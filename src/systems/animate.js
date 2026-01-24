function animate(scene, camera, controls, renderer, updateCallbacks = [], composer = null) {
  let prevTime = performance.now();

  function loop(now) {
    requestAnimationFrame(loop);

    const delta = Math.max(0, (now - prevTime) / 1000); // seconds
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