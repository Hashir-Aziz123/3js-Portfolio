import * as THREE from 'three';
import gsap from 'gsap';
import { isTouch } from '../../utils/device';

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
    liftZoomLimits(controls);

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
            restoreZoomLimits(controls);
            onComplete?.();
        },
        onInterrupt
    });

    activeTween = tween;
    return tween;
}

// On phones the focus panels (laptop screen, contact card) come out far too small to read
// from the desktop camera spots. This moves the camera in along its line of sight until
// the panel reaches a readable size, without letting it overflow the screen.
// Desktop framing is left exactly as designed.
const MIN_PANEL_SCALE = 0.5;           // on-screen CSS px per panel px
const MAX_FILL = { width: 0.94, height: 0.88 };

// view: { position, target }; panel: { center, width, height, scale, normal? }
// (width/height in panel px). With a normal (the way the panel faces), the camera moves
// square in front of the panel; without one it closes in along its current line of sight.
export function fitViewToPanel(view, camera, panel) {
    if (!isTouch) return view;

    const position = new THREE.Vector3().copy(view.position);
    const target = new THREE.Vector3().copy(view.target);
    const center = new THREE.Vector3().copy(panel.center);

    // How many CSS px one panel px covers from the designed camera spot
    const distance = position.distanceTo(center);
    const visibleHeight = 2 * distance * Math.tan(THREE.MathUtils.degToRad(camera.fov) / 2);
    const currentScale = panel.scale * window.innerHeight / visibleHeight;

    const wantedScale = Math.min(
        MIN_PANEL_SCALE,
        MAX_FILL.width * window.innerWidth / panel.width,
        MAX_FILL.height * window.innerHeight / panel.height
    );

    const zoom = wantedScale / currentScale;
    if (zoom <= 1) return view;

    // Aim at the panel's center so the bigger panel sits in the middle of the screen
    const towardsCamera = position.clone().sub(center).normalize();
    const direction = panel.normal
        ? new THREE.Vector3().copy(panel.normal).normalize()
        : towardsCamera;
    if (direction.dot(towardsCamera) < 0) direction.negate(); // face the side the camera is on

    return {
        position: center.clone().addScaledVector(direction, distance / zoom),
        target: center
    };
}

// The zoom limits (min/maxDistance, set in app.js) are for the room view, but OrbitControls
// enforces them on every update, which would yank the close-up views back out. They're
// lifted while the camera moves and put back once it lands inside them again (back home).
let zoomLimits = null;

function liftZoomLimits(controls) {
    if (!zoomLimits) zoomLimits = { min: controls.minDistance, max: controls.maxDistance };
    controls.minDistance = 0;
    controls.maxDistance = Infinity;
}

function restoreZoomLimits(controls) {
    if (!zoomLimits) return;

    const distance = controls.object.position.distanceTo(controls.target);
    const EPSILON = 1e-6;
    if (distance < zoomLimits.min - EPSILON || distance > zoomLimits.max + EPSILON) return;

    controls.minDistance = zoomLimits.min;
    controls.maxDistance = zoomLimits.max;
    zoomLimits = null;
}

// With enableDamping, OrbitControls keeps easing out the last drag on every update(),
// even while disabled, which pulls the camera off the tween's path. These are internal
// fields (three r178); there is no public way to clear them.
function stopControlsMomentum(controls) {
    controls._sphericalDelta?.set(0, 0, 0);
    controls._panOffset?.set(0, 0, 0);
}
