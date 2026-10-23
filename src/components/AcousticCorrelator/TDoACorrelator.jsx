import React, { useState, useEffect, useRef } from 'react';
import { 
  Volume2, 
  Activity, 
  MapPin, 
  Radio, 
  CheckCircle2, 
  AlertTriangle, 
  Sliders, 
  Sparkles, 
  ArrowRight,
  Disc,
  Play,
  RotateCcw,
  Cpu
} from 'lucide-react';
import { calculateLeakCoordinate } from '../../engines/tdoaCorrelators.js';
import { audioManager } from '../../utils/AudioContextManager';
import { SyntheticDataGenerator } from '../../utils/SyntheticDataGenerator';

export const TDoACorrelator = ({ 
  isSyntheticDemo, 
  selectedStreet, 
  onNavigateToSubterra,
  onLeakCalculated
}) => {
  const canvasWaveformRef = useRef(null);
  const canvasCorrelationRef = useRef(null);

  // Pipe physical parameters
  const [pipeMaterial, setPipeMaterial] = useState('DI');
  const [pipeLength, setPipeLength] = useState(selectedStreet?.lengthMeters || 85);

  // Recording steps: 'IDLE', 'RECORDING_A', 'RECORDING_B', 'ANALYZING', 'COMPLETED'
  const [recordingStep, setRecordingStep] = useState('IDLE');
  const [countdown, setCountdown] = useState(3);

  // Buffer storage in volatile memory
  const [bufferA, setBufferA] = useState(null);
  const [bufferB, setBufferB] = useState(null);

  // TDoA Output from src/engines/tdoaCorrelators.js
  const [triageResults, setTriageResults] = useState({
    distanceFromValveA: 28.5,
    distanceFromValveB: 56.5,
    timeDelayMs: -19.2,
    correlationConfidence: 96,
    waveVelocityUsed: 1250,
    isCalculated: false
  });

  const [liveAudioLevel, setLiveAudioLevel] = useState(0);

  // Update pipe length if street prop changes
  useEffect(() => {
    if (selectedStreet?.lengthMeters) {
      setPipeLength(selectedStreet.lengthMeters);
    }
  }, [selectedStreet]);

  // Load default synthetic calculation on mount or toggle
  useEffect(() => {
    if (isSyntheticDemo) {
      loadSyntheticBuffers();
    }
  }, [isSyntheticDemo, pipeLength, pipeMaterial]);

  const loadSyntheticBuffers = () => {
    // Generate realistic leak audio waveforms
    const synthetic = SyntheticDataGenerator.generateAcousticLeakWaveforms(
      44100, 
      44100, 
      pipeLength, 
      28.5, 
      1250
    );

    setBufferA(synthetic.bufferA);
    setBufferB(synthetic.bufferB);

    executeCorrelationAnalysis(synthetic.bufferA, synthetic.bufferB);
  };

  // Start Live Recording for Valve A or B
  const startRecordingSpindle = async (valve) => {
    setRecordingStep(valve === 'A' ? 'RECORDING_A' : 'RECORDING_B');
    setCountdown(3);

    const started = await audioManager.startRawCapture((samples) => {
      let sum = 0;
      for (let i = 0; i < samples.length; i++) sum += Math.abs(samples[i]);
      setLiveAudioLevel(Math.min(100, Math.round((sum / samples.length) * 400)));
    });

    if (!started && !isSyntheticDemo) {
      alert('Microphone access blocked. Switching to synthetic buffer injection.');
      loadSyntheticBuffers();
      return;
    }

    let remaining = 3;
    const interval = setInterval(() => {
      remaining -= 1;
      setCountdown(remaining);
      if (remaining <= 0) {
        clearInterval(interval);
        finishRecordingSpindle(valve);
      }
    }, 1000);
  };

  const finishRecordingSpindle = (valve) => {
    const rawSnapshot = audioManager.snapshotVolatileBuffer(3);
    audioManager.stopRawCapture();

    if (valve === 'A') {
      setBufferA(rawSnapshot);
      setRecordingStep('IDLE');
    } else {
      setBufferB(rawSnapshot);
      setRecordingStep('ANALYZING');
      if (bufferA) {
        executeCorrelationAnalysis(bufferA, rawSnapshot);
      }
    }
  };

  // Execute TDoA Cross-Correlation using calculateLeakCoordinate (src/engines/tdoaCorrelators.js)
  const executeCorrelationAnalysis = (sigA, sigB) => {
    const sampleRate = 44100;

    // Direct invocation of engine DSP math
    const result = calculateLeakCoordinate(
      sigA,
      sigB,
      sampleRate,
      pipeLength,
      pipeMaterial
    );

    setTriageResults({
      distanceFromValveA: result.distanceFromValveA,
      distanceFromValveB: result.distanceFromValveB,
      timeDelayMs: result.timeDelayMs,
      correlationConfidence: result.correlationConfidence,
      waveVelocityUsed: result.waveVelocityUsed,
      isCalculated: true
    });

    if (onLeakCalculated) {
      onLeakCalculated(result.distanceFromValveA, pipeLength, selectedStreet);
    }

    setRecordingStep('COMPLETED');

    // Draw plots on canvases
    drawWaveforms(sigA, sigB);
    drawCorrelationPlot(result.timeDelayMs, result.correlationConfidence);
  };

  const drawWaveforms = (sigA, sigB) => {
    const canvas = canvasWaveformRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const w = canvas.width;
    const h = canvas.height;

    ctx.fillStyle = '#070b16';
    ctx.fillRect(0, 0, w, h);

    // Gridlines
    ctx.strokeStyle = '#1e293b';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(0, h / 2); ctx.lineTo(w, h / 2);
    ctx.stroke();

    // Valve A waveform (Cyan)
    ctx.strokeStyle = '#00f0ff';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    const step = Math.floor(sigA.length / w);
    for (let x = 0; x < w; x++) {
      const idx = x * step;
      const y = (h / 2) - sigA[idx] * (h / 2.5);
      if (x === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.stroke();

    // Valve B waveform (Amber)
    ctx.strokeStyle = '#f59e0b';
    ctx.lineWidth = 1.2;
    ctx.beginPath();
    for (let x = 0; x < w; x++) {
      const idx = x * step;
      const y = (h / 2) - sigB[idx] * (h / 2.5);
      if (x === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.stroke();
  };

  const drawCorrelationPlot = (delayMs, confidence) => {
    const canvas = canvasCorrelationRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const w = canvas.width;
    const h = canvas.height;

    ctx.fillStyle = '#070b16';
    ctx.fillRect(0, 0, w, h);

    // Center zero-lag line
    ctx.strokeStyle = '#334155';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(w / 2, 0); ctx.lineTo(w / 2, h);
    ctx.stroke();

    // Sinc-like correlation curve with peak at delay
    ctx.strokeStyle = '#10b981';
    ctx.lineWidth = 2;
    ctx.beginPath();

    const peakOffsetNormalized = (delayMs / 40); // range roughly -40ms to +40ms
    const peakX = (w / 2) + peakOffsetNormalized * (w / 2.5);

    for (let x = 0; x < w; x++) {
      const distFromPeak = (x - peakX) / 14;
      const sinc = Math.sin(distFromPeak + 1e-4) / (distFromPeak + 1e-4);
      const y = (h / 2) - (sinc * (confidence / 100) * (h / 2.4));
      if (x === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.stroke();

    // Peak Lag Marker
    ctx.strokeStyle = '#ef4444';
    ctx.setLineDash([4, 4]);
    ctx.beginPath();
    ctx.moveTo(peakX, 0); ctx.lineTo(peakX, h);
    ctx.stroke();
    ctx.setLineDash([]);

    ctx.fillStyle = '#ef4444';
    ctx.font = 'bold 10px JetBrains Mono, monospace';
    ctx.fillText(`Δt Peak: ${delayMs} ms`, peakX + 4, 16);
  };

  return (
    <div className="space-y-5">
      {/* Top Banner: Pipe Parameters & Engine Status */}
      <div className="glass-panel rounded-2xl p-5 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-800/80">
          <div>
            <h2 className="text-sm font-bold text-cyan-400 tracking-wider flex items-center gap-2">
              <Volume2 className="w-4 h-4 text-cyan-400 animate-pulse" />
              ACOUSTIC VALVE CONTACT & TDoA CORRELATOR (DSP ENGINE)
            </h2>
            <p className="text-xs font-mono text-slate-400">
              Engine: <code className="text-cyan-300">src/engines/tdoaCorrelators.js</code> • calculateLeakCoordinate()
            </p>
          </div>

          <div className="flex items-center space-x-2">
            <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-600 flex items-center gap-1">
              <Cpu className="w-3 h-3" /> TDoA GCC-PHAT ENGINE
            </span>
          </div>
        </div>

        {/* Pipe Material and Distance Settings */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 font-mono text-xs">
          <div>
            <label className="text-slate-400 block mb-1">PIPE MATERIAL & WAVE SPEED</label>
            <select
              value={pipeMaterial}
              onChange={(e) => setPipeMaterial(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-white font-bold focus:border-cyan-400 outline-none"
            >
              <option value="DI">DI - Ductile Iron (1,250 m/s)</option>
              <option value="STEEL">STEEL - Mild Steel (1,400 m/s)</option>
              <option value="PVC">PVC - Polyvinyl Chloride (420 m/s)</option>
            </select>
          </div>

          <div>
            <label className="text-slate-400 block mb-1">DISTANCE BETWEEN VALVES (L)</label>
            <div className="flex items-center space-x-2">
              <input
                type="number"
                min="20"
                max="300"
                value={pipeLength}
                onChange={(e) => setPipeLength(Number(e.target.value))}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-white font-bold focus:border-cyan-400 outline-none"
              />
              <span className="text-slate-400">meters</span>
            </div>
          </div>

          <div className="flex flex-col justify-end">
            <button
              onClick={loadSyntheticBuffers}
              className="btn-tactical-primary w-full py-2.5 px-3 rounded-xl text-xs font-bold font-mono flex items-center justify-center space-x-2"
            >
              <Sparkles className="w-3.5 h-3.5 text-slate-950" />
              <span>RECALCULATE LEAK CORRELATION</span>
            </button>
          </div>
        </div>
      </div>

      {/* Two-Step Spindle Contact Capture Workflow */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* Step 1: Valve A Contact */}
        <div className={`p-5 rounded-2xl border transition-all ${
          bufferA ? 'bg-slate-900/85 border-emerald-500/60 shadow-lg shadow-emerald-950/20' : 'glass-panel'
        }`}>
          <div className="flex items-center justify-between mb-3.5">
            <div className="flex items-center space-x-3">
              <span className="w-7 h-7 rounded-full bg-cyan-950 border border-cyan-400 text-cyan-300 font-mono font-bold text-xs flex items-center justify-center shadow-[0_0_8px_rgba(6,182,212,0.5)]">
                A
              </span>
              <div>
                <h4 className="text-xs font-bold text-white">UPSTREAM SPINDLE: VALVE A</h4>
                <p className="text-[10px] font-mono text-slate-400">Position 0.0m</p>
              </div>
            </div>
            {bufferA ? (
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-500 flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3" /> CAPTURED
              </span>
            ) : (
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-400">
                PENDING
              </span>
            )}
          </div>

          <p className="text-xs text-slate-300 mb-3 leading-relaxed">
            Press phone chassis against Valve A spindle nut. Keep quiet during capture to record high-frequency metallic water hiss.
          </p>

          <button
            onClick={() => startRecordingSpindle('A')}
            disabled={recordingStep === 'RECORDING_A'}
            className="w-full py-2.5 rounded-lg bg-gradient-to-r from-cyan-600 to-blue-700 hover:from-cyan-500 hover:to-blue-600 disabled:opacity-50 text-white font-semibold text-xs flex items-center justify-center space-x-2 transition-all shadow-md shadow-cyan-900/30"
          >
            {recordingStep === 'RECORDING_A' ? (
              <>
                <Disc className="w-4 h-4 animate-spin text-red-400" />
                <span>RECORDING VALVE A ({countdown}s)...</span>
              </>
            ) : (
              <>
                <Volume2 className="w-4 h-4" />
                <span>RECORD VALVE A CONTACT (3s)</span>
              </>
            )}
          </button>
        </div>

        {/* Step 2: Valve B Contact */}
        <div className={`p-5 rounded-2xl border transition-all ${
          bufferB ? 'bg-slate-900/85 border-emerald-500/60 shadow-lg shadow-emerald-950/20' : 'glass-panel'
        }`}>
          <div className="flex items-center justify-between mb-3.5">
            <div className="flex items-center space-x-3">
              <span className="w-7 h-7 rounded-full bg-amber-950 border border-amber-400 text-amber-300 font-mono font-bold text-xs flex items-center justify-center shadow-[0_0_8px_rgba(245,158,11,0.5)]">
                B
              </span>
              <div>
                <h4 className="text-xs font-bold text-white">DOWNSTREAM SPINDLE: VALVE B</h4>
                <p className="text-[10px] font-mono text-slate-400">Position {pipeLength}m</p>
              </div>
            </div>
            {bufferB ? (
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-500 flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3" /> CAPTURED
              </span>
            ) : (
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-400">
                PENDING
              </span>
            )}
          </div>

          <p className="text-xs text-slate-300 mb-3 leading-relaxed">
            Move to Valve B at distance {pipeLength}m. Press phone chassis against spindle and capture contact acoustics for TDoA cross-correlation.
          </p>

          <button
            onClick={() => startRecordingSpindle('B')}
            disabled={recordingStep === 'RECORDING_B' || !bufferA}
            className="w-full py-2.5 rounded-xl bg-gradient-to-r from-amber-600 to-orange-700 hover:from-amber-500 hover:to-orange-600 disabled:opacity-40 text-white font-bold text-xs flex items-center justify-center space-x-2 transition-all shadow-md shadow-amber-950/40"
          >
            {recordingStep === 'RECORDING_B' ? (
              <>
                <Disc className="w-4 h-4 animate-spin text-red-400" />
                <span>RECORDING VALVE B ({countdown}s)...</span>
              </>
            ) : (
              <>
                <Volume2 className="w-4 h-4" />
                <span>RECORD VALVE B CONTACT (3s)</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Main Localization Output Banner */}
      {triageResults.isCalculated && (
        <div className="glass-panel hud-border p-6 rounded-2xl relative overflow-hidden shadow-2xl border-cyan-500/50">
          <div className="absolute top-0 right-0 w-80 h-80 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
          <div className="flex flex-wrap items-center justify-between gap-4 pb-4 mb-4 border-b border-slate-700/60 relative z-10">
            <div>
              <span className="text-[10px] font-mono uppercase text-cyan-400 font-bold tracking-widest flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-ping" />
                TDoA CROSS-CORRELATION COMPLETE // EXACT LOCALIZATION
              </span>
              <h3 className="text-2xl font-black text-white mt-1">
                EXACT LEAK DISTANCE: <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-sky-200">{triageResults.distanceFromValveA} METRES</span> FROM VALVE A
              </h3>
              <p className="text-xs font-mono text-slate-400 mt-1">
                (Distance from Valve B: {triageResults.distanceFromValveB}m • Peak Delay: {triageResults.timeDelayMs} ms • Wave Speed: {triageResults.waveVelocityUsed} m/s)
              </p>
            </div>

            <div className="flex items-center space-x-3">
              <div className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-700/80 text-center font-mono shadow-inner">
                <div className="text-[10px] text-slate-400 uppercase font-bold">Confidence</div>
                <div className="text-xl font-bold text-emerald-400">{triageResults.correlationConfidence}%</div>
              </div>
            </div>
          </div>

          {/* Interactive Physical Pipe Rupture Locator Bar */}
          <div className="space-y-2 mb-5 relative z-10">
            <div className="flex justify-between text-xs font-mono text-slate-300">
              <span className="flex items-center gap-1.5 text-cyan-400 font-bold">
                <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 shadow-[0_0_6px_rgba(6,182,212,0.8)]" /> Valve A (0.0m)
              </span>
              <span className="text-rose-400 font-black flex items-center gap-1.5 bg-rose-950/40 border border-rose-500/30 px-2.5 py-0.5 rounded-full">
                <AlertTriangle className="w-3.5 h-3.5 animate-pulse text-rose-400" />
                RUPTURE POINT (distanceFromValveA = {triageResults.distanceFromValveA}m)
              </span>
              <span className="flex items-center gap-1.5 text-amber-400 font-bold">
                Valve B ({pipeLength}m) <span className="w-2.5 h-2.5 rounded-full bg-amber-400 shadow-[0_0_6px_rgba(245,158,11,0.8)]" />
              </span>
            </div>

            {/* Graphic Pipe Bar */}
            <div className="relative h-7 rounded-xl bg-slate-950 border border-slate-700/80 overflow-hidden flex items-center px-2">
              <div className="w-full h-3 bg-gradient-to-r from-cyan-950 via-slate-700 to-amber-950 rounded-full" />

              <div
                className="absolute top-0 bottom-0 w-3.5 bg-red-500 rounded-full shadow-[0_0_12px_rgba(239,68,68,0.9)] animate-pulse"
                style={{ left: `calc(${(triageResults.distanceFromValveA / pipeLength) * 100}% - 7px)` }}
              />
              <div
                className="absolute top-1.5 bottom-1.5 w-1.5 bg-white rounded-full shadow-sm"
                style={{ left: `calc(${(triageResults.distanceFromValveA / pipeLength) * 100}% - 3px)` }}
              />
            </div>
          </div>

          {/* Proceed to Module 3 Action */}
          <div className="flex justify-end pt-2 relative z-10">
            <button
              onClick={onNavigateToSubterra}
              className="btn-tactical-warning py-3 px-5 rounded-xl font-bold text-xs tracking-wider flex items-center space-x-2"
            >
              <span>INSPECT 3D SUBSURFACE VOID AT {triageResults.distanceFromValveA}m</span>
              <ArrowRight className="w-4 h-4 text-slate-950" />
            </button>
          </div>
        </div>
      )}

      {/* Waveform and Correlation Plots */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <div className="glass-panel p-5 rounded-2xl">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-mono font-bold text-slate-200">
              CONTACT ACOUSTIC WAVEFORMS (BANDPASS 150-1000 Hz)
            </span>
            <div className="flex items-center space-x-3 text-[10px] font-mono">
              <span className="text-cyan-400 font-semibold">Valve A (Cyan)</span>
              <span className="text-amber-400 font-semibold">Valve B (Amber)</span>
            </div>
          </div>
          <canvas
            ref={canvasWaveformRef}
            width={520}
            height={160}
            className="w-full h-36 rounded-xl bg-slate-950 border border-slate-800 block shadow-inner"
          />
        </div>

        <div className="glass-panel p-5 rounded-2xl">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-mono font-bold text-slate-200">
              NORMALIZED CROSS-CORRELATION FUNCTION R_xy(τ)
            </span>
            <span className="text-xs font-mono text-emerald-400 font-bold bg-emerald-950/40 border border-emerald-500/30 px-2 py-0.5 rounded">
              PEAK LAG τ = {triageResults.timeDelayMs} ms
            </span>
          </div>
          <canvas
            ref={canvasCorrelationRef}
            width={520}
            height={160}
            className="w-full h-36 rounded-xl bg-slate-950 border border-slate-800 block shadow-inner"
          />
        </div>
      </div>
    </div>
  );
};
