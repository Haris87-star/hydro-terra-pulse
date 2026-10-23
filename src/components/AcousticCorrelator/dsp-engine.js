/**
 * dsp-engine.js
 * High-performance DSP algorithms for Acoustic Valve Contact & TDoA Leak Correlation.
 * Implements discrete cross-correlation, lag peak isolation, acoustic propagation velocity
 * modeling, and pinpoint distance localization between Valve A and Valve B.
 */

export class DSPEngine {
  /**
   * Typical acoustic propagation velocities in water-filled municipal pipelines (m/s)
   */
  static PIPE_MATERIALS = {
    DUCTILE_IRON: { name: 'Ductile Iron (BWSSB Primary)', velocity: 1200, icon: '🛡️' },
    CAST_IRON: { name: 'Cast Iron (Old Bengaluru Trunk)', velocity: 1100, icon: '🏛️' },
    MILD_STEEL: { name: 'Mild Steel (High-Pressure)', velocity: 1300, icon: '⚡' },
    PVC: { name: 'uPVC (Secondary Feeder)', velocity: 520, icon: '🧪' },
    HDPE: { name: 'HDPE (Service Connection)', velocity: 460, icon: '🌀' }
  };

  /**
   * Computes Cross-Correlation R_xy(tau) between signal x (Valve A) and signal y (Valve B).
   * Supports maximum lag limit to avoid unnecessary compute beyond physical pipe length.
   */
  static computeCrossCorrelation(signalA, signalB, sampleRate = 48000, maxLagSeconds = 0.15) {
    const N = Math.min(signalA.length, signalB.length);
    const maxLagSamples = Math.min(Math.floor(maxLagSeconds * sampleRate), Math.floor(N / 2));
    const lags = [];
    const correlation = [];

    // Zero-mean normalisation
    let meanA = 0, meanB = 0;
    for (let i = 0; i < N; i++) {
      meanA += signalA[i];
      meanB += signalB[i];
    }
    meanA /= N;
    meanB /= N;

    let varA = 0, varB = 0;
    for (let i = 0; i < N; i++) {
      const a = signalA[i] - meanA;
      const b = signalB[i] - meanB;
      varA += a * a;
      varB += b * b;
    }
    const norm = Math.sqrt(varA * varB) || 1e-6;

    let peakValue = -Infinity;
    let peakLagIndex = 0;

    // Cross-correlation loop over -maxLag to +maxLag
    for (let lag = -maxLagSamples; lag <= maxLagSamples; lag++) {
      let sum = 0;
      let count = 0;

      for (let i = 0; i < N; i++) {
        const j = i + lag;
        if (j >= 0 && j < N) {
          sum += (signalA[i] - meanA) * (signalB[j] - meanB);
          count++;
        }
      }

      const r = count > 0 ? (sum / norm) : 0;
      lags.push(lag);
      correlation.push(r);

      if (Math.abs(r) > peakValue) {
        peakValue = Math.abs(r);
        peakLagIndex = lag;
      }
    }

    // Time difference of arrival (Delta t) in seconds
    const deltaT = peakLagIndex / sampleRate;

    // Calculate Peak-to-Sidelobe Ratio (PSLR) for confidence
    let meanNoiseFloor = 0;
    let noiseSamples = 0;
    for (let i = 0; i < correlation.length; i++) {
      const lag = lags[i];
      if (Math.abs(lag - peakLagIndex) > 20) {
        meanNoiseFloor += Math.abs(correlation[i]);
        noiseSamples++;
      }
    }
    meanNoiseFloor = noiseSamples > 0 ? (meanNoiseFloor / noiseSamples) : 0.01;
    const confidence = Math.min(99.4, Math.max(30.0, ((peakValue / (meanNoiseFloor || 0.01)) * 12.5)));

    return {
      lags,
      correlation,
      peakLagIndex,
      peakValue,
      deltaT,
      confidence: parseFloat(confidence.toFixed(1))
    };
  }

  /**
   * Calculates exact distance from Valve A (dA) and Valve B (dB)
   * Formula: dA = (L - c * deltaT) / 2
   * Note: deltaT is (tB - tA).
   */
  static calculateLeakLocation(pipeLengthMeters, speedOfSound, deltaT) {
    // Distance sound travels during time difference
    const deltaDistance = speedOfSound * deltaT;

    // dA = (L - deltaDistance) / 2
    let dA = (pipeLengthMeters - deltaDistance) / 2;
    let dB = pipeLengthMeters - dA;

    // Clamp within bounds for physical sanity
    const isOutOfBounds = dA < 0 || dA > pipeLengthMeters;
    dA = Math.max(0, Math.min(pipeLengthMeters, dA));
    dB = Math.max(0, Math.min(pipeLengthMeters, dB));

    return {
      distA: parseFloat(dA.toFixed(2)),
      distB: parseFloat(dB.toFixed(2)),
      deltaDistance: parseFloat(deltaDistance.toFixed(2)),
      isOutOfBounds
    };
  }

  /**
   * Applies a digital Biquad IIR Bandpass filter (150 Hz - 1,000 Hz) to Float32Array in memory
   */
  static applyBiquadBandpass(inputBuffer, sampleRate = 48000, f0 = 575, Q = 1.0) {
    const N = inputBuffer.length;
    const output = new Float32Array(N);

    const w0 = (2 * Math.PI * f0) / sampleRate;
    const alpha = Math.sin(w0) / (2 * Q);

    const b0 = alpha;
    const b1 = 0;
    const b2 = -alpha;
    const a0 = 1 + alpha;
    const a1 = -2 * Math.cos(w0);
    const a2 = 1 - alpha;

    // Direct Form II Transposed implementation
    let x1 = 0, x2 = 0;
    let y1 = 0, y2 = 0;

    for (let i = 0; i < N; i++) {
      const x = inputBuffer[i];
      const y = (b0 / a0) * x + (b1 / a0) * x1 + (b2 / a0) * x2
              - (a1 / a0) * y1 - (a2 / a0) * y2;

      x2 = x1;
      x1 = x;
      y2 = y1;
      y1 = y;

      output[i] = y;
    }

    return output;
  }
}
