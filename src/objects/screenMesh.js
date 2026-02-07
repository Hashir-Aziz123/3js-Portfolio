import * as THREE from 'three';

const geometry = new THREE.PlaneGeometry(1., 0.61);
    const material = new THREE.MeshStandardMaterial({
        color: 0x000000,
        emissive: new THREE.Color(0x4488ff), // The Blue Glow
        emissiveIntensity: 0.8,
        transparent: true,
        side: THREE.DoubleSide,
        opacity: 0.8 // Allows a bit of the 3D bezel to show through
    });

const screenMesh = new THREE.Mesh(geometry, material);
screenMesh.name = "screenGlowLayer";
screenMesh.position.set(-0.85, 4.115, 4.16); // Slightly in front of the screen to avoid z-fighting
screenMesh.rotation.y = Math.PI + 1.207 ; // Rotate to face the camera
screenMesh.rotation.x = 0.3;
screenMesh.rotation.z = 0.28;
    

export default screenMesh;