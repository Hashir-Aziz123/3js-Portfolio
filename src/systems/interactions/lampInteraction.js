import * as THREE from 'three';
import gsap from 'gsap';
import { lampLight } from '../../scene/lights'; // Import the actual light object
import audioManager from '../audioManager';

// Configuration
const LAMP_CONFIG = {
    onIntensity: 20,   // Brightness when ON
    offIntensity: 0.0,  // Brightness when OFF
    onEmissive: 1.0,    // Glow strength when ON
    offEmissive: 0.0,   // Glow strength when OFF
    color: 0xffaa33     // Warm Yellow
};

let isLampOn = true; 

export default function onLampClick({ scene }) {
    const lampMesh = scene.getObjectByName('lamp_paper_body');

    if (!lampMesh) {
        console.warn("⚠️ Lamp mesh not found for interaction");
        return;
    }

    // 2. Toggle State
    isLampOn = !isLampOn;
    const targetIntensity = isLampOn ? LAMP_CONFIG.onIntensity : LAMP_CONFIG.offIntensity;
    const targetEmissive = isLampOn ? LAMP_CONFIG.onEmissive : LAMP_CONFIG.offEmissive;

    console.log(`💡 Lamp switched ${isLampOn ? 'ON' : 'OFF'}`);

    audioManager.playOneShot('phone_pickup', lampMesh.position, 2);

    // Animate Light Source (The room illumination)
    if (lampLight) {
        gsap.to(lampLight, {
            intensity: targetIntensity,
            duration: 0.4,
            ease: "power2.inOut"
        });
    }

    // Animate Physical Mesh (The glowing paper)
    if (lampMesh.material) {
        gsap.to(lampMesh.material, {
            emissiveIntensity: targetEmissive,
            duration: 0.4,
            ease: "power2.inOut"
        });
    }
}