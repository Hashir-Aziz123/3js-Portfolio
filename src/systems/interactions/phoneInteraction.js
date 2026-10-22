import * as THREE from 'three';
import gsap from 'gsap';
import { CSS3DObject } from 'three/examples/jsm/renderers/CSS3DRenderer.js';
import audioManager  from '../audioManager.js';
import { transitionCamera, fitViewToPanel } from './cameraTransition.js';

// Constants
const PHONE_VIEW = {
    position: { x: -2, y: 4.52, z: -5 },
    target: { x: -1.2, y: 3.4, z: -3.8 }
};

const CONTACT_CONFIG = {
    position: { x: -1.2, y: 3.9, z: -3.8 },
    scale: 0.001,
    email: "hashir14aziz@gmail.com"
};

const ANIMATION_CONFIG = {
    fadeIn: 0.5
};

// State
const state = {
    cssObject: null,
    initialCameraState: null
};

export default function onPhoneClick({ camera, controls, scene }) {
    console.log('☎️ Establishing Uplink...');

    if (!state.initialCameraState) {
        state.initialCameraState = {
            position: camera.position.clone(),
            target: controls.target.clone()
        };
    }

    const phonePos = new THREE.Vector3(CONTACT_CONFIG.position.x, CONTACT_CONFIG.position.y, CONTACT_CONFIG.position.z);
    const ringSound = audioManager.playOneShot('phone_ring', phonePos, 2.5);

    animateCameraToPhone(camera, controls, () => {

        if (ringSound && ringSound.isPlaying) {
            ringSound.stop();
        }
        audioManager.playOneShot('phone_pickup', phonePos, 3.5);

        createContactInterface(scene, camera, controls);
    });
}


function animateCameraToPhone(camera, controls, onComplete) {
    controls.enabled = false;
    const { width, height } = measureContactCard();
    const view = fitViewToPanel(PHONE_VIEW, camera, {
        center: CONTACT_CONFIG.position,
        width,
        height,
        scale: CONTACT_CONFIG.scale
    });
    transitionCamera(camera, controls, view, { onComplete });
}

