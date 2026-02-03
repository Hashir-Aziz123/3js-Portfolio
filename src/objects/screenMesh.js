import * as THREE from 'three';

const geometry = new THREE.PlaneGeometry(0.8, 0.65);
    const material = new THREE.MeshStandardMaterial({
        color: 0x000000,
        emissive: new THREE.Color(0x0066ff), // The Blue Glow
        emissiveIntensity: 2.0,
        transparent: true,
        side: THREE.DoubleSide,
        opacity: 0.8 // Allows a bit of the 3D bezel to show through
    });

const screenMesh = new THREE.Mesh(geometry, material);
screenMesh.name = "screenGlowLayer";
screenMesh.position.set(-0.9, 4.2, 4.3); // Slightly in front of the screen to avoid z-fighting
screenMesh.rotation.y = Math.PI + 1.2 ; // Rotate to face the camera
screenMesh.rotation.x = 2;
    

export default screenMesh;