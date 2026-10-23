import React, { useState, useEffect } from 'react';
import { 
  Radio, 
  AlertTriangle, 
  ShieldCheck, 
  Sliders, 
  MapPin, 
  RefreshCw, 
  Zap, 
  CheckCircle2, 
  Volume2 
} from 'lucide-react';
import { triggerHaptic } from '../../utils/haptics';

export const AutonomousSentinelBanner = ({
  streets,
  activeLeakStreetId,
  currentStreet,
  onAutoIsolate,
  onNavigateToMap,
  isAutoIsolated
}) => {
  const [scanState, setScanState] = useState('ANOMALY_CONFIRMED'); // 'SCANNING' | 'ANOMALY_CONFIRMED' | 'ISOLATED'
  const [scanProgress, setScanProgress] = useState(100);
  const [autoScanCycle, setAutoScanCycle] = useState(1);

  const leakStreet = streets.find(s => s.id === activeLeakStreetId) || currentStreet;

  const handleTriggerReScan = () => {
    triggerHaptic('medium');
    setScanState('SCANNING');
    setScanProgress(0);

    const interval = setInterval(() => {
      setScanProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          setScanState('ANOMALY_CONFIRMED');
          triggerHaptic('success');
          return 100;
        }
        return prev + 25;
      });
    }, 200);

    setAutoScanCycle(c => c + 1);
  };

  return (
    <div className="w-full bg-[#080d1a] border-b border-cyan-500/40 relative overflow-hidden shadow-lg z-20">
      {/* Background animated scanner gradient */}
      <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/5 via-sky-500/10 to-red-500/10 pointer-events-none" />

      <div className="max-w-7xl mx-auto px-3 sm:px-6 py-2 sm:py-2.5">
        <div className="flex flex-wrap items-center justify-between gap-2.5">
          {/* Left: Autonomous Status & AI Detection Badge */}
          <div className="flex items-center space-x-2.5 min-w-0">
            <div className={`flex items-center justify-center w-7 h-7 sm:w-8 sm:h-8 rounded-lg shrink-0 ${
              isAutoIsolated 
                ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/50' 
                : scanState === 'SCANNING'
                  ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/50 animate-spin'
                  : 'bg-red-500/20 text-red-400 border border-red-500/50 animate-pulse'
            }`}>
              {isAutoIsolated ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              ) : scanState === 'SCANNING' ? (
                <RefreshCw className="w-4 h-4 text-cyan-400" />
              ) : (
                <AlertTriangle className="w-4 h-4 text-red-400" />
              )}
            </div>

            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-[10px] sm:text-xs font-mono font-bold tracking-wider text-cyan-300 uppercase flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping inline-block" />
                  AUTONOMOUS AI SENTINEL (ZERO MANUAL TRIAGE REQUIRED)
                </span>
                <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-slate-900 border border-slate-700 text-slate-300 hidden sm:inline">
                  Cycle #{autoScanCycle} • 12ms sweep
                </span>
              </div>

              {scanState === 'SCANNING' ? (
                <div className="flex items-center gap-2 text-xs font-mono text-cyan-400 mt-0.5">
                  <span>SWEEPING 24 STREET BRANCHES... {scanProgress}%</span>
                  <div className="w-24 sm:w-36 h-1.5 bg-slate-800 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-cyan-400 transition-all duration-200" 
                      style={{ width: `${scanProgress}%` }} 
                    />
                  </div>
                </div>
              ) : isAutoIsolated ? (
                <div className="text-xs font-mono text-emerald-300 truncate mt-0.5">
                  ✅ RUPTURE AUTONOMOUSLY ISOLATED: Valves A & B shut on Street #{activeLeakStreetId} (0.0 PSI line pressure).
                </div>
              ) : (
                <div className="text-xs font-mono text-red-300 truncate mt-0.5 flex items-center gap-2">
                  <span className="font-bold text-white">
                    🚨 CRITICAL LEAK AUTO-PINPOINTED: Street #{activeLeakStreetId} ({leakStreet?.name})
                  </span>
                  <span className="hidden md:inline text-slate-400">•</span>
                  <span className="hidden md:inline text-amber-300">
                    Pressure: {leakStreet?.pressure} PSI (-34 PSI Drop)
                  </span>
                  <span className="hidden lg:inline text-slate-400">•</span>
                  <span className="hidden lg:inline text-cyan-300">
                    Confidence: 99.4%
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Right: Quick Autonomous Actions */}
          <div className="flex items-center gap-2 shrink-0">
            {!isAutoIsolated ? (
              <button
                onClick={() => {
                  triggerHaptic('success');
                  if (onAutoIsolate) onAutoIsolate();
                }}
                className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-red-600 via-rose-600 to-amber-600 hover:from-red-500 hover:to-amber-500 text-white text-[11px] sm:text-xs font-mono font-bold flex items-center gap-1.5 shadow-md shadow-red-950/40 border border-red-400/50 transition-all active:scale-95"
              >
                <Zap className="w-3.5 h-3.5 text-amber-300" />
                <span>1-TAP AUTO-ISOLATE VALVES</span>
              </button>
            ) : (
              <span className="px-3 py-1.5 rounded-xl bg-emerald-950/80 border border-emerald-500/50 text-emerald-300 text-[11px] sm:text-xs font-mono font-bold flex items-center gap-1.5 shadow-sm">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                <span>LINE ISOLATED</span>
              </span>
            )}

            <button
              onClick={() => {
                triggerHaptic('light');
                if (onNavigateToMap) onNavigateToMap();
              }}
              className="px-2.5 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 hover:border-cyan-500/50 text-slate-300 text-[11px] sm:text-xs font-mono flex items-center gap-1 transition-all active:scale-95"
              title="View on Namma Bengaluru GIS Map"
            >
              <MapPin className="w-3.5 h-3.5 text-cyan-400" />
              <span className="hidden xs:inline">Map</span>
            </button>

            <button
              onClick={handleTriggerReScan}
              className="p-1.5 sm:px-2 sm:py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-400 hover:text-cyan-300 transition-all"
              title="Re-run Autonomous AI Network Sweep"
            >
              <RefreshCw className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
