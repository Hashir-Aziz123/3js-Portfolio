function animate(scene, camera, controls, renderer, updateCallbacks = []) {
  let prevTime = performance.now();

  function loop(now) {
    requestAnimationFrame(loop);

    const delta = Math.max(0, (now - prevTime) / 1000); // seconds
    prevTime = now;

    // run all update callbacks with delta
    for (let i = 0; i < updateCallbacks.length; i++) {
      try {
        updateCallbacks[i](delta, now);
      } catch (err) {
        console.error('Error in update callback:', err);
      }
    }

    controls.update();
    renderer.render(scene, camera);
  }

  // kick off the loop
  requestAnimationFrame(loop);

  // return a small handle so caller can stop the loop if they want later
  return {
    stop() { /* not implemented - left intentionally minimal */ }
  };
}

export default animate;