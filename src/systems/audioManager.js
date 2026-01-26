import * as THREE from 'three';

/*
    Listener: Attached to the camera
    Rain: Positional audio attached to the window.
    Music: Global audio
    SFX: Pool of sounds for UI interactions
*/

class AudioManager {

    constructor() {

        this.listener = new THREE.AudioListener();
        this.loader = new THREE.AudioLoader();

        // Systems
        this.rainAudio = null;
        this.musicTracks = [];
        this.currentTrackIndex = 0;
        this.musicOutput = null;

        // State
        this.isMuted = false;
        this.masterVolume = 1.0;

        // Buffers
        this.buffers = {
            click: null,
            thunder: null,
            rain: null,
        };
    }

    // INITIALIZATION METHODS

    setupCameraListener(camera){
        camera.add(this.listener);
    }

    async loadAssets() {

        const load = (path) => this.loader.loadAsync(path);

        try{
            const [rainBuf, clickBuf, lofi1, lofi2, lofi3, lofi4] = await Promise.all([
                load('../../assets/audio/pure-theta-4-7hz-rain-and-417hz-music-351390.mp3'),
                load('../../assets/audio/mouse-click-405462.mp3'),
                load('../../assets/audio/ukrainian-doomer-ambient-music-342198.mp3'),
                load('../../assets/audio/cozy-lofi-background-music-for-study-457198.mp3'),
                load('../../assets/audio/kiss-the-rain-274811.mp3'),
                load('../../assets/audio/good-night-lofi-cozy-chill-music-160166.mp3'),
            ]);

            this.buffers.rain = rainBuf;
            this.buffers.click = clickBuf;
            this.musicTracks = [lofi1, lofi2, lofi3, lofi4];

            console.log("Audio assets loaded.");
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

    // RAIN SYSTEM

    initRain(windowMesh) {

        if(!this.buffers.rain) {
            console.warn("Rain buffer not loaded.");
            return;
        }

        this.rainAudio = new THREE.PositionalAudio(this.listener);
        this.rainAudio.setBuffer(this.buffers.rain);
        this.rainAudio.setRefDistance(2);
        this.rainAudio.setLoop(true);
        this.rainAudio.setVolume(this.masterVolume); // change this to function of master volume

        windowMesh.add(this.rainAudio);
        this.rainAudio.play();
    }

    // MUSIC SYSTEM

    playMusic() {

        if (this.musicTracks.length === 0) {
            console.warn("No music tracks loaded.");
            return;
        }

        this.musicOutput = new THREE.Audio(this.listener);
        this.playNextTrack();
    }

    playNextTrack() {

        const buffer = this.musicTracks[this.currentTrackIndex];

        this.musicOutput.setBuffer(buffer);
        this.musicOutput.setLoop(false);
        this.musicOutput.setVolume(0); // start muted

        this.fadeVolume(this.musicOutput, 0, 10 * this.masterVolume, 3000); // fade in

        this.musicOutput.onEnded = () => {
            this.currentTrackIndex = (this.currentTrackIndex + 1) % this.musicTracks.length;
            this.playNextTrack();
        };
    }

    fadeVolume(audioNode, startVol, endVol, duration) {

        const startTime = this.listener.context.currentTime;

        audioNode.gain.gain.setValueAtTime(startVol, startTime);
        audioNode.gain.gain.linearRampToValueAtTime(endVol, startTime + duration / 1000);
    }

    // SFX SYSTEM

    playSFX(type, position) {

        if (!this.buffers[type]) {
            console.warn(`SFX buffer for type "${type}" not loaded.`);
            return;
        }

        // temporarily create a positional audio for the effect
        const sound = new THREE.PositionalAudio(this.listener);
        sound.setBuffer(this.buffers[type]);
        sound.setRefDistance(1);
        sound.setVolume(0.5 * this.masterVolume);

        sound.position.copy(position);
        sound.play();
    }

    playClickSound(object) {

        if (!this.buffers.click) {
            console.warn("Click SFX buffer not loaded.");
            return;
        }

        const sound = new THREE.PositionalAudio(this.listener);
        sound.setBuffer(this.buffers.click);
        sound.setRefDistance(1);
        sound.setVolume(1);

        object.add(sound);
        sound.play();

        sound.onEnded = () => {
            object.remove(sound);
        };
    }
}

const audioManager = new AudioManager();
export default audioManager;