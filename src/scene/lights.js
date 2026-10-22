import * as THREE from 'three';

// Ambient Light
const backgroundLight = new THREE.AmbientLight(0xffffff, 0.05  ); // keep it 0.045

// Moon Light
const moonLight = new THREE.DirectionalLight(0xaaccff, 0.4);
moonLight.position.set(-5, 6, 6);

moonLight.castShadow = true;
moonLight.shadow.mapSize.width = 1024;
moonLight.shadow.mapSize.height = 1024;
moonLight.shadow.bias = -0.0001;
moonLight.shadow.normalBias = 0.05;
moonLight.shadow.radius = 3; // soft edges (PCFShadowMap)

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
const windowBeam = new THREE.SpotLight(0xaaccff, 100); // High intensity (50-100)
windowBeam.position.set(-6, 5, 12); 
windowBeam.distance = 20;
windowBeam.angle = Math.PI / 3; // Narrow beam (30 degrees)
windowBeam.penumbra = 0.3;      // Soft edges
windowBeam.decay = 1;

// Shadows for the beam (The most important part)
windowBeam.castShadow = true;
windowBeam.shadow.bias = -0.0001;
windowBeam.shadow.radius = 3; // soft edges (PCFShadowMap)
windowBeam.shadow.mapSize.width = 1024;
windowBeam.shadow.mapSize.height = 1024;

const beamTarget = new THREE.Object3D();
beamTarget.position.set(-3.5, 3.3, 3);
windowBeam.target = beamTarget;


// Lamp Light
const lampLight = new THREE.PointLight(0xffaa33, 25, 20);
lampLight.position.set(-11.7, 5.2, 6);
lampLight.castShadow = true;
lampLight.shadow.bias = -0.00005;
lampLight.shadow.normalBias = 0;

lampLight.shadow.radius = 4; 
lampLight.shadow.mapSize.width = 1024; 
lampLight.shadow.mapSize.height = 1024;

// Small screen glows. These were RectAreaLights, which made every pixel of the room
// far more expensive to shade. A short-range PointLight placed just in front of the
// screen gives the same total light output: a rect light of luminance L and area A
// emits L*A*PI, which a point light matches (on the lit side) with intensity L*A/2.
function createScreenGlowLight(color, rectIntensity, width, height, position, rotation, range) {
    const light = new THREE.PointLight(color, rectIntensity * width * height / 2, range);
    const inFront = new THREE.Vector3(0, 0, -0.05).applyEuler(rotation); // rect lights emit along -Z
    light.position.copy(position).add(inFront);
    return light;
}

// Printer Light

const greenScreenMaterial = new THREE.MeshStandardMaterial({
    color: 0x00ff00,          // Base color is black so only the glow shows
    emissive: 0x00ff00,       // The "glow" color (Pure Green)
    emissiveIntensity: 2.0,   // How much it "pops" visually
    roughness: 0.1,           // Makes it look a bit like glass
    metalness: 0.5,
    side: THREE.DoubleSide
});

const greenScreenGeometry = new THREE.PlaneGeometry(0.12, 0.04);
const greenScreenMesh = new THREE.Mesh(greenScreenGeometry, greenScreenMaterial);
greenScreenMesh.position.set(-1.41, 4.1, -3.25);
greenScreenMesh.rotation.y = Math.PI / 2;

const printerLight = createScreenGlowLight(0x00ff00, 5, 0.12, 0.04,
    new THREE.Vector3(-1.42, 4.1, -3.25), new THREE.Euler(0, Math.PI / 2, 0), 0.5);

// Phone light
const redScreenMaterial = new THREE.MeshStandardMaterial({
    color: 0xff0000,          // Base color is black so only the glow shows
    emissive: 0xff0000,       // The "glow" color (Pure Red)
    emissiveIntensity: 2.0,   // How much it "pops" visually
    roughness: 0.1,           // Makes it look a bit like glass
    metalness: 0.5,
    side: THREE.DoubleSide
});

const redScreenGeometry = new THREE.PlaneGeometry(0.15, 0.02);
const redScreenMesh = new THREE.Mesh(redScreenGeometry, redScreenMaterial);
redScreenMesh.position.set(-1.15, 3.72, -4.8);
redScreenMesh.rotation.y = Math.PI / 2;

const phoneLight = createScreenGlowLight(0xFF0000, 5, 0.15, 0.02,
    new THREE.Vector3(-1.16, 3.72, -4.8), new THREE.Euler(0, Math.PI / 2, 0), 0.5);

// Starts off; laptopInteraction fades it to LAPTOP_LIGHT_ON_INTENSITY
const laptopScreenLight = createScreenGlowLight(0x6666ff, 0, 1.0, 0.6,
    new THREE.Vector3(-0.92, 4.115, 4.16), new THREE.Euler(-0.3, 1.207, 0.32), 3);
const LAPTOP_LIGHT_ON_INTENSITY = 2.5 * 1.0 * 0.6 / 2; // former RectAreaLight intensity 2.5


const sideTableLight = new THREE.PointLight(0xaaccff, 0.3, 4);
sideTableLight.position.set(-1.4, 5.5, -3.7);

export {backgroundLight, moonLight, lampLight, windowBeam, moonLightTarget, beamTarget, printerLight, phoneLight, greenScreenMesh, redScreenMesh, laptopScreenLight, LAPTOP_LIGHT_ON_INTENSITY, sideTableLight};