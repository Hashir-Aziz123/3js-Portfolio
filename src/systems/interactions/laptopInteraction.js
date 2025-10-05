// systems/events/onPcClick.js
import * as THREE from 'three';

export default function onPcClick({ camera, controls }) {
  console.log('💻 PC clicked!');

  // Temporary zoom effect (just moves camera a bit closer)
  const targetPosition = new THREE.Vector3(0, 1.5, 1); // Adjust based on your scene
  const duration = 1000; // 1 second animation

  if (!controls || !camera) {
    console.warn('PC click: Missing camera or controls.');
    return;
  }

  const start = {
    x: camera.position.x,
    y: camera.position.y,
    z: camera.position.z,
  };

  const end = targetPosition.clone();
  const startTime = performance.now();

  function animate() {
    const elapsed = performance.now() - startTime;
    const t = Math.min(elapsed / duration, 1);

    camera.position.lerpVectors(new THREE.Vector3(start.x, start.y, start.z), end, t);
    controls.update();

    if (t < 1) {
      requestAnimationFrame(animate);
    }
  }

  requestAnimationFrame(animate);

  // Optional: show temporary HTML overlay
  showPlaceholderUI();
}

function showPlaceholderUI() {
  if (document.getElementById('pcUI')) {
    document.getElementById('pcUI').classList.toggle('hidden');
    return;
  }

  const div = document.createElement('div');
  div.id = 'pcUI';
  div.innerHTML = `
    <div style="
      position: fixed;
      top: 20%;
      left: 50%;
      transform: translateX(-50%);
      padding: 20px 30px;
      background: rgba(0,0,0,0.8);
      color: white;
      border-radius: 12px;
      z-index: 9999;
      font-family: monospace;
    ">
      <p>🖥️ Projects UI (Coming Soon)</p>
      <button id="closePcUI" style="margin-top: 10px;">Close</button>
    </div>
  `;
  document.body.appendChild(div);

  document.getElementById('closePcUI').addEventListener('click', () => {
    div.remove();
  });
}
