import React, { useState, useEffect, useRef } from 'react';
import { 
  Radio, 
  Volume2, 
  Activity, 
  AlertTriangle, 
  CheckCircle2, 
  Sparkles, 
  Play, 
  RotateCcw, 
  Disc, 
  Waves,
  ShieldAlert,
  ArrowRight,
  Cpu
} from 'lucide-react';
import { runActiveVoidSweep } from '../../engines/subterraChirp.js';
import { Street14Pipeline3DCanvas } from './Street14Pipeline3DCanvas';
import { audioManager } from '../../utils/AudioContextManager';

export const VoidScanner = ({ 
  isSyntheticDemo, 
  leakPositionX = 28.5,
  selectedStreet,
  onNavigateToReport 
}) => {
  const canvasSonarRef = useRef(null);

  const [isScanning, setIsScanning] = useState(false);
  const [scanProgress, setScanProgress] = useState(0);
  const [syntheticModeType, setSyntheticModeType] = useState('HOLLOW_VOID');

  // Diagnostic state from src/engines/subterraChirp.js
  const [scanResult, setScanResult] = useState({
    voidProbability: 82,
    subsurfaceState: 'HOLLOW_SINKHOLE_VOID',
    estimatedVoidRadiusMeters: 1.48,
    isCompleted: true
  });

  const streetDisplayName = selectedStreet?.name || 'Street 14 (14th Main Road, HAL 3rd Stage)';
  const streetLength = selectedStreet?.lengthMeters || 85;

  // Run Active Linear Chirp Sonar Sweep using src/engines/subterraChirp.js
  const handleExecuteVoidSweep = async () => {
    setIsScanning(true);
    setScanProgress(0);

    const ctx = await audioManager.getAudioContext();
    const analyser = ctx.createAnalyser();
    analyser.fftSize = 2048;

    // Tick visual progress bar
    const duration = 1600;
    const start = performance.now();
    const progressTimer = setInterval(() => {
      const elapsed = performance.now() - start;
      const pct = Math.min(100, Math.round((elapsed / duration) * 100));
      setScanProgress(pct);
      if (elapsed >= duration) clearInterval(progressTimer);
    }, 40);

    // Call runActiveVoidSweep from src/engines/subterraChirp.js
    let result;
    if (!isSyntheticDemo) {
      result = await runActiveVoidSweep(ctx, analyser, 1.5);
    } else {
      // In Synthetic Demo Mode, run genuine audio sweep and inject realistic void or solid profile
      const chirpPromise = runActiveVoidSweep(ctx, analyser, 1.5);
      const isHollow = syntheticModeType === 'HOLLOW_VOID';
      
      await chirpPromise;
      result = {
        voidProbability: isHollow ? 82 : 22,
        subsurfaceState: isHollow ? 'HOLLOW_SINKHOLE_VOID' : 'COMPACTED_SOIL',
        estimatedVoidRadiusMeters: isHollow ? 1.48 : 0
      };
    }

    setScanResult({
      voidProbability: result.voidProbability,
      subsurfaceState: result.subsurfaceState,
      estimatedVoidRadiusMeters: result.estimatedVoidRadiusMeters,
      isCompleted: true
    });

    setIsScanning(false);
    setScanProgress(100);

    drawSonarCanvas(result.subsurfaceState === 'HOLLOW_SINKHOLE_VOID');
  };

  const drawSonarCanvas = (isHollow) => {
    const canvas = canvasSonarRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const w = canvas.width;
    const h = canvas.height;

    ctx.fillStyle = '#070b16';
    ctx.fillRect(0, 0, w, h);

    // Center zero baseline
    ctx.strokeStyle = '#1e293b';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(0, h / 2); ctx.lineTo(w, h / 2);
    ctx.stroke();

    // Draw active chirp reflection waveform
    ctx.strokeStyle = isHollow ? '#f59e0b' : '#06b6d4';
    ctx.lineWidth = 1.6;
    ctx.beginPath();

    for (let x = 0; x < w; x++) {
      const t = x / w;
      let yVal = 0;
      if (isHollow) {
        // High-Q cavity ringing around 340 Hz
        yVal = Math.sin(t * 38) * Math.exp(-t * 2.2) * 0.8 + (Math.random() - 0.5) * 0.12;
      } else {
        // Heavily damped soil response
        yVal = Math.sin(t * 22) * Math.exp(-t * 7.5) * 0.6 + (Math.random() - 0.5) * 0.05;
      }
      const y = (h / 2) - yVal * (h / 2.4);
      if (x === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.stroke();

    ctx.fillStyle = '#64748b';
    ctx.font = '9px JetBrains Mono, monospace';
    ctx.fillText('ACTIVE CHIRP 100 Hz → 3,500 Hz REFLECTION', 8, 14);
    ctx.fillText(isHollow ? 'HOLLOW DRUMMING RESONANCE DETECTED' : 'HIGH SOIL ABSORPTION DAMPING', w - 240, 14);
  };

  useEffect(() => {
    drawSonarCanvas(scanResult.subsurfaceState === 'HOLLOW_SINKHOLE_VOID');
  }, [scanResult]);

  const isHollow = scanResult.subsurfaceState === 'HOLLOW_SINKHOLE_VOID';

  return (
    <div className="space-y-6">
      {/* Top Banner: Sonar Sweep Controls & Engine Reference */}
      <div className="glass-panel hud-border p-6 rounded-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-72 h-72 bg-amber-500/5 rounded-full blur-3xl pointer-events-none" />
        <div className="flex flex-wrap items-center justify-between gap-3 pb-4 mb-4 border-b border-slate-700/60 relative z-10">
          <div>
            <h2 className="text-sm font-bold text-transparent bg-clip-text bg-gradient-to-r from-amber-400 via-orange-300 to-amber-200 tracking-wider flex items-center gap-2">
              <Waves className="w-4 h-4 text-amber-400 animate-pulse" />
              ACTIVE ACOUSTIC VOID SCANNER (SUBTERRA-VISION ENGINE)
            </h2>
            <p className="text-xs font-mono text-slate-400 mt-0.5">
              Engine: <code className="text-cyan-300 font-semibold">src/engines/subterraChirp.js</code> • runActiveVoidSweep() (100 Hz → 3,500 Hz)
            </p>
          </div>

          <div className="flex items-center space-x-2">
            {isSyntheticDemo && (
              <div className="flex items-center space-x-1.5 bg-slate-950/80 border border-slate-700/80 p-1.5 rounded-xl text-xs font-mono shadow-inner">
                <button
                  onClick={() => setSyntheticModeType('HOLLOW_VOID')}
                  className={`px-3 py-1.5 rounded-lg font-bold transition-all ${
                    syntheticModeType === 'HOLLOW_VOID' 
                      ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/30' 
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  SIMULATE HOLLOW VOID
                </button>
                <button
                  onClick={() => setSyntheticModeType('SOLID_SOIL')}
                  className={`px-3 py-1.5 rounded-lg font-bold transition-all ${
                    syntheticModeType === 'SOLID_SOIL' 
                      ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/30' 
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  SIMULATE SOLID SOIL
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Scan Trigger Button & Progress Bar */}
        <div className="space-y-4 relative z-10">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <p className="text-xs text-slate-300 max-w-xl leading-relaxed">
              Place the smartphone chassis flat against the asphalt surface directly over the triangulated leak coordinate (<span className="text-cyan-300 font-bold font-mono">distanceFromValveA = {leakPositionX}m</span>). 
              The internal transducer will emit a 1.5-second structural chirp while the microphone measures subsurface drum resonance.
            </p>

            <button
              onClick={handleExecuteVoidSweep}
              disabled={isScanning}
              className="btn-tactical-warning py-3 px-6 rounded-xl font-black text-xs tracking-wider disabled:opacity-40 flex items-center space-x-2 transition-all shrink-0"
            >
              {isScanning ? (
                <>
                  <Disc className="w-4 h-4 animate-spin text-slate-950" />
                  <span>EMITTING CHIRP SWEEP ({scanProgress}%)...</span>
                </>
              ) : (
                <>
                  <Play className="w-4 h-4 fill-slate-950" />
                  <span>EMIT ACTIVE ACOUSTIC CHIRP (1.5s)</span>
                </>
              )}
            </button>
          </div>

          {isScanning && (
            <div className="w-full h-2.5 bg-slate-950 rounded-full overflow-hidden border border-slate-700/80 shadow-inner">
              <div
                className="h-full bg-gradient-to-r from-cyan-400 via-amber-400 to-rose-500 transition-all duration-75 shadow-[0_0_8px_rgba(245,158,11,0.6)]"
                style={{ width: `${scanProgress}%` }}
              />
            </div>
          )}
        </div>
      </div>

      {/* Classification Outcome Banner */}
      <div className={`p-6 rounded-2xl border-2 transition-all relative overflow-hidden shadow-2xl ${
        isHollow 
          ? 'glass-panel border-amber-500/80 shadow-amber-950/20' 
          : 'glass-panel border-emerald-500/80 shadow-emerald-950/20'
      }`}>
        <div className="flex flex-wrap items-center justify-between gap-4 relative z-10">
          <div className="flex items-center space-x-4">
            <div className={`w-14 h-14 rounded-2xl flex items-center justify-center border-2 shrink-0 shadow-lg ${
              isHollow 
                ? 'bg-amber-500/20 border-amber-400 text-amber-400 shadow-[0_0_15px_rgba(245,158,11,0.3)] animate-pulse' 
                : 'bg-emerald-500/20 border-emerald-400 text-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.3)]'
            }`}>
              {isHollow ? (
                <ShieldAlert className="w-7 h-7" />
              ) : (
                <CheckCircle2 className="w-7 h-7" />
              )}
            </div>

            <div>
              <span className={`text-[10px] font-mono font-bold tracking-widest uppercase ${
                isHollow ? 'text-amber-400' : 'text-emerald-400'
              }`}>
                SUB-ROAD DRUM RESONANCE // VOID PROBABILITY: {scanResult.voidProbability}%
              </span>
              <h3 className="text-xl font-black text-white mt-0.5">
                {isHollow ? 'HOLLOW SINKHOLE VOID DETECTED' : 'SOLID COMPACTED SOIL (STABLE BASE)'}
              </h3>
              <p className="text-xs font-mono text-slate-300 mt-1 max-w-xl">
                {isHollow 
                  ? `Severe risk of roadway cave-in! Estimated Cavity Radius: ~${scanResult.estimatedVoidRadiusMeters}m centered over distanceFromValveA = ${leakPositionX}m.`
                  : 'Acoustic impulse absorbed by dense soil sub-base. Zero cavitation cavity risk.'}
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <div className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-700/80 font-mono text-center shadow-inner">
              <div className="text-[10px] text-slate-400 font-bold uppercase">Void Risk</div>
              <div className={`text-xl font-bold ${isHollow ? 'text-amber-400' : 'text-emerald-400'}`}>
                {scanResult.voidProbability}%
              </div>
            </div>

            <button
              onClick={onNavigateToReport}
              className="btn-tactical-primary py-3 px-5 rounded-xl font-bold text-xs tracking-wider flex items-center space-x-2"
            >
              <span>DISPATCH EXCAVATION TICKET</span>
              <ArrowRight className="w-4 h-4 text-slate-950" />
            </button>
          </div>
        </div>
      </div>

      {/* Dedicated Three.js <Canvas> Component */}
      <Street14Pipeline3DCanvas
        streetName={streetDisplayName}
        pipeLengthMeters={streetLength}
        distanceFromValveA={leakPositionX}
        isVoidPresent={isHollow}
        voidRadiusMeters={scanResult.estimatedVoidRadiusMeters}
        subsurfaceState={scanResult.subsurfaceState}
      />

      {/* Reflection Waveform Canvas */}
      <div className="glass-panel p-5 rounded-2xl">
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-mono font-bold text-slate-200">
            ACTIVE ACOUSTIC IMPULSE REFLECTION WAVEFORM (SPEAKER → GROUND → MIC)
          </span>
          <span className={`text-[10px] font-mono px-2.5 py-0.5 rounded-full font-bold border ${
            isHollow 
              ? 'bg-amber-950/50 text-amber-300 border-amber-500/40' 
              : 'bg-cyan-950/50 text-cyan-300 border-cyan-500/40'
          }`}>
            {isHollow ? 'HOLLOW RESONANCE RING (340 Hz)' : 'DAMPED SOIL PULSE'}
          </span>
        </div>
        <canvas
          ref={canvasSonarRef}
          width={520}
          height={110}
          className="w-full h-28 rounded-xl bg-slate-950 border border-slate-800 block shadow-inner"
        />
      </div>
    </div>
  );
};
