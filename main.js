import './styles/style.css'
import { setUpScene } from './src/app'
import audioManager from './src/systems/audioManager';

const overlay = document.getElementById('overlay');
const overlayText = overlay.querySelector('p');

// 1. Initial State: "Loading..."
overlayText.innerText = "[ Loading Assets... ]";
overlay.style.cursor = 'wait';

// 2. Start Loading immediately
audioManager.loadAssets().then(() => {
    
    // 3. When loaded, update UI to "Ready"
    console.log("Assets Ready. Waiting for user input.");
    overlayText.innerText = "[ Click to Start ]";
    overlay.style.cursor = 'pointer';

    // 4. Only NOW add the click listener
    window.addEventListener('click', startExperience);

}).catch(err => {
    overlayText.innerText = "[ Error Loading Audio ]";
    console.error(err);
});


const startExperience = async () => {
    // Prevent double-clicking
    window.removeEventListener('click', startExperience);

    // 5. Unlock Audio Context
    audioManager.startContext();

    // 6. Fade out overlay
    overlay.style.opacity = '0';
    setTimeout(() => overlay.remove(), 1000);

    // 7. Start Audio
    audioManager.playMusic();

    // 8. Start Scene (This ensures initRain finds the loaded buffer)
    await setUpScene();
};