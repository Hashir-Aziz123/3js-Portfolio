import * as THREE from 'three';
import { RectAreaLightUniformsLib, RectAreaLightHelper } from 'three/examples/jsm/Addons.js';

import camera from './scene/camera';
import controls from './scene/controls';
import renderer from './scene/renderer';
import { createCSSRenderer } from './scene/cssRenderer'; 

import Car from './objects/car';
import room from './objects/room';
import screenMesh from './objects/screenMesh';

import { backgroundLight, moonLight, lampLight, moonLightTarget, windowBeam, beamTarget,
         printerLight, phoneLight, greenScreenMesh, redScreenMesh, laptopScreenLight, sideTableLight } from './scene/lights';
import { addCarMovementEventListener, disposeKeyboardControls, inputState } from './systems/events';
import { createComposer } from './scene/postprocessing';
import animate from './systems/animate';

// Interactions
import { createGroup } from './utils/createGroup';           
import InteractionManager from './systems/interactions/interactionManager';

import onPrinterClick from './systems/interactions/printerInteraction.js';
import onPhoneClick from './systems/interactions/phoneInteraction';
import onPcClick from './systems/interactions/laptopInteraction';
import onLampClick from './systems/interactions/lampInteraction.js';

// Audio
import audioManager from './systems/audioManager';

// rain Shader
import { createRainPlane } from './scene/environment';

export async function setUpScene() {

    window.camera = camera;
    window.controls = controls;

    controls.target.set( -3.659, 0.133, 3.957);
    controls.update();

    controls.listenToKeyEvents(window); 
    controls.keyPanSpeed = 10.0; 
    controls.enableDamping = true; 

    window.addEventListener('keydown', (e) => {
        if (e.key.toLowerCase() === 'p') {
            console.log(`
    position: { x: ${camera.position.x.toFixed(3)}, y: ${camera.position.y.toFixed(3)}, z: ${camera.position.z.toFixed(3)} },
    target: { x: ${controls.target.x.toFixed(3)}, y: ${controls.target.y.toFixed(3)}, z: ${controls.target.z.toFixed(3)} }
            `);
        }
    });

    // Initialize CSS Renderer
    const cssRenderer = createCSSRenderer();
    document.body.appendChild(cssRenderer.domElement);

    // Adding all event listeners
    addWindowResizeEventListener(camera, renderer, cssRenderer); 
    addCarMovementEventListener();

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x000000);

    RectAreaLightUniformsLib.init();

    // Adding lights
    scene.add(backgroundLight);
    scene.add(lampLight);
    scene.add(moonLight);
    scene.add(moonLightTarget);
    scene.add(windowBeam);
    scene.add(beamTarget);

    scene.add(printerLight);
    scene.add(greenScreenMesh);
    scene.add(phoneLight)
    scene.add(redScreenMesh);

    // for the lamp
    scene.add(laptopScreenLight);

    // Side light
    scene.add(sideTableLight)

    // // Helpers

    // const moonHelper = new THREE.DirectionalLightHelper(moonLight, 1);
    // scene.add(moonHelper);

    // const beamHelper = new THREE.SpotLightHelper(windowBeam);
    // scene.add(beamHelper);

    // const sideHelper = new THREE.PointLightHelper(sideTableLight, 0.5);
    // scene.add(sideHelper);


    // Adding Fog
    const fogColor = 0x050505; 
    scene.background = new THREE.Color(fogColor);
    scene.fog = new THREE.FogExp2(fogColor, 0.08); // Kept your thicker fog
    
    const roomModel = await room;
    const car = new Car();
    await car.load();

    scene.add(roomModel);
    scene.add(car.model);

    // Screen Mesh on Laptop
    scene.add(screenMesh);
    
    // Adding rain shader
    const { mesh: rainGroup } = createRainPlane(4, 3.5); 
    rainGroup.position.set(-4.2, 5.3, 7.11); 
    rainGroup.rotation.y = Math.PI; 
    scene.add(rainGroup);

    // Setting up interactions
    const interaction = new InteractionManager(scene, camera, renderer.domElement);

    const printerGroup = createGroup(roomModel, "printer", [
        "printer_body", "printer_screen", "printer_buttons", "printer_tray"
    ]);
    if (printerGroup) {
        interaction.register(printerGroup.name, () => onPrinterClick({ scene, camera, controls }));
    } 

    const phoneGroup = createGroup(roomModel, "phone", [
        "telephone_body", "telephone_miscellaneous", "telephone_receiver",
    ]);
    if (phoneGroup) {
        interaction.register(phoneGroup.name, () =>  onPhoneClick({ camera, controls, scene }));
    } 

    const laptopGroup = createGroup(roomModel, "laptop", [
        "laptop",
    ]);
    if (laptopGroup) {
        interaction.register(laptopGroup.name, () => onPcClick({ camera, controls, scene, cssRenderer }));
    } 

    const lampGroup = createGroup(roomModel, "lamp_structure", [
    "lamp_paper_body", "lamp_frame"
    ]);
    if (lampGroup) {
        interaction.register(lampGroup.name, () => onLampClick({ scene }));
    }

    // Audio setup
    audioManager.setupCameraListener(camera);
    audioManager.startRainStream();

    const windowTargetPos = new THREE.Vector3();     
    const windowMesh = scene.getObjectByName('window_glass');

    if (windowMesh) {
        windowMesh.getWorldPosition(windowTargetPos); 
    } else {
        windowTargetPos.set(-6, 5, 12); 
    }
    
    // Post-processing 
    const composer = createComposer(renderer, scene, camera);

    // Start animation loop
    animate(scene, camera, controls, renderer, [
        (delta, now) => {
            audioManager.updateRainVolume(camera.position, windowTargetPos);
            if (rainGroup.userData.tick) rainGroup.userData.tick(delta);
            
            cssRenderer.render(scene, camera);
        }
    ], composer);
}

function handleCarMovement(car, delta) {
    car.updateMotion(inputState, delta);
}

function addWindowResizeEventListener(camera, renderer, cssRenderer) {
    window.addEventListener('resize', () => {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
        if(cssRenderer) cssRenderer.setSize(window.innerWidth, window.innerHeight);
    });
}