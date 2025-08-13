import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/Addons.js';

const gltfLoader = new GLTFLoader();
const textureLoader = new THREE.TextureLoader();

const room = new Promise((resolve, reject) =>{
    gltfLoader.load(
        '../../assets/models/cleaned_portfolio_model_2.glb',
        (gltf) => {
            const roomScene = gltf.scene;
            roomScene.position.set(0, 0, 0);

            const mesh = roomScene.getObjectByName('room_floor');
            
            if (mesh) {
                const normalMap = textureLoader.load('../../assets/textures/floor_normal.png');
                normalMap.encoding = THREE.LinearEncoding;

                mesh.material.normalMap = normalMap;
                mesh.material.normalMapType = THREE.TangentSpaceNormalMap;
                mesh.material.normalScale.set(1, 1);
                mesh.material.needsUpdate = true;
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

export default room;