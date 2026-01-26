import * as THREE from 'three';
import { RectAreaLightUniformsLib, RectAreaLightHelper } from 'three/examples/jsm/Addons.js';

import camera from './scene/camera';
import controls from './scene/controls';
import renderer from './scene/renderer';

import Car from './objects/car';
import room from './objects/room';

import { backgroundLight, moonLight, lampLight, moonLightTarget, windowBeam, beamTarget, printerLight, phoneLight, greenScreenMesh, redScreenMesh } from './scene/lights';
import { addCarMovementEventListener, disposeKeyboardControls, inputState } from './systems/events';
import { createComposer } from './scene/postprocessing';
import animate from './systems/animate';

// Interactions
import { createGroup } from './utils/createGroup';           
import InteractionManager from './systems/interactions/interactionManager';

import onPrinterClick from './systems/interactions/printerEvent';
import onPhoneClick from './systems/interactions/phoneEvent';
import onPcClick from './systems/interactions/laptopInteraction';

// Audio
import audioManager from './systems/audioManager';

export async function setUpScene() {

    // Adding all event listeners
    addWindowResizeEventListener(camera, renderer);
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



    // Adding light helpers for debugging
    // const moonHelper = new THREE.DirectionalLightHelper(moonLight, 1);
    // scene.add(moonHelper);
    // const lampHelper = new THREE.PointLightHelper(lampLight, 0.2);
    // scene.add(lampHelper);

    // const shadowHelper1 = new THREE.CameraHelper(moonLight.shadow.camera);
    // scene.add(shadowHelper1);

    // const moonHelper = new THREE.DirectionalLightHelper(windowBeam, 1);
    // scene.add(moonHelper);

    // const printerLightHelper = new RectAreaLightHelper(printerLight);
    // scene.add(printerLightHelper);

    // const phoneLightHelper = new RectAreaLightHelper(phoneLight);
    // scene.add(phoneLightHelper);

    // const shadowHelper2 = new THREE.CameraHelper(lampLight.shadow.camera);
    
    

    // Axes Helpers
    // const axesHelper = new THREE.AxesHelper(5);
    // scene.add(axesHelper);
    // const gridHelper = new THREE.GridHelper(10, 10);
    // scene.add(gridHelper);

    const roomModel = await room;
    const car = new Car();
    await car.load();

    scene.add(roomModel);
    scene.add(car.model);

    // For debugging: print the room model hierarchy to console
    console.log('Room model hierarchy:');
    roomModel.traverse(obj => {
    console.log(obj.name, obj.type);
    });


    // Setting up interactions
    const interaction = new InteractionManager(scene, camera, renderer.domElement);

    const printerGroup = createGroup(roomModel, "printer", [
        "printer_body",
        "printer_screen",
        "printer_buttons",
        "printer_tray"
    ]);
    if (printerGroup) {
        interaction.register(printerGroup.name, onPrinterClick);
        console.log('Registered printer group:', printerGroup);
    } else {
    console.warn("Printer not found!");
    }

    const phoneGroup = createGroup(roomModel, "phone", [
        "telephone_body",
        "telephone_miscellaneous",
        "telephone_receiver",
    ]);
    if (phoneGroup) {
        interaction.register(phoneGroup.name, onPhoneClick);
        console.log('Registered phone group:', phoneGroup);
    } else {
        console.warn("Phone not found!");
    }

    const laptopGroup = createGroup(roomModel, "laptop", [
        "laptop",
    ]);
    if (laptopGroup) {
        interaction.register(laptopGroup.name, () => onPcClick({ camera, controls }));
        console.log('Registered laptop group:', laptopGroup);
    } else {
        console.warn("Laptop not found!");
    }

    // Audio setup
    audioManager.setupCameraListener(camera);
   
    const windowMesh = scene.getObjectByName('window_glass');
    if (windowMesh) {
        audioManager.initRain(windowMesh);
    } else {
        console.warn("Window glass mesh not found!");
    }
    
    // Post-processing 
    const composer = createComposer(renderer, scene, camera);

    // Start animation loop
    animate(scene, camera, controls, renderer, [], composer);
}

function handleCarMovement(car, delta) {
    car.updateMotion(inputState, delta);
}

function addWindowResizeEventListener(camera, renderer) {
    window.addEventListener('resize', () => {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
    });
}



