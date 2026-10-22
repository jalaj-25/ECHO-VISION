export class AudioManager {
  constructor() {
    this.context = null;
    this.gainNode = null;
    this.muted = false;
    this.pulseOscillator = null;
    this.pulseFilter = null;
    this.resonanceOscillator = null;
    this.exitOscillator = null;
    this.isInitialized = false;

    this._setupOscillator = (oscillator, frequency, type = "sine") => {
      oscillator.frequency.value = frequency;
      oscillator.type = type;
    };

    this._setupGain = (gainNode, value) => {
      gainNode.gain.value = value;
    };
  }

  async initialize() {
    if (this.isInitialized) return;
    try {
      this.context = new (window.AudioContext || window.webkitAudioContext)();
      this.gainNode = this.createGain(this.context, 0.3);
      this.isInitialized = true;
    } catch (e) {
      console.error("AudioContext initialization failed:", e);
    }
  }

  createGain(context, gainValue = 0.3) {
    const gainNode = context.createGain();
    gainNode.gain.value = gainValue;
    gainNode.connect(context.destination);
    return gainNode;
  }

  resume() {
    if (this.context && this.context.state) {
      this.context.resume().then(() => {
        this.isInitialized = true;
      });
    }
  }

  playPulse() {
    if (!this.context || this.muted) return;
    try {
      const osc = this.context.createOscillator();
      const gain = this.context.createGain();
      const filter = this.context.createBiquadFilter();

      osc.type = "sine";
      osc.frequency.value = 200;
      filter.type = "lowpass";
      filter.frequency.value = 200;
      gain.gain.value = 0.1;

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(this.context.destination);

      osc.start();
      setTimeout(() => osc.stop(), 50);

      setTimeout(() => this.playReturnResonance(), 80);
    } catch (e) {
      console.error("Failed to play pulse sound:", e);
    }
  }

  playReturnResonance() {
    if (!this.context || this.muted) return;
    try {
      const osc = this.context.createOscillator();
      const gain = this.context.createGain();

      osc.type = "sine";
      osc.frequency.value = 100;
      gain.gain.value = 0.05;

      osc.connect(gain);
      gain.connect(this.context.destination);

      osc.start();
      setTimeout(() => osc.stop(), 500);
    } catch (e) {
      console.error("Failed to play resonance:", e);
    }
  }

  playExitSignal(distance) {
    if (!this.context || this.muted) return;
    try {
      const distanceFactor = Math.max(0.1, 1.0 - distance / 20);
      const osc = this.context.createOscillator();
      const gain = this.context.createGain();

      osc.type = "sine";
      osc.frequency.value = 100 + distanceFactor * 50;
      gain.gain.value = 0.02 * distanceFactor;

      osc.connect(gain);
      gain.connect(this.context.destination);

      osc.start();
      setTimeout(() => osc.stop(), 800);
    } catch (e) {
      console.error("Failed to play exit signal:", e);
    }
  }

  playWin() {
    if (!this.context || this.muted) return;
    try {
      const osc = this.context.createOscillator();
      const gain = this.context.createGain();

      osc.type = "sine";
      osc.frequency.value = 800;
      gain.gain.value = 0.1;

      osc.connect(gain);
      gain.connect(this.context.destination);

      osc.start();
      setTimeout(() => osc.stop(), 200);
    } catch (e) {
      console.error("Failed to play win sound:", e);
    }
  }

  lose() {
    if (!this.context || this.muted) return;
    try {
      const osc = this.context.createOscillator();
      const gain = this.context.createGain();

      osc.type = "sine";
      osc.frequency.value = 150;
      gain.gain.value = 0.1;

      osc.connect(gain);
      gain.connect(this.context.destination);

      osc.start();
      setTimeout(() => osc.stop(), 400);
    } catch (e) {
      console.error("Failed to play lose sound:", e);
    }
  }

  setMuted(muted) {
    this.muted = muted;
    if (this.gainNode) {
      this.gainNode.gain.value = muted ? 0.0 : 1.0;
    }
  }

  dispose() {
    if (this.context) {
      this.context.suspend();
    }
  }
}