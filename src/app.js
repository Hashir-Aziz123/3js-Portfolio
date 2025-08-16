import * as THREE from 'three'

import camera  from './scene/camera'
import controls from './scene/controls'
import renderer from './scene/renderer'

import Car from './objects/car'
import room from './objects/room'

import { backgroundLight} from './scene/lights'

import { setupCarControls } from './systems/events'

export async function setUpScene() {
   addWindowResizeEventListener(camera, renderer);

   const scene = new THREE.Scene();
   scene.background = new THREE.Color(0x000000);

   scene.add(backgroundLight);

   const axesHelper = new THREE.AxesHelper(5); // Length of the axes lines
   scene.add(axesHelper);

   const gridHelper = new THREE.GridHelper(10, 10);
   scene.add(gridHelper);

   const roomModel = await room;
   const car = new Car();
   await car.load()

   scene.add(roomModel);
   scene.add(car.model);
   setupCarControls(car);

   animate(scene, camera, controls, renderer);
};

function animate(scene, camera , controls , renderer) {
   requestAnimationFrame(()=> animate(scene , camera , controls , renderer));
   controls.update();
   renderer.render(scene,camera);
}

function addWindowResizeEventListener(camera, renderer){
   window.addEventListener('resize' , () => {
      camera.aspect = window.innerWidth/ window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth,window.innerHeight);
   })
}