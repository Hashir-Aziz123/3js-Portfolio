function setupAudioContext() {
    const overlay = document.getElementById('overlay');
    const music = document.getElementById('bg-music');
    
    // Set initial volume (0.0 to 1.0)
    music.volume = 0.5; 

    const startExperience = () => {
        // 1. Play Audio
        music.play().then(() => {
            console.log("Audio started successfully");
        }).catch(e => {
            console.warn("Audio autoplay blocked or file missing:", e);
        });

        // 2. Fade out Overlay
        overlay.style.opacity = '0';

        // 3. Remove overlay from DOM after transition (1s)
        setTimeout(() => {
            overlay.remove();
        }, 1000);

        // 4. Cleanup listener so it only happens once
        window.removeEventListener('click', startExperience);
        window.removeEventListener('keydown', startExperience);
    };

    // Listen for any interaction
    window.addEventListener('click', startExperience);
    window.addEventListener('keydown', startExperience);
}

export default setupAudioContext;