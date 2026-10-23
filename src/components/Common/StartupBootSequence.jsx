import React, { useState, useEffect, useRef } from 'react';
import { 
  ShieldCheck, 
  Activity, 
  Volume2, 
  VolumeX, 
  ChevronRight, 
  Waves
} from 'lucide-react';
import { triggerHaptic } from '../../utils/haptics';

export const StartupBootSequence = ({ onComplete }) => {
  const [progress, setProgress] = useState(0);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [isFadingOut, setIsFadingOut] = useState(false);
  const audioContextRef = useRef(null);

  const steps = [
    {
      code: 'HW_INIT',
      title: 'Acoustic Sensor & MEMS Accelerometer Bus',
      desc: 'Engaging device micro-vibration & hydro-acoustic transducers',
      metric: '48.0 kHz 24-Bit'
    },
    {
      code: 'GEO_MESH',
      title: '24-Street Digital Twin Mesh (Sector 7B)',
      desc: 'Synchronizing with BWSSB SCADA feeders & BBMP road topology',
      metric: '24 Feeder Sectors'
    },
    {
      code: 'DPDP_LOCK',
      title: 'DPDP Act 2023 Sec 8(7) Ephemeral Enclave',
      desc: 'Zero-persistence volatile TypedArray ring buffers mounted',
      metric: '100% Zero-Leak'
    },
    {
      code: 'TDoA_CORR',
      title: 'TDoA Acoustic & Optical EVM Filters',
      desc: 'Activating cross-correlation algorithms & cavity resonance',
      metric: 'Sub-Meter Precision'
    },
    {
      code: 'GRID_READY',
      title: 'Civic Telemetry Grid Active',
      desc: 'Namma Bengaluru infrastructure monitoring ready for dispatch',
      metric: 'Grid Nominal'
    }
  ];

  // Play synthetic boot chimes using Web Audio API
  const playBootChime = (freq = 440, type = 'sine', duration = 0.15) => {
    if (!soundEnabled) return;
    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (!AudioCtx) return;
      if (!audioContextRef.current) {
        audioContextRef.current = new AudioCtx();
      }
      const ctx = audioContextRef.current;
      if (ctx.state === 'suspended') {
        ctx.resume();
      }
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = type;
      osc.frequency.setValueAtTime(freq, ctx.currentTime);
      
      gain.gain.setValueAtTime(0.001, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.08, ctx.currentTime + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + duration);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + duration);
    } catch (e) {
      // Audio autoplay restriction fallback
    }
  };

  useEffect(() => {
    // Initial sound
    playBootChime(520, 'sine', 0.25);
    triggerHaptic('sonar');

    const totalDuration = 2800; // 2.8 seconds total boot sequence
    const intervalTime = 35;
    const increment = 100 / (totalDuration / intervalTime);

    const interval = setInterval(() => {
      setProgress((prev) => {
        const next = Math.min(prev + increment, 100);
        
        // Update step index based on progress
        const step = Math.min(Math.floor((next / 100) * steps.length), steps.length - 1);
        setCurrentStepIndex(step);

        if (next >= 100) {
          clearInterval(interval);
          playBootChime(880, 'triangle', 0.35);
          triggerHaptic('success');
          setTimeout(() => {
            setIsFadingOut(true);
            setTimeout(() => {
              if (onComplete) onComplete();
            }, 600);
          }, 350);
        }
        return next;
      });
    }, intervalTime);

    return () => clearInterval(interval);
  }, [soundEnabled]);

  const handleSkip = () => {
    triggerHaptic('light');
    setIsFadingOut(true);
    setTimeout(() => {
      if (onComplete) onComplete();
    }, 300);
  };

  return (
    <div 
      className={`fixed inset-0 z-50 flex flex-col items-center justify-center bg-[#020617] text-slate-100 overflow-hidden select-none transition-all duration-700 ${
        isFadingOut ? 'opacity-0 scale-105 pointer-events-none' : 'opacity-100 scale-100'
      }`}
    >
      {/* Background Animated Tactical Grid & Radial Beam */}
      <div className="absolute inset-0 bg-tactical-grid opacity-80" />
      <div className="absolute inset-0 bg-radial-gradient-glow pointer-events-none" />

      {/* Holographic Radar Sweep Circles */}
      <div className="absolute w-[360px] h-[360px] sm:w-[500px] sm:h-[500px] rounded-full border border-cyan-500/15 animate-ping opacity-25 pointer-events-none" style={{ animationDuration: '4s' }} />
      <div className="absolute w-[280px] h-[280px] sm:w-[420px] sm:h-[420px] rounded-full border border-sky-400/20 pointer-events-none flex items-center justify-center">
        <div className="w-full h-[1px] bg-cyan-500/20 absolute" />
        <div className="h-full w-[1px] bg-cyan-500/20 absolute" />
      </div>

      {/* Top Floating Controls */}
      <div className="absolute top-5 inset-x-0 max-w-md mx-auto px-6 flex items-center justify-between z-20">
        <div className="flex items-center space-x-2">
          <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
          <span className="text-[10px] font-mono tracking-widest text-cyan-400 uppercase font-bold">
            BOOT // SEC_7B_GRID
          </span>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={() => setSoundEnabled(!soundEnabled)}
            className="p-2 rounded-xl bg-slate-900/80 border border-slate-700/80 text-slate-400 hover:text-white transition-all text-xs"
            title={soundEnabled ? 'Mute boot sound' : 'Unmute boot sound'}
          >
            {soundEnabled ? <Volume2 className="w-3.5 h-3.5 text-cyan-400" /> : <VolumeX className="w-3.5 h-3.5" />}
          </button>
          
          <button
            onClick={handleSkip}
            className="px-3 py-1.5 rounded-xl bg-slate-800/80 hover:bg-slate-700 border border-slate-700/80 text-[11px] font-mono text-slate-300 hover:text-white transition-all flex items-center space-x-1"
          >
            <span>SKIP</span>
            <ChevronRight className="w-3 h-3 text-cyan-400" />
          </button>
        </div>
      </div>

      {/* Central Holographic Emblem & Animation */}
      <div className="relative z-10 flex flex-col items-center max-w-sm sm:max-w-md w-full px-6 text-center">
        {/* Radar Ring with Rotating Accents */}
        <div className="relative mb-8 flex items-center justify-center">
          {/* Outer Rotating Gear / Radar Ring */}
          <div 
            className="w-28 h-28 sm:w-32 sm:h-32 rounded-full border-2 border-dashed border-cyan-400/35 flex items-center justify-center"
            style={{ animation: 'radarSweep 12s linear infinite' }}
          >
            <div className="absolute -top-1 w-2.5 h-2.5 rounded-full bg-cyan-400 shadow-lg shadow-cyan-400" />
            <div className="absolute -bottom-1 w-2.5 h-2.5 rounded-full bg-sky-500 shadow-lg shadow-sky-400" />
          </div>

          {/* Glowing Inner Shield */}
          <div className="absolute w-20 h-20 sm:w-24 sm:h-24 rounded-2xl bg-gradient-to-br from-cyan-500 via-sky-600 to-blue-700 p-0.5 shadow-2xl shadow-cyan-500/40 border border-cyan-300/60 flex items-center justify-center animate-pulse-glow">
            <div className="w-full h-full rounded-[14px] bg-slate-950/85 backdrop-blur-md flex flex-col items-center justify-center relative overflow-hidden">
              <Waves className="w-8 h-8 text-cyan-300 animate-pulse" />
              {/* Scanline passing through icon */}
              <div className="absolute inset-x-0 h-1 bg-cyan-400/70 shadow-cyan-400 shadow-md animate-scanline" />
            </div>
          </div>
        </div>

        {/* Title & Civic Branding */}
        <div className="space-y-1 mb-6">
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-wider font-['Plus_Jakarta_Sans',sans-serif] text-transparent bg-clip-text bg-gradient-to-r from-white via-cyan-100 to-sky-300 neon-glow-cyan">
            KAVERI TERRA-PULSE
          </h1>
          <p className="text-xs sm:text-sm font-mono text-cyan-400/90 font-medium tracking-wide">
            Bengaluru Civic Hydro-Acoustic Subsurface Intelligence
          </p>
          <div className="flex items-center justify-center gap-2 pt-1">
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-cyan-950/90 border border-cyan-500/40 text-cyan-300 font-bold">
              BWSSB × BBMP
            </span>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-950/90 border border-emerald-500/40 text-emerald-300 font-bold flex items-center gap-1">
              <ShieldCheck className="w-2.5 h-2.5" />
              DPDP SEC 8(7) COMPLIANT
            </span>
          </div>
        </div>

        {/* Step Status Box */}
        <div className="w-full glass-panel rounded-2xl p-4 border border-cyan-500/25 mb-6 text-left shadow-2xl shadow-black/80">
          <div className="flex items-center justify-between mb-1.5 font-mono text-[11px]">
            <span className="text-cyan-400 font-bold flex items-center gap-1.5">
              <Activity className="w-3.5 h-3.5 animate-spin" style={{ animationDuration: '3s' }} />
              [{steps[currentStepIndex].code}] {steps[currentStepIndex].title}
            </span>
            <span className="text-slate-400">{steps[currentStepIndex].metric}</span>
          </div>
          <div className="text-[11px] text-slate-300 font-sans line-clamp-1">
            {steps[currentStepIndex].desc}
          </div>
        </div>

        {/* High-Tech Progress Bar */}
        <div className="w-full space-y-2 font-mono">
          <div className="flex justify-between items-center text-xs">
            <span className="text-slate-400 tracking-wider text-[11px]">CALIBRATING SUBSURFACE ARRAY</span>
            <span className="text-cyan-300 font-bold text-sm">{Math.round(progress)}%</span>
          </div>

          <div className="w-full h-2 bg-slate-900 rounded-full overflow-hidden p-0.5 border border-slate-700/60 shadow-inner">
            <div 
              className="h-full rounded-full bg-gradient-to-r from-cyan-500 via-sky-400 to-blue-500 shadow-lg shadow-cyan-500/50 transition-all duration-75 relative"
              style={{ width: `${progress}%` }}
            >
              <div className="absolute right-0 top-0 bottom-0 w-2 bg-white rounded-full shadow-white shadow-sm animate-pulse" />
            </div>
          </div>

          <div className="flex justify-between text-[10px] text-slate-500 pt-1">
            <span>RAM BUFFER: 100% EPHEMERAL</span>
            <span>LATENCY: &lt;1.8ms</span>
          </div>
        </div>
      </div>

      {/* Bottom Subtext */}
      <div className="absolute bottom-5 inset-x-0 text-center font-mono text-[10px] text-slate-500">
        NANOSECOND ACOUSTIC TDoA // ZERO PHYSICAL SENSORS REQUIRED
      </div>
    </div>
  );
};
