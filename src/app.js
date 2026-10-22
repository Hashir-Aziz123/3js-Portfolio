import * as THREE from 'three';

import camera from './scene/camera';
import controls from './scene/controls';
import renderer from './scene/renderer';
import { createCSSRenderer } from './scene/cssRenderer'; 

import Car from './objects/car';
import loadRoom from './objects/room';
import screenMesh from './objects/screenMesh';

import { backgroundLight, moonLight, lampLight, moonLightTarget, windowBeam, beamTarget,
         printerLight, phoneLight, greenScreenMesh, redScreenMesh, laptopScreenLight, sideTableLight } from './scene/lights';
import { createComposer } from './scene/postprocessing';
import animate from './systems/animate';
import { createAdaptiveResolution } from './systems/adaptiveResolution';

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

let isStarted = false;

// Loads every asset and builds the scene behind the loading overlay.
// onProgress receives the download fraction (0-1) of the models.
export async function setUpScene(onProgress = () => {}) {

    window.camera = camera;
    window.controls = controls;

    controls.target.set( -3.659, 0.133, 3.957);
    controls.update();

    controls.enableDamping = true;
    controls.enabled = false; // enabled by startScene() once the overlay is dismissed

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

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x000000);

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
    
    // Download everything in parallel; the room is ~90% of the bytes
    const loaded = { room: 0, car: 0 };
    const trackProgress = (key) => (event) => {
        if (!event.total) return;
        loaded[key] = event.loaded / event.total;
        onProgress(0.9 * loaded.room + 0.1 * loaded.car);
    };

    const car = new Car();
    const [roomModel, , { mesh: rainGroup }] = await Promise.all([
        loadRoom(trackProgress('room')),
        car.load(trackProgress('car')),
        createRainPlane(4, 3.5)
    ]);

    scene.add(roomModel);
    scene.add(car.model);

    // Screen Mesh on Laptop
    scene.add(screenMesh);
    
    // Adding rain shader
    rainGroup.position.set(-4.2, 5.3, 7.11); 
    rainGroup.rotation.y = Math.PI; 
    scene.add(rainGroup);

    // Setting up interactions
    const interaction = new InteractionManager(scene, camera, renderer.domElement);

    // Objects only respond while the user is free to look around. Controls are off during
    // camera moves and while a panel is open, and the panels' close buttons act on
    // pointerdown, so the rest of that tap lands on the scene behind and would otherwise
    // reopen whatever is under the button.
    const whenFree = (handler) => () => {
        if (controls.enabled) handler();
    };

    const printerGroup = createGroup(roomModel, "printer", [
        "printer_body", "printer_screen", "printer_buttons", "printer_tray"
    ]);
    if (printerGroup) {
        interaction.register(printerGroup.name, whenFree(() => onPrinterClick({ scene, camera, controls })));
    } 

    const phoneGroup = createGroup(roomModel, "phone", [
        "telephone_body", "telephone_miscellaneous", "telephone_receiver",
    ]);
    if (phoneGroup) {
        interaction.register(phoneGroup.name, whenFree(() => onPhoneClick({ camera, controls, scene })));
    } 

    const laptopGroup = createGroup(roomModel, "laptop", [
        "laptop",
    ]);
    if (laptopGroup) {
        interaction.register(laptopGroup.name, whenFree(() => onPcClick({ camera, controls, scene, cssRenderer })));
    } 

    const lampGroup = createGroup(roomModel, "lamp_structure", [
    "lamp_paper_body", "lamp_frame"
    ]);
    if (lampGroup) {
        interaction.register(lampGroup.name, whenFree(() => onLampClick({ scene })));
    }

    // Audio setup
    audioManager.setupCameraListener(camera);

    const windowTargetPos = new THREE.Vector3();     
    const windowMesh = scene.getObjectByName('window_glass');

    if (windowMesh) {
        windowMesh.getWorldPosition(windowTargetPos); 
    } else {
        windowTargetPos.set(-6, 5, 12); 
    }
    
    // Post-processing 
    const composer = createComposer(renderer, scene, camera);
    addWindowResizeEventListener(camera, renderer, cssRenderer, composer);

    // Shadow maps are static (see renderer.js): draw them once now.
    // Compiling shaders up front avoids a freeze on the first visible frame.
    renderer.shadowMap.needsUpdate = true;
    await renderer.compileAsync(scene, camera);

    const updateResolution = createAdaptiveResolution(renderer, composer);

    // Start animation loop
    animate(scene, camera, controls, renderer, [
        (delta, now) => {
            audioManager.updateRainVolume(camera.position, windowTargetPos);
            if (rainGroup.userData.tick) rainGroup.userData.tick(delta);
            
            cssRenderer.render(scene, camera);

            // Only judge frame rate once the user is in the scene, not while loading
            if (isStarted) updateResolution(delta);
        }
    ], composer);

    // Render a couple of frames behind the overlay so textures are uploaded to the GPU
    await new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve)));
}

// Called on the user's click: browsers only allow audio after a user gesture
export function startScene() {
    isStarted = true;
    controls.enabled = true;
    audioManager.startRainStream();
}

function addWindowResizeEventListener(camera, renderer, cssRenderer, composer) {
    window.addEventListener('resize', () => {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
        if(cssRenderer) cssRenderer.setSize(window.innerWidth, window.innerHeight);
        if(composer) composer.setSize(window.innerWidth, window.innerHeight);
    });
}