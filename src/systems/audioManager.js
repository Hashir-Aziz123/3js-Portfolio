import * as THREE from 'three';

/*
    Listener: Attached to the camera
    Rain: Positional audio (Web Audio API) - Loaded into RAM for 3D physics.
    Music: Global audio (HTML5 Streaming) - Streamed from disk to save RAM.
    SFX: Positional audio - Loaded into RAM for low latency.
*/

class AudioManager {

    constructor() {
        this.listener = new THREE.AudioListener();
        this.loader = new THREE.AudioLoader();

        // Systems
        this.rainAudio = null;
        this.musicTracks = [];
        this.currentTrackIndex = 0;
        
        // Changed: We now track the HTML Audio Element instead of a THREE.Audio source
        this.currentStream = null; 

        // State
        this.isMuted = false;
        this.masterVolume = 1.0;

        // Buffers (Only for 3D sounds)
        this.buffers = {
            click: null,
            rain: null,
        };
    }

    // INITIALIZATION METHODS

    setupCameraListener(camera){
        camera.add(this.listener);
    }

    async loadAssets() {
        const loadBuffer = (path) => this.loader.loadAsync(path);
        try {
            // 1. ONLY load the Click sound into RAM (It's tiny, <1MB)
            const [clickBuf] = await Promise.all([
                loadBuffer('/assets/audio/mouse-click-405462.mp3'),
            ]);
            this.buffers.click = clickBuf;

            // 2. Store Music Paths as Strings (Zero RAM cost until played)
            this.musicTracks = [
                '/assets/audio/chill-lofi-ambient-lofi-music-457259.mp3',
                '/assets/audio/cozy-lofi-background-music-for-study-457198.mp3',
                '/assets/audio/chill-night-cozy-lofi-music-452693.mp3',
                '/assets/audio/good-night-lofi-cozy-chill-music-160166.mp3'
            ];

            console.log("Audio assets loaded (Hybrid Mode).");
        } 
        catch(err){
            console.error("Error loading audio assets:", err);
        }
    }

    startContext() {
        if (this.listener.context.state === 'suspended') {
            this.listener.context.resume();
        }
    }

    // RAIN SYSTEM (Remains Web Audio API for 3D Position)

    
    startRainStream() {
        // Create HTML Audio (No decoding to RAM)
        this.rainStream = new Audio('/assets/audio/heavy-raining-rain-on-tree-natural-clear-sound-abbas-ali-quiet-life-relaxing-music-11938.mp3');
        this.rainStream.loop = true;
        this.rainStream.volume = 0; 
        this.rainStream.play().catch(e => console.warn("Rain blocked:", e));
    }


    updateRainVolume(cameraPosition, windowPosition) {
        if (!this.rainStream) return;

        const distance = cameraPosition.distanceTo(windowPosition);
        
        const maxDistance = 25; 
        const maxVolume = 1 * this.masterVolume;

        // Linear drop-off formula
        let volume = 1 - (distance / maxDistance);
        volume = Math.max(0, Math.min(volume, maxVolume));

        this.rainStream.volume = volume * this.masterVolume;
    }
 

    // MUSIC SYSTEM (Switched to HTML5 Streaming)

    playMusic() {
        if (this.musicTracks.length === 0) {
            console.warn("No music tracks loaded.");
            return;
        }
        this.playNextTrack();
    }

    playNextTrack() {
        // Stop previous stream if it exists
        if (this.currentStream) {
            this.currentStream.pause();
            this.currentStream.currentTime = 0;
            this.currentStream = null;
        }

        const path = this.musicTracks[this.currentTrackIndex];
        
        // Create new HTML Audio instance (Streams from file)
        const audio = new Audio(path);
        audio.loop = false;
        audio.volume = 0; // Start silent for fade-in

        // Play
        audio.play().catch(e => console.warn("Autoplay blocked or stream failed:", e));
        
        // Save reference
        this.currentStream = audio;

        // Handle Track End
        audio.onended = () => {
            console.log("Track ended, playing next...");
            this.currentTrackIndex = (this.currentTrackIndex + 1) % this.musicTracks.length;
            this.playNextTrack();
        };

        // Fade In (Target Volume: 0.1 * Master)
        this.fadeStream(audio, 0, 0.1 * this.masterVolume, 2000);
    }

    // Custom Fader for HTML5 Audio (Since we can't use AudioContext nodes easily here)
    fadeStream(element, startVol, endVol, duration) {
        let startTime = null;

        const animate = (time) => {
            if (!startTime) startTime = time;
            const elapsed = time - startTime;
            const progress = Math.min(elapsed / duration, 1);

            // Linear interpolation
            element.volume = startVol + (endVol - startVol) * progress;

            if (progress < 1) {
                requestAnimationFrame(animate);
            } else {
                element.volume = endVol; // Ensure exact final value
            }
        };
        
        requestAnimationFrame(animate);
    }

    // SFX SYSTEM (Remains Web Audio API for low latency)

    playSFX(type, position) {
        if (!this.buffers[type]) return;

        const sound = new THREE.PositionalAudio(this.listener);
        sound.setBuffer(this.buffers[type]);
        sound.setRefDistance(1);
        sound.setVolume(0.5 * this.masterVolume);

        sound.position.copy(position);
        sound.play();
    }

    playClickSound(object) {
        if (!this.buffers.click) return;

        const sound = new THREE.PositionalAudio(this.listener);
        sound.setBuffer(this.buffers.click);
        sound.setRefDistance(1);
        sound.setVolume(1.0);

        object.add(sound);
        sound.play();

        sound.onEnded = () => {
            object.remove(sound);
        };
    }
}

const audioManager = new AudioManager();
export default audioManager;