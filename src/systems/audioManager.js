import * as THREE from 'three';

class AudioManager {

    constructor() {
        this.listener = new THREE.AudioListener();
        this.loader = new THREE.AudioLoader();

        // Systems
        this.currentMusicStream = null;
        this.rainStream = null;

        // State
        this.masterVolume = 1.0;
        this.sfxVolume = 0.6; 

        // RAM Buffers
        this.buffers = {
            click: null,
            printer_slide: null, 
            printer_grab: null,  
            phone_ring: null,      
            phone_pickup: null,    
            laptop: null        
        };

        // Playlist
        this.musicTracks = [
            '/assets/audio/chill-lofi-ambient-lofi-music-457259.mp3',
            '/assets/audio/cozy-lofi-background-music-for-study-457198.mp3',
            '/assets/audio/chill-night-cozy-lofi-music-452693.mp3',
            '/assets/audio/good-night-lofi-cozy-chill-music-160166.mp3'
        ];
        this.currentTrackIndex = 0;
    }

    // ==================== INITIALIZATION ====================

    setupCameraListener(camera){
        camera.add(this.listener);
    }

    async loadAssets() {
        const loadBuffer = (path) => this.loader.loadAsync(path);

        try {
            console.log("⏳ Loading Audio Buffers...");
            
            const [click, pSlide, pGrab, ring, pickup, laptop] = await Promise.all([
                loadBuffer('/assets/audio/select-sound.mp3'),
                loadBuffer('/assets/audio/printer-sound.mp3'),
                loadBuffer('/assets/audio/paper-grab.mp3'),
                loadBuffer('/assets/audio/phone.mp3'),
                loadBuffer('/assets/audio/phone-pick-up.mp3'),
                loadBuffer('/assets/audio/bootup.mp3'),
            ]);

            this.buffers.click = click;
            this.buffers.printer_slide = pSlide;
            this.buffers.printer_grab = pGrab;
            this.buffers.phone_ring = ring;   
            this.buffers.phone_pickup = pickup;
            this.buffers.laptop = laptop;

            console.log("✅ Audio Assets Ready.");
        } 
        catch(err){
            console.error("❌ Error loading audio:", err);
        }
    }

    // ==================== SFX SYSTEM ====================

    /**
     * Plays a sound at a specific 3D location.
     * @param {string} id - Buffer ID
     * @param {THREE.Vector3} position - World position
     * @param {number} volumeScale - 0.0 to 1.0
     * @returns {THREE.PositionalAudio | THREE.Audio} The sound object
     */
    playOneShot(id, position, volumeScale = 1.0) {
        if (!this.buffers[id]) {
            console.warn(`Audio buffer '${id}' not found.`);
            return null;
        }

        // Global Fallback if no position
        if (!position) {
            const sound = new THREE.Audio(this.listener);
            sound.setBuffer(this.buffers[id]);
            sound.setVolume(this.sfxVolume * volumeScale * this.masterVolume);
            sound.play();
            return sound;
        }

        // 3D Positional Audio
        const sound = new THREE.PositionalAudio(this.listener);
        sound.setBuffer(this.buffers[id]);
        sound.setRefDistance(1.5);
        sound.setVolume(this.sfxVolume * volumeScale * this.masterVolume);
        
        // Setup position
        sound.position.copy(position);
        
        // Note: For perfect spatialization, this sound node should ideally be added 
        // to the scene graph. However, for one-shots, Three.js often handles 
        // the world matrix update if we play immediately.
        sound.play();
        
        return sound;
    }

    playClickSound(object) {
        if (!this.buffers.click) return;
        const sound = new THREE.PositionalAudio(this.listener);
        sound.setBuffer(this.buffers.click);
        sound.setRefDistance(1);
        sound.setVolume(1.0);
        
        // Attach to object for perfect tracking
        object.add(sound);
        sound.play();
        sound.onEnded = () => object.remove(sound);
    }

    // ==================== RAIN & MUSIC ====================

    startRainStream() {
        this.rainStream = new Audio('/assets/audio/heavy-raining-rain-on-tree-natural-clear-sound-abbas-ali-quiet-life-relaxing-music-11938.mp3');
        this.rainStream.loop = true;
        this.rainStream.volume = 0; 
        this.rainStream.play().catch(e => console.warn("Rain blocked:", e));
    }

    updateRainVolume(cameraPosition, windowPosition) {
        if (!this.rainStream) return;
        const distance = cameraPosition.distanceTo(windowPosition);
        const maxDistance = 25; 
        let volume = 1 - (distance / maxDistance);
        volume = Math.max(0, Math.min(volume, 1));
        this.rainStream.volume = volume * 0.5 * this.masterVolume;
    }

    playMusic() {
        if (this.musicTracks.length === 0) return;
        this.playNextTrack();
    }

    playNextTrack() {
        if (this.currentMusicStream) {
            this.currentMusicStream.pause();
            this.currentMusicStream = null;
        }

        const path = this.musicTracks[this.currentTrackIndex];
        const audio = new Audio(path);
        audio.loop = false;
        audio.volume = 0;

        audio.play().catch(e => console.warn("Music blocked:", e));
        this.currentMusicStream = audio;

        audio.onended = () => {
            this.currentTrackIndex = (this.currentTrackIndex + 1) % this.musicTracks.length;
            this.playNextTrack();
        };

        this.fadeStream(audio, 0, 0.15 * this.masterVolume, 2000);
    }

    fadeStream(element, startVol, endVol, duration) {
        let startTime = null;
        const animate = (time) => {
            if (!startTime) startTime = time;
            const progress = Math.min((time - startTime) / duration, 1);
            element.volume = startVol + (endVol - startVol) * progress;
            if (progress < 1) requestAnimationFrame(animate);
        };
        requestAnimationFrame(animate);
    }
}

const audioManager = new AudioManager();
export default audioManager;