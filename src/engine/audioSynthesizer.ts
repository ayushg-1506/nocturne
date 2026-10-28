/**
 * Nocturne Procedural Web Audio Synthesizer
 * Generates ambient room tone, 18.98Hz infrasound wave, and EMF crackle
 */
export class AudioSynthesizer {
  private static ctx: AudioContext | null = null;
  private static masterGain: GainNode | null = null;
  private static humOsc: OscillatorNode | null = null;
  private static infrasoundOsc: OscillatorNode | null = null;
  private static noiseNode: AudioBufferSourceNode | null = null;
  private static isPlaying = false;

  public static init() {
    if (this.ctx) return;
    const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    this.ctx = new AudioCtx();
    this.masterGain = this.ctx.createGain();
    this.masterGain.gain.setValueAtTime(0.18, this.ctx.currentTime);
    this.masterGain.connect(this.ctx.destination);
  }

  public static toggleAudio(): boolean {
    this.init();
    if (!this.ctx) return false;

    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }

    if (this.isPlaying) {
      this.stop();
      return false;
    } else {
      this.startAmbient();
      return true;
    }
  }

  public static isAudioActive(): boolean {
    return this.isPlaying;
  }

  public static startAmbient() {
    if (!this.ctx || !this.masterGain) return;
    this.isPlaying = true;

    // 1. Ambient 60Hz room baseline hum
    this.humOsc = this.ctx.createOscillator();
    this.humOsc.type = 'sine';
    this.humOsc.frequency.setValueAtTime(60, this.ctx.currentTime);

    const humFilter = this.ctx.createBiquadFilter();
    humFilter.type = 'lowpass';
    humFilter.frequency.setValueAtTime(120, this.ctx.currentTime);

    const humGain = this.ctx.createGain();
    humGain.gain.setValueAtTime(0.08, this.ctx.currentTime);

    this.humOsc.connect(humFilter);
    humFilter.connect(humGain);
    humGain.connect(this.masterGain);
    this.humOsc.start();

    // 2. Brown/Pink noise for air drift
    const bufferSize = this.ctx.sampleRate * 2;
    const noiseBuffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const output = noiseBuffer.getChannelData(0);
    let lastOut = 0.0;
    for (let i = 0; i < bufferSize; i++) {
      const white = Math.random() * 2 - 1;
      output[i] = (lastOut + 0.02 * white) / 1.02;
      lastOut = output[i];
      output[i] *= 0.15;
    }

    this.noiseNode = this.ctx.createBufferSource();
    this.noiseNode.buffer = noiseBuffer;
    this.noiseNode.loop = true;

    const noiseFilter = this.ctx.createBiquadFilter();
    noiseFilter.type = 'bandpass';
    noiseFilter.frequency.setValueAtTime(240, this.ctx.currentTime);
    noiseFilter.Q.setValueAtTime(1.5, this.ctx.currentTime);

    this.noiseNode.connect(noiseFilter);
    noiseFilter.connect(this.masterGain);
    this.noiseNode.start();
  }

  public static triggerInfrasound(enable: boolean, freqHz = 18.98) {
    if (!this.ctx || !this.isPlaying || !this.masterGain) return;

    if (enable) {
      if (!this.infrasoundOsc) {
        this.infrasoundOsc = this.ctx.createOscillator();
        this.infrasoundOsc.type = 'sine';
        this.infrasoundOsc.frequency.setValueAtTime(freqHz, this.ctx.currentTime);

        const infraGain = this.ctx.createGain();
        infraGain.gain.setValueAtTime(0.35, this.ctx.currentTime);

        this.infrasoundOsc.connect(infraGain);
        infraGain.connect(this.masterGain);
        this.infrasoundOsc.start();
      }
    } else {
      if (this.infrasoundOsc) {
        try {
          this.infrasoundOsc.stop();
          this.infrasoundOsc.disconnect();
        } catch {
          // ignore
        }
        this.infrasoundOsc = null;
      }
    }
  }

  public static triggerEmfPulse() {
    if (!this.ctx || !this.isPlaying || !this.masterGain) return;

    // Quick burst of high-frequency white noise clicking (Geiger style)
    const burstLength = 0.12;
    const buffer = this.ctx.createBuffer(1, this.ctx.sampleRate * burstLength, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < data.length; i++) {
      data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (data.length * 0.3));
    }

    const source = this.ctx.createBufferSource();
    source.buffer = buffer;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'highpass';
    filter.frequency.setValueAtTime(2500, this.ctx.currentTime);

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0.2, this.ctx.currentTime);

    source.connect(filter);
    filter.connect(gain);
    gain.connect(this.masterGain);
    source.start();
  }

  public static stop() {
    if (this.humOsc) {
      try { this.humOsc.stop(); this.humOsc.disconnect(); } catch { /* ignore */ }
      this.humOsc = null;
    }
    if (this.noiseNode) {
      try { this.noiseNode.stop(); this.noiseNode.disconnect(); } catch { /* ignore */ }
      this.noiseNode = null;
    }
    if (this.infrasoundOsc) {
      try { this.infrasoundOsc.stop(); this.infrasoundOsc.disconnect(); } catch { /* ignore */ }
      this.infrasoundOsc = null;
    }
    this.isPlaying = false;
  }
}
