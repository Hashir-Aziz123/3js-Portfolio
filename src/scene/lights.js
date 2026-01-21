import * as THREE from 'three';

// Ambient Light
const backgroundLight = new THREE.AmbientLight(0xffffff, 0);

// Moon Light
const moonLight = new THREE.DirectionalLight(0xaaccff, 0.4);
moonLight.position.set(-5, 6, 6);

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
moonLightTarget.position.set(-4, 4, 0);
moonLight.target = moonLightTarget;

// window light -6, 5, 12
const windowBeam = new THREE.SpotLight(0xddeeff, 50); // High intensity (50-100)
windowBeam.position.set(-6, 5, 12); 
windowBeam.distance = 20;
windowBeam.angle = Math.PI / 3; // Narrow beam (30 degrees)
windowBeam.penumbra = 0.3;      // Soft edges
windowBeam.decay = 1;

// Shadows for the beam (The most important part)
windowBeam.castShadow = true;
windowBeam.shadow.bias = -0.0001;
windowBeam.shadow.mapSize.width = 1024;
windowBeam.shadow.mapSize.height = 1024;

const beamTarget = new THREE.Object3D();
beamTarget.position.set(-3.5, 3.3, 3);
windowBeam.target = beamTarget;


// Lamp Light
const lampLight = new THREE.PointLight(0xffaa33, 23, 20);
lampLight.position.set(-11.5, 5.5, 5.6);
lampLight.castShadow = true;
lampLight.shadow.bias = -0.00005;
lampLight.shadow.normalBias = 0;

lampLight.shadow.radius = 4; 
lampLight.shadow.mapSize.width = 2048; 
lampLight.shadow.mapSize.height = 2048;





export {backgroundLight, moonLight, lampLight, windowBeam, moonLightTarget, beamTarget};