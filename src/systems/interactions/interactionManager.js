import * as THREE from 'three';

export default class InteractionManager {
  constructor(scene, camera, domElement) {
    this.scene = scene;
    this.camera = camera;
    this.domElement = domElement || window;

    this.raycaster = new THREE.Raycaster();
    this.mousePosition = new THREE.Vector2();

    // Store registered objects: uuid -> { object, handler }
    this.interactiveObjects = new Map();

    // Bind and attach click listener
    this.handleClick = this.handleClick.bind(this);
    this.domElement.addEventListener('click', this.handleClick, { passive: true });
  }

  register(objectName, clickHandler) {
    if (!this.isValidHandler(clickHandler)) {
      console.warn('[InteractionManager] Click handler must be a function');
      return;
    }

    const sceneObject = this.findObjectInScene(objectName);
    if (!sceneObject) {
      console.warn(`[InteractionManager] Object "${objectName}" not found in scene`);
      return;
    }

    this.interactiveObjects.set(sceneObject.uuid, {
      object: sceneObject,
      handler: clickHandler
    });

    console.log(`[InteractionManager] Registered "${objectName}" for clicks`);
  }

  unregister(objectName) {
    const sceneObject = this.findObjectInScene(objectName);
    if (sceneObject) {
      this.interactiveObjects.delete(sceneObject.uuid);
    }
  }

  dispose() {
    this.domElement.removeEventListener('click', this.handleClick);
    this.interactiveObjects.clear();
  }

  // ============ Private Methods ============

  handleClick(event) {
    this.updateMousePosition(event);
    this.castRayFromMouse();

    const clickedObject = this.findClickedInteractiveObject();
    if (clickedObject) {
      this.executeClickHandler(clickedObject, event);
    }
  }

  updateMousePosition(event) {
    const bounds = this.getElementBounds();

    this.mousePosition.x = ((event.clientX - bounds.left) / bounds.width) * 2 - 1;
    this.mousePosition.y = -((event.clientY - bounds.top) / bounds.height) * 2 + 1;
  }

  getElementBounds() {
    if (this.domElement.getBoundingClientRect) {
      return this.domElement.getBoundingClientRect();
    }

    // Fallback for window object
    return {
      left: 0,
      top: 0,
      width: window.innerWidth,
      height: window.innerHeight
    };
  }

  castRayFromMouse() {
    this.raycaster.setFromCamera(this.mousePosition, this.camera);
  }

  findClickedInteractiveObject() {
    const registeredObjects = this.getAllRegisteredObjects();
    if (registeredObjects.length === 0) {
      return null;
    }

    // Check ray intersections (recursive = true to check children)
    const intersections = this.raycaster.intersectObjects(registeredObjects, true);
    if (intersections.length === 0) {
      return null;
    }

    // Get the closest intersection
    const closestHit = intersections[0];

    // Find which registered parent was clicked (clicked mesh might be a child)
    const registeredParent = this.findRegisteredParent(closestHit.object);
    if (!registeredParent) {
      return null;
    }

    return {
      registeredObject: registeredParent,
      intersectionData: closestHit
    };
  }

  findRegisteredParent(clickedMesh) {
    let currentNode = clickedMesh;

    while (currentNode) {
      if (this.interactiveObjects.has(currentNode.uuid)) {
        return currentNode;
      }
      currentNode = currentNode.parent;
    }

    return null;
  }

  executeClickHandler(clickedObject, event) {
    const { registeredObject, intersectionData } = clickedObject;
    const registration = this.interactiveObjects.get(registeredObject.uuid);

    if (!registration || !this.isValidHandler(registration.handler)) {
      return;
    }

    // Build context object for the handler
    const clickContext = {
      object: registeredObject,
      point: intersectionData.point,
      face: intersectionData.face,
      uv: intersectionData.uv,
      distance: intersectionData.distance,
      event: event
    };

    // Call the handler with error protection
    try {
      registration.handler(clickContext);
    } catch (error) {
      console.error('[InteractionManager] Error in click handler:', error);
    }
  }

  getAllRegisteredObjects() {
    return Array.from(this.interactiveObjects.values()).map(entry => entry.object);
  }

  findObjectInScene(objectName) {
    return this.scene.getObjectByName(objectName);
  }

  isValidHandler(handler) {
    return typeof handler === 'function';
  }
}