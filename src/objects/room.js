import * as THREE from 'three';
import gltfLoader from '../systems/modelLoader';

const textureLoader = new THREE.TextureLoader();

const BEDSHEETS = ['bedsheets_1', 'bedsheets_2'];

// Loads on demand (not at import) so nothing downloads on locked mobile devices
export default async function loadRoom(onProgress) {
    const [gltf, normalMap] = await Promise.all([
        gltfLoader.loadAsync('/assets/models/cleaned_portfolio_model_3.glb', onProgress),
        textureLoader.loadAsync('/assets/textures/floor_diffuse_v4.png')
    ]).catch((error) => {
        console.error("Error loading room model: ", error);
        throw error;
    });

    const roomScene = gltf.scene;
    roomScene.position.set(0, 0, 0);

    setupRoomShadows(roomScene);
    replaceTransmissiveGlass(roomScene);

    positionPaintings(roomScene);

    const floorMesh = roomScene.getObjectByName('room_floor');

    if (floorMesh) {
        normalMap.colorSpace = THREE.NoColorSpace;
        normalMap.wrapS = THREE.RepeatWrapping;
        normalMap.wrapT = THREE.RepeatWrapping;
        normalMap.minFilter = THREE.LinearMipmapLinearFilter;
        normalMap.magFilter = THREE.LinearFilter;
        floorMesh.material.normalMap = normalMap;
        floorMesh.material.normalMapType = THREE.TangentSpaceNormalMap;
        
        floorMesh.material.normalScale.set(0.05, 0.05); 
        
        if (!floorMesh.geometry.attributes.tangent) {
            console.log("⚠️ Tangents missing on floor. Computing them now...");
            floorMesh.geometry.computeTangents();
        }

        floorMesh.material.needsUpdate = true;
        
        console.log("✅ Normal map applied to floor");
    } else {
        console.warn("⚠️ Floor floorMesh not found!");
    }

    return roomScene;
}

// Transmission makes three.js render the whole scene an extra time every frame;
// a tinted transparent material looks nearly the same for a thin window pane.
function replaceTransmissiveGlass(roomScene) {
    roomScene.traverse((child) => {
        if (!child.isMesh || !(child.material.transmission > 0)) return;

        const oldMat = child.material;
        child.material = new THREE.MeshStandardMaterial({
            color: oldMat.color,
            roughness: oldMat.roughness,
            metalness: oldMat.metalness,
            side: oldMat.side,
            transparent: true,
            opacity: 0.2,
            depthWrite: false
        });
        child.material.shadowSide = oldMat.shadowSide;
        oldMat.dispose();
    });
}

function positionPaintings(roomScene) {
    const paintings = ['painting_1', 'painting_frame_1', 'painting_2', 'painting_frame_2'];
    const offsetAmount = +0.05;

    paintings.forEach(name => {
        const mesh = roomScene.getObjectByName(name);
        if (mesh) {
            mesh.position.z += offsetAmount;
            console.log(`🖼️ Adjusted position for ${name}`);
        } else {
            console.warn(`⚠️ Could not find ${name}`);
        }
    });
}

function setupRoomShadows(roomScene) {
    roomScene.traverse((child) => {
        if (child.isMesh) {
            if (!child.material.isMeshStandardMaterial) {
                 const oldMat = child.material;
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

            if (child.name === 'lamp_paper_body') {
                console.log("👻 Ghost Mode Activated for:", child.name);
                child.castShadow = false;    
                child.receiveShadow = false;  
                child.material.emissive.setHex(0xffaa33); 
                child.material.side = THREE.DoubleSide; 
            } 
            else {
                child.castShadow = true;
                child.receiveShadow = true;
                
                if (child.material) {
                    // The bedsheets are a single double-sided layer in the optimized model
                    // (the original had separate front and back copies), so they need to
                    // cast shadows from both sides or light leaks under the bed.
                    child.material.shadowSide = BEDSHEETS.includes(child.name) ? THREE.DoubleSide : THREE.BackSide;
                }
            }
        }
    });
}