// Shrinks an exported room/car .glb for the web (the room went from 27.8 MB to 3.1 MB).
// Re-run this whenever a model is re-exported from Blender, or the site gets slow again.
//
//   npm install --no-save @gltf-transform/core@4 @gltf-transform/functions@4 @gltf-transform/extensions@4 meshoptimizer sharp
//   node tools/optimize-model.mjs exported.glb public/assets/models/cleaned_portfolio_model_3.glb
//
// Output uses EXT_meshopt_compression, so loaders need setMeshoptDecoder (src/systems/modelLoader.js).
// Object names are kept, because the code looks objects up by name (printer_body, lamp_frame, ...).
import { NodeIO } from '@gltf-transform/core';
import { ALL_EXTENSIONS, EXTMeshoptCompression } from '@gltf-transform/extensions';
import { dedup, prune, weld, simplifyPrimitive, weldPrimitive, textureCompress, reorder, quantize } from '@gltf-transform/functions';
import { MeshoptEncoder, MeshoptDecoder, MeshoptSimplifier } from 'meshoptimizer';
import sharp from 'sharp';

const [, , input, output] = process.argv;

// Mesh name -> [fraction of triangles to keep, max relative error].
// These are glTF mesh names from the current export; check them if the model changes.
const SIMPLIFY = {
    Mesh_9: [0.25, 0.02],                         // bedsheets_2 (163k tris, half are back-face copies)
    Mesh_10: [0.25, 0.02],                        // bedsheets_1 (100k tris, half are back-face copies)
    Object_0: [0.2, 0.002],                        // carpet (57k tris)
    'soccer_ball_soccer_ball_0.003': [0.12, 0.002], // soccer ball (51k tris)
};
const DOUBLE_LAYERED = new Set(['Mesh_9', 'Mesh_10']);

await Promise.all([MeshoptEncoder.ready, MeshoptDecoder.ready, MeshoptSimplifier.ready]);

const io = new NodeIO()
    .registerExtensions(ALL_EXTENSIONS)
    .registerDependencies({ 'meshopt.encoder': MeshoptEncoder, 'meshopt.decoder': MeshoptDecoder });

const doc = await io.read(input);
const countTris = () => doc.getRoot().listMeshes().reduce((sum, m) =>
    sum + m.listPrimitives().reduce((s, p) => s + (p.getIndices()?.getCount() ?? 0) / 3, 0), 0);

console.log('tris before:', Math.round(countTris()));

await doc.transform(dedup(), prune({ keepAttributes: true }), weld());

for (const mesh of doc.getRoot().listMeshes()) {
    const [ratio, error] = SIMPLIFY[mesh.getName()] ?? [];
    if (!ratio) continue;
    for (const prim of mesh.listPrimitives()) {
        const before = prim.getIndices().getCount() / 3;
        // Coincident front/back copies lock the simplifier (see mergeBackFaceLayer)
        if (DOUBLE_LAYERED.has(mesh.getName())) {
            mergeBackFaceLayer(prim);
            prim.getMaterial().setDoubleSided(true);
        }
        simplifyPrimitive(prim, { simplifier: MeshoptSimplifier, ratio, error });
        if (DOUBLE_LAYERED.has(mesh.getName())) setSmoothNormals(prim);
        console.log(`  ${mesh.getName()}: ${before} -> ${prim.getIndices().getCount() / 3}`);
    }
}

// Bedsheet meshes contain every triangle twice: a front copy and a back copy with
// flipped normals. Keep one copy, orient all triangles consistently and recompute
// smooth normals; the material is made double-sided so both sides still render.
function mergeBackFaceLayer(prim) {
    prim.getAttribute('NORMAL').dispose();
    prim.setAttribute('NORMAL', null);
    weldPrimitive(prim); // now welds by position only

    const idx = prim.getIndices().getArray();
    const tris = [];
    const seen = new Set();
    for (let i = 0; i < idx.length; i += 3) {
        const t = [idx[i], idx[i + 1], idx[i + 2]];
        const key = [...t].sort((x, y) => x - y).join(',');
        if (seen.has(key) || t[0] === t[1] || t[1] === t[2] || t[0] === t[2]) continue;
        seen.add(key);
        tris.push(t);
    }

    // Edge -> triangles, then breadth-first orientation propagation: a neighbour across
    // edge (u, v) must traverse it as (v, u) to be wound the same way.
    const edgeKey = (u, v) => (u < v ? `${u},${v}` : `${v},${u}`);
    const edges = new Map();
    tris.forEach((t, ti) => { for (let k = 0; k < 3; k++) {
        const e = edgeKey(t[k], t[(k + 1) % 3]);
        if (!edges.has(e)) edges.set(e, []);
        edges.get(e).push(ti);
    } });
    const visited = new Uint8Array(tris.length);
    for (let start = 0; start < tris.length; start++) {
        if (visited[start]) continue;
        visited[start] = 1;
        const queue = [start];
        while (queue.length) {
            const t = tris[queue.pop()];
            for (let k = 0; k < 3; k++) {
                const u = t[k], v = t[(k + 1) % 3];
                for (const ni of edges.get(edgeKey(u, v))) {
                    if (visited[ni]) continue;
                    const n = tris[ni];
                    const sameDirection = [0, 1, 2].some((j) => n[j] === u && n[(j + 1) % 3] === v);
                    if (sameDirection) [n[1], n[2]] = [n[2], n[1]];
                    visited[ni] = 1;
                    queue.push(ni);
                }
            }
        }
    }

    console.log(`    merged back-face layer: ${idx.length / 3} -> ${tris.length} tris`);
    prim.getIndices().setArray(new Uint32Array(tris.flat()));
}

function setSmoothNormals(prim) {
    const pos = prim.getAttribute('POSITION').getArray();
    const idx = prim.getIndices().getArray();
    const n = new Float32Array(pos.length);
    for (let i = 0; i < idx.length; i += 3) {
        const [a, b, c] = [idx[i] * 3, idx[i + 1] * 3, idx[i + 2] * 3];
        const e1 = [pos[b] - pos[a], pos[b + 1] - pos[a + 1], pos[b + 2] - pos[a + 2]];
        const e2 = [pos[c] - pos[a], pos[c + 1] - pos[a + 1], pos[c + 2] - pos[a + 2]];
        // Unnormalized cross product = area-weighted face normal
        const f = [e1[1] * e2[2] - e1[2] * e2[1], e1[2] * e2[0] - e1[0] * e2[2], e1[0] * e2[1] - e1[1] * e2[0]];
        for (const v of [a, b, c]) for (let k = 0; k < 3; k++) n[v + k] += f[k];
    }
    for (let v = 0; v < n.length; v += 3) {
        const len = Math.hypot(n[v], n[v + 1], n[v + 2]) || 1;
        n[v] /= len; n[v + 1] /= len; n[v + 2] /= len;
    }
    const normal = doc.createAccessor().setType('VEC3').setArray(n)
        .setBuffer(prim.getAttribute('POSITION').getBuffer());
    prim.setAttribute('NORMAL', normal);
}

await doc.transform(
    prune({ keepAttributes: true }),
    textureCompress({ encoder: sharp, targetFormat: 'webp', resize: [1024, 1024], quality: 85 }),
    reorder({ encoder: MeshoptEncoder }),
    quantize(),
);

doc.createExtension(EXTMeshoptCompression).setRequired(true)
    .setEncoderOptions({ method: EXTMeshoptCompression.EncoderMethod.FILTER });

console.log('tris after:', Math.round(countTris()));
await io.write(output, doc);
