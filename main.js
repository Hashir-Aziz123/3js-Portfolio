import './styles/style.css'
import { setUpScene, startScene } from './src/app'
import audioManager from './src/systems/audioManager';
// Phones and tablets; in portrait they see a rotate prompt (styles/style.css) while this loads
import { isTouch } from './src/utils/device';

const overlay = document.getElementById('overlay');
const loaderText = document.getElementById('loader-text');
const subText = document.getElementById('sub-text');

const onProgress = (fraction) => {
    subText.innerText = fraction < 1
        ? `loading assets ${Math.round(fraction * 100)}%`
        : 'preparing scene';
};

// Start is only offered once every asset is loaded and the scene is built and rendered
Promise.all([audioManager.loadAssets(), setUpScene(onProgress)]).then(() => {
    console.log("Assets Ready.");
    overlay.classList.add('ready-state');

    loaderText.innerHTML = `${isTouch ? 'Tap' : 'Click'} to Start Experience<span class="cursor">|</span>`;
    subText.style.display = 'none';

    window.addEventListener('click', startExperience);

}).catch(err => {
    loaderText.innerText = "Error Loading";
    subText.innerText = 'please refresh the page';
    console.error(err);
});

const startExperience = async () => {
    window.removeEventListener('click', startExperience);
    await audioManager.listener.context.resume();

    overlay.style.opacity = '0';
    overlay.style.pointerEvents = 'none'; // let clicks reach the scene while it fades

    audioManager.playMusic();
    startScene();

    setTimeout(() => {
        overlay.remove();
    }, 1000);
};
