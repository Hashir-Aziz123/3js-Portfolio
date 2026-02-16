import * as THREE from 'three';

const camera = new THREE.PerspectiveCamera(
    75 , 
    window.innerWidth / window.innerHeight,
    0.1 , 
    200
)

// camera.position.set( -12.5 , 7.5 , -7.5);
camera.position.set( -11.413, 5.513, -3.536);


export default camera;