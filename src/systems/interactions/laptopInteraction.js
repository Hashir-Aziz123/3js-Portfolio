import * as THREE from 'three';
import gsap from 'gsap';
import { CSS3DObject } from 'three/examples/jsm/renderers/CSS3DRenderer.js';

// 🟢 NEW: Import the RectAreaLight
import { laptopScreenLight } from '../../scene/lights'; 

// ---------------------------------------------------------
// 1. DATA
// ---------------------------------------------------------
const projects = [
    {
        title: "Pakistan Heat Risk AI",
        description: "A decision support system for predicting health risks from heat events in Pakistan using Machine Learning.",
        stack: ["Python", "Scikit-Learn", "Data Science"],
        image: "https://placehold.co/600x400/282828/FFF?text=Heat+Risk+AI" 
    },
    {
        title: "Temporal Illusions",
        description: "Data visualization dashboard demonstrating the deceptive nature of time-series aggregation on electricity data.",
        stack: ["D3.js", "React", "Data Viz"],
        image: "https://placehold.co/600x400/282828/FFF?text=Temporal+Viz"
    },
    {
        title: "Fluid & Fire Sim",
        description: "Interactive simulation tool built with p5.js for educational fluid and fire dynamics.",
        stack: ["p5.js", "Simulation", "Creative Coding"],
        image: "https://placehold.co/600x400/282828/FFF?text=Fluid+Sim"
    }
];

let cssObject = null;
let initialCameraState = null;
let currentProjectIndex = 0;

export default function onPcClick({ camera, controls, scene, cssRenderer }) {
    console.log('💻 Entering Work Mode...');

    const anchorMesh = scene.getObjectByName("screenGlowLayer");
    if(anchorMesh && anchorMesh.material) {
        anchorMesh.material.transparent = true;
        anchorMesh.material.opacity = 0; 
    }

    // 🟢 LIGHT FIX: Warm Amber Color & Reduced Intensity
    if (laptopScreenLight) {
        laptopScreenLight.color.setHex(0xffaa55); // Warm Tungsten/Orange
        // Lower intensity to remove the "Halo" glare
        gsap.to(laptopScreenLight, { intensity: 2.5, duration: 2.0, ease: "power2.out" });
    }

    if (!initialCameraState) {
        initialCameraState = {
            position: camera.position.clone(),
            target: controls.target.clone()
        };
    }
    controls.enabled = false;

    gsap.to(camera.position, { 
        x: -1.7, y: 4.3, z: 3.6, 
        duration: 1.5, 
        ease: "power2.inOut" 
    });
    
    gsap.to(controls.target, { 
        x: -1, y: 4.1, z: 3.94, 
        duration: 1.5, 
        ease: "power2.inOut",
        onUpdate: () => controls.update(),
        onComplete: () => {
            spawnMinimalScreen(scene, camera, controls, anchorMesh);
        }
    });
}

