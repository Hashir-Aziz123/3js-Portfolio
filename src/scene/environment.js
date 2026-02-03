import * as THREE from 'three';

export function createRainPlane(width, height) {
    const loader = new THREE.TextureLoader();
    const group = new THREE.Group(); 

    const basePath = '/assets/textures/rainTexture/';

    // Load textures
    const displacementTex = loader.load(`${basePath}Leaking019B_1K-PNG_Displacement.png`);
    const roughnessTex = loader.load(`${basePath}Leaking019B_1K-PNG_Roughness.png`);
    
    [displacementTex, roughnessTex].forEach(tex => {
        tex.wrapS = THREE.RepeatWrapping;
        tex.wrapT = THREE.RepeatWrapping;
    });

    const geometry = new THREE.PlaneGeometry(width, height);

    // 🌧️ LAYER 1: Fast Background
    // DRASTICALLY REDUCED: 0.18 -> 0.05
    // This should be almost invisible, just a hint of motion.
    const material1 = new THREE.MeshBasicMaterial({
        map: displacementTex.clone(),
        transparent: true,
        opacity: 0.05, 
        blending: THREE.AdditiveBlending,
        depthWrite: false,
        side: THREE.DoubleSide
    });
    material1.map.repeat.set(1.5, 2);
    
    const mesh1 = new THREE.Mesh(geometry, material1);
    mesh1.position.z = -0.1;
    group.add(mesh1);

    // 🌧️ LAYER 2: Main Drops
    // DRASTICALLY REDUCED: 0.25 -> 0.12
    // This is your "hero" layer. It needs to be visible but not glowing.
    const material2 = new THREE.MeshBasicMaterial({
        map: displacementTex.clone(),
        transparent: true,
        opacity: 0.12, 
        blending: THREE.AdditiveBlending,
        depthWrite: false,
        side: THREE.DoubleSide
    });
    material2.map.repeat.set(1, 1.5);
    
    const mesh2 = new THREE.Mesh(geometry, material2);
    mesh2.position.z = 0;
    group.add(mesh2);

    // 🌧️ LAYER 3: The "Grit" (Multiply)
    // Kept around 0.1. Multiply doesn't glow, so it's safe.
    const material3 = new THREE.MeshBasicMaterial({
        map: roughnessTex.clone(),
        transparent: true,
        opacity: 0.1, 
        blending: THREE.MultiplyBlending, // Darkens the glass
        premultipliedAlpha: true,
        depthWrite: false,
        side: THREE.DoubleSide
    });
    material3.map.repeat.set(1.2, 2.5);
    
    const mesh3 = new THREE.Mesh(geometry, material3);
    mesh3.position.z = 0.05;
    group.add(mesh3);

    // 🌧️ LAYER 4: Highlights
    // REDUCED: 0.1 -> 0.06
    const material4 = new THREE.MeshBasicMaterial({
        map: displacementTex.clone(),
        transparent: true,
        opacity: 0.06, 
        blending: THREE.AdditiveBlending,
        depthWrite: false,
        side: THREE.DoubleSide
    });
    material4.map.repeat.set(0.8, 1.8);
    
    const mesh4 = new THREE.Mesh(geometry, material4);
    mesh4.position.z = 0.12;
    group.add(mesh4);

    // 🎬 ANIMATION
    group.userData.tick = (delta) => {
        if (material1.map) material1.map.offset.y += delta * 0.35 + 0.15;
        if (material2.map) material2.map.offset.y += delta * 0.18 + 0.02;
        if (material3.map) material3.map.offset.y += delta * 0.1 + 0.02; 
        if (material4.map) material4.map.offset.y += delta * 0.05 + 0.025;
    };

    console.log("✅ Rain opacity tuned down for subtle effect");

    return { mesh: group, material: material1 };
}