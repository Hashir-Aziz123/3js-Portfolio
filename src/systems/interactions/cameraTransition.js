import * as THREE from 'three';
import gsap from 'gsap';

// Shared camera move for the click interactions. Position and target are driven by one
// tween so they always stay in step, and a move still in progress is cancelled first so
// two transitions never fight over the camera.

// sine.inOut has the gentlest acceleration of the inOut eases: no lurch at the start,
// no whoosh in the middle, and a soft settle at the end.
const DEFAULT_DURATION = 1.8;
const DEFAULT_EASE = 'sine.inOut';

let activeTween = null;

export function transitionCamera(camera, controls, { position, target }, {
    duration = DEFAULT_DURATION,
    ease = DEFAULT_EASE,
    onComplete,
    onInterrupt
} = {}) {
    activeTween?.kill();
    stopControlsMomentum(controls);

    const fromPosition = camera.position.clone();
    const fromTarget = controls.target.clone();
    const toPosition = new THREE.Vector3().copy(position);
    const toTarget = new THREE.Vector3().copy(target);
    const progress = { t: 0 };

    const tween = gsap.to(progress, {
        t: 1,
        duration,
        ease,
        onUpdate: () => {
            camera.position.lerpVectors(fromPosition, toPosition, progress.t);
            controls.target.lerpVectors(fromTarget, toTarget, progress.t);
            controls.update();
        },
        onComplete: () => {
            if (activeTween === tween) activeTween = null;
            onComplete?.();
        },
        onInterrupt
    });

    activeTween = tween;
    return tween;
}

// With enableDamping, OrbitControls keeps easing out the last drag on every update(),
// even while disabled, which pulls the camera off the tween's path. These are internal
// fields (three r178); there is no public way to clear them.
function stopControlsMomentum(controls) {
    controls._sphericalDelta?.set(0, 0, 0);
    controls._panOffset?.set(0, 0, 0);
}
