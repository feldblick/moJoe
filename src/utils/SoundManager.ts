class SoundManager {
  private ctx: AudioContext | null = null;

  private init() {
    if (!this.ctx) {
      this.ctx = new (window.AudioContext || (window as Window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext)();
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  playClick() {
    try {
      this.init();
      if (!this.ctx) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(800, this.ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(100, this.ctx.currentTime + 0.05);

      gain.gain.setValueAtTime(0.05, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.05);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start();
      osc.stop(this.ctx.currentTime + 0.05);
    } catch (e) {
      console.warn('Audio click failed', e);
    }
  }

  playCorrect() {
    try {
      this.init();
      if (!this.ctx) return;

      const now = this.ctx.currentTime;
      // Arpeggio: C5 -> E5 -> G5 -> C6
      const notes = [523.25, 659.25, 783.99, 1046.50];
      const duration = 0.1;
      const spacing = 0.07;

      notes.forEach((freq, index) => {
        if (!this.ctx) return;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, now + index * spacing);

        gain.gain.setValueAtTime(0, now + index * spacing);
        gain.gain.linearRampToValueAtTime(0.15, now + index * spacing + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.001, now + index * spacing + duration);

        osc.connect(gain);
        gain.connect(this.ctx.destination);

        osc.start(now + index * spacing);
        osc.stop(now + index * spacing + duration);
      });
    } catch (e) {
      console.warn('Audio correct chime failed', e);
    }
  }

  playIncorrect() {
    try {
      this.init();
      if (!this.ctx) return;

      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(180, now);
      osc.frequency.linearRampToValueAtTime(100, now + 0.25);

      gain.gain.setValueAtTime(0, now);
      gain.gain.linearRampToValueAtTime(0.12, now + 0.05);
      gain.gain.linearRampToValueAtTime(0.12, now + 0.15);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.25);

      // Low pass filter to make it softer and less harsh
      const filter = this.ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(300, now);

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now);
      osc.stop(now + 0.25);
    } catch (e) {
      console.warn('Audio incorrect buzzer failed', e);
    }
  }
}

export const soundManager = new SoundManager();
