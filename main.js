import './styles/style.css'
import { setUpScene } from './src/app'
import audioManager from './src/systems/audioManager';

// Select DOM elements
const overlay = document.getElementById('overlay');
const loaderText = document.getElementById('loader-text');
const subText = document.getElementById('sub-text');

// 1. Start Loading Assets
// (The initial text "Initializing..." is set in index.html)

audioManager.loadAssets().then(() => {
    
    // 2. Assets Ready -> Update UI
    console.log("Assets Ready.");
    
    // Add class for hover cursor
    overlay.classList.add('ready-state');
    
    // 🟢 UPDATED: Modern, Minimalist Text
    // Title Case, White, No symbols
    loaderText.innerHTML = 'Start Experience<span class="cursor">|</span>';
    subText.innerText = "click to enter";

    // 3. Add Click Listener
    window.addEventListener('click', startExperience);

}).catch(err => {
    loaderText.innerText = "Error Loading";
    subText.innerText = "check console";
    console.error(err);
});


const startExperience = async () => {
    // Clean up listener to prevent double-clicks
    window.removeEventListener('click', startExperience);

    // 4. Resume Audio Context (Required by browser policy)
    await audioManager.listener.context.resume();

    // 5. Fade Out Overlay
    overlay.style.opacity = '0';
    
    // 6. Start Background Music
    audioManager.playMusic();

    // 7. Initialize 3D Scene
    await setUpScene();

    // 8. Remove overlay from DOM after the 1s fade completes
    setTimeout(() => {
        overlay.remove();
    }, 1000);
};