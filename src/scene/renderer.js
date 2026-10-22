import * as THREE from 'three';

// antialias is off: all rendering goes through the composer's render targets
// (see postprocessing.js), so it only ever applied to the final full-screen pass.
const renderer = new THREE.WebGLRenderer( {antialias: false} );
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5)); // 4K/Retina screens would otherwise render up to 4x the pixels

renderer.outputColorSpace = THREE.SRGBColorSpace;

// Linear tone mapping just scales the final image by the exposure, so this brightens
// the whole scene evenly without changing the balance between the lights.
// The OutputPass in postprocessing.js applies it.
renderer.toneMapping = THREE.LinearToneMapping;
renderer.toneMappingExposure = 1.15;

renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFShadowMap; // cheaper filtering than PCFSoft; softness comes from shadow.radius
// The room is static, so shadow maps are drawn once instead of every frame.
// Set renderer.shadowMap.needsUpdate = true if a shadow-casting object ever moves.
renderer.shadowMap.autoUpdate = false;

document.body.appendChild(renderer.domElement);

export default renderer;
