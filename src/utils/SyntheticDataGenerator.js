/**
 * SyntheticDataGenerator.js
 * High-fidelity synthetic sensor data generator for Kaveri Terra-Pulse.
 * Provides pre-computed, physics-accurate data streams for:
 * 1. Pump Impeller Cavitation (micro-vibrations, 142 Hz harmonic peaks, broadband vapor collapse noise)
 * 2. Underground Pipe Acoustic Leak Hiss (Ductile Iron, L=80m, dA=28.5m, dB=51.5m, TDoA lag)
 * 3. Active Sonar Chirp & Void Cavity Resonance (High-Q cavity echo vs heavily damped soil)
 */

export class SyntheticDataGenerator {
  /**
   * Generates a 1-second buffer of synthetic pump vibration at sample rate (e.g., 60 fps for video or 48kHz for audio)
   * Cavitation mode adds broadband noise above 120 Hz and characteristic cavitation burst pulses.
   */
  static generatePumpVibrationSample(t, isCavitating = true) {
    // Fundamental pump shaft frequency: ~25 Hz (1500 RPM motor)
    const f_motor = 25.0;
    // Blade pass frequency (5-vane impeller): 5 * 25 = 125 Hz
    const f_bpf = 125.0;
    
    // Normal mechanical baseline vibration
    let signal = 0.4 * Math.sin(2 * Math.PI * f_motor * t) +
                 0.25 * Math.sin(2 * Math.PI * f_bpf * t);

    if (isCavitating) {
      // Cavitation creates violent bubble collapse spikes and broadband high-frequency resonance (140 - 220 Hz)
      const cavitationResonance = 0.65 * Math.sin(2 * Math.PI * 142.5 * t + Math.sin(2 * Math.PI * 12 * t));
      const bubblePop = Math.random() > 0.88 ? (Math.random() - 0.5) * 1.8 : 0;
      const broadbandHiss = (Math.random() - 0.5) * 0.45;
      signal += cavitationResonance + bubblePop + broadbandHiss;
    } else {
      // Mild smooth operational noise
      signal += (Math.random() - 0.5) * 0.08;
    }

    return Math.max(-1, Math.min(1, signal));
  }

  /**
   * Generates realistic synthetic acoustic leak waveforms for Valve A and Valve B.
   * Pipe parameters: Ductile Iron (speed of sound c = 1200 m/s), Distance L = 80m.
   * Rupture at dA = 28.5m from Valve A (dB = 51.5m).
   * Time delay: delta_t = (dB - dA) / c = (51.5 - 28.5) / 1200 = 23 / 1200 = 0.01916 seconds.
   * At 48,000 Hz, lag in samples = 0.01916 * 48000 = 920 samples.
   */
  static generateAcousticLeakWaveforms(numSamples = 48000, sampleRate = 48000, pipeLength = 80, leakDistA = 28.5, speedOfSound = 1200) {
    const bufferA = new Float32Array(numSamples);
    const bufferB = new Float32Array(numSamples);

    // Calculate delay in samples
    const distB = pipeLength - leakDistA;
    const timeA = leakDistA / speedOfSound;
    const timeB = distB / speedOfSound;
    const delaySeconds = timeB - timeA; // Positive means Valve A receives leak sound first
    const delaySamples = Math.round(delaySeconds * sampleRate);

    // Generate continuous turbulent water leak hiss (filtered broadband 200-800 Hz)
    const masterLeakNoise = new Float32Array(numSamples + Math.abs(delaySamples) + 1000);
    
    // Colored noise synthesis with pipe resonance modes (320 Hz, 480 Hz, 710 Hz)
    for (let i = 0; i < masterLeakNoise.length; i++) {
      const white = (Math.random() - 0.5) * 2;
      const t = i / sampleRate;
      const pipeAcousticRing = 0.35 * Math.sin(2 * Math.PI * 320 * t) +
                               0.25 * Math.sin(2 * Math.PI * 480 * t) +
                               0.15 * Math.sin(2 * Math.PI * 710 * t);
      masterLeakNoise[i] = white * 0.6 + pipeAcousticRing;
    }

    // Apply distance attenuation: closer valve gets slightly louder signal with less high-frequency damping
    const attenA = 1.0 / Math.max(1, Math.sqrt(leakDistA / 10));
    const attenB = 1.0 / Math.max(1, Math.sqrt(distB / 10));

    const offset = Math.max(0, -delaySamples);
    for (let i = 0; i < numSamples; i++) {
      // Valve A signal
      bufferA[i] = masterLeakNoise[i + offset] * attenA * 0.75 + (Math.random() - 0.5) * 0.05;
      // Valve B signal (delayed by delaySamples)
      const indexB = i + offset + delaySamples;
      bufferB[i] = masterLeakNoise[indexB] * attenB * 0.70 + (Math.random() - 0.5) * 0.06;
    }

    return {
      bufferA,
      bufferB,
      expectedDelaySeconds: delaySeconds,
      expectedDelaySamples: delaySamples,
      pipeLength,
      leakDistA,
      distB,
      speedOfSound
    };
  }

