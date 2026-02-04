import { CSS3DRenderer } from 'three/examples/jsm/renderers/CSS3DRenderer.js';

export function createCSSRenderer() {
    const renderer = new CSS3DRenderer();
    renderer.setSize(window.innerWidth, window.innerHeight);
    
    // Position the HTML layer absolutely on top of the WebGL canvas
    renderer.domElement.style.position = 'absolute';
    renderer.domElement.style.top = '0';
    renderer.domElement.style.left = '0'; // Ensure it starts at the edge
    
    // CRITICAL: 'pointer-events: none' allows your mouse clicks to pass through
    // this invisible HTML layer and hit your 3D models (like the car or printer)
    // when you aren't clicking on a specific button.
    renderer.domElement.style.pointerEvents = 'none'; 
    
    return renderer;
}