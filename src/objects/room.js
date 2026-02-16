import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/Addons.js';

const gltfLoader = new GLTFLoader();
const textureLoader = new THREE.TextureLoader();

const room = new Promise((resolve, reject) =>{
    gltfLoader.load(
        '/assets/models/cleaned_portfolio_model_3.glb',
        (gltf) => {
            const roomScene = gltf.scene;
            roomScene.position.set(0, 0, 0);

            setupRoomShadows(roomScene);

            positionPaintings(roomScene);

 

            const floorMesh = roomScene.getObjectByName('room_floor');
            
            if (floorMesh) {
                const normalMap = textureLoader.load('../../assets/textures/floor_diffuse_v4.png');
                
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
            
            resolve(roomScene);
        },
        undefined,
        (error) => {
            console.error("Error loading room model: ", error)
            reject(error);
        }
    );
});

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
                    child.material.shadowSide = THREE.BackSide;
                }
            }
        }
    });
}


export default room;