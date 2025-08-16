import { GLTFLoader } from "three/examples/jsm/Addons.js";

class Car {
    
    static MAX_FORWARD_SPEED = 4.0;      // units/sec
    static MAX_REVERSE_SPEED = 1.5;      // units/sec
    static ACCELERATION = 6.0;           // units/sec^2
    static BRAKE_DECELERATION = 8.0;     // when switching directions
    static FREE_DECELERATION = 3.0;      // natural slow-down
    static STEER_SPEED = 2.5;            // radians/sec at full steer, scaled by speed
    
    constructor() {
        this.model = null;
        this.velocity = 0;     
        this.steering = 0;     
    }
    
    async load() {
        const loader = new GLTFLoader();

        return new Promise((resolve, reject) => {
            loader.load(
                "../../assets/models/car_model.glb",
                (gltf) => {
                    this.model = gltf.scene;
                    this.model.rotation.y = Math.PI; // rotate 180 degrees for directional fix
                    this._initializePositionAndScale();
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
    
    _initializePositionAndScale() {
        if (!this.model) 
            return; 
        
        const iScaleX = 0.5, iScaleY = 0.5, iScaleZ = 0.5;
        const iPositionX = -4, iPositionY = 2.2, iPositionZ = 0;
        
        this.model.scale.set(iScaleX, iScaleY, iScaleZ);
        this.model.position.set(iPositionX, iPositionY, iPositionZ);
    }


    // movement methods
    updateMotion(input = { throttle: 0, steer: 0 }, delta = 1 / 60) {
        if (!this.model) 
            return; 

        const throttle = Car._clamp(input.throttle || 0, -1, 1);
        this.steering = Car._clamp(input.steer || 0, -1, 1);

        this._integrateVelocity(throttle, delta);

        const speedFactor = Math.min(1, Math.abs(this.velocity) /  Car.MAX_FORWARD_SPEED);
        const steerAngle = this.steering * Car.STEER_SPEED * speedFactor * delta;

        const directionMultiplier = this.velocity >= 0 ? 1 : -1; // Inverts the steering direction when the car is reversing.
        
        this.model.rotation.y -= steerAngle * directionMultiplier;
        this.model.translateZ(this.velocity * delta);
    }

    _integrateVelocity(throttle, delta) {
        const isAccelerating = throttle > 0;
        const isBraking = throttle < 0;
        const isCoasting = throttle === 0;
        
        const isMovingForward = this.velocity > 0;
        const isMovingBackward = this.velocity < 0;
        const isStopped = this.velocity === 0;
        
        if (isAccelerating) {
            this._accelerateForward(throttle, delta);
        } else if (isBraking && isMovingForward) {
            this._brakeFromForwardMotion(throttle, delta);
        } else if (isBraking && (isStopped || isMovingBackward)) {
            this._accelerateBackward(throttle, delta);
        } else if (isCoasting) {
            this._applyNaturalDeceleration(delta);
        }
    }

    _accelerateForward(throttle, delta) {
        this.velocity += Car.ACCELERATION * throttle * delta;
        this.velocity = Math.min(this.velocity, Car.MAX_FORWARD_SPEED);
    }

    _brakeFromForwardMotion(throttle, delta) {
        this.velocity -= Car.BRAKE_DECELERATION * Math.abs(throttle) * delta;
        this.velocity = Math.max(this.velocity, 0); // Don't go below 0
    }

    _accelerateBackward(throttle, delta) {
        this.velocity -= Car.ACCELERATION * Math.abs(throttle) * delta;
        this.velocity = Math.max(this.velocity, -Car.MAX_REVERSE_SPEED);
    }

    _applyNaturalDeceleration(delta) {
        if (this.velocity > 0) {
            this.velocity = Math.max(0, this.velocity - Car.FREE_DECELERATION * delta);
        } else if (this.velocity < 0) {
            this.velocity = Math.min(0, this.velocity + Car.FREE_DECELERATION * delta);
        }
    }


    static _clamp(value, minimumValue, maximumValue) {
        return Math.max(minimumValue, Math.min(maximumValue, value));
    }
}

export default Car;