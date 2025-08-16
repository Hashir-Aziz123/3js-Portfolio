import * as THREE from 'three';

import camera from './scene/camera';
import controls from './scene/controls';
import renderer from './scene/renderer';

import Car from './objects/car';
import room from './objects/room';

import { backgroundLight } from './scene/lights';
import { addCarMovementEventListener, disposeKeyboardControls, inputState } from './systems/events';
import animate from './systems/animate';

export async function setUpScene() {
    // Adding all event listeners
    addWindowResizeEventListener(camera, renderer);
    addCarMovementEventListener();

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x000000);

    scene.add(backgroundLight);

    const axesHelper = new THREE.AxesHelper(5);
    scene.add(axesHelper);

    const gridHelper = new THREE.GridHelper(10, 10);
    scene.add(gridHelper);

    const roomModel = await room;
    const car = new Car();
    await car.load();

    scene.add(roomModel);
    scene.add(car.model);

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