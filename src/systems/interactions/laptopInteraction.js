import * as THREE from 'three';
import gsap from 'gsap';
import { CSS3DObject } from 'three/examples/jsm/renderers/CSS3DRenderer.js';
import { laptopScreenLight } from '../../scene/lights'; 
import { projects } from './projectsData.js'; 
import audioManager from '../audioManager'; 

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
            <button id="exit-btn" style="${getButtonStyles('exit')}">X</button>
            <h1 style="${getMainHeadingStyles()}">Explore My Projects</h1>
            <div style="width: 100%; height: 2px; background: #504945; margin-bottom: 20px;"></div>
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
        padding: 40px 50px 30px 50px;
        pointer-events: auto;
        backface-visibility: hidden;
        transform-style: preserve-3d;
        perspective: 1000px;
        position: relative;
    `;
}

function getMainHeadingStyles() {
    return `
        margin: 0 0 12px 0;
        font-size: 30px;
        font-weight: 900;
        color: #fabd2f;
        text-align: left;
        letter-spacing: 2px;
        text-transform: uppercase;
    `;
}

function generateContentHTML(project) {
    return `
        <div style="flex-grow: 1; display: flex; gap: 40px; align-items: flex-start;">
            <div style="width: 50%; display: flex; flex-direction: column; gap: 18px;">
                ${generateGithubLink(project)}
                ${generateImageSection(project)}
            </div>
            ${generateProjectDetailsSection(project)}
        </div>
    `;
}

function generateGithubLink(project) {
    return `
        <a href="${project.github || '#'}" target="_blank" style="
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 10px;
            background: #458588;
            color: #ebdbb2;
            padding: 14px 24px;
            border-radius: 6px;
            text-decoration: none;
            font-size: 18px;
            font-weight: 700;
            border: 2px solid #076678;
            box-shadow: 3px 3px 0px rgba(0,0,0,0.3);
            transition: all 0.2s;
            width: fit-content;
        " onmouseover="this.style.background='#076678'" onmouseout="this.style.background='#458588'">
            <svg width="22" height="22" fill="currentColor" viewBox="0 0 16 16">
                <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.012 8.012 0 0 0 16 8c0-4.42-3.58-8-8-8z"/>
            </svg>
            Check out on GitHub
        </a>
    `;
}

function generateImageSection(project) {
    return `
        <div style="
            width: 100%; 
            aspect-ratio: 4/3;
            background: #1d2021; 
            border-radius: 8px; 
            overflow: hidden;
            border: 2px solid #504945; 
            box-shadow: 0 8px 20px rgba(0,0,0,0.5);
            display: flex; 
            align-items: center; 
            justify-content: center;
            position: relative;
        ">
            <img id="p-img" src="${project.image}" style="${getImageStyles()}">
        </div>
    `;
}

function generateProjectDetailsSection(project) {
    return `
        <div style="width: 50%; display: flex; flex-direction: column; gap: 15px;">
            <h2 id="p-title" style="${getTitleStyles()}">${project.title}</h2>
            <p id="p-desc" style="${getDescriptionStyles()}">${project.description}</p>
            <div id="p-stack" style="display: flex; gap: 12px; flex-wrap: wrap; margin-top: auto;">
                ${generateStackTags(project.stack)}
            </div>
        </div>
    `;
}

function generateFooterHTML() {
    return `
        <div style="margin-top: 15px; display: flex; gap: 15px; align-items: center; justify-content: center;">
            <button id="prev-btn" style="${getButtonStyles('prev')}">&lt; PREV</button>
            <button id="next-btn" style="${getButtonStyles('next')}">NEXT &gt;</button>
        </div>
    `;
}

function getImageStyles() {
    return `
        width: 100%; 
        height: 100%; 
        object-fit: cover;
        opacity: 0.9; 
        will-change: auto;
    `;
}

function getTitleStyles() {
    return `
        margin: 0; 
        font-size: 42px;
        font-weight: 800; 
        color: #fe8019;
        letter-spacing: -0.5px;
        line-height: 1.1;
    `;
}

function getDescriptionStyles() {
    return `
        font-size: 28px;
        color: #ebdbb2; 
        line-height: 1.7; 
        margin: 0; 
        font-weight: 500;
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
            position: absolute;
            top: 25px;
            right: 25px;
            z-index: 50;
            background: #cc241d;
            border: 2px solid #1d2021;
            color: #ebdbb2;
            font-size: 20px;
            width: 45px;
            height: 45px;
            display: flex;
            align-items: center;
            justify-content: center;
            font-weight: bold;
            box-shadow: 0 4px 0 rgba(0,0,0,0.5);
        `,
        prev: `
            background: #3c3836;
            color: #ebdbb2;
            padding: 12px 30px;
            font-size: 16px;
        `,
        next: `
            background: #fabd2f;
            color: #282828;
            padding: 12px 35px;
            font-size: 16px;
            font-weight: 900;
            box-shadow: 0 4px 0px #d79921;
        `
    };

    return baseStyles + typeStyles[type];
}

function generateStackTags(stack) {
    return stack.map(tech => `
        <span style="
            background: #fabd2f; 
            color: #1d2021; 
            padding: 12px 24px;
            border-radius: 6px; 
            font-size: 20px;
            font-weight: 800; 
            border: 2px solid #d79921;
            box-shadow: 3px 3px 0px rgba(0,0,0,0.4);
            display: inline-block;
        ">${tech}</span>
    `).join('');
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
    controls.enabled = true;
    removeWorkModeEffects(anchorMesh);
    animateCameraToNormalMode(camera, controls);
}

function updateProjectDisplay() {
    const content = document.getElementById('screen-content');
    if (!content) return;

    const project = projects[state.currentProjectIndex];
    
    updateElement(content, '#p-title', project.title);
    updateElement(content, '#p-desc', project.description);
    updateElement(content, '#p-img', project.image, true);
    updateStackTags(content, project.stack);
    updateGithubLink(content, project.github);
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

    stackContainer.innerHTML = generateStackTags(stack);
}

function updateGithubLink(container, githubUrl) {
    const githubLink = container.querySelector('a[href*="github"]');
    if (!githubLink) return;
    
    githubLink.href = githubUrl || '#';
}