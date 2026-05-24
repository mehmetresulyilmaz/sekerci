/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

class SoundEffectsManager {
  private ctx: AudioContext | null = null;

  private initContext() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  playSelect() {
    try {
      this.initContext();
      if (!this.ctx) return;
      const t = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(400, t);
      osc.frequency.exponentialRampToValueAtTime(800, t + 0.08);

      gain.gain.setValueAtTime(0.08, t);
      gain.gain.exponentialRampToValueAtTime(0.01, t + 0.08);

      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(t);
      osc.stop(t + 0.08);
    } catch (e) {
      // Ignored if sound is blocked or unsupported
    }
  }

  playSwap() {
    try {
      this.initContext();
      if (!this.ctx) return;
      const t = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(500, t);
      osc.frequency.setValueAtTime(320, t + 0.05);

      gain.gain.setValueAtTime(0.12, t);
      gain.gain.exponentialRampToValueAtTime(0.01, t + 0.12);

      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(t);
      osc.stop(t + 0.12);
    } catch (e) {}
  }

  playMatch(combo: number = 0) {
    try {
      this.initContext();
      if (!this.ctx) return;
      const t = this.ctx.currentTime;
      const duration = 0.25;
      
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      // Pitch goes up based on combos
      const baseFreq = 440 + combo * 110;
      osc.frequency.setValueAtTime(baseFreq, t);
      osc.frequency.exponentialRampToValueAtTime(baseFreq * 1.5, t + duration);

      gain.gain.setValueAtTime(0.15, t);
      gain.gain.exponentialRampToValueAtTime(0.01, t + duration);

      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(t);
      osc.stop(t + duration);

      // Play a lovely little high-pitched ring for sweet explosion feel
      const ringOsc = this.ctx.createOscillator();
      const ringGain = this.ctx.createGain();
      ringOsc.type = 'triangle';
      ringOsc.frequency.setValueAtTime(baseFreq * 2.2, t);
      ringGain.gain.setValueAtTime(0.05, t);
      ringGain.gain.exponentialRampToValueAtTime(0.001, t + 0.15);
      ringOsc.connect(ringGain);
      ringGain.connect(this.ctx.destination);
      ringOsc.start(t);
      ringOsc.stop(t + 0.15);
    } catch (e) {}
  }

  playSpecialActivate() {
    try {
      this.initContext();
      if (!this.ctx) return;
      const t = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(150, t);
      osc.frequency.exponentialRampToValueAtTime(900, t + 0.35);

      // Simple low pass filter for beefy bass feel
      const filter = this.ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(1000, t);

      gain.gain.setValueAtTime(0.12, t);
      gain.gain.exponentialRampToValueAtTime(0.01, t + 0.35);

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(t);
      osc.stop(t + 0.35);
    } catch (e) {}
  }

  playClaim() {
    try {
      this.initContext();
      if (!this.ctx) return;
      const t = this.ctx.currentTime;
      const notes = [261.63, 329.63, 392.00, 523.25]; // C4, E4, G4, C5 arpeggio
      notes.forEach((freq, idx) => {
        if (!this.ctx) return;
        const noteTime = t + idx * 0.09;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.frequency.setValueAtTime(freq, noteTime);
        gain.gain.setValueAtTime(0.12, noteTime);
        gain.gain.exponentialRampToValueAtTime(0.005, noteTime + 0.18);
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(noteTime);
        osc.stop(noteTime + 0.18);
      });
    } catch (e) {}
  }

  playTriumph() {
    try {
      this.initContext();
      if (!this.ctx) return;
      const t = this.ctx.currentTime;
      const notes = [523.25, 659.25, 783.99, 1046.50]; // C5, E5, G5, C6 triumph fanfares
      notes.forEach((freq, idx) => {
        if (!this.ctx) return;
        const noteTime = t + idx * 0.12;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, noteTime);
        gain.gain.setValueAtTime(0.15, noteTime);
        gain.gain.exponentialRampToValueAtTime(0.005, noteTime + 0.3);
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(noteTime);
        osc.stop(noteTime + 0.3);
      });
    } catch (e) {}
  }
}

export const sounds = new SoundEffectsManager();
