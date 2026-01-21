import * as THREE from 'three';

import camera from './scene/camera';
import controls from './scene/controls';
import renderer from './scene/renderer';

import Car from './objects/car';
import room from './objects/room';

import { backgroundLight, moonLight, lampLight, moonLightTarget } from './scene/lights';
import { addCarMovementEventListener, disposeKeyboardControls, inputState } from './systems/events';
import animate from './systems/animate';

// Interactions
import { createGroup } from './utils/createGroup';           
import InteractionManager from './systems/interactions/interactionManager';

import onPrinterClick from './systems/interactions/printerEvent';
import onPhoneClick from './systems/interactions/phoneEvent';
import onPcClick from './systems/interactions/laptopInteraction';

export async function setUpScene() {
    // Adding all event listeners
    addWindowResizeEventListener(camera, renderer);
    addCarMovementEventListener();

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x000000);

    // Adding lights
    scene.add(backgroundLight);
    scene.add(moonLight);
    scene.add(lampLight);
    scene.add(moonLightTarget);

    // Adding light helpers for debugging
    // const moonHelper = new THREE.DirectionalLightHelper(moonLight, 1);
    // scene.add(moonHelper);
    // const lampHelper = new THREE.PointLightHelper(lampLight, 0.2);
    // scene.add(lampHelper);

    // const shadowHelper1 = new THREE.CameraHelper(moonLight.shadow.camera);
    // scene.add(shadowHelper1);

    // const shadowHelper2 = new THREE.CameraHelper(lampLight.shadow.camera);
    
    

    // Axes Helpers
    const axesHelper = new THREE.AxesHelper(5);
    scene.add(axesHelper);
    const gridHelper = new THREE.GridHelper(10, 10);
    scene.add(gridHelper);

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

    // Start animation loop

    animate(scene, camera, controls, renderer, [
        (delta) => handleCarMovement(car, delta)
    ]);
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



