import * as THREE from 'three';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js';
import { OutputPass } from 'three/examples/jsm/postprocessing/OutputPass.js';

export function createComposer(renderer, scene, camera){
    // No MSAA: renderer-level antialias never applied to composer passes, and
    // multisampled targets roughly halved the frame rate on integrated GPUs.
    const composer = new EffectComposer( renderer );

    const renderPass = new RenderPass( scene, camera );
    composer.addPass( renderPass );

    // Bloom Pass
    const bloomPass = new UnrealBloomPass( 
        new THREE.Vector2( window.innerWidth, window.innerHeight ),
        0.15, // strength
        0.35, // radius
        0.9 // threshold
    );
    composer.addPass( bloomPass );

    // Output Pass
    const outputPass = new OutputPass();
    composer.addPass( outputPass );

    return composer;
}