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
                load('/assets/audio/heavy-raining-rain-on-tree-natural-clear-sound-abbas-ali-quiet-life-relaxing-music-11938.mp3'),
                load('/assets/audio/mouse-click-405462.mp3'),
                load('/assets/audio/chill-lofi-ambient-lofi-music-457259.mp3'),
                load('/assets/audio/cozy-lofi-background-music-for-study-457198.mp3'),
                load('/assets/audio/chill-night-cozy-lofi-music-452693.mp3'), 
                load('/assets/audio/good-night-lofi-cozy-chill-music-160166.mp3'),
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
        this.rainAudio.setVolume(2 * this.masterVolume); // change this to function of master volume

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

        // Stop any currently playing music
        if (this.musicOutput.isPlaying) {
            this.musicOutput.stop();
        }

        this.musicOutput.setBuffer(buffer);
        this.musicOutput.setLoop(false);
        this.musicOutput.setVolume(0.1 * this.masterVolume);
        
        // Set up the ended callback BEFORE playing
        // We need to wait for the source to be created
        const originalPlay = this.musicOutput.play.bind(this.musicOutput);
        this.musicOutput.play();
        
        // The source is created after play() is called
        if (this.musicOutput.source) {
            this.musicOutput.source.onended = () => {
                console.log("Track ended, playing next...");
                this.currentTrackIndex = (this.currentTrackIndex + 1) % this.musicTracks.length;
                this.playNextTrack();
            };
        }

        this.fadeVolume(this.musicOutput, 0.05 * this.masterVolume, 0.1 * this.masterVolume, 1000);
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