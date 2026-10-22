import * as THREE from 'three';
import gsap from 'gsap';

// Hover highlight: a faint warm copy of the object drawn additively on top of it.
// The object's own materials are left alone, since they can be shared with other objects
// and the lamp animates its own glow, and nothing extra is drawn while nothing is hovered.
const COLOR = 0xffb347;
const OPACITY = 0.22;
const FADE_SECONDS = 0.2;

export function createHighlighter(objects) {
    const entries = new Map(); // object -> { material, overlays }

    objects.forEach((object) => {
        const material = new THREE.MeshBasicMaterial({
            color: COLOR,
            transparent: true,
            opacity: 0,
            blending: THREE.AdditiveBlending,
            depthWrite: false,
            side: THREE.DoubleSide,
            // Drawn on the object's own surface, so pull it forward to avoid z-fighting
            polygonOffset: true,
            polygonOffsetFactor: -1,
            polygonOffsetUnits: -1
        });

        const meshes = [];
        object.traverse((child) => { if (child.isMesh) meshes.push(child); });

        const overlays = meshes.map((mesh) => {
            const overlay = new THREE.Mesh(mesh.geometry, material);
            overlay.raycast = () => {}; // never the target of clicks or hover
            mesh.add(overlay);
            return overlay;
        });

        entries.set(object, { material, overlays });
    });

    const setVisible = (entry, visible) => entry.overlays.forEach((o) => { o.visible = visible; });

    let current = null;

    function fade(entry, on) {
        gsap.killTweensOf(entry.material);
        if (on) setVisible(entry, true);
        gsap.to(entry.material, {
            opacity: on ? OPACITY : 0,
            duration: FADE_SECONDS,
            onComplete: () => { if (!on) setVisible(entry, false); }
        });
    }

    return {
        // Highlight this object (or none with null); fades between them
        set(object) {
            if (object === current) return;
            if (current) fade(entries.get(current), false);
            current = entries.has(object) ? object : null;
            if (current) fade(entries.get(current), true);
        },

        // Overlays start visible (fully transparent) so the renderer compiles their shader
        // during loading instead of hitching on the first hover. Call once that's done.
        hideAll() {
            entries.forEach((entry) => setVisible(entry, false));
        }
    };
}
