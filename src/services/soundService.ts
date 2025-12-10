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

    // Sound: Button Click / Select - Subtle
    public playClick() {
        this.init();
        this.playTone(440, 'sine', 0.1);
    }
}

export const soundService = new SoundService();
