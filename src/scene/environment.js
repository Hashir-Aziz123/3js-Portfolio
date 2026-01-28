// Rain Window Shader

import * as THREE from 'three';

export function createRainPlane(width, height) {
    
    // The Vertex Shader
    // This just handles the position of the plane on screen.
    // We pass the "uv" coordinates to the fragment shader so it knows where to draw.
    const vertexShader = `
        varying vec2 vUv;
        void main() {
            vUv = uv;
            gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
    `;

    // Fragement Shader
    // - uTime: The animation clock
    // - uSpeed: How fast it falls
    // - uOpacity: Transparency
    const fragmentShader = `
        uniform float uTime;
        uniform float uOpacity;
        uniform vec3 uColor;
        varying vec2 vUv;

        // A pseudo-random function (GLSL doesn't have Math.random)
        float random(vec2 st) {
            return fract(sin(dot(st.xy, vec2(12.9898,78.233))) * 43758.5453123);
        }

        void main() {
            // 1. Create a grid of "cells"
            vec2 st = vUv;
            
            // 2. Squash the grid vertically to make "streaks"
            // Multiply Y by 20.0 to make rows tall and thin
            st.y *= 20.0; 
            
            // 3. Offset the Y based on time (The falling animation)
            // We use the floor() of the X to make each column fall at a different speed
            float speedOffset = random(vec2(floor(st.x * 50.0), 0.0)); 
            st.y += uTime * (5.0 + speedOffset * 5.0); 

            // 4. Calculate the rain drop inside the cell
            vec2 ipos = floor(st); // Integer position (the cell ID)
            vec2 fpos = fract(st); // Fractional position (where we are inside the cell)

            // 5. Generate noise for this cell
            float n = random(ipos);

            // 6. Threshold: Only draw if the noise is high enough (controls density)
            // If n > 0.95, it's a drop. Otherwise it's empty space.
            float strength = step(0.95, n);
            
            // 7. Fade the tail of the drop (gradient)
            strength *= (1.0 - fpos.y); 

            // 8. Output
            vec3 finalColor = uColor;
            gl_FragColor = vec4(finalColor, strength * uOpacity);
        }
    `;

    const material = new THREE.ShaderMaterial({
        vertexShader: vertexShader,
        fragmentShader: fragmentShader,
        uniforms: {
            uTime: { value: 0 },
            uOpacity: { value: 0.4 }, // Subtle
            uColor: { value: new THREE.Color(0xaaccff) } // Slightly blueish white
        },
        transparent: true,
        depthWrite: false, // Don't block objects behind it
        blending: THREE.AdditiveBlending // Glow effect
    });

    const geometry = new THREE.PlaneGeometry(width, height);
    const mesh = new THREE.Mesh(geometry, material);

    return { mesh, material };
}