import * as THREE from 'three';

const renderer = new THREE.WebGLRenderer( {antialias: true} );
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(window.devicePixelRatio);
renderer.antialias = true;

renderer.outputColorSpace = THREE.SRGBColorSpace;

renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFShadowMap; // instead of BasicShadowMap

document.body.appendChild(renderer.domElement);

export default renderer;