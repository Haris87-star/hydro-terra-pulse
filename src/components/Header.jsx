import React, { useState } from 'react';
import { 
  ShieldCheck, 
  Radio, 
  Trash2, 
  Eye, 
  Volume2, 
  Box, 
  FileText, 
  MapPin, 
  Sparkles,
  Zap,
  Info,
  CheckCircle2,
  Building,
  Download,
  RotateCcw,
  Smartphone
} from 'lucide-react';
import { triggerHaptic } from '../utils/haptics';

export const Header = ({ 
  activeTab, 
  setActiveTab, 
  isSyntheticDemo, 
  setIsSyntheticDemo, 
  onPurgeMemory,
  onOpenDpdpModal,
  onOpenDownloadModal,
  onReplayBootSequence
}) => {
  const [purgedNotification, setPurgedNotification] = useState(false);

  const handlePurge = () => {
    triggerHaptic('heavy');
    onPurgeMemory();
    setPurgedNotification(true);
    setTimeout(() => setPurgedNotification(false), 3000);
  };

  const navItems = [
    { id: 'twin', label: '24-Street Twin & Triage', badge: '24 ST', icon: MapPin },
    { id: 'evm', label: 'M1: Optical EVM Pump', badge: '15 HP', icon: Eye },
    { id: 'acoustic', label: 'M2: Acoustic Valve TDoA', badge: 'TDoA', icon: Volume2 },
    { id: 'subterra', label: 'M3: SubTerra 3D Sonar', badge: '3D XR', icon: Box },
    { id: 'report', label: 'Civic Field Report', badge: 'JCB', icon: FileText }
  ];

  return (
    <header className="sticky top-0 z-40 bg-[#030712]/90 backdrop-blur-xl border-b border-slate-800/80 shadow-2xl shadow-black/80">
      {/* Top Banner: Civic Authority & System Status */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex flex-wrap items-center justify-between gap-4">
        {/* Brand identity & Civic Seals */}
        <div className="flex items-center space-x-3.5">
          <div className="relative flex items-center justify-center w-11 h-11 rounded-xl bg-gradient-to-br from-cyan-500 via-sky-600 to-blue-700 shadow-lg shadow-cyan-500/25 border border-cyan-300/40">
            <Radio className="w-5 h-5 text-white animate-pulse" />
            <div className="absolute -inset-1 rounded-xl border border-cyan-400/30 animate-pulse-glow pointer-events-none" />
          </div>

          <div>
            <div className="flex items-center space-x-2.5">
              <span className="font-extrabold text-lg sm:text-xl tracking-wider text-white font-['Plus_Jakarta_Sans',sans-serif] neon-glow-cyan">
                KAVERI TERRA-PULSE
              </span>
              <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded-full bg-cyan-950/80 border border-cyan-500/50 text-cyan-300 font-bold tracking-wider">
                CIVIC v2.4
              </span>
            </div>
            <div className="flex items-center space-x-2 mt-0.5">
              <span className="inline-flex items-center gap-1 text-[11px] font-mono text-emerald-400">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping"></span>
                GRID ACTIVE // INDIRANAGAR SECTOR 7B
              </span>
              <span className="text-slate-600 text-[10px]">•</span>
              <span className="text-[11px] font-mono text-slate-400 hidden sm:inline">
                BWSSB & BBMP Civic Intelligence
              </span>
            </div>
          </div>
        </div>

        {/* Tactical Controls: Download APK, Replay Boot, Live/Stage Toggle & DPDP */}
        <div className="flex flex-wrap items-center gap-2 sm:gap-3">
          {/* Download App & APK Hub Button */}
          <button
            onClick={() => {
              triggerHaptic('success');
              if (onOpenDownloadModal) onOpenDownloadModal();
            }}
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-bold text-xs font-mono shadow-md shadow-cyan-500/30 border border-cyan-300/60 transition-all active:scale-95"
            title="Download smartphone app (.APK for Android or 1-tap install on iOS)"
          >
            <Smartphone className="w-3.5 h-3.5 text-slate-950" />
            <span>GET APP FILE</span>
            <span className="hidden sm:inline text-[9px] px-1 py-0.2 rounded bg-slate-950/30 text-slate-950 font-extrabold uppercase">
              APK
            </span>
          </button>

          {/* Replay Startup Animation Button */}
          <button
            onClick={() => {
              triggerHaptic('light');
              if (onReplayBootSequence) onReplayBootSequence();
            }}
            className="p-2 rounded-xl bg-slate-950/80 border border-slate-800 text-slate-400 hover:text-cyan-300 transition-all"
            title="Replay cinematic startup animation & grid calibration"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>

          {/* Executive Hardware vs Stage Demo Toggle */}
          <div className="flex items-center bg-slate-950/90 border border-slate-800 rounded-xl p-1 shadow-inner">
            <button
              onClick={() => {
                triggerHaptic('medium');
                setIsSyntheticDemo(false);
              }}
              className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition-all ${
                !isSyntheticDemo 
                  ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-600/30 border border-emerald-400/50' 
                  : 'text-slate-400 hover:text-slate-200'
              }`}
              title="Engage live smartphone camera, microphone, and DeviceMotionEvent sensors"
            >
              <Zap className="w-3.5 h-3.5 text-emerald-300" />
              <span>LIVE</span>
            </button>
            <button
              onClick={() => {
                triggerHaptic('medium');
                setIsSyntheticDemo(true);
              }}
              className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition-all ${
                isSyntheticDemo 
                  ? 'bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 shadow-lg shadow-amber-500/25 border border-amber-300/40' 
                  : 'text-slate-400 hover:text-slate-200'
              }`}
              title="Physics-modeled cavitation, ductile iron pipe leak hiss, and sinkhole resonance for a guaranteed zero-fail demo"
            >
              <Sparkles className="w-3.5 h-3.5 text-slate-950" />
              <span>STAGE</span>
            </button>
          </div>

          {/* DPDP Act 2023 Statutory Privacy Badge */}
          <div className="flex items-center space-x-2 bg-slate-950/80 border border-emerald-500/40 px-3 py-1.5 rounded-xl shadow-sm">
            <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
            <div className="flex flex-col text-left">
              <span className="text-[10px] font-mono text-emerald-400 font-bold leading-tight flex items-center gap-1">
                DPDP ACT
                <button 
                  onClick={onOpenDpdpModal}
                  className="text-slate-400 hover:text-cyan-300 transition-colors" 
                  title="View statutory DPDP privacy architecture"
                >
                  <Info className="w-3 h-3" />
                </button>
              </span>
              <span className="text-[9px] font-mono text-slate-400 leading-tight">
                Volatile Only
              </span>
            </div>
            
            {/* Quick Instant RAM Purge Button */}
            <button
              onClick={handlePurge}
              className="ml-1 p-1.5 rounded-lg bg-slate-900 hover:bg-red-950 text-slate-400 hover:text-red-400 border border-slate-700/80 hover:border-red-500/50 transition-all shadow-sm"
              title="Wipe volatile camera and audio ring buffers immediately (Sec 8(7) DPDP Act)"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Memory Purged Banner Alert */}
      {purgedNotification && (
        <div className="bg-red-950/90 border-y border-red-500/60 px-4 py-1.5 text-center text-xs font-mono text-red-200 flex items-center justify-center gap-2 shadow-lg animate-pulse">
          <Trash2 className="w-3.5 h-3.5 text-red-400" />
          <span>DPDP Act 2023 Sec 8(7) Statutory Purge Complete: All audio ring buffers and WebGL textures zeroed in RAM.</span>
        </div>
      )}

      {/* Navigation Tabs Bar (Desktop / Tablet) */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 hidden md:block">
        <nav className="flex space-x-2 overflow-x-auto py-2 no-scrollbar">
          {navItems.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => {
                  triggerHaptic('medium');
                  setActiveTab(tab.id);
                }}
                className={`flex items-center space-x-2 px-3.5 py-2 rounded-xl text-xs font-mono font-semibold whitespace-nowrap transition-all duration-200 ${
                  isActive
                    ? 'bg-gradient-to-r from-cyan-500/20 via-sky-500/15 to-transparent text-cyan-300 border border-cyan-400/50 shadow-md shadow-cyan-500/20'
                    : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800/40 border border-transparent'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-cyan-400' : 'text-slate-400'}`} />
                <span>{tab.label}</span>
                <span className={`text-[10px] px-1.5 py-0.2 rounded font-mono ${
                  isActive 
                    ? 'bg-cyan-900/60 text-cyan-200 border border-cyan-500/40' 
                    : 'bg-slate-800 text-slate-500'
                }`}>
                  {tab.badge}
                </span>
              </button>
            );
          })}
        </nav>
      </div>
    </header>
  );
};
