import * as THREE from 'three';
import gsap from 'gsap';
import { CSS3DObject } from 'three/examples/jsm/renderers/CSS3DRenderer.js';
import { laptopScreenLight, LAPTOP_LIGHT_ON_INTENSITY } from '../../scene/lights'; 
import { projects } from './projectsData.js'; 
import audioManager from '../audioManager';
import { transitionCamera, fitViewToPanel } from './cameraTransition.js';
import { isTouch } from '../../utils/device';

const CAMERA_CONFIG = {
    work: { position: { x: -1.7, y: 4.3, z: 3.6 }, target: { x: -1, y: 4.1, z: 3.94 } }
};

const SCREEN_CONFIG = {
    position: { x: -0.75, y: 4.095, z: 4.218 },
    rotation: { x: 0.3, y: Math.PI + 1.207, z: 0.28 },
    scale: 0.001,
    width: 1100,
    height: 695
};

// Fingers need bigger targets than a mouse; on touch screens the buttons grow and the
// description shrinks a little so everything still fits the screen
const SIZES = isTouch
    ? { description: 28, button: 24, prevPadding: '20px 40px', nextPadding: '20px 44px', exit: 66, github: 22, githubPadding: '20px 30px' }
    : { description: 30, button: 18, prevPadding: '12px 30px', nextPadding: '12px 35px', exit: 45, github: 18, githubPadding: '12px 24px' };

const state = {
    cssObject: null,
    initialCameraState: null,
    currentProjectIndex: 0
};

export default function onPcClick({ camera, controls, scene, cssRenderer }) {
    console.log('💻 Entering Work Mode...');

    const anchorMesh = scene.getObjectByName("screenGlowLayer");
    
    const laptopPos = new THREE.Vector3(SCREEN_CONFIG.position.x, SCREEN_CONFIG.position.y, SCREEN_CONFIG.position.z);
    audioManager.playOneShot('laptop', laptopPos, 7.0);

    if (!state.initialCameraState) {
        state.initialCameraState = {
            position: camera.position.clone(),
            target: controls.target.clone()
        };
    }

    animateCameraToWorkMode(camera, controls, () => {
        applyWorkModeEffects(scene, anchorMesh);
        createProjectScreen(scene, camera, controls, anchorMesh);
    });
}

function animateCameraToWorkMode(camera, controls, onComplete) {
    controls.enabled = false;
    const view = fitViewToPanel(CAMERA_CONFIG.work, camera, {
        center: SCREEN_CONFIG.position,
        width: SCREEN_CONFIG.width,
        height: SCREEN_CONFIG.height,
        scale: SCREEN_CONFIG.scale,
        normal: getScreenNormal()
    });
    transitionCamera(camera, controls, view, { onComplete });
}

// The direction the laptop screen faces (a CSS3D panel shows on its +Z side)
function getScreenNormal() {
    const { x, y, z } = SCREEN_CONFIG.rotation;
    return new THREE.Vector3(0, 0, 1).applyEuler(new THREE.Euler(x, y, z));
}

function animateCameraToNormalMode(camera, controls) {
    if (!state.initialCameraState) {
        controls.enabled = true;
        return;
    }

    // Controls stay off until the camera is back, so a drag can't fight the move
    transitionCamera(camera, controls, state.initialCameraState, {
        duration: 1.6,
        onComplete: () => { controls.enabled = true; }
    });
}

function applyWorkModeEffects(scene, anchorMesh) {
    if (anchorMesh?.material) {
        anchorMesh.material.transparent = true;
        gsap.to(anchorMesh.material, { opacity: 0, duration: 0.5 });
    }

    if (laptopScreenLight) {
        laptopScreenLight.color.setHex(0xffaa55);
        gsap.to(laptopScreenLight, { 
            intensity: LAPTOP_LIGHT_ON_INTENSITY, 
            duration: 1.0, 
            ease: "power2.out" 
        });
    }
}

function removeWorkModeEffects(anchorMesh) {
    if (laptopScreenLight) {
        gsap.to(laptopScreenLight, { intensity: 0, duration: 1.0 });
    }

    if (anchorMesh?.material) {
        gsap.to(anchorMesh.material, { opacity: 0.8, duration: 1.0 });
    }
}

