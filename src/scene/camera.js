import * as THREE from 'three';

const camera = new THREE.PerspectiveCamera(
    75 , 
    window.innerWidth / window.innerHeight,
    0.1 , 
    200
)

camera.position.set( +4.7 , 2.5 , 5.2);


export default camera;