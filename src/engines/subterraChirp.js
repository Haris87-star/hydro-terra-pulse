/**
 * Emits a 100 Hz -> 3500 Hz acoustic frequency sweep (chirp) and measures
 * hollow sub-road drum resonance (drumming effect over sinkhole voids).
 */
export async function runActiveVoidSweep(audioCtx, analyserNode, durationSec = 1.5) {
    if (audioCtx.state === 'suspended') await audioCtx.resume();

    // 1. Create Oscillator for Active Chirp Injection
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();

    osc.type = 'sine';
    const now = audioCtx.currentTime;
    osc.frequency.setValueAtTime(100, now);
    osc.frequency.exponentialRampToValueAtTime(3500, now + durationSec);

    // Envelope to avoid speaker clicking
    gain.gain.setValueAtTime(0.01, now);
    gain.gain.linearRampToValueAtTime(0.9, now + 0.1);
    gain.gain.exponentialRampToValueAtTime(0.01, now + durationSec);

    osc.connect(gain);
    gain.connect(audioCtx.destination);

    osc.start(now);
    osc.stop(now + durationSec);

    // 2. Sample the Acoustic Reflection Profile during the sweep
    const bins = analyserNode.frequencyBinCount;
    const freqBuffer = new Uint8Array(bins);
    const sampleRate = audioCtx.sampleRate;
    const binWidth = sampleRate / analyserNode.fftSize;

    let lowHollowResonanceEnergy = 0; // 120 Hz - 450 Hz (Hollow void drumming band)
    let highDampedEnergy = 0;         // 800 Hz - 2500 Hz (Compacted soil absorption band)
    let samplesTaken = 0;

    return new Promise((resolve) => {
        const sampler = setInterval(() => {
            analyserNode.getByteFrequencyData(freqBuffer);
            for (let i = 0; i < bins; i++) {
                const freq = i * binWidth;
                if (freq >= 120 && freq <= 450) lowHollowResonanceEnergy += freqBuffer[i];
                if (freq >= 800 && freq <= 2500) highDampedEnergy += freqBuffer[i];
            }
            samplesTaken++;
        }, 50);

        setTimeout(() => {
            clearInterval(sampler);
            // Hollow voids amplify low-mid resonance (like knocking on a hollow wall)
            const resonanceRatio = highDampedEnergy > 0 ? (lowHollowResonanceEnergy / highDampedEnergy) : 0;
            const voidProbability = Math.min(100, Math.round(resonanceRatio * 42));

            resolve({
                voidProbability,
                subsurfaceState: voidProbability > 60 ? 'HOLLOW_SINKHOLE_VOID' : 'COMPACTED_SOIL',
                estimatedVoidRadiusMeters: voidProbability > 60 ? Number((voidProbability * 0.018).toFixed(2)) : 0
            });
        }, durationSec * 1000 + 100);
    });
}