function createProjectScreen(scene, camera, controls, anchorMesh) {
    if (state.cssObject) return; 

    const container = createScreenContainer();
    state.cssObject = new CSS3DObject(container);
    
    state.cssObject.position.set(
        SCREEN_CONFIG.position.x, 
        SCREEN_CONFIG.position.y, 
        SCREEN_CONFIG.position.z
    );
    state.cssObject.rotation.set(
        SCREEN_CONFIG.rotation.x, 
        SCREEN_CONFIG.rotation.y, 
        SCREEN_CONFIG.rotation.z
    );
    state.cssObject.scale.set(
        SCREEN_CONFIG.scale, 
        SCREEN_CONFIG.scale, 
        SCREEN_CONFIG.scale
    );

    scene.add(state.cssObject);

    gsap.to(container, { opacity: 1, duration: 0.8, ease: "power2.inOut" });

    setTimeout(() => attachEventListeners(container, scene, camera, controls, anchorMesh), 100);
}

function createScreenContainer() {
    const container = document.createElement('div');
    container.style.opacity = '0';
    container.innerHTML = generateScreenHTML(projects[state.currentProjectIndex]);
    return container;
}

function generateScreenHTML(project) {
    return `
        <div id="screen-content" style="${getScreenStyles()}">
            <div style="display: flex; align-items: center; justify-content: space-between;">
                <h1 style="${getMainHeadingStyles()}">Explore My Projects</h1>
                <div style="display: flex; align-items: center; gap: 22px;">
                    <span id="p-count" style="font-size: 20px; font-weight: 700; color: #a89984; letter-spacing: 2px;">${getCounterText()}</span>
                    <button id="exit-btn" style="${getButtonStyles('exit')}">X</button>
                </div>
            </div>
            <div style="width: 100%; height: 2px; background: #504945; margin: 18px 0 26px 0;"></div>
            ${generateContentHTML(project)}
            ${generateFooterHTML(project)}
        </div>
    `;
}

function getScreenStyles() {
    return `
        width: ${SCREEN_CONFIG.width}px; 
        height: ${SCREEN_CONFIG.height}px; 
        background-color: #282828; 
        background-image: linear-gradient(rgba(255, 255, 255, 0.025) 1px, transparent 1px);
        background-size: 100% 20px;
        border: 8px solid #1d2021; 
        box-sizing: border-box;
        color: #ebdbb2; 
        font-family: 'Courier New', monospace; 
        border-radius: 16px; 
        overflow: hidden;
        display: flex; 
        flex-direction: column;
        padding: 34px 48px 30px 48px;
        pointer-events: auto;
        backface-visibility: hidden;
        transform-style: preserve-3d;
        perspective: 1000px;
        position: relative;
    `;
}

function getMainHeadingStyles() {
    return `
        margin: 0;
        font-size: 26px;
        font-weight: 900;
        color: #fabd2f;
        letter-spacing: 3px;
        text-transform: uppercase;
    `;
}

function getCounterText() {
    const pad = (n) => String(n).padStart(2, '0');
    return `${pad(state.currentProjectIndex + 1)} / ${pad(projects.length)}`;
}

function generateContentHTML(project) {
    return `
        <div style="flex-grow: 1; display: flex; flex-direction: column; gap: 14px;">
            <h2 id="p-title" style="${getTitleStyles()}">${project.title}</h2>
            <div id="p-tagline" style="${getTaglineStyles()}">${project.tagline}</div>
            <p id="p-desc" style="${getDescriptionStyles()}">${project.description}</p>
        </div>
    `;
}

function generateFooterHTML(project) {
    return `
        <div style="margin-top: 24px; display: flex; align-items: center; justify-content: space-between;">
            ${generateGithubLink(project)}
            <div style="display: flex; gap: 14px; margin-left: auto;">
                <button id="prev-btn" style="${getButtonStyles('prev')}">&lt; PREV</button>
                <button id="next-btn" style="${getButtonStyles('next')}">NEXT &gt;</button>
            </div>
        </div>
    `;
}

function generateGithubLink(project) {
    return `
        <a id="p-github" href="${project.github || '#'}" target="_blank" style="
            display: ${project.github ? 'flex' : 'none'};
            align-items: center;
            gap: 10px;
            background: #fe8019;
            color: #1d2021;
            padding: ${SIZES.githubPadding};
            border-radius: 6px;
            text-decoration: none;
            font-size: ${SIZES.github}px;
            font-weight: 900;
            letter-spacing: 1px;
            box-shadow: 0 4px 0 #af3a03;
            transition: background 0.2s;
        " onmouseover="this.style.background='#fabd2f'" onmouseout="this.style.background='#fe8019'">
            <svg width="22" height="22" fill="currentColor" viewBox="0 0 16 16">
                <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.012 8.012 0 0 0 16 8c0-4.42-3.58-8-8-8z"/>
            </svg>
            VIEW ON GITHUB
        </a>
    `;
}

