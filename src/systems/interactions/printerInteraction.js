import * as THREE from 'three';
import gsap from 'gsap';
import audioManager from '../audioManager';
import { transitionCamera } from './cameraTransition.js';

// ==================== CONFIGURATION ====================
const PAPER_CONFIG = {
    initialPosition: { x: -1.4, y: 3.755, z: -3.7 }, 
    initialRotation: { x: -Math.PI / 2, y: -0.1, z: Math.PI / 2 }, 
    
    size: { width: 0.35, height: 0.55 }, 
    
    ejectAxis: 'x', 
    ejectDistance: 0.4, 
    animationDuration: 1.2,

    resumeUrl: '/assets/PDFs/Hashir_Resume.pdf', 
    fileName: 'Hashir_Aziz_Resume.pdf',
    textureUrl: '/assets/images/cv.png' 
};

const CAMERA_VIEW = {
    position: { x: -2.5, y: 4.52, z: -4.5 }, 
    target: { x: -1.4, y: 3.755, z: -3.7 }   
};

// ==================== STATE ====================
let paperMesh = null;
let isPrinting = false;
let initialCameraState = null;

// ==================== MAIN INTERACTION ====================
export default function onPrinterClick({ scene, camera, controls }) {
    if (!paperMesh) {
        paperMesh = createPaper(scene);
    }
    
    if (isPrinting) return;
    isPrinting = true;
    console.log('🖨️ Printer Sequence Initiated...');

    if (!initialCameraState) {
        initialCameraState = {
            position: camera.position.clone(),
            target: controls.target.clone()
        };
    }
    controls.enabled = false;

    const tl = gsap.timeline();

    // 1. Camera Swoop
    tl.add(transitionCamera(camera, controls, CAMERA_VIEW, { duration: 1.6 }), "start");

    // 2. Paper Eject
    const targetPos = { ...PAPER_CONFIG.initialPosition };
    targetPos[PAPER_CONFIG.ejectAxis] -= PAPER_CONFIG.ejectDistance; 

    tl.to(paperMesh.position, {
        [PAPER_CONFIG.ejectAxis]: targetPos[PAPER_CONFIG.ejectAxis],
        duration: PAPER_CONFIG.animationDuration,
        ease: "power2.out",
        onStart: () => {
            audioManager.playOneShot('printer_slide', paperMesh.position, 2.5);
        }
    }, "-=0.5"); 

    // 3. Pause
    tl.to({}, { duration: 1 });

    // 4. Hand-Off
    tl.to(paperMesh.position, {
        y: targetPos.y + 0.3,
        x: targetPos.x - 0.1,
        duration: 0.8,
        ease: "back.in(1.7)",
        onStart: () => {
            audioManager.playOneShot('printer_grab', paperMesh.position, 4);
        }
    }, "handoff");

    tl.to(paperMesh.material, {
        opacity: 0,
        duration: 0.4,
        delay: 0.4 
    }, "handoff");

    // 5. Download & Reset
    tl.call(() => {
        downloadResume();
        resetSystem(camera, controls, paperMesh);
    });
}

// ==================== HELPER FUNCTIONS ====================
function createPaper(scene) {
    const geometry = new THREE.PlaneGeometry(PAPER_CONFIG.size.width, PAPER_CONFIG.size.height);
    
    const textureLoader = new THREE.TextureLoader();
    const resumeTexture = textureLoader.load(PAPER_CONFIG.textureUrl, (tex) => {
        tex.flipY = false;
        tex.colorSpace = THREE.SRGBColorSpace;
    });

    const material = new THREE.MeshStandardMaterial({ 
        map: resumeTexture,
        color: 0xffffff,
        side: THREE.DoubleSide,
        roughness: 0.8,
        metalness: 0.0,
        transparent: true,
        opacity: 1
    });
    
    const mesh = new THREE.Mesh(geometry, material);
    mesh.name = "ResumePaper";
    
    mesh.position.set(
        PAPER_CONFIG.initialPosition.x, 
        PAPER_CONFIG.initialPosition.y, 
        PAPER_CONFIG.initialPosition.z
    );
    mesh.rotation.set(
        PAPER_CONFIG.initialRotation.x, 
        PAPER_CONFIG.initialRotation.y, 
        PAPER_CONFIG.initialRotation.z
    );
    
    scene.add(mesh);
    return mesh;
}

function resetSystem(camera, controls, mesh) {
    const finish = () => {
        controls.enabled = true;
        isPrinting = false;
    };

    // Also finish if another click takes over the camera, or the printer would stay locked
    transitionCamera(camera, controls, initialCameraState, {
        duration: 1.6,
        onComplete: finish,
        onInterrupt: () => { isPrinting = false; }
    });

    setTimeout(() => {
        mesh.position.set(
            PAPER_CONFIG.initialPosition.x, 
            PAPER_CONFIG.initialPosition.y, 
            PAPER_CONFIG.initialPosition.z
        );
        mesh.material.opacity = 1;
    }, 1000);
}

function downloadResume() {
    const link = document.createElement('a');
    link.href = PAPER_CONFIG.resumeUrl;
    link.download = PAPER_CONFIG.fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}