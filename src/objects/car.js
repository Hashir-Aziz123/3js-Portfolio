
import * as THREE from 'three';
import { GLTFLoader } from "three/examples/jsm/Addons.js";

class Car {
    static CAR_SPEED = 0.05;
    static ROTATION_SPEED = 0.03;
    
    constructor() {
        this.model = null;
        this.speed = Car.CAR_SPEED;
        this.rotationSpeed = Car.ROTATION_SPEED;
    }
    
    async load() {
        try {
            const loader = new GLTFLoader(); 
            
            const gltf = await loader.loadAsync("../../assets/models/car_model.glb");
            
            this.model = gltf.scene;
            this.initializePositionAndScale(); 
            
            return this.model; // Return the loaded model
        } catch (error) {
            console.error("Error while loading car model:", error);
        }
    }
    
    initializePositionAndScale() {
        if (!this.model) return; // Guard clause
        
        const iScaleX = 0.5, iScaleY = 0.5, iScaleZ = 0.5;
        const iPositionX = -4, iPositionY = 2.2, iPositionZ = 0;
        
        this.model.scale.set(iScaleX, iScaleY, iScaleZ);
        this.model.position.set(iPositionX, iPositionY, iPositionZ);
    }

}

export default Car;