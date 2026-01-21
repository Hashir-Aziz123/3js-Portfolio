import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/Addons.js';

const gltfLoader = new GLTFLoader();
const textureLoader = new THREE.TextureLoader();

const room = new Promise((resolve, reject) =>{
    gltfLoader.load(
        '../../assets/models/cleaned_portfolio_model_3.glb',
        (gltf) => {
            const roomScene = gltf.scene;
            roomScene.position.set(0, 0, 0);

            setupRoomShadows(roomScene);

            const mesh = roomScene.getObjectByName('room_floor');
            
            if (mesh) {
                // Load the normal map with proper settings
                const normalMap = textureLoader.load('../../assets/textures/floor_diffuse_v4.png');
                
                // CRITICAL: Set colorSpace instead of encoding (for newer Three.js)
                normalMap.colorSpace = THREE.NoColorSpace; // Normal maps should NOT have color space conversion
                
                // Set wrapping and filtering for better quality
                normalMap.wrapS = THREE.RepeatWrapping;
                normalMap.wrapT = THREE.RepeatWrapping;
                normalMap.minFilter = THREE.LinearMipmapLinearFilter;
                normalMap.magFilter = THREE.LinearFilter;
                
                // If your texture needs tiling, set repeat:
                // normalMap.repeat.set(1, 1);

                // Apply to material
                mesh.material.normalMap = normalMap;
                mesh.material.normalMapType = THREE.TangentSpaceNormalMap;
                
                // Adjust strength - start subtle, increase if needed
                mesh.material.normalScale.set(0.05, 0.05); // Try lower values first
                
                // Compute tangents if missing
                if (!mesh.geometry.attributes.tangent) {
                    console.log("⚠️ Tangents missing on floor. Computing them now...");
                    mesh.geometry.computeTangents();
                }

                mesh.material.needsUpdate = true;
                
                console.log("✅ Normal map applied to floor");
            } else {
                console.warn("⚠️ Floor mesh not found!");
            }
            
            resolve(roomScene);
        },
        undefined,
        (error) => {
            console.error("Error loading room model: ", error)
            reject(error);
        }
    );
});

function setupRoomShadows(roomScene) {
    roomScene.traverse((child) => {
        if (child.isMesh) {
            if (!child.material.isMeshStandardMaterial) {
                console.log(`Upgrading material for: ${child.name}`);
                const oldMat = child.material;
            
                // Create a new Standard material preserving the old texture/color
                child.material = new THREE.MeshStandardMaterial({
                    map: oldMat.map,
                    color: oldMat.color,
                    transparent: oldMat.transparent,
                    opacity: oldMat.opacity,
                    side: oldMat.side || THREE.FrontSide,
                    roughness: 1.0, 
                    metalness: 0.0
                });
            }
            // Furniture, Walls, Floor
            else {
                child.castShadow = true;
                child.receiveShadow = true;
                
                // Fix wall striping
                if (child.material) {
                    child.material.shadowSide = THREE.BackSide;
                }
            }
        }
    });
}

// function updateFootballShadow(roomScene) {
//     roomScene.traverse((child) => {
//         if (child.isMesh && child.name.toLowerCase().includes('soccer') ) {
//             console.log("Found Football:", child.name);

//             child.castShadow = false;
//             const shadowPlane = createFakeShadow();
//             shadowPlane.position.y = 0.02;
//             child.add(shadowPlane);
//         }
//     });
// }

// function createFakeShadow() {
//     const canvas = document.createElement('canvas');
//     canvas.width = 128;
//     canvas.height = 128;
//     const context = canvas.getContext('2d');
    
//     const gradient = context.createRadialGradient(
//         64, 64, 0,
//         64, 64, 64
//     );
//     gradient.addColorStop(0, 'rgba(0, 0, 0, 0.6)');
//     gradient.addColorStop(1, 'rgba(0, 0, 0, 0)');
    
//     context.fillStyle = gradient;
//     context.fillRect(0, 0, 128, 128);

//     const shadowTexture = new THREE.CanvasTexture(canvas);
//     const shadowGeometry = new THREE.PlaneGeometry(0.8, 0.8);
//     const shadowMaterial = new THREE.MeshBasicMaterial({
//         map: shadowTexture,
//         transparent: true,
//         depthWrite: false,
//     });

//     const plane = new THREE.Mesh(shadowGeometry, shadowMaterial);
//     plane.rotation.x = -Math.PI / 2;
//     return plane;
// }

export default room;