function spawnMinimalScreen(scene, camera, controls, anchorMesh) {
    if (cssObject) return;

    const div = document.createElement('div');
    
    // 🟢 THEME: "Gruvbox" Retro (Warm, Cozy, Homy)
    div.innerHTML = `
        <div id="screen-content" style="
            width: 1100px; 
            height: 695px; 
            
            /* Warm Dark Grey Background (Cozy) */
            background-color: #282828; 
            
            /* Subtle paper-like grain */
            background-image: linear-gradient(rgba(255, 255, 255, 0.03) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255, 255, 255, 0.03) 1px, transparent 1px);
            background-size: 20px 20px;

            border: 8px solid #1d2021; 
            box-sizing: border-box;
            color: #ebdbb2; /* Cream/Off-White Text */

            font-family: 'Courier New', monospace; 
            border-radius: 16px; 
            overflow: hidden;
            
            display: flex; flex-direction: column;
            padding: 60px;
            pointer-events: auto;
            
            backface-visibility: hidden;
            transform-style: preserve-3d;
            outline: 1px solid transparent; 
        ">
            <div style="
                display:flex; justify-content:space-between; align-items: center;
                margin-bottom: 50px;
                border-bottom: 2px solid #3c3836;
                padding-bottom: 20px;
            ">
                <div style="display:flex; align-items:center; gap:10px;">
                    <span style="color:#fabd2f; font-size:20px;">●</span>
                    <span style="
                        font-size: 18px; color: #a89984; 
                        font-weight: bold; letter-spacing: 1px;
                    ">HASHIR_PORTFOLIO.EXE</span>
                </div>
                
                <button id="exit-btn" style="
                    background: #cc241d; /* Retro Red */
                    border: 2px solid #1d2021; color: #ebdbb2; 
                    font-size: 18px; width: 40px; height: 40px; border-radius: 8px;
                    cursor: pointer; display: flex; align-items: center; justify-content: center;
                    transition: all 0.2s; font-weight: bold;
                ">X</button>
            </div>
            
            <div style="flex-grow:1; display:flex; gap: 60px; align-items: center;">
                <div style="
                    width: 50%; height: 350px; 
                    background: #1d2021; 
                    border-radius: 4px; 
                    overflow: hidden;
                    border: 4px solid #3c3836;
                    box-shadow: 5px 5px 0px #1d2021; /* Retro Shadow */
                ">
                    <img id="p-img" src="" style="width:100%; height:100%; object-fit:cover; opacity: 0.9; filter: sepia(0.2);">
                </div>
                
                <div style="width: 50%; display: flex; flex-direction: column; justify-content: center;">
                    <h1 id="p-title" style="
                        margin: 0 0 25px 0; 
                        font-size: 44px; 
                        font-weight: 700; 
                        color: #fe8019; /* Retro Orange */
                        letter-spacing: -1px;
                    ">Loading...</h1>
                    
                    <p id="p-desc" style="
                        font-size: 22px; 
                        color: #d5c4a1; /* Warm Grey */
                        line-height: 1.5; 
                        margin-bottom: 40px;
                        font-weight: 500;
                    ">...</p>
                    
                    <div id="p-stack" style="display:flex; gap: 12px; flex-wrap: wrap;"></div>
                </div>
            </div>

            <div style="
                margin-top: auto; 
                display: flex; gap: 20px; 
                align-items: center; justify-content: flex-end;
            ">
                <button id="prev-btn" style="
                    background: #3c3836; 
                    border: none; 
                    color: #ebdbb2; 
                    padding: 14px 35px; font-size: 16px; border-radius: 6px; 
                    cursor: pointer; font-weight: bold; font-family: inherit;
                    transition: all 0.2s;
                ">< PREV</button>
                
                <button id="next-btn" style="
                    background: #fabd2f; /* Retro Yellow */
                    border: none; 
                    color: #282828; 
                    padding: 14px 40px; font-size: 16px; border-radius: 6px; 
                    cursor: pointer; font-weight: 900; font-family: inherit;
                    box-shadow: 0 4px 0px #d79921; /* 3D Button Press feel */
                    transition: all 0.1s;
                ">NEXT ></button>
            </div>
        </div>
    `;

    cssObject = new CSS3DObject(div);
    scene.add(cssObject);

    // Exact Coordinates
    cssObject.position.set(-0.75, 4.095, 4.218); 
    cssObject.rotation.set(0.3, Math.PI + 1.207, 0.28); 
    cssObject.scale.set(0.001, 0.001, 0.001); 

    updateProjectView(div);

    setTimeout(() => {
        const next = div.querySelector('#next-btn');
        const prev = div.querySelector('#prev-btn');
        const exit = div.querySelector('#exit-btn');
        
        // Button Animations (Physical Click Feel)
        next.addEventListener('pointerdown', () => { 
            next.style.transform = 'translateY(4px)'; // Press down
            next.style.boxShadow = '0 0 0 #d79921';
            
            setTimeout(() => {
                next.style.transform = 'translateY(0)';
                next.style.boxShadow = '0 4px 0 #d79921';
                currentProjectIndex = (currentProjectIndex + 1) % projects.length;
                updateProjectView();
            }, 100);
        });
        
        prev.addEventListener('pointerdown', () => {
            currentProjectIndex = (currentProjectIndex - 1 + projects.length) % projects.length;
            updateProjectView();
        });
        
        exit.addEventListener('pointerdown', () => {
            exitWorkMode(scene, camera, controls, anchorMesh);
        });
    }, 100);
}

function updateProjectView(container = null) {
    const content = container ? container.querySelector('#screen-content') : document.getElementById('screen-content');
    if(!content) return;

    const p = projects[currentProjectIndex];
    
    content.querySelector('#p-title').innerText = p.title;
    content.querySelector('#p-desc').innerText = p.description;
    
    const img = content.querySelector('#p-img');
    img.src = p.image;
    
    // Retro Pill Tags
    const stackHTML = p.stack.map(s => 
        `<span style="
            border: 2px solid #689d6a; /* Retro Aqua/Green */
            color: #8ec07c;            
            padding: 6px 16px; 
            border-radius: 50px; 
            font-size: 14px; 
            font-weight: 700;
            background: rgba(40, 40, 40, 0.5);
        ">${s}</span>`
    ).join('');
    content.querySelector('#p-stack').innerHTML = stackHTML;
}

function exitWorkMode(scene, camera, controls, anchorMesh) {
    if (!cssObject) return;

    scene.remove(cssObject);
    cssObject = null;

    controls.enabled = true;

    // Turn OFF light
    if (laptopScreenLight) {
        gsap.to(laptopScreenLight, { intensity: 0, duration: 1.0 });
    }

    if(anchorMesh && anchorMesh.material) {
        gsap.to(anchorMesh.material, { opacity: 0.8, duration: 1.0 });
    }

    if (initialCameraState) {
        gsap.to(camera.position, { 
            ...initialCameraState.position, 
            duration: 1.2, 
            ease: "power2.inOut" 
        });
        gsap.to(controls.target, { 
            ...initialCameraState.target, 
            duration: 1.2, 
            ease: "power2.inOut",
            onUpdate: () => controls.update()
        });
    }
}