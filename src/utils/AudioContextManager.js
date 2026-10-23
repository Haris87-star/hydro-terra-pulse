/**
 * AudioContextManager.js
 * Low-latency, raw-sensor Web Audio API manager.
 * Strict hardware bypass: disables echoCancellation, noiseSuppression, autoGainControl
 * for clean physical contact acoustics & active sonar chirp generation.
 * DPDP Act Compliant: Volatile memory zeroing on demand.
 */

class AudioContextManager {
  constructor() {
    this.ctx = null;
    this.mediaStream = null;
    this.sourceNode = null;
    this.biquadFilter = null;
    this.analyser = null;
    this.isRecording = false;
    this.volatileAudioBuffer = null;
    this.ringBuffer = new Float32Array(48000 * 5); // 5-second circular memory ring
    this.ringWritePos = 0;
  }

  /**
   * Initializes or resumes the AudioContext
   */
  async getAudioContext() {
    if (!this.ctx) {
      const AudioContextClass = window.AudioContext || window.webkitAudioContext;
      this.ctx = new AudioContextClass({
        latencyHint: 'interactive',
        sampleRate: 48000
      });
    }
    if (this.ctx.state === 'suspended') {
      await this.ctx.resume();
    }
    return this.ctx;
  }

  /**
   * Starts raw microphone capture without browser DSP interference
   */
  async startRawCapture(onAudioData) {
    const ctx = await this.getAudioContext();

    if (this.mediaStream) {
      this.stopRawCapture();
    }

    try {
      this.mediaStream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: false,
          noiseSuppression: false,
          autoGainControl: false,
          sampleRate: 48000,
          channelCount: 1
        },
        video: false
      });

      this.sourceNode = ctx.createMediaStreamSource(this.mediaStream);

      // Create Biquad Bandpass Filter (150 Hz - 1,000 Hz) to isolate acoustic valve contact hiss
      this.biquadFilter = ctx.createBiquadFilter();
      this.biquadFilter.type = 'bandpass';
      this.biquadFilter.frequency.value = 575; // center of [150, 1000]
      this.biquadFilter.Q.value = 1.2; // Q = f0 / BW = 575 / 850 ~ 0.68 to 1.2

      this.analyser = ctx.createAnalyser();
      this.analyser.fftSize = 2048;
      this.analyser.smoothingTimeConstant = 0.6;

      // ScriptProcessor / AudioWorklet tap for raw sample buffer
      const bufferSize = 2048;
      const scriptNode = ctx.createScriptProcessor(bufferSize, 1, 1);
      
      scriptNode.onaudioprocess = (e) => {
        if (!this.isRecording) return;
        const inputData = e.inputBuffer.getChannelData(0);
        
        // Write into volatile circular ring buffer
        for (let i = 0; i < inputData.length; i++) {
          this.ringBuffer[this.ringWritePos] = inputData[i];
          this.ringWritePos = (this.ringWritePos + 1) % this.ringBuffer.length;
        }

        if (onAudioData) {
          onAudioData(inputData, this.analyser);
        }
      };

      this.sourceNode.connect(this.biquadFilter);
      this.biquadFilter.connect(this.analyser);
      this.analyser.connect(scriptNode);
      scriptNode.connect(ctx.destination);

      this.isRecording = true;
      return true;
    } catch (err) {
      console.warn('Live microphone capture error (falling back to synthetic mode if enabled):', err);
      return false;
    }
  }

  /**
   * Stops live capture and detaches tracks
   */
  stopRawCapture() {
    this.isRecording = false;
    if (this.mediaStream) {
      this.mediaStream.getTracks().forEach(track => track.stop());
      this.mediaStream = null;
    }
    if (this.sourceNode) {
      this.sourceNode.disconnect();
      this.sourceNode = null;
    }
  }

  /**
   * Plays linear acoustic chirp (100 Hz -> 4,000 Hz over 1.5 seconds)
   * used for Module 3 Active Sonar Void Scanning
   */
  async playLinearChirp(duration = 1.5, startFreq = 100, endFreq = 4000) {
    const ctx = await this.getAudioContext();
    const osc = ctx.createOscillator();
    const gainNode = ctx.createGain();

    const now = ctx.currentTime;
    osc.type = 'sine';
    
    // Linear frequency chirp ramp from 100 Hz to 4,000 Hz
    osc.frequency.setValueAtTime(startFreq, now);
    osc.frequency.linearRampToValueAtTime(endFreq, now + duration);

    // Smooth envelope attack and decay to prevent loudspeaker click
    gainNode.gain.setValueAtTime(0.001, now);
    gainNode.gain.exponentialRampToValueAtTime(0.65, now + 0.08);
    gainNode.gain.setValueAtTime(0.65, now + duration - 0.08);
    gainNode.gain.exponentialRampToValueAtTime(0.001, now + duration);

    osc.connect(gainNode);
    gainNode.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + duration + 0.05);

    return new Promise(resolve => {
      setTimeout(resolve, (duration + 0.1) * 1000);
    });
  }

  /**
   * Snapshot current volatile buffer (e.g. for Valve A or Valve B contact recording)
   */
  snapshotVolatileBuffer(seconds = 3) {
    const sampleRate = this.ctx ? this.ctx.sampleRate : 48000;
    const numSamples = Math.min(this.ringBuffer.length, Math.floor(sampleRate * seconds));
    const output = new Float32Array(numSamples);

    let readPos = (this.ringWritePos - numSamples + this.ringBuffer.length) % this.ringBuffer.length;
    for (let i = 0; i < numSamples; i++) {
      output[i] = this.ringBuffer[readPos];
      readPos = (readPos + 1) % this.ringBuffer.length;
    }
    return output;
  }

  /**
   * DPDP Act Compliant: Overwrites all volatile RAM audio arrays with zeros
   */
  purgeVolatileMemory() {
    if (this.ringBuffer) {
      this.ringBuffer.fill(0);
    }
    this.ringWritePos = 0;
    return {
      status: 'PURGED',
      bytesWiped: this.ringBuffer ? this.ringBuffer.byteLength : 0,
      timestamp: new Date().toISOString()
    };
  }
}

export const audioManager = new AudioContextManager();
