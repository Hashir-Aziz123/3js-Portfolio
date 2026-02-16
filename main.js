import './styles/style.css'
import { setUpScene } from './src/app'
import audioManager from './src/systems/audioManager';


const isMobile = window.innerWidth < 1024; 

if (isMobile) {
    console.log("Mobile detected. System locked.");
} else {
    const overlay = document.getElementById('overlay');
    const loaderText = document.getElementById('loader-text');
    const subText = document.getElementById('sub-text');

    audioManager.loadAssets().then(() => {
        console.log("Assets Ready.");
        overlay.classList.add('ready-state');
        
        loaderText.innerHTML = 'Click to Start Experience<span class="cursor">|</span>';
        subText.style.display = 'none';

        window.addEventListener('click', startExperience);

    }).catch(err => {
        loaderText.innerText = "Error Loading";
        console.error(err);
    });
}

const startExperience = async () => {
    window.removeEventListener('click', startExperience);
    await audioManager.listener.context.resume();
    
    const overlay = document.getElementById('overlay'); 
    overlay.style.opacity = '0';
    
    audioManager.playMusic();
    await setUpScene();

    setTimeout(() => {
        overlay.remove();
    }, 1000);
};