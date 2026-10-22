import gltfLoader from "../systems/modelLoader";

// Static decorative toy car
class Car {

    constructor() {
        this.model = null;
    }

    async load(onProgress) {
        return new Promise((resolve, reject) => {
            gltfLoader.load(
                "/assets/models/car_model.glb",
                (gltf) => {
                    this.model = gltf.scene;
                    this.model.rotation.y = Math.PI; // rotate 180 degrees for directional fix

                    // enable shadows
                    this.model.traverse((child) => {
                        if (child.isMesh) {
                            child.castShadow = true;
                            child.receiveShadow = true;
                        }
                    });

                    this._initializePositionAndScale();
                    resolve(this.model);
                },
                onProgress,
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
        const iPositionX = -4, iPositionY = 2.08, iPositionZ = 0;

        this.model.scale.set(iScaleX, iScaleY, iScaleZ);
        this.model.position.set(iPositionX, iPositionY, iPositionZ);
    }
}

export default Car;
