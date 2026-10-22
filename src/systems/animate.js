// Rendering is capped at a steady 30 fps. Frames on integrated GPUs take about as long as
// a 60 Hz refresh, so uncapped they swing between 60 and 30 fps, which looks jittery;
// an even 30 looks smoother. On 60/120/240 Hz screens this is exactly 30 fps; on others
// it lands just under (e.g. ~29 fps at 144 Hz), since a frame can only show on a refresh.
export const MAX_FPS = 30;
const FRAME_INTERVAL = 1000 / MAX_FPS;
// requestAnimationFrame timestamps jitter by a fraction of a millisecond, so a frame
// that arrives just short of the interval still counts; otherwise 60 Hz would drop to 20 fps.
const FRAME_TOLERANCE = 2;

function animate(scene, camera, controls, renderer, updateCallbacks = [], composer = null) {
  let prevTime = performance.now();

  function loop(now) {
    requestAnimationFrame(loop);

    if (now - prevTime < FRAME_INTERVAL - FRAME_TOLERANCE) return;

    const delta = Math.max(0, (now - prevTime) / 1000); // seconds since the last rendered frame
    prevTime = now;

    // Generic update loop
    for (let i = 0; i < updateCallbacks.length; i++) {
      try {
        updateCallbacks[i](delta, now);
      } catch (err) {
        console.error('Error in update callback:', err);
      }
    }

    controls.update();

    if (composer) {
        composer.render();
    } else {
        renderer.render(scene, camera);
    }
  }

  // kick off the loop
  requestAnimationFrame(loop);

  return {
    stop() { /* not implemented - left intentionally minimal */ }
  };
}

export default animate;
