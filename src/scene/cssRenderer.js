import { CSS3DRenderer } from 'three/examples/jsm/renderers/CSS3DRenderer.js';

export function createCSSRenderer() {
    const renderer = new CSS3DRenderer();
    renderer.setSize(window.innerWidth, window.innerHeight);
    
    renderer.domElement.style.position = 'absolute';
    renderer.domElement.style.top = '0';
    renderer.domElement.style.left = '0'; // Ensure it starts at the edge
    
    renderer.domElement.style.pointerEvents = 'none'; 
    
    return renderer;
}