  /**
   * Generates synthetic active sonar reflection response for SubTerra-Vision.
   * Compares Solid Compacted Soil vs Hollow Sinkhole Void.
   */
  static generateVoidScanReflection(isHollowVoid = true, sampleRate = 48000) {
    const duration = 2.0; // 2 seconds
    const totalSamples = Math.floor(sampleRate * duration);
    const audioReflection = new Float32Array(totalSamples);
    const accelTraceZ = new Float32Array(120); // 60Hz - 120 samples (~2s)

    // Base chirp response
    for (let i = 0; i < totalSamples; i++) {
      const t = i / sampleRate;
      
      if (isHollowVoid) {
        // Hollow cavity produces acoustic cavern resonance (Helmholtz mode at ~340 Hz and ~680 Hz)
        // With sustained ring-down / high Q-factor
        const cavityResonance1 = Math.exp(-1.8 * (t - 0.2)) * Math.sin(2 * Math.PI * 342 * t) * (t > 0.2 ? 1 : 0);
        const cavityResonance2 = Math.exp(-2.2 * (t - 0.35)) * Math.sin(2 * Math.PI * 684 * t) * (t > 0.35 ? 1 : 0);
        const echoFlutter = 0.25 * Math.sin(2 * Math.PI * 18 * t) * Math.sin(2 * Math.PI * 342 * t);
        
        audioReflection[i] = (cavityResonance1 * 0.7 + cavityResonance2 * 0.4 + echoFlutter) + (Math.random() - 0.5) * 0.08;
      } else {
        // Solid soil absorbs higher frequencies and damps quickly
        const soilDampedPulse = Math.exp(-8.5 * (t - 0.2)) * Math.sin(2 * Math.PI * 180 * t) * (t > 0.2 ? 1 : 0);
        audioReflection[i] = soilDampedPulse * 0.4 + (Math.random() - 0.5) * 0.03;
      }
    }

    // MEMS Z-axis accelerometer vibration trace
    for (let j = 0; j < accelTraceZ.length; j++) {
      const tj = j / 60;
      if (isHollowVoid) {
        // Road surface above hollow void flexes more under acoustic pressure wave
        accelTraceZ[j] = 9.81 + 0.45 * Math.sin(2 * Math.PI * 12 * tj) * Math.exp(-0.8 * tj) + (Math.random() - 0.5) * 0.08;
      } else {
        // Compacted soil provides rigid reaction force, minimal flex
        accelTraceZ[j] = 9.81 + 0.08 * Math.sin(2 * Math.PI * 24 * tj) * Math.exp(-3.5 * tj) + (Math.random() - 0.5) * 0.02;
      }
    }

    return {
      audioReflection,
      accelTraceZ,
      spectralResonanceRatio: isHollowVoid ? 3.42 : 0.88,
      classification: isHollowVoid ? 'HOLLOW_SINKHOLE_VOID' : 'SOLID_COMPACTED_SOIL',
      resonantFrequencyHz: isHollowVoid ? 342.5 : 178.0,
      cavityDepthEstimateMeters: isHollowVoid ? 1.25 : 0.0,
      erosionVolumeEstimateM3: isHollowVoid ? 3.8 : 0.0,
      riskLevel: isHollowVoid ? 'CRITICAL_ROAD_COLLAPSE_RISK' : 'SAFE_BASE'
    };
  }
}
