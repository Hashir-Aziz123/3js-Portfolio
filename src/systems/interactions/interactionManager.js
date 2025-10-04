// src/systems/interactionManager.js
import * as THREE from 'three';

export default class InteractionManager {

  constructor(scene, camera, domElement) {
    this.scene = scene;
    this.camera = camera;
    this.domElement = domElement || window;

    this.raycaster = new THREE.Raycaster();
    this.mouse = new THREE.Vector2();

    // registry: name -> { object, handler }
    this.registry = new Map();

    this._onClick = this._onClick.bind(this);
    this.domElement.addEventListener('click', this._onClick, { passive: true });
  }

  /**
   * Register an object by its Blender name (must exist in scene) and a handler function.
   * handler will be called as handler(ctx) where ctx = { object, point, event }
   */
  register(name, handler) {
    if (typeof handler !== 'function') {
      console.warn('[InteractionManager] handler must be a function');
      return;
    }

    const obj = this.scene.getObjectByName(name);
    if (!obj) {
      console.warn(`[InteractionManager] object named "${name}" not found in scene`);
      return;
    }

    this.registry.set(obj.uuid  , { object: obj, handler });
    console.log(`[InteractionManager] registered "${name}"`);   
  }

  unregister(name) {
    const obj = this.scene.getObjectByName(name);
    if (!obj) return;
    this.registry.delete(obj.uuid);
  }

  dispose() {
    this.domElement.removeEventListener('click', this._onClick);
    this.registry.clear();
  }

  // -------- internal --------
  _onClick(event) {
    // normalized device coords
    const rect = this.domElement.getBoundingClientRect
      ? this.domElement.getBoundingClientRect()
      : { left: 0, top: 0, width: window.innerWidth, height: window.innerHeight };

    this.mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
    this.mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

    this.raycaster.setFromCamera(this.mouse, this.camera);

    // gather registered objects for raycast
    const targets = Array.from(this.registry.values()).map(e => e.object);
    if (targets.length === 0) return;

    const intersects = this.raycaster.intersectObjects(targets, true);
    if (!intersects.length) return;

    // find the registered parent for the hit mesh
    const top = intersects[0];
    const registered = this._findRegisteredParent(top.object);
    if (!registered) return;

    const entry = this.registry.get(registered.uuid);
    if (!entry || typeof entry.handler !== 'function') return;

    const ctx = {
      object: registered,
      point: top.point,
      face: top.face,
      uv: top.uv,
      distance: top.distance,
      event
    };

    try { entry.handler(ctx); }
    catch (err) { console.error('[InteractionManager] handler error:', err); }
  }

  _findRegisteredParent(mesh) {
    let node = mesh;
    while (node) {
      if (this.registry.has(node.uuid)) return node;
      node = node.parent;
    }
    return null;
  }
}
