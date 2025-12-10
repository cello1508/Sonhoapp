// Sound Service using Web Audio API for lightweight, procedural sound effects

class SoundService {
    private audioContext: AudioContext | null = null;
    private masterGain: GainNode | null = null;

    constructor() {
        // Initialize on first user interaction usually, but we set up structure here
    }

    private init() {
        if (!this.audioContext) {
            this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
            this.masterGain = this.audioContext.createGain();
            this.masterGain.gain.value = 0.3; // Global volume
            this.masterGain.connect(this.audioContext.destination);
        }
        if (this.audioContext.state === 'suspended') {
            this.audioContext.resume();
        }
    }

    // Helper to create an oscillator with envelope
    private playTone(freq: number, type: 'sine' | 'triangle' | 'square' | 'sawtooth', duration: number, startTime: number = 0) {
        if (!this.audioContext || !this.masterGain) return;

        const osc = this.audioContext.createOscillator();
        const gain = this.audioContext.createGain();

        osc.type = type;
        osc.frequency.setValueAtTime(freq, this.audioContext.currentTime + startTime);

        gain.gain.setValueAtTime(0, this.audioContext.currentTime + startTime);
        gain.gain.linearRampToValueAtTime(1, this.audioContext.currentTime + startTime + 0.05);
        gain.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + startTime + duration);

        osc.connect(gain);
        gain.connect(this.masterGain);

        osc.start(this.audioContext.currentTime + startTime);
        osc.stop(this.audioContext.currentTime + startTime + duration);
    }

    // Sound: Ping (Correct Word) - Soft, high, dreamy
    public playPing() {
        this.init();
        // A nice major 7th interval or just a high bell
        this.playTone(880, 'sine', 0.5); // A5
        this.playTone(1108.73, 'sine', 0.6, 0.05); // C#6 (Major 3rd)
    }

    // Sound: Task Complete (Relaxing) - Soft major chord
    public playTaskComplete() {
        this.init();
        const now = 0;
        // Soft, relaxing F Major 7 chord
        this.playTone(349.23, 'sine', 1.5, now);       // F4
        this.playTone(440.00, 'sine', 1.5, now + 0.1); // A4
        this.playTone(523.25, 'sine', 1.5, now + 0.2); // C5
        this.playTone(659.25, 'sine', 1.8, now + 0.3); // E5
    }

    // Sound: Success (Level Complete) - Ethereal chord swell
    public playSuccess() {
        this.init();
        const now = 0;
        // C Major 9 chord arpeggio/swell
        this.playTone(523.25, 'triangle', 2.0, now);       // C5
        this.playTone(659.25, 'triangle', 2.0, now + 0.1); // E5
        this.playTone(783.99, 'triangle', 2.0, now + 0.2); // G5
        this.playTone(987.77, 'triangle', 2.0, now + 0.3); // B5
        this.playTone(1174.66, 'sine', 2.5, now + 0.4);    // D6 (The 9th, very dreamy)
    }

    private ambientNodes: AudioNode[] = [];
    private isMuted: boolean = true; // Start muted by default for browser policy

    // Ambient: Lucid Dream Binaural Beats (40Hz Gamma) + Ethereal Drone
    public startAmbient() {
        if (this.isMuted) return;
        this.init();
        this.stopAmbient(); // Clear existing

        const now = this.audioContext!.currentTime;
        const fadeTime = 2.0;

        // 1. Binaural Beat (Gamma 40Hz)
        // Base Freq: 200Hz
        // Left: 200Hz, Right: 240Hz
        const leftOsc = this.audioContext!.createOscillator();
        const rightOsc = this.audioContext!.createOscillator();
        const leftPan = this.audioContext!.createStereoPanner();
        const rightPan = this.audioContext!.createStereoPanner();
        const binGain = this.audioContext!.createGain();

        leftOsc.frequency.value = 200;
        rightOsc.frequency.value = 240;

        leftPan.pan.value = -1; // Fully Left
        rightPan.pan.value = 1; // Fully Right

        binGain.gain.setValueAtTime(0, now);
        binGain.gain.linearRampToValueAtTime(0.02, now + fadeTime); // Ultra Low volume for background

        leftOsc.connect(leftPan).connect(binGain);
        rightOsc.connect(rightPan).connect(binGain);
        binGain.connect(this.masterGain!);

        leftOsc.start(now);
        rightOsc.start(now);

        // 2. Ethereal Drone (Dreamy Pad)
        // A slowly modulating Chord
        const droneOsc1 = this.audioContext!.createOscillator();
        const droneOsc2 = this.audioContext!.createOscillator();
        const droneGain = this.audioContext!.createGain();

        droneOsc1.type = 'triangle';
        droneOsc1.frequency.value = 110; // A2

        droneOsc2.type = 'sine';
        droneOsc2.frequency.value = 164.81; // E3

        droneGain.gain.setValueAtTime(0, now);
        droneGain.gain.linearRampToValueAtTime(0.04, now + fadeTime);

        // Add some LFO for movement? Keeping it simple for now (CPU safe)
        droneOsc1.connect(droneGain);
        droneOsc2.connect(droneGain);
        droneGain.connect(this.masterGain!);

        droneOsc1.start(now);
        droneOsc2.start(now);

        this.ambientNodes = [leftOsc, rightOsc, binGain, droneOsc1, droneOsc2, droneGain, leftPan, rightPan];
    }

    public stopAmbient(duration: number = 2.0) {
        if (!this.audioContext) return;
        const now = this.audioContext.currentTime;

        // Safety: If array is empty, we can't stop anything. 
        // This might happen if 'startAmbient' failed or wasn't called.
        // But if sound is playing, nodes must exist.

        // Strategy: 
        // 1. Cancel all future volume changes.
        // 2. Schedule ramp to 0.
        // 3. Stop oscillators shortly after.

        this.ambientNodes.forEach(node => {
            if (node instanceof GainNode) {
                // IMPORTANT: In Web Audio, 'cancelScheduledValues' is necessary to remove active ramps.
                node.gain.cancelScheduledValues(now);

                // Ramp to 0. We don't use 'setValueAtTime' with 'node.gain.value' because it reads intrinsic value (usually 1 or 0) not current calculated value.
                // By calling linearRamp directly after cancel, browsers try to smooth it from current render value.
                // However, for immediate stop, we force it.
                if (duration < 0.2) {
                    node.gain.value = 0;
                    node.gain.setValueAtTime(0, now);
                } else {
                    node.gain.linearRampToValueAtTime(0, now + duration);
                }
            }
            if (node instanceof OscillatorNode) {
                if (duration < 0.2) {
                    node.stop(now);
                } else {
                    node.stop(now + duration + 0.1);
                }
            }

            // Clean up: Disconnect to be sure
            setTimeout(() => {
                try { node.disconnect(); } catch (e) { }
            }, (duration * 1000) + 200);
        });

        // Clear references
        this.ambientNodes = [];
    }

    public setMute(muted: boolean, fadeDuration: number = 1.0) {
        this.isMuted = muted;
        if (muted) {
            this.stopAmbient(fadeDuration);
        } else {
            this.startAmbient();
        }
        // Persist
        localStorage.setItem('soninho_muted', String(muted));
    }

    public getMuteState(): boolean {
        // Init state from storage if exists
        const stored = localStorage.getItem('soninho_muted');
        if (stored !== null) {
            this.isMuted = stored === 'true';
        }
        return this.isMuted;
    }

    // Sound: Click
    public playClick() {
        this.init();
        this.playTone(440, 'sine', 0.1);
    }
}

export const soundService = new SoundService();
