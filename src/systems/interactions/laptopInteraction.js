import * as THREE from 'three';
import gsap from 'gsap';

// Store the "Room View" position to return to later
let initialCameraState = null;

export default function onPcClick({ camera, controls }) {
    console.log('💻 Entering Work Mode...');

    if (!controls || !camera) return;

    // 1. Save the current position so we can "Exit" later
    if (!initialCameraState) {
        initialCameraState = {
            position: camera.position.clone(),
            target: controls.target.clone() // Where the camera is looking
        };
    }

    // 2. Disable OrbitControls (Lock the view)
    controls.enabled = false;

    // 3. Define the "Chair View" coordinates
    // TIP: Manually move your camera to the perfect spot in the app, 
    // log `camera.position` and `controls.target`, and copy those numbers here.
    const targetPosition = { x: -2.7, y: 4.3, z: 3.2 }; // Example: Just in front of desk
    const targetLookAt = { x: -1, y: 4.24, z: 3.94 };      // Example: Looking at laptop screen _Vector3 {x: -0.9983800502442792, y: 4.241992511014129, z: 3.9428896622459364, _gsap: GSCache2}

    // 4. GSAP Animation Timeline
    // We animate the Camera Position AND the Controls Target simultaneously
    const tl = gsap.timeline({
        onComplete: () => {
            console.log("✅ Camera Locked. Showing UI.");
            showLaptopUI(camera, controls); // Launch the overlay
        }
    });

    // Animate Position
    tl.to(camera.position, {
        x: targetPosition.x,
        y: targetPosition.y,
        z: targetPosition.z,
        duration: 1.5,
        ease: "power2.inOut" // The "Premium" smooth feel
    }, 0);

    // Animate Rotation (via controls.target)
    tl.to(controls.target, {
        x: targetLookAt.x,
        y: targetLookAt.y,
        z: targetLookAt.z,
        duration: 1.5,
        ease: "power2.inOut",
        onUpdate: () => controls.update() // Important: Update controls every frame
    }, 0);
}

// --- THE OVERLAY UI ---
function showLaptopUI(camera, controls) {
    const div = document.createElement('div');
    div.id = 'laptop-interface';
    
    // This styling mimics the "Fake Screen" approach
    // It covers the whole screen but we will center the content
    // to match where the 3D laptop is.
    div.style.cssText = `
        position: fixed;
        top: 0; left: 0; width: 100%; height: 100%;
        z-index: 10;
        display: flex;
        align-items: center;
        justify-content: center;
        pointer-events: none; /* Let clicks pass through to edges */
    `;

    div.innerHTML = `
        <div style="
            width: 800px; height: 500px;
            background: rgba(10, 15, 20, 0.95);
            border: 2px solid #333;
            border-radius: 8px;
            pointer-events: auto; 
            padding: 20px;
            color: #0f0;
            font-family: 'Courier New', monospace;
            box-shadow: 0 0 50px rgba(0,0,0,0.5);
            display: flex;
            flex-direction: column;
            opacity: 0; /* Start hidden for fade-in */
            transform: scale(0.95);
        " id="screen-content">
            
            <div style="border-bottom: 1px solid #333; padding-bottom: 10px; margin-bottom: 20px; display: flex; justify-content: space-between;">
                <span>root@hashir-portfolio:~/projects</span>
                <button id="exit-btn" style="background: red; border: none; color: white; cursor: pointer; padding: 2px 8px;">X</button>
            </div>

            <div style="flex-grow: 1; display: flex; gap: 20px;">
                <div style="width: 40%; background: #000;">
                    <img src="https://placehold.co/300x200/000/FFF" style="width: 100%; height: 100%; object-fit: cover; opacity: 0.5;">
                </div>
                <div style="width: 60%;">
                    <h2 style="margin-top: 0; color: #fff;">Project: Heat Risk AI</h2>
                    <p style="font-size: 0.9rem; color: #aaa;">A decision support system for predicting health risks from heat events in Pakistan.</p>
                    <div style="margin-top: 20px;">
                        <span style="background: #222; padding: 4px 8px; font-size: 0.8rem; border-radius: 4px;">Python</span>
                        <span style="background: #222; padding: 4px 8px; font-size: 0.8rem; border-radius: 4px;">Machine Learning</span>
                    </div>
                </div>
            </div>

            <div style="margin-top: auto; display: flex; justify-content: space-between; padding-top: 20px;">
                <button style="background: transparent; border: 1px solid #333; color: #fff; padding: 5px 15px; cursor: pointer;">&lt; PREV</button>
                <button style="background: transparent; border: 1px solid #333; color: #fff; padding: 5px 15px; cursor: pointer;">NEXT &gt;</button>
            </div>
        </div>
    `;

    document.body.appendChild(div);

    // Fade In Animation (CSS via GSAP)
    gsap.to("#screen-content", { opacity: 1, scale: 1, duration: 0.5 });

    // --- EXIT LOGIC ---
    document.getElementById('exit-btn').addEventListener('click', () => {
        // 1. Fade out UI
        gsap.to("#screen-content", { 
            opacity: 0, 
            scale: 0.95, 
            duration: 0.3, 
            onComplete: () => {
                div.remove();
                exitWorkMode(camera, controls); // Reverse the camera move
            }
        });
    });
}

function exitWorkMode(camera, controls) {
    if (!initialCameraState) return;

    console.log("Returning to Room View...");

    const tl = gsap.timeline({
        onComplete: () => {
            controls.enabled = true; // Unlock controls
            console.log("Controls Unlocked.");
        }
    });

    tl.to(camera.position, {
        x: initialCameraState.position.x,
        y: initialCameraState.position.y,
        z: initialCameraState.position.z,
        duration: 1.2,
        ease: "power2.inOut"
    }, 0);

    tl.to(controls.target, {
        x: initialCameraState.target.x,
        y: initialCameraState.target.y,
        z: initialCameraState.target.z,
        duration: 1.2,
        ease: "power2.inOut",
        onUpdate: () => controls.update()
    }, 0);
}