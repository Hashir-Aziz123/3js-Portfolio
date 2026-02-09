import * as THREE from 'three';
import gsap from 'gsap';
import { CSS3DObject } from 'three/examples/jsm/renderers/CSS3DRenderer.js';
import { laptopScreenLight } from '../../scene/lights'; 
import { projects } from './projectsData.js'; 
import audioManager from '../audioManager'; // 🟢 Import Audio Manager

// Constants
const CAMERA_CONFIG = {
    work: { position: { x: -1.7, y: 4.3, z: 3.6 }, target: { x: -1, y: 4.1, z: 3.94 } },
    duration: 1.5,
    ease: "power2.inOut"
};

const SCREEN_CONFIG = {
    position: { x: -0.75, y: 4.095, z: 4.218 },
    rotation: { x: 0.3, y: Math.PI + 1.207, z: 0.28 },
    scale: 0.001,
    width: 1100,
    height: 695
};

// State
const state = {
    cssObject: null,
    initialCameraState: null,
    currentProjectIndex: 0
};

// ==================== MAIN ENTRY POINT ====================
export default function onPcClick({ camera, controls, scene, cssRenderer }) {
    console.log('💻 Entering Work Mode...');

    const anchorMesh = scene.getObjectByName("screenGlowLayer");
    
    // 🟢 AUDIO: Play Boot-up Sound
    const laptopPos = new THREE.Vector3(SCREEN_CONFIG.position.x, SCREEN_CONFIG.position.y, SCREEN_CONFIG.position.z);
    audioManager.playOneShot('laptop', laptopPos, 7.0);

    // Save initial camera position
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

// ==================== CAMERA ANIMATIONS ====================
function animateCameraToWorkMode(camera, controls, onComplete) {
    controls.enabled = false;

    gsap.to(camera.position, { 
        ...CAMERA_CONFIG.work.position,
        duration: CAMERA_CONFIG.duration, 
        ease: CAMERA_CONFIG.ease
    });
    
    gsap.to(controls.target, { 
        ...CAMERA_CONFIG.work.target,
        duration: CAMERA_CONFIG.duration, 
        ease: CAMERA_CONFIG.ease,
        onUpdate: () => controls.update(),
        onComplete
    });
}

function animateCameraToNormalMode(camera, controls) {
    if (!state.initialCameraState) return;

    gsap.to(camera.position, { 
        ...state.initialCameraState.position, 
        duration: 1.2, 
        ease: "power2.inOut" 
    });
    
    gsap.to(controls.target, { 
        ...state.initialCameraState.target, 
        duration: 1.2, 
        ease: "power2.inOut", 
        onUpdate: () => controls.update() 
    });
}

// ==================== VISUAL EFFECTS ====================
function applyWorkModeEffects(scene, anchorMesh) {
    if (anchorMesh?.material) {
        anchorMesh.material.transparent = true;
        gsap.to(anchorMesh.material, { opacity: 0, duration: 0.5 });
    }

    if (laptopScreenLight) {
        laptopScreenLight.color.setHex(0xffaa55);
        gsap.to(laptopScreenLight, { 
            intensity: 2.5, 
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

// ==================== PROJECT SCREEN CREATION ====================
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

// ==================== HTML GENERATION ====================
function generateScreenHTML(project) {
    return `
        <div id="screen-content" style="${getScreenStyles()}">
            ${generateHeaderHTML()}
            ${generateContentHTML(project)}
            ${generateFooterHTML()}
        </div>
    `;
}

function getScreenStyles() {
    return `
        width: ${SCREEN_CONFIG.width}px; 
        height: ${SCREEN_CONFIG.height}px; 
        background-color: #282828; 
        background-image: linear-gradient(rgba(255, 255, 255, 0.03) 1px, transparent 1px);
        background-size: 100% 20px;
        border: 8px solid #1d2021; 
        box-sizing: border-box;
        color: #ebdbb2; 
        font-family: 'Courier New', monospace; 
        border-radius: 16px; 
        overflow: hidden;
        display: flex; 
        flex-direction: column;
        padding: 40px;
        pointer-events: auto;
        backface-visibility: hidden;
        transform-style: preserve-3d;
        perspective: 1000px;
    `;
}

function generateHeaderHTML() {
    return `
        <div style="
            display: flex; 
            justify-content: space-between; 
            align-items: center;
            margin-bottom: 20px;
            border-bottom: 3px solid #3c3836;
            padding-bottom: 15px;
        ">
            <div style="display: flex; align-items: center; gap: 15px;">
                <span style="color: #fabd2f; font-size: 24px;">●</span>
                <span style="
                    font-size: 22px; 
                    color: #a89984; 
                    font-weight: bold; 
                    letter-spacing: 1px;
                ">HASHIR_PORTFOLIO.EXE</span>
            </div>
            <button id="exit-btn" style="${getButtonStyles('exit')}">X</button>
        </div>
    `;
}

function generateContentHTML(project) {
    return `
        <div style="flex-grow: 1; display: flex; gap: 40px; align-items: center;">
            ${generateImageSection(project)}
            ${generateProjectDetailsSection(project)}
        </div>
    `;
}

function generateImageSection(project) {
    return `
        <div style="
            width: 45%; 
            height: 420px;
            background: #1d2021; 
            border-radius: 8px; 
            overflow: hidden;
            border: 5px solid #3c3836; 
            box-shadow: 8px 8px 0px #1d2021;
            display: flex; 
            align-items: center; 
            justify-content: center;
        ">
            <img id="p-img" src="${project.image}" style="${getImageStyles()}">
        </div>
    `;
}

function generateProjectDetailsSection(project) {
    return `
        <div style="width: 55%; display: flex; flex-direction: column; justify-content: center;">
            <h1 id="p-title" style="${getTitleStyles()}">${project.title}</h1>
            <p id="p-desc" style="${getDescriptionStyles()}">${project.description}</p>
            <div id="p-stack" style="display: flex; gap: 15px; flex-wrap: wrap;">
                ${generateStackTags(project.stack)}
            </div>
        </div>
    `;
}

function generateFooterHTML() {
    return `
        <div style="margin-top: auto; display: flex; gap: 20px; align-items: center; justify-content: flex-end;">
            <button id="prev-btn" style="${getButtonStyles('prev')}">&lt; PREV</button>
            <button id="next-btn" style="${getButtonStyles('next')}">NEXT &gt;</button>
        </div>
    `;
}

// ==================== STYLE HELPERS ====================
function getImageStyles() {
    return `
        width: 100%; 
        height: 100%; 
        object-fit: fill;
        opacity: 0.95; 
        filter: sepia(0.1) contrast(1.1);
        will-change: auto;
    `;
}

function getTitleStyles() {
    return `
        margin: 0 0 20px 0; 
        font-size: 52px;
        font-weight: 800; 
        color: #fe8019;
        letter-spacing: -2px;
        line-height: 1.1;
        -webkit-font-smoothing: antialiased;
        -moz-osx-font-smoothing: grayscale;
        text-rendering: optimizeLegibility;
        will-change: auto;
        transition: none !important;
        animation: none !important;
    `;
}

function getDescriptionStyles() {
    return `
        font-size: 28px;
        color: #d5c4a1; 
        line-height: 1.4; 
        margin-bottom: 30px; 
        font-weight: 600;
        -webkit-font-smoothing: antialiased;
        -moz-osx-font-smoothing: grayscale;
        text-rendering: optimizeLegibility;
        will-change: auto;
        transition: none !important;
        animation: none !important;
    `;
}

function getButtonStyles(type) {
    const baseStyles = `
        border: none;
        border-radius: 8px;
        cursor: pointer;
        font-weight: bold;
        font-family: inherit;
        transition: all 0.2s;
    `;

    const typeStyles = {
        exit: `
            background: #cc241d;
            border: 3px solid #1d2021;
            color: #ebdbb2;
            font-size: 24px;
            width: 50px;
            height: 50px;
            display: flex;
            align-items: center;
            justify-content: center;
            font-weight: bold;
        `,
        prev: `
            background: #3c3836;
            color: #ebdbb2;
            padding: 16px 40px;
            font-size: 20px;
        `,
        next: `
            background: #fabd2f;
            color: #282828;
            padding: 16px 50px;
            font-size: 20px;
            font-weight: 900;
            box-shadow: 0 6px 0px #d79921;
        `
    };

    return baseStyles + typeStyles[type];
}

function generateStackTags(stack) {
    return stack.map(tech => `
        <span style="
            background: #fabd2f; 
            color: #1d2021; 
            padding: 10px 22px;
            border-radius: 8px; 
            font-size: 22px;
            font-weight: 800; 
            border: 2px solid #d79921;
            box-shadow: 4px 4px 0px rgba(0,0,0,0.4);
            display: inline-block;
        ">${tech}</span>
    `).join('');
}

// ==================== EVENT HANDLERS ====================
function attachEventListeners(container, scene, camera, controls, anchorMesh) {
    const nextBtn = container.querySelector('#next-btn');
    const prevBtn = container.querySelector('#prev-btn');
    const exitBtn = container.querySelector('#exit-btn');

    nextBtn.addEventListener('pointerdown', () => {
        // 🟢 AUDIO: UI Click
        audioManager.playOneShot('click', null, 0.5);
        handleNextProject(nextBtn);
    });

    prevBtn.addEventListener('pointerdown', () => {
        // 🟢 AUDIO: UI Click
        audioManager.playOneShot('click', null, 0.5);
        handlePrevProject();
    });

    exitBtn.addEventListener('pointerdown', () => {
        // 🟢 AUDIO: UI Click
        audioManager.playOneShot('click', null, 0.5);
        handleExitWorkMode(scene, camera, controls, anchorMesh);
    });
}

function handleNextProject(button) {
    button.style.transform = 'translateY(6px)';
    button.style.boxShadow = '0 0 0 #d79921';

    setTimeout(() => {
        button.style.transform = 'translateY(0)';
        button.style.boxShadow = '0 6px 0 #d79921';
        
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
    controls.enabled = true;
    removeWorkModeEffects(anchorMesh);
    animateCameraToNormalMode(camera, controls);
}

// ==================== PROJECT DISPLAY UPDATE ====================
function updateProjectDisplay() {
    const content = document.getElementById('screen-content');
    if (!content) return;

    const project = projects[state.currentProjectIndex];
    
    updateElement(content, '#p-title', project.title);
    updateElement(content, '#p-desc', project.description);
    updateElement(content, '#p-img', project.image, true);
    updateStackTags(content, project.stack);
}

function updateElement(container, selector, value, isImage = false) {
    const element = container.querySelector(selector);
    if (!element) return;

    element.style.transition = 'none';
    element.style.animation = 'none';
    
    if (isImage) {
        element.src = value;
    } else {
        element.textContent = value;
    }
    
    void element.offsetHeight;
}

function updateStackTags(container, stack) {
    const stackContainer = container.querySelector('#p-stack');
    if (!stackContainer) return;

    stackContainer.innerHTML = stack.map(tech => `
        <span style="
            background: #fabd2f; 
            color: #1d2021; 
            padding: 10px 18px;
            border-radius: 8px; 
            font-size: 18px;
            font-weight: 800; 
            border: 2px solid #d79921;
            box-shadow: 4px 4px 0px rgba(0,0,0,0.4);
            display: inline-block;
        ">${tech}</span>
    `).join('');
}