function getTitleStyles() {
    return `
        margin: 0; 
        font-size: 46px;
        font-weight: 800; 
        color: #fe8019;
        letter-spacing: -0.5px;
        line-height: 1.1;
    `;
}

function getTaglineStyles() {
    return `
        font-size: 19px;
        font-weight: 700;
        color: #d79921;
        letter-spacing: 1.5px;
        text-transform: uppercase;
    `;
}

function getDescriptionStyles() {
    return `
        font-family: Consolas, Menlo, 'Courier New', monospace;
        font-size: ${SIZES.description}px;
        color: #ebdbb2;
        line-height: 1.6;
        margin: 6px 0 0 0; 
    `;
}

function getButtonStyles(type) {
    const baseStyles = `
        border: none;
        border-radius: 6px;
        cursor: pointer;
        font-weight: bold;
        font-family: inherit;
        transition: all 0.2s;
    `;

    const typeStyles = {
        exit: `
            background: #cc241d;
            border: 2px solid #1d2021;
            color: #ebdbb2;
            font-size: ${Math.round(SIZES.exit * 0.45)}px;
            width: ${SIZES.exit}px;
            height: ${SIZES.exit}px;
            display: flex;
            align-items: center;
            justify-content: center;
            font-weight: bold;
            box-shadow: 0 4px 0 rgba(0,0,0,0.5);
        `,
        prev: `
            background: #3c3836;
            color: #ebdbb2;
            padding: ${SIZES.prevPadding};
            font-size: ${SIZES.button}px;
            box-shadow: 0 4px 0 #1d2021;
        `,
        next: `
            background: #fabd2f;
            color: #282828;
            padding: ${SIZES.nextPadding};
            font-size: ${SIZES.button}px;
            font-weight: 900;
            box-shadow: 0 4px 0px #d79921;
        `
    };

    return baseStyles + typeStyles[type];
}

function attachEventListeners(container, scene, camera, controls, anchorMesh) {
    const nextBtn = container.querySelector('#next-btn');
    const prevBtn = container.querySelector('#prev-btn');
    const exitBtn = container.querySelector('#exit-btn');

    nextBtn.addEventListener('pointerdown', () => {
        audioManager.playOneShot('click', null, 0.5);
        handleNextProject(nextBtn);
    });

    prevBtn.addEventListener('pointerdown', () => {
        audioManager.playOneShot('click', null, 0.5);
        handlePrevProject();
    });

    exitBtn.addEventListener('pointerdown', () => {
        audioManager.playOneShot('click', null, 0.5);
        handleExitWorkMode(scene, camera, controls, anchorMesh);
    });
}

function handleNextProject(button) {
    button.style.transform = 'translateY(4px)';
    button.style.boxShadow = '0 0 0 #d79921';

    setTimeout(() => {
        button.style.transform = 'translateY(0)';
        button.style.boxShadow = '0 4px 0 #d79921';
        
        state.currentProjectIndex = (state.currentProjectIndex + 1) % projects.length;
        updateProjectDisplay();
    }, 100);
}

function handlePrevProject() {
    state.currentProjectIndex = (state.currentProjectIndex - 1 + projects.length) % projects.length;
    updateProjectDisplay();
}

function handleExitWorkMode(scene, camera, controls, anchorMesh) {
    if (!state.cssObject) return;

    scene.remove(state.cssObject);
    state.cssObject = null;
    removeWorkModeEffects(anchorMesh);
    animateCameraToNormalMode(camera, controls);
}

function updateProjectDisplay() {
    const content = document.getElementById('screen-content');
    if (!content) return;

    const project = projects[state.currentProjectIndex];
    
    updateElement(content, '#p-title', project.title);
    updateElement(content, '#p-tagline', project.tagline);
    updateElement(content, '#p-desc', project.description);
    updateElement(content, '#p-count', getCounterText());
    updateGithubLink(content, project.github);
}

function updateElement(container, selector, value) {
    const element = container.querySelector(selector);
    if (!element) return;

    element.textContent = value;
}

function updateGithubLink(container, githubUrl) {
    const githubLink = container.querySelector('#p-github');
    if (!githubLink) return;

    // Projects without a repo URL hide the button instead of linking to '#'
    githubLink.href = githubUrl || '#';
    githubLink.style.display = githubUrl ? 'flex' : 'none';
}
