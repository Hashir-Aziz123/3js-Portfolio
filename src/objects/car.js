
import * as THREE from 'three';
import { GLTFLoader } from "three/examples/jsm/Addons.js";

class Car {
    static CAR_SPEED = 0.15;
    static ROTATION_SPEED = 0.03;
    
    constructor() {
        this.model = null;
        this.speed = Car.CAR_SPEED;
        this.rotationSpeed = Car.ROTATION_SPEED;
    }
    
    async load() {
        const loader = new GLTFLoader();

        return new Promise((resolve, reject) => {
            loader.load(
                "../../assets/models/car_model.glb",
                (gltf) => {
                    this.model = gltf.scene;
                    this.model.rotation.y = Math.PI; // rotate 180 degrees for directional fix
                    this.initializePositionAndScale();
                    resolve(this.model);
                },
                undefined,
                (error) => {
                    console.error("Error while loading car model ", error);
                    reject(error);
                }
            );
        });
    }
    
    initializePositionAndScale() {
        if (!this.model) 
            return; 
        
        const iScaleX = 0.5, iScaleY = 0.5, iScaleZ = 0.5;
        const iPositionX = -4, iPositionY = 2.2, iPositionZ = 0;
        
        this.model.scale.set(iScaleX, iScaleY, iScaleZ);
        this.model.position.set(iPositionX, iPositionY, iPositionZ);
    }


    // movement methods
    moveForward() {
        if (this.model) {
            this.model.translateZ(this.speed);
        }
    }

    moveBackward() {
        if (this.model) {
            this.model.translateZ(-this.speed);
        }
    }

    rotateLeft() {
        if (this.model) {
            this.model.rotation.y += this.rotationSpeed;
        }
    }

    rotateRight() {
        if (this.model) {
            this.model.rotation.y -= this.rotationSpeed;
        }
    }

}

export default Car;