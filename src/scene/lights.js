import * as THREE from 'three';

// Ambient Light
const backgroundLight = new THREE.AmbientLight(0xffffff, 0.1);

// Moon Light
const moonLight = new THREE.DirectionalLight(0xaaccff, 0.5);
moonLight.position.set(-6, 6.5, 12);

moonLight.castShadow = true;
moonLight.shadow.mapSize.width = 4096;
moonLight.shadow.mapSize.height = 4096;
moonLight.shadow.bias = -0.00005;
moonLight.shadow.normalBias = 0;

moonLight.shadow.camera.left = -6
moonLight.shadow.camera.right = 6;
moonLight.shadow.camera.top = 6;
moonLight.shadow.camera.bottom = -6; 

moonLight.shadow.camera.near = 0.5;
moonLight.shadow.camera.far = 20;

moonLight.shadow.camera.updateProjectionMatrix();

const moonLightTarget = new THREE.Object3D();
moonLightTarget.position.set(-3, 3, 0);
moonLight.target = moonLightTarget;


// Lamp Light
const lampLight = new THREE.PointLight(0xffaa33, 30, 8);
lampLight.position.set(-11.5, 5.5, 5.6);
lampLight.castShadow = true;
lampLight.shadow.bias = -0.00005;
lampLight.shadow.normalBias = 0;





export {backgroundLight, moonLight, lampLight, moonLightTarget};