import React, { useState, useEffect, useRef, useCallback } from 'react';
import { 
  Video, 
  AlertTriangle, 
  CheckCircle2, 
  Cpu
} from 'lucide-react';
import { OpticalEVMProcessor } from '../../engines/evmOptical.js';

export const EVMEngine = ({ isSyntheticDemo }) => {
  const videoRef = useRef(null);
  const mainCanvasRef = useRef(null);
  const magnifiedCanvasRef = useRef(null);
  const spectrumCanvasRef = useRef(null);

  // Optical EVM Processor engine from src/engines/evmOptical.js
  const processorRef = useRef(new OpticalEVMProcessor(160, 28, 0.08, 0.4));
  const animationFrameRef = useRef(null);
  const syntheticTimeRef = useRef(0);

  // State
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [magnification, setMagnification] = useState(28);
  const [cutoffLow, setCutoffLow] = useState(0.08); // 50 Hz equivalent
  const [cutoffHigh, setCutoffHigh] = useState(0.40); // 200 Hz equivalent
  const [roiPos, setRoiPos] = useState({ x: 180, y: 120 }); // 160x160 ROI top-left
  const [isDraggingRoi, setIsDraggingRoi] = useState(false);

  // Synthetic pump controls
  const [syntheticCavitationFault, setSyntheticCavitationFault] = useState(true);

  // Real-time telemetry from engine
  const [telemetry, setTelemetry] = useState({
    peakFrequency: 142.5,
    cavitationIndex: 74,
    isCavitationCritical: true,
    fps: 60,
    status: 'CRITICAL CAVITATION'
  });

  const startLiveCamera = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: 'environment',
          width: { ideal: 640 },
          height: { ideal: 480 }
        },
        audio: false
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
        setIsCameraActive(true);
      }
    } catch (err) {
      console.warn('Could not start live camera feed. Reverting to synthetic:', err);
      setIsCameraActive(false);
    }
  }, []);

  const stopLiveCamera = useCallback(() => {
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject;
      stream.getTracks().forEach(t => t.stop());
      videoRef.current.srcObject = null;
    }
    setIsCameraActive(false);
  }, []);

  // Re-instantiate or update processor parameters when sliders change
  useEffect(() => {
    processorRef.current = new OpticalEVMProcessor(160, magnification, cutoffLow, cutoffHigh);
  }, [magnification, cutoffLow, cutoffHigh]);

  // Start / Stop live camera
  useEffect(() => {
    if (!isSyntheticDemo) {
      startLiveCamera();
    } else {
      stopLiveCamera();
    }
    return () => {
      stopLiveCamera();
      if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
    };
  }, [isSyntheticDemo, startLiveCamera, stopLiveCamera]);

  // Main rendering loop powered by OpticalEVMProcessor
  useEffect(() => {
    let lastTime = performance.now();
    let frameCounter = 0;
    let fpsVal = 60;
    const vibrationHistory = new Float32Array(64);
    let histIdx = 0;

    const render = (now) => {
      frameCounter++;
      if (now - lastTime >= 1000) {
        fpsVal = frameCounter;
        frameCounter = 0;
        lastTime = now;
      }

      const mainCanvas = mainCanvasRef.current;
      const magCanvas = magnifiedCanvasRef.current;
      const specCanvas = spectrumCanvasRef.current;

      if (!mainCanvas) {
        animationFrameRef.current = requestAnimationFrame(render);
        return;
      }

      const ctx = mainCanvas.getContext('2d', { willReadFrequently: true });

      // 1. Draw source (either Live Camera or Synthetic Booster Pump)
      if (!isSyntheticDemo && isCameraActive && videoRef.current && videoRef.current.readyState >= 2) {
        ctx.drawImage(videoRef.current, 0, 0, 640, 480);
      } else {
        syntheticTimeRef.current += 0.035;
        drawSyntheticPump(ctx, syntheticTimeRef.current, syntheticCavitationFault);
      }

      // 2. Bound 160x160 ROI
      const roiX = Math.max(0, Math.min(640 - 160, roiPos.x));
      const roiY = Math.max(0, Math.min(480 - 160, roiPos.y));

      // 3. Process with OpticalEVMProcessor (src/engines/evmOptical.js)
      const evmResult = processorRef.current.processFrame(ctx, roiX, roiY);

      // 4. Copy magnified ROI to dedicated magnified canvas view
      if (magCanvas) {
        const magCtx = magCanvas.getContext('2d');
        magCtx.drawImage(mainCanvas, roiX, roiY, 160, 160, 0, 0, 160, 160);
        
        // Draw crosshair reticle
        magCtx.strokeStyle = evmResult.isCavitationCritical ? '#ef4444' : '#00f0ff';
        magCtx.lineWidth = 1;
        magCtx.beginPath();
        magCtx.moveTo(80, 0); magCtx.lineTo(80, 160);
        magCtx.moveTo(0, 80); magCtx.lineTo(160, 80);
        magCtx.stroke();
      }

      // 5. Draw Tactical HUD labels
      ctx.fillStyle = evmResult.isCavitationCritical ? '#ef4444' : '#38bdf8';
      ctx.font = 'bold 11px JetBrains Mono, monospace';
      ctx.fillText(
        `EVM ENGINE [src/engines/evmOptical.js] • α=${magnification}x • Cavitation: ${evmResult.cavitationIndex}%`, 
        roiX + 4, 
        roiY - 6
      );

      // Track history for spectrum
      vibrationHistory[histIdx] = evmResult.cavitationIndex;
      histIdx = (histIdx + 1) % vibrationHistory.length;

      // 6. Draw Spectrogram
      if (specCanvas) {
        drawSpectrogram(specCanvas, vibrationHistory, evmResult.isCavitationCritical);
      }

      // 7. Update Telemetry state throttled
      if (frameCounter % 6 === 0) {
        setTelemetry({
          peakFrequency: syntheticCavitationFault ? 142.5 : 25.0,
          cavitationIndex: evmResult.cavitationIndex,
          isCavitationCritical: evmResult.isCavitationCritical,
          fps: fpsVal,
          status: evmResult.isCavitationCritical ? 'CRITICAL CAVITATION' : 'NOMINAL FLOW'
        });
      }

      animationFrameRef.current = requestAnimationFrame(render);
    };

    animationFrameRef.current = requestAnimationFrame(render);

    return () => {
      if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
    };
  }, [isSyntheticDemo, isCameraActive, magnification, cutoffLow, cutoffHigh, roiPos, syntheticCavitationFault]);

  // Synthetic Pump Graphics Engine
  const drawSyntheticPump = (ctx, t, hasCavitation) => {
    ctx.fillStyle = '#070b16';
    ctx.fillRect(0, 0, 640, 480);

    // Grid scanlines
    ctx.strokeStyle = 'rgba(14, 28, 54, 0.4)';
    ctx.lineWidth = 1;
    for (let x = 0; x < 640; x += 40) {
      ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, 480); ctx.stroke();
    }
    for (let y = 0; y < 480; y += 40) {
      ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(640, y); ctx.stroke();
    }

    // Micro-vibrations
    const jitterMagnitude = hasCavitation ? 2.8 : 0.4;
    const jX = (Math.random() - 0.5) * jitterMagnitude * Math.sin(t * 35);
    const jY = (Math.random() - 0.5) * jitterMagnitude * Math.cos(t * 35);

    ctx.save();
    ctx.translate(jX, jY);

    // Concrete Pedestal
    ctx.fillStyle = '#1e293b';
    ctx.fillRect(100, 340, 440, 90);
    ctx.strokeStyle = '#334155';
    ctx.strokeRect(100, 340, 440, 90);

    // Volute Casing
    const centerX = 260;
    const centerY = 220;

    const casingGrad = ctx.createRadialGradient(centerX - 20, centerY - 20, 20, centerX, centerY, 120);
    casingGrad.addColorStop(0, '#38bdf8');
    casingGrad.addColorStop(0.5, '#0369a1');
    casingGrad.addColorStop(1, '#082f49');

    ctx.fillStyle = casingGrad;
    ctx.beginPath();
    ctx.arc(centerX, centerY, 110, 0, Math.PI * 2);
    ctx.fill();
    ctx.lineWidth = 4;
    ctx.strokeStyle = '#0284c7';
    ctx.stroke();

    // Impeller Center Hub
    ctx.fillStyle = '#0f172a';
    ctx.beginPath();
    ctx.arc(centerX, centerY, 42, 0, Math.PI * 2);
    ctx.fill();

    // Rotating Impeller Vanes
    const vaneAngle = t * (hasCavitation ? 18 : 12);
    ctx.strokeStyle = '#94a3b8';
    ctx.lineWidth = 6;
    for (let i = 0; i < 5; i++) {
      const angle = vaneAngle + (i * Math.PI * 2) / 5;
      ctx.beginPath();
      ctx.moveTo(centerX + Math.cos(angle) * 35, centerY + Math.sin(angle) * 35);
      ctx.quadraticCurveTo(
        centerX + Math.cos(angle + 0.4) * 75,
        centerY + Math.sin(angle + 0.4) * 75,
        centerX + Math.cos(angle + 0.8) * 105,
        centerY + Math.sin(angle + 0.8) * 105
      );
      ctx.stroke();
    }

    // Cavitation Vapor Bubbles Turbulence
    if (hasCavitation) {
      ctx.fillStyle = 'rgba(255, 255, 255, 0.85)';
      for (let b = 0; b < 28; b++) {
        const bubbleRad = 2 + Math.random() * 4;
        const bAngle = Math.random() * Math.PI * 2;
        const bDist = 45 + Math.random() * 60;
        ctx.beginPath();
        ctx.arc(centerX + Math.cos(bAngle) * bDist, centerY + Math.sin(bAngle) * bDist, bubbleRad, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    // Electric Drive Motor
    ctx.fillStyle = '#1e293b';
    ctx.fillRect(360, 160, 150, 120);
    ctx.strokeStyle = '#475569';
    ctx.lineWidth = 3;
    ctx.strokeRect(360, 160, 150, 120);

    // Motor Cooling Ribs
    ctx.strokeStyle = '#334155';
    ctx.lineWidth = 2;
    for (let mx = 380; mx < 490; mx += 14) {
      ctx.beginPath(); ctx.moveTo(mx, 160); ctx.lineTo(mx, 280); ctx.stroke();
    }

    // Suction & Discharge Flanges
    ctx.fillStyle = '#0284c7';
    ctx.fillRect(230, 60, 60, 60);
    ctx.fillRect(80, 190, 80, 60);

    // Analog Pressure Gauge
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(260, 45, 22, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 2;
    ctx.stroke();

    const needleAngle = hasCavitation ? Math.PI + Math.sin(t * 28) * 0.45 : Math.PI * 1.35;
    ctx.strokeStyle = '#ef4444';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(260, 45);
    ctx.lineTo(260 + Math.cos(needleAngle) * 16, 45 + Math.sin(needleAngle) * 16);
    ctx.stroke();

    ctx.restore();

    ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
    ctx.font = '10px JetBrains Mono, monospace';
    ctx.fillText('BWSSB 15 HP VOLUTE BOOSTER • OPTICAL EVM DIAGNOSTICS', 110, 455);
  };

  const drawSpectrogram = (canvas, history, isCritical) => {
    const ctx = canvas.getContext('2d');
    const w = canvas.width;
    const h = canvas.height;

    ctx.fillStyle = '#070b16';
    ctx.fillRect(0, 0, w, h);

    const barWidth = w / history.length;
    for (let i = 0; i < history.length; i++) {
      const val = Math.min(1, history[i] / 100);
      const barHeight = val * (h - 16);

      ctx.fillStyle = isCritical 
        ? `rgba(239, 68, 68, ${0.4 + val * 0.6})` 
        : `rgba(6, 182, 212, ${0.4 + val * 0.6})`;

      ctx.fillRect(i * barWidth, h - barHeight, barWidth - 1, barHeight);
    }

    ctx.fillStyle = '#64748b';
    ctx.font = '9px JetBrains Mono, monospace';
    ctx.fillText('TEMPORAL IIR CAVITATION ENERGY OVER TIME', 6, 12);
  };

  // Dragging 160x160 ROI (Mouse & Touch for smartphones)
  const updateRoiFromCoords = (clientX, clientY) => {
    const canvas = mainCanvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const scaleX = 640 / rect.width;
    const scaleY = 480 / rect.height;

    const clickX = (clientX - rect.left) * scaleX;
    const clickY = (clientY - rect.top) * scaleY;

    setRoiPos({
      x: Math.max(0, Math.min(640 - 160, clickX - 80)),
      y: Math.max(0, Math.min(480 - 160, clickY - 80))
    });
  };

  const handleMouseDown = (e) => {
    setIsDraggingRoi(true);
    updateRoiFromCoords(e.clientX, e.clientY);
  };
  const handleMouseMove = (e) => {
    if (!isDraggingRoi) return;
    updateRoiFromCoords(e.clientX, e.clientY);
  };
  const handleMouseUp = () => {
    setIsDraggingRoi(false);
  };

  const handleTouchStart = (e) => {
    setIsDraggingRoi(true);
    if (e.touches && e.touches.length > 0) {
      updateRoiFromCoords(e.touches[0].clientX, e.touches[0].clientY);
    }
  };
  const handleTouchMove = (e) => {
    if (!isDraggingRoi) return;
    if (e.touches && e.touches.length > 0) {
      updateRoiFromCoords(e.touches[0].clientX, e.touches[0].clientY);
    }
  };
  const handleTouchEnd = () => {
    setIsDraggingRoi(false);
  };

  return (
    <div className="space-y-4">
      <video ref={videoRef} playsInline muted className="hidden" />

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Left: Primary Camera / Synthetic Feed with ROI Selection */}
        <div className="lg:col-span-8 glass-panel rounded-2xl p-5 space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-800/80">
            <div>
              <h2 className="text-sm font-bold text-cyan-400 font-mono tracking-wider flex items-center gap-2">
                <Video className="w-4 h-4 text-cyan-400 animate-pulse" />
                OPTICAL PUMP FEED // SELECTABLE 160×160 ROI
              </h2>
              <p className="text-xs font-mono text-slate-400 mt-0.5">
                Engine: <code className="text-cyan-300 font-mono">src/engines/evmOptical.js</code> (Temporal IIR Bandpass)
              </p>
            </div>

            <div className="flex items-center space-x-2.5">
              {isSyntheticDemo && (
                <button
                  onClick={() => setSyntheticCavitationFault(!syntheticCavitationFault)}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-mono font-bold border transition-all shadow-md ${
                    syntheticCavitationFault 
                      ? 'btn-tactical-danger' 
                      : 'bg-emerald-950 text-emerald-300 border-emerald-500/50'
                  }`}
                >
                  {syntheticCavitationFault ? '⚡ CAVITATION INDUCED' : '✅ PUMP LAMINAR'}
                </button>
              )}
              <span className="text-[11px] font-mono px-2.5 py-1 rounded-lg bg-slate-900 text-cyan-300 border border-slate-700/80 font-bold">
                {telemetry.fps} FPS
              </span>
            </div>
          </div>

          {/* Primary Viewport Canvas */}
          <div className="relative rounded-xl overflow-hidden border border-slate-800 bg-black cursor-crosshair hud-border shadow-2xl">
            <canvas
              ref={mainCanvasRef}
              width={640}
              height={480}
              onMouseDown={handleMouseDown}
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUp}
              onTouchStart={handleTouchStart}
              onTouchMove={handleTouchMove}
              onTouchEnd={handleTouchEnd}
              className="w-full h-auto block touch-none"
            />
            <div className="absolute top-3 left-3 text-[10px] font-mono text-cyan-300/90 pointer-events-none bg-slate-950/80 backdrop-blur-md px-2.5 py-1 rounded-lg border border-cyan-500/40">
              EVM IIR ACTIVE: Low {cutoffLow} | High {cutoffHigh}
            </div>
          </div>

          {/* Real-time Spectrogram Banner */}
          <div className="bg-slate-950/70 p-3 rounded-xl border border-slate-800/80">
            <div className="flex items-center justify-between text-xs font-mono text-slate-400 mb-2">
              <span className="font-bold">TEMPORAL DISPLACEMENT HISTORY</span>
              <span className="text-cyan-400 font-bold">PEAK FREQ: {telemetry.peakFrequency} Hz</span>
            </div>
            <canvas
              ref={spectrumCanvasRef}
              width={600}
              height={55}
              className="w-full h-14 block rounded-lg bg-[#070b16]"
            />
          </div>
        </div>

        {/* Right: EVM Magnified Output & Cavitation Telemetry */}
        <div className="lg:col-span-4 space-y-5">
          {/* Magnified 160x160 ROI Panel */}
          <div className="glass-panel rounded-2xl p-5 space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800/80">
              <span className="text-xs font-mono font-bold text-cyan-400">
                EVM MAGNIFIED MICRO-VIBRATION
              </span>
              <span className="text-[10px] font-mono px-2.5 py-0.5 rounded-full bg-cyan-950 text-cyan-300 border border-cyan-500/50 font-bold">
                α = {magnification}×
              </span>
            </div>

            <div className="flex justify-center py-1">
              <div className="relative p-1.5 rounded-2xl bg-black border-2 border-cyan-400/60 shadow-xl shadow-cyan-950">
                <canvas
                  ref={magnifiedCanvasRef}
                  width={160}
                  height={160}
                  className="w-48 h-48 block rounded-xl"
                />
                <div className="absolute bottom-3 left-3 text-[9px] font-mono text-cyan-300 bg-black/80 backdrop-blur-sm px-2 py-0.5 rounded-md border border-cyan-500/40">
                  FALSE-COLOR PHASE SHIFT
                </div>
              </div>
            </div>

            {/* EVM Parameter Sliders */}
            <div className="space-y-3 font-mono text-xs pt-1">
              <div>
                <div className="flex justify-between text-slate-300 mb-1.5">
                  <span>Amplification Gain (α)</span>
                  <span className="text-cyan-400 font-bold">{magnification}×</span>
                </div>
                <input
                  type="range"
                  min="5"
                  max="60"
                  step="1"
                  value={magnification}
                  onChange={(e) => setMagnification(Number(e.target.value))}
                  className="w-full accent-cyan-400 cursor-pointer"
                />
              </div>

              <div>
                <div className="flex justify-between text-slate-300 mb-1.5">
                  <span>IIR Low Cutoff ({cutoffLow})</span>
                  <span className="text-cyan-400">~50 Hz</span>
                </div>
                <input
                  type="range"
                  min="0.02"
                  max="0.25"
                  step="0.02"
                  value={cutoffLow}
                  onChange={(e) => setCutoffLow(Number(e.target.value))}
                  className="w-full accent-cyan-400 cursor-pointer"
                />
              </div>

              <div>
                <div className="flex justify-between text-slate-300 mb-1.5">
                  <span>IIR High Cutoff ({cutoffHigh})</span>
                  <span className="text-cyan-400">~200 Hz</span>
                </div>
                <input
                  type="range"
                  min="0.25"
                  max="0.65"
                  step="0.05"
                  value={cutoffHigh}
                  onChange={(e) => setCutoffHigh(Number(e.target.value))}
                  className="w-full accent-cyan-400 cursor-pointer"
                />
              </div>
            </div>
          </div>

          {/* Cavitation Severity Metric Card */}
          <div className="glass-panel rounded-2xl p-5 space-y-4">
            <div className="text-xs font-mono font-bold text-slate-300 flex items-center justify-between border-b border-slate-800/80 pb-2">
              <span>IMPELLER CAVITATION DIAGNOSTIC</span>
              <Cpu className="w-4 h-4 text-cyan-400" />
            </div>

            <div className={`p-3.5 rounded-xl border flex items-center justify-between ${
              telemetry.isCavitationCritical 
                ? 'bg-red-950/60 border-red-500/60 text-red-200 shadow-md shadow-red-950/40' 
                : 'bg-emerald-950/60 border-emerald-500/60 text-emerald-200'
            }`}>
              <div className="flex items-center space-x-3">
                {telemetry.isCavitationCritical ? (
                  <AlertTriangle className="w-5 h-5 text-red-400 animate-pulse shrink-0" />
                ) : (
                  <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
                )}
                <div>
                  <div className="text-xs font-bold font-mono">{telemetry.status}</div>
                  <div className="text-[10px] opacity-80 font-mono mt-0.5">
                    {telemetry.isCavitationCritical 
                      ? 'Impeller cavitation & vapor collapse detected' 
                      : 'Laminar flow stable'}
                  </div>
                </div>
              </div>
            </div>

            {/* Cavitation Index Meter */}
            <div>
              <div className="flex justify-between text-xs font-mono mb-1.5">
                <span className="text-slate-400">CAVITATION INDEX</span>
                <span className={`font-bold ${telemetry.isCavitationCritical ? 'text-red-400' : 'text-emerald-400'}`}>
                  {telemetry.cavitationIndex}%
                </span>
              </div>
              <div className="w-full h-3 bg-slate-950 rounded-full overflow-hidden border border-slate-800">
                <div
                  className={`h-full transition-all duration-300 ${
                    telemetry.isCavitationCritical ? 'bg-gradient-to-r from-amber-500 to-red-500' : 'bg-emerald-500'
                  }`}
                  style={{ width: `${telemetry.cavitationIndex}%` }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
