/**
 * Computes the exact leak distance from Valve A using Generalized Cross-Correlation (TDoA).
 * @param {Float32Array} signalA - Audio buffer recorded at Street Valve A
 * @param {Float32Array} signalB - Audio buffer recorded at Street Valve B
 * @param {number} sampleRate - AudioContext sample rate (typically 44100 or 48000 Hz)
 * @param {number} pipeLengthMeters - Distance between Valve A and Valve B (e.g., 60m)
 * @param {string} pipeMaterial - 'DI' (Ductile Iron), 'STEEL', or 'PVC'
 */
export function calculateLeakCoordinate(
    signalA,
    signalB,
    sampleRate = 44100,
    pipeLengthMeters = 60,
    pipeMaterial = 'DI'
) {
    // Acoustic propagation speed (m/s) inside water-filled pipes
    const waveSpeeds = {
        STEEL: 1400,
        DI: 1250,   // Standard BWSSB metallic arterial/street line
        PVC: 420    // High-density plastic / MDPE branch line
    };
    const v = waveSpeeds[pipeMaterial] || 1250;

    // Maximum possible acoustic delay between the two valves
    const maxDelaySeconds = pipeLengthMeters / v;
    const maxLagSamples = Math.ceil(maxDelaySeconds * sampleRate);

    let bestLag = 0;
    let maxCorrelation = -Infinity;
    const N = Math.min(signalA.length, signalB.length);

    // Normalized Cross-Correlation across valid physical lag window
    for (let lag = -maxLagSamples; lag <= maxLagSamples; lag++) {
        let sumAB = 0;
        let sumA2 = 0;
        let sumB2 = 0;

        for (let i = 0; i < N; i++) {
            const idxB = i + lag;
            if (idxB >= 0 && idxB < N) {
                const a = signalA[i];
                const b = signalB[idxB];
                sumAB += a * b;
                sumA2 += a * a;
                sumB2 += b * b;
            }
        }

        const denom = Math.sqrt(sumA2 * sumB2);
        const correlation = denom > 0 ? sumAB / denom : 0;

        if (correlation > maxCorrelation) {
            maxCorrelation = correlation;
            bestLag = lag;
        }
    }

    // Time Difference of Arrival (Delta t in seconds)
    const deltaT = bestLag / sampleRate;

    // Classical Acoustic Leak Formula: d_A = (D - v * deltaT) / 2
    const rawDistanceFromA = (pipeLengthMeters - v * deltaT) / 2;
    const clampedDistance = Math.max(0, Math.min(pipeLengthMeters, rawDistanceFromA));

    return {
        distanceFromValveA: Number(clampedDistance.toFixed(2)),
        distanceFromValveB: Number((pipeLengthMeters - clampedDistance).toFixed(2)),
        timeDelayMs: Number((deltaT * 1000).toFixed(3)),
        correlationConfidence: Math.round(Math.max(0, maxCorrelation) * 100),
        waveVelocityUsed: v
    };
}