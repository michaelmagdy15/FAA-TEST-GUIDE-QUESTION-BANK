class SoundManager {
    private ctx: AudioContext | null = null;
    private initialized = false;

    private init() {
        if (this.initialized) return;
        try {
            this.ctx = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
            this.initialized = true;
        } catch (e) {
            console.error("Web Audio API not supported", e);
        }
    }

    private playTone(freq: number, type: OscillatorType, duration: number, vol: number = 0.1) {
        if (!this.ctx) this.init();
        if (!this.ctx) return;

        // Resume if suspended (browser autoplay policy)
        if (this.ctx.state === 'suspended') {
            this.ctx.resume();
        }

        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = type;
        osc.frequency.setValueAtTime(freq, this.ctx.currentTime);

        gain.gain.setValueAtTime(0, this.ctx.currentTime);
        // Quick attack
        gain.gain.linearRampToValueAtTime(vol, this.ctx.currentTime + 0.01);
        // Fade out
        gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + duration);

        osc.connect(gain);
        gain.connect(this.ctx.destination);

        osc.start();
        osc.stop(this.ctx.currentTime + duration);
    }

    public playHover() {
        this.playTone(600, 'sine', 0.05, 0.02);
    }

    public playSelect() {
        this.playTone(800, 'sine', 0.1, 0.05);
    }

    public playCorrect() {
        // High pitched pleasant chime (A major chord arp)
        if (!this.ctx) this.init();
        if (!this.ctx) return;

        const now = this.ctx.currentTime;
        const playNote = (f: number, t: number) => {
            const osc = this.ctx!.createOscillator();
            const gain = this.ctx!.createGain();
            osc.type = 'sine';
            osc.frequency.value = f;
            gain.gain.setValueAtTime(0, now + t);
            gain.gain.linearRampToValueAtTime(0.05, now + t + 0.01);
            gain.gain.exponentialRampToValueAtTime(0.001, now + t + 0.3);
            osc.connect(gain);
            gain.connect(this.ctx!.destination);
            osc.start(now + t);
            osc.stop(now + t + 0.3);
        };

        playNote(440, 0);       // A4
        playNote(554.37, 0.08); // C#5
        playNote(659.25, 0.16); // E5
        playNote(880, 0.24);    // A5
    }

    public playIncorrect() {
        // Low double-buzz
        if (!this.ctx) this.init();
        if (!this.ctx) return;

        const now = this.ctx.currentTime;
        const playBuzz = (t: number) => {
            const osc = this.ctx!.createOscillator();
            const gain = this.ctx!.createGain();
            osc.type = 'sawtooth';
            osc.frequency.value = 110; // A2
            gain.gain.setValueAtTime(0, now + t);
            gain.gain.linearRampToValueAtTime(0.08, now + t + 0.01);
            gain.gain.exponentialRampToValueAtTime(0.001, now + t + 0.15);
            osc.connect(gain);
            gain.connect(this.ctx!.destination);
            osc.start(now + t);
            osc.stop(now + t + 0.15);
        };

        playBuzz(0);
        playBuzz(0.12);
    }
}

export const sfx = new SoundManager();
