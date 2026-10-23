/**
 * Real-Time Phase/Intensity Eulerian Video Magnification (EVM) on a Canvas ROI.
 * Highlights micro-vibrations and cavitation in municipal water booster pumps.
 */
export class OpticalEVMProcessor {
    constructor(roiSize = 160, alpha = 25, lowCutoff = 0.08, highCutoff = 0.4) {
        this.roiSize = roiSize;
        this.alpha = alpha; // Amplification gain factor
        this.lowCutoff = lowCutoff;
        this.highCutoff = highCutoff;

        const pixelCount = roiSize * roiSize * 3;
        this.lowpass1 = new Float32Array(pixelCount);
        this.lowpass2 = new Float32Array(pixelCount);
        this.initialized = false;
    }

    processFrame(ctx, roiX, roiY) {
        const imgData = ctx.getImageData(roiX, roiY, this.roiSize, this.roiSize);
        const data = imgData.data;

        let vibrationEnergy = 0;
        let pIdx = 0;

        for (let i = 0; i < data.length; i += 4) {
            for (let c = 0; c < 3; c++) {
                const val = data[i + c];

                if (!this.initialized) {
                    this.lowpass1[pIdx] = val;
                    this.lowpass2[pIdx] = val;
                } else {
                    // Temporal IIR Bandpass Filter
                    this.lowpass1[pIdx] = this.lowpass1[pIdx] + this.highCutoff * (val - this.lowpass1[pIdx]);
                    this.lowpass2[pIdx] = this.lowpass2[pIdx] + this.lowCutoff * (val - this.lowpass2[pIdx]);

                    const bandpassSignal = this.lowpass1[pIdx] - this.lowpass2[pIdx];
                    vibrationEnergy += Math.abs(bandpassSignal);

                    // Amplify micro-motion and overlay false-color red/cyan shift for cavitation visibility
                    const magnified = val + bandpassSignal * this.alpha;
                    data[i + c] = Math.min(255, Math.max(0, magnified));
                }
                pIdx++;
            }
        }

        this.initialized = true;
        ctx.putImageData(imgData, roiX, roiY);

        // Draw high-tech targeting HUD around the ROI
        ctx.strokeStyle = vibrationEnergy / pIdx > 1.8 ? '#ef4444' : '#38bdf8';
        ctx.lineWidth = 2;
        ctx.strokeRect(roiX, roiY, this.roiSize, this.roiSize);

        const normalizedCavitationScore = Math.min(100, Math.round((vibrationEnergy / pIdx) * 35));
        return {
            cavitationIndex: normalizedCavitationScore,
            isCavitationCritical: normalizedCavitationScore > 65
        };
    }
}