// The card's height depends on its content, so lay it out once offscreen to measure it
let cardSize = null;
function measureContactCard() {
    if (cardSize) return cardSize;

    const probe = createContactContainer();
    probe.style.cssText = 'position: absolute; left: -10000px; top: 0; visibility: hidden;';
    document.body.appendChild(probe);
    cardSize = { width: probe.offsetWidth, height: probe.offsetHeight };
    probe.remove();
    return cardSize;
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


function createContactInterface(scene, camera, controls) {
    if (state.cssObject) return;
    const container = createContactContainer();
    state.cssObject = new CSS3DObject(container);
    state.cssObject.position.set(CONTACT_CONFIG.position.x, CONTACT_CONFIG.position.y, CONTACT_CONFIG.position.z);
    // Keep the card parallel to the screen: the camera has just arrived at the phone view
    // (which is closer on phones, see fitViewToPanel), so match its rotation
    state.cssObject.quaternion.copy(camera.quaternion);
    state.cssObject.scale.set(CONTACT_CONFIG.scale, CONTACT_CONFIG.scale, CONTACT_CONFIG.scale);
    scene.add(state.cssObject);
    gsap.to(container, { opacity: 1, duration: ANIMATION_CONFIG.fadeIn });
    gsap.from(state.cssObject.position, { y: state.cssObject.position.y - 0.2, duration: 0.8, ease: "back.out(1.7)" });
    setTimeout(() => attachEventListeners(container, scene, camera, controls), 100);
}

function createContactContainer() {
    const container = document.createElement('div');
    container.style.opacity = '0';
    container.innerHTML = generateContactHTML();
    return container;
}

// ==================== HTML GENERATION ====================

function generateContactHTML() {
    return `
        <div id="phone-ui" style="${getContainerStyles()}">
            ${generateHeaderHTML()}
            ${generateProfileHTML()}
            ${generateButtonsHTML()}
            ${generateFooterHTML()}
        </div>
    `;
}

function getContainerStyles() {
    return `
        width: 1040px; 
        padding: 90px;
        background-color: #282828; 
        border: 10px solid #fabd2f;
        border-radius: 32px;
        font-family: 'Courier New', monospace;
        color: #ebdbb2;
        box-shadow: 0 0 80px rgba(250, 189, 47, 0.2);
        display: flex; 
        flex-direction: column; 
        gap: 50px;
        backface-visibility: hidden;
        pointer-events: auto;
    `;
}

function generateHeaderHTML() {
    return `
        <div style="
            border-bottom: 6px solid #504945; 
            padding-bottom: 36px;
            display: flex; 
            justify-content: space-between; 
            align-items: center;
        ">
            <span style="
                font-size: 44px; /* Doubled */
                font-weight: bold; 
                color: #fabd2f;
                letter-spacing: 2px;
                -webkit-font-smoothing: antialiased;
            ">● CONTACT INFORMATION</span>
        </div>
    `;
}

function generateProfileHTML() {
    return `
        <div style="
            display: flex; gap: 50px; align-items: center;
        ">
            <img src="https://github.com/Hashir-Aziz123.png" style="
                width: 180px; /* Doubled */
                height: 180px; 
                border-radius: 50%; 
                border: 6px solid #d5c4a1;
                box-shadow: 0 8px 24px rgba(0,0,0,0.3);
            ">
            <div>
                <h2 style="${getNameStyles()}">Hashir Aziz</h2>
                <p style="${getSubtitleStyles()}">CS Student | AI/ML Engineer</p>
            </div>
        </div>
    `;
}

function generateButtonsHTML() {
    return `
        <div style="
            display: flex; flex-direction: column; gap: 28px; margin-top: 10px;
        ">
            <a href="https://www.linkedin.com/in/hashir-aziz-aab28b281/" target="_blank" style="text-decoration: none;">
                <button class="contact-btn" style="${getButtonStyles('linkedin')}">
                 
                    <span>LINKEDIN PROFILE</span>
                </button>
            </a>

            <a href="https://github.com/Hashir-Aziz123" target="_blank" style="text-decoration: none;">
                <button class="contact-btn" style="${getButtonStyles('github')}">
                
                    <span>GITHUB REPOS</span>
                </button>
            </a>

            <button id="email-btn" style="${getButtonStyles('email')}">
            
                <span>COPY EMAIL</span>
            </button>
        </div>
    `;
}

function generateFooterHTML() {
    return `
        <button id="hangup-btn" style="
            margin-top: 30px;
            background: #3c3836; 
            border: 4px solid #504945;
            border-radius: 16px;
            color: #d5c4a1; 
            font-family: inherit; 
            font-size: 40px; /* Doubled */
            font-weight: 700; 
            cursor: pointer; 
            align-self: center;
            padding: 24px 80px;
            text-transform: uppercase;
            -webkit-font-smoothing: antialiased;
        ">CLOSE</button>
    `;
}

// ==================== STYLE HELPERS ====================
function getNameStyles() {
    return `
        margin: 0; 
        font-size: 56px; /* Doubled */
        color: #fe8019;
        font-weight: 800;
        letter-spacing: -1px;
        -webkit-font-smoothing: antialiased;
    `;
}

function getSubtitleStyles() {
    return `
        margin: 16px 0 0 0; 
        color: #d5c4a1; 
        font-size: 34px; /* Doubled */
        font-weight: 600;
        line-height: 1.4;
        -webkit-font-smoothing: antialiased;
    `;
}

function getButtonStyles(type) {
    const baseStyles = `
        width: 100%; 
        padding: 36px; /* Doubled */
        border-radius: 16px;
        font-family: inherit; 
        font-size: 38px; /* Doubled */
        font-weight: 700;
        cursor: pointer; 
        display: flex; 
        align-items: center; 
        justify-content: center; 
        gap: 24px;
        letter-spacing: 1px;
    `;

    const typeStyles = {
        linkedin: `background: #0077b5; color: #ffffff; border: none; box-shadow: 0 8px 0 #005885;`,
        github: `background: #3c3836; color: #ebdbb2; border: 6px solid #d5c4a1;`,
        email: `background: #cc241d; color: #ebdbb2; border: none; box-shadow: 0 8px 0 #9d1a17;`
    };

    return baseStyles + typeStyles[type];
}

// ==================== EVENT HANDLERS (SAME) ====================
function attachEventListeners(container, scene, camera, controls) {
    const emailBtn = container.querySelector('#email-btn');
    const hangupBtn = container.querySelector('#hangup-btn');
    const allBtns = container.querySelectorAll('button');

    allBtns.forEach(btn => {
        btn.onmouseenter = () => gsap.to(btn, { scale: 1.03, duration: 0.1 });
        btn.onmouseleave = () => gsap.to(btn, { scale: 1, duration: 0.1 });
    });

    emailBtn.addEventListener('pointerdown', () => handleEmailCopy(emailBtn));
    hangupBtn.addEventListener('pointerdown', () => {
        audioManager.playOneShot('phone_pickup', null, 0.8);
        handleDisconnect(scene, camera, controls)
    });
    
    hangupBtn.onmouseenter = () => {
        hangupBtn.style.backgroundColor = '#504945';
        hangupBtn.style.color = '#fabd2f';
    };
    hangupBtn.onmouseleave = () => {
        hangupBtn.style.backgroundColor = '#3c3836';
        hangupBtn.style.color = '#d5c4a1';
    };
}

function handleEmailCopy(button) {
    navigator.clipboard.writeText(CONTACT_CONFIG.email);
    const originalContent = button.innerHTML;
    const originalBackground = button.style.background;
    const originalBoxShadow = button.style.boxShadow;
    
    button.style.background = "#98971a";
    button.style.boxShadow = "0 8px 0 #79740e";
    button.innerHTML = '<span style="font-size: 44px;">✓</span> <span>COPIED TO CLIPBOARD</span>';
    
    setTimeout(() => {
        button.style.background = originalBackground;
        button.style.boxShadow = originalBoxShadow;
        button.innerHTML = originalContent;
    }, 2000);
}

function handleDisconnect(scene, camera, controls) {
    if (!state.cssObject) return;
    scene.remove(state.cssObject);
    state.cssObject = null;
    animateCameraToNormalMode(camera, controls);
}