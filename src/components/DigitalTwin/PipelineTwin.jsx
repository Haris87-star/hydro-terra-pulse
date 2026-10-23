import React, { useState, useEffect, useMemo } from 'react';
import { 
  Radio, 
  AlertTriangle, 
  CheckCircle2, 
  RotateCcw, 
  Gauge, 
  Activity, 
  MapPin, 
  Sliders, 
  Filter,
  Volume2,
  ArrowRight,
  ShieldAlert,
  Disc
} from 'lucide-react';
import { triggerHaptic } from '../../utils/haptics';

export const PipelineTwin = ({ 
  streets, 
  activeLeakStreetId, 
  setActiveLeakStreetId, 
  triageRange, 
  onNavigateToAcoustic,
  valveStates,
  onToggleValve
}) => {
  const [selectedStreetId, setSelectedStreetId] = useState(activeLeakStreetId || 14);
  const [turningValve, setTurningValve] = useState(null);

  // Sync selected ID when activeLeakStreetId changes
  useEffect(() => {
    if (activeLeakStreetId) {
      setSelectedStreetId(activeLeakStreetId);
    }
  }, [activeLeakStreetId]);

  // Dynamically derive selectedStreet from current streets state so valve changes reflect immediately
  const selectedStreet = useMemo(() => {
    return streets.find(s => s.id === selectedStreetId) || streets[0];
  }, [streets, selectedStreetId]);

  const handleValveClick = (valve) => {
    triggerHaptic('medium');
    setTurningValve(valve);
    setTimeout(() => setTurningValve(null), 450);
    if (onToggleValve && selectedStreet) {
      onToggleValve(selectedStreet.id, valve);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
      {/* Topology Canvas & Radial Schematic */}
      <div className="lg:col-span-8 glass-panel rounded-2xl p-5 relative overflow-hidden">
        {/* Header telemetry */}
        <div className="flex flex-wrap items-center justify-between gap-3 mb-5 pb-3.5 border-b border-slate-800/80">
          <div>
            <h2 className="text-sm font-bold text-cyan-400 font-mono tracking-wider flex items-center gap-2">
              <Radio className="w-4 h-4 text-cyan-400 animate-pulse" />
              24-STREET RADIAL PIPELINE DIGITAL TWIN (NAMMA BENGALURU)
            </h2>
            <p className="text-xs text-slate-400 font-mono mt-0.5">
              Primary Feeder: BWSSB Kaveri Stage IV Sub-Zone 7B (Borewell Master Node)
            </p>
          </div>
          <div className="flex items-center space-x-2">
            <span className="text-[11px] font-mono px-3 py-1 rounded-full bg-slate-900 border border-slate-700/80 shadow-inner">
              {streets.filter(s => s.isDepressurized).length > 0 ? (
                <span className="text-red-400 font-bold flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-red-500 animate-ping" />
                  PRESSURE ANOMALY DETECTED
                </span>
              ) : (
                <span className="text-emerald-400 font-bold flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                  GRID NOMINAL (48 PSI)
                </span>
              )}
            </span>
          </div>
        </div>

        {/* 24-Street Interactive Grid / Radial Map */}
        <div className="space-y-4">
          {/* Master Borewell Node: Responsive on all screen sizes */}
          <div className="flex items-center justify-center">
            <div className="w-full max-w-xl mx-auto p-3 sm:px-5 sm:py-3 rounded-2xl bg-gradient-to-r from-cyan-950/80 via-slate-900 to-cyan-950/80 border border-cyan-500/50 shadow-xl shadow-cyan-500/10 flex flex-col sm:flex-row items-center gap-2.5 sm:gap-4">
              <div className="relative flex items-center justify-center w-10 h-10 rounded-xl bg-cyan-500/20 border border-cyan-400/60 shadow-lg shadow-cyan-400/20 shrink-0">
                <Radio className="w-5 h-5 text-cyan-300 animate-pulse" />
                <div className="absolute -inset-0.5 rounded-xl border border-cyan-400/40 animate-pulse-glow" />
              </div>
              <div className="text-center sm:text-left min-w-0">
                <div className="text-xs font-bold text-white tracking-wide font-mono flex flex-wrap items-center justify-center sm:justify-start gap-1.5 sm:gap-2">
                  <span>BOREWELL MASTER NODE // BWSSB FEEDER 01</span>
                  <span className="text-[9px] px-1.5 py-0.2 rounded bg-emerald-950 text-emerald-300 border border-emerald-500/50">ONLINE</span>
                </div>
                <div className="text-[10px] sm:text-[11px] font-mono text-cyan-300 flex flex-wrap items-center justify-center sm:justify-start gap-2 sm:gap-3 mt-1">
                  <span>P: <strong className="text-white">56.4 PSI</strong></span>
                  <span className="text-slate-600 hidden xs:inline">•</span>
                  <span>Flow: <strong className="text-white">1,420 L/min</strong></span>
                  <span className="text-slate-600 hidden xs:inline">•</span>
                  <span>Impeller: <strong className="text-emerald-400">15 HP Nominal</strong></span>
                </div>
              </div>
            </div>
          </div>

          {/* Radial Feeder Lines Connector */}
          <div className="w-full flex justify-center">
            <div className="w-0.5 h-5 bg-gradient-to-b from-cyan-500 to-slate-700" />
          </div>

          {/* 24 Sequential Street Pipeline Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2 sm:gap-2.5 max-h-[460px] overflow-y-auto p-2 rounded-xl bg-slate-950/60 border border-slate-800/80">
            {streets.map((street) => {
              const isLeakTarget = street.id === activeLeakStreetId;
              const isSelected = selectedStreet?.id === street.id;
              const inTriageCandidate = street.id >= triageRange[0] && street.id <= triageRange[1];

              let cardStyle = 'border-slate-800/80 bg-slate-900/60 hover:border-slate-600 text-slate-300';
              let badgeColor = 'bg-slate-800 text-slate-400 border-slate-700';

              if (isLeakTarget) {
                cardStyle = 'border-red-500/90 bg-red-950/40 shadow-lg shadow-red-900/30 text-white animate-pulse';
                badgeColor = 'bg-red-950 text-red-200 border-red-500 font-bold';
              } else if (inTriageCandidate) {
                cardStyle = 'border-cyan-500/60 bg-cyan-950/30 shadow-md shadow-cyan-900/20 text-slate-100';
                badgeColor = 'bg-cyan-950 text-cyan-200 border-cyan-400/50 font-bold';
              }

              if (isSelected) {
                cardStyle += ' ring-2 ring-cyan-400 border-cyan-400';
              }

              return (
                <div
                  key={street.id}
                  onClick={() => {
                    triggerHaptic('light');
                    setSelectedStreetId(street.id);
                    setActiveLeakStreetId(street.id);
                  }}
                  className={`p-3 rounded-xl border cursor-pointer transition-all duration-200 hover:-translate-y-0.5 active:scale-95 ${cardStyle}`}
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-xs font-mono font-bold text-white">
                      St #{street.id}
                    </span>
                    <span className={`text-[9px] font-mono px-1.5 py-0.5 rounded border ${badgeColor}`}>
                      {isLeakTarget ? 'LEAK' : inTriageCandidate ? 'TRIAGE' : 'NOMINAL'}
                    </span>
                  </div>

                  <div className="text-[10px] text-slate-300 font-medium truncate mb-2" title={street.name}>
                    {street.name}
                  </div>

                  {/* Pressure gauge bar */}
                  <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden mb-2">
                    <div 
                      className={`h-full transition-all duration-300 ${
                        street.pressure < 25 ? 'bg-red-500' : 'bg-cyan-500'
                      }`}
                      style={{ width: `${Math.min(100, (street.pressure / 60) * 100)}%` }}
                    />
                  </div>

                  {/* Pressure & Valve indicators */}
                  <div className="flex items-center justify-between text-[10px] font-mono">
                    <span className={street.pressure < 25 ? 'text-red-400 font-bold' : 'text-slate-400'}>
                      {street.pressure} PSI
                    </span>
                    <div className="flex items-center space-x-1.5">
                      <span 
                        title={`Valve A: ${street.valveAOpen ? 'Open' : 'Closed'}`}
                        className={`w-2.5 h-2.5 rounded-full transition-all ${street.valveAOpen ? 'bg-emerald-400 shadow-[0_0_6px_rgba(52,211,153,0.8)]' : 'bg-red-500 shadow-[0_0_6px_rgba(239,68,68,0.8)]'} ring-2 ring-slate-900`} 
                      />
                      <span 
                        title={`Valve B: ${street.valveBOpen ? 'Open' : 'Closed'}`}
                        className={`w-2.5 h-2.5 rounded-full transition-all ${street.valveBOpen ? 'bg-emerald-400 shadow-[0_0_6px_rgba(52,211,153,0.8)]' : 'bg-red-500 shadow-[0_0_6px_rgba(239,68,68,0.8)]'} ring-2 ring-slate-900`} 
                      />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Interactive Legend */}
          <div className="flex flex-wrap items-center justify-between text-[11px] font-mono text-slate-400 pt-3 border-t border-slate-800/80 gap-2">
            <div className="flex flex-wrap items-center gap-3 sm:gap-4">
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" /> Normal Pressure (&gt;45 PSI)
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-cyan-500" /> Triage Active Range
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-ping" /> Rupture Detected (&lt;18 PSI)
              </span>
            </div>
            <span>24 Spindles Monitored</span>
          </div>
        </div>
      </div>

      {/* Selected Street & Valve Inspection Panel */}
      <div className="lg:col-span-4 glass-panel rounded-2xl p-4 sm:p-5 flex flex-col justify-between space-y-4">
        {selectedStreet ? (
          <div className="space-y-4">
            <div className="border-b border-slate-800/80 pb-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono text-cyan-400 font-bold uppercase tracking-wider">
                  BRANCH TELEMETRY // STREET #{selectedStreet.id}
                </span>
                <span className={`text-[10px] font-mono px-2.5 py-0.5 rounded-full font-bold border ${
                  selectedStreet.id === activeLeakStreetId 
                    ? 'bg-red-950 text-red-300 border-red-500' 
                    : 'bg-emerald-950 text-emerald-300 border-emerald-500'
                }`}>
                  {selectedStreet.id === activeLeakStreetId ? 'RUPTURE CONFIRMED' : 'FLOW OPTIMAL'}
                </span>
              </div>
              <h3 className="text-base font-bold text-white mt-1.5 font-['Plus_Jakarta_Sans',sans-serif]">
                {selectedStreet.name}
              </h3>
              <p className="text-xs font-mono text-slate-400 mt-0.5">
                Segment Length: {selectedStreet.lengthMeters}m • Pipe: {selectedStreet.material}
              </p>
            </div>

            {/* Live Metrics */}
            <div className="grid grid-cols-2 gap-3 font-mono">
              <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800">
                <div className="text-[10px] text-slate-400">LINE PRESSURE</div>
                <div className={`text-xl font-bold mt-1 ${
                  selectedStreet.pressure < 25 ? 'text-red-400' : 'text-cyan-400'
                }`}>
                  {selectedStreet.pressure} <span className="text-xs font-normal">PSI</span>
                </div>
              </div>
              <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800">
                <div className="text-[10px] text-slate-400">ACOUSTIC NOISE FLOOR</div>
                <div className="text-xl font-bold mt-1 text-amber-400">
                  {selectedStreet.id === activeLeakStreetId ? '74.2' : '22.8'} <span className="text-xs font-normal">dB</span>
                </div>
              </div>
            </div>

            {/* Clickable Gate Valves: Valve A and Valve B */}
            <div className="space-y-2.5 pt-1">
              <div className="text-xs font-mono font-bold text-slate-300 flex items-center justify-between">
                <span className="flex items-center gap-1.5">
                  <Sliders className="w-3.5 h-3.5 text-cyan-400" />
                  GATE-VALVE CONTACT TAPS
                </span>
                <span className="text-[10px] text-cyan-300 bg-cyan-950/60 px-2 py-0.5 rounded-full border border-cyan-500/40">
                  Tap card to toggle
                </span>
              </div>

              {/* Valve A Card */}
              <div 
                role="button"
                tabIndex={0}
                onClick={() => handleValveClick('valveA')}
                onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') handleValveClick('valveA'); }}
                className={`p-3 rounded-xl border cursor-pointer transition-all duration-200 flex items-center justify-between group active:scale-[0.98] ${
                  selectedStreet.valveAOpen 
                    ? 'bg-slate-900/90 border-slate-700/80 hover:border-emerald-500/70 shadow-sm' 
                    : 'bg-red-950/40 border-red-500/70 shadow-md shadow-red-950/30'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <div className={`relative flex items-center justify-center w-8 h-8 rounded-lg ${
                    selectedStreet.valveAOpen ? 'bg-emerald-500/20 text-emerald-400' : 'bg-red-500/20 text-red-400'
                  }`}>
                    <Disc className={`w-4 h-4 transition-transform ${turningValve === 'valveA' ? 'animate-valve-turn' : ''}`} />
                    <div className={`absolute -top-0.5 -right-0.5 w-2.5 h-2.5 rounded-full border-2 border-slate-900 ${
                      selectedStreet.valveAOpen ? 'bg-emerald-400' : 'bg-red-500'
                    }`} />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-slate-100 group-hover:text-cyan-300 transition-colors flex items-center gap-1.5">
                      <span>Valve A (Upstream Gate)</span>
                    </div>
                    <div className="text-[10px] font-mono text-slate-400">Position 0.0m • Ch: Sensor A Contact</div>
                  </div>
                </div>
                <div className="text-right">
                  <span className={`text-[10px] font-mono px-2.5 py-1 rounded-lg font-bold border inline-block transition-all ${
                    selectedStreet.valveAOpen 
                      ? 'bg-emerald-950 text-emerald-300 border-emerald-500/50 shadow-[0_0_8px_rgba(52,211,153,0.3)]' 
                      : 'bg-red-950 text-red-300 border-red-500/50 shadow-[0_0_8px_rgba(239,68,68,0.3)]'
                  }`}>
                    {selectedStreet.valveAOpen ? '● OPEN' : '✕ CLOSED'}
                  </span>
                  <div className="text-[9px] font-mono text-slate-500 mt-0.5">Tap to {selectedStreet.valveAOpen ? 'Shut' : 'Open'}</div>
                </div>
              </div>

              {/* Valve B Card */}
              <div 
                role="button"
                tabIndex={0}
                onClick={() => handleValveClick('valveB')}
                onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') handleValveClick('valveB'); }}
                className={`p-3 rounded-xl border cursor-pointer transition-all duration-200 flex items-center justify-between group active:scale-[0.98] ${
                  selectedStreet.valveBOpen 
                    ? 'bg-slate-900/90 border-slate-700/80 hover:border-emerald-500/70 shadow-sm' 
                    : 'bg-red-950/40 border-red-500/70 shadow-md shadow-red-950/30'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <div className={`relative flex items-center justify-center w-8 h-8 rounded-lg ${
                    selectedStreet.valveBOpen ? 'bg-emerald-500/20 text-emerald-400' : 'bg-red-500/20 text-red-400'
                  }`}>
                    <Disc className={`w-4 h-4 transition-transform ${turningValve === 'valveB' ? 'animate-valve-turn' : ''}`} />
                    <div className={`absolute -top-0.5 -right-0.5 w-2.5 h-2.5 rounded-full border-2 border-slate-900 ${
                      selectedStreet.valveBOpen ? 'bg-emerald-400' : 'bg-red-500'
                    }`} />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-slate-100 group-hover:text-cyan-300 transition-colors flex items-center gap-1.5">
                      <span>Valve B (Downstream Gate)</span>
                    </div>
                    <div className="text-[10px] font-mono text-slate-400">Position {selectedStreet.lengthMeters}m • Ch: Sensor B Contact</div>
                  </div>
                </div>
                <div className="text-right">
                  <span className={`text-[10px] font-mono px-2.5 py-1 rounded-lg font-bold border inline-block transition-all ${
                    selectedStreet.valveBOpen 
                      ? 'bg-emerald-950 text-emerald-300 border-emerald-500/50 shadow-[0_0_8px_rgba(52,211,153,0.3)]' 
                      : 'bg-red-950 text-red-300 border-red-500/50 shadow-[0_0_8px_rgba(239,68,68,0.3)]'
                  }`}>
                    {selectedStreet.valveBOpen ? '● OPEN' : '✕ CLOSED'}
                  </span>
                  <div className="text-[9px] font-mono text-slate-500 mt-0.5">Tap to {selectedStreet.valveBOpen ? 'Shut' : 'Open'}</div>
                </div>
              </div>
            </div>

            {/* Quick Action Button to Module 2 Acoustic Correlator */}
            <div className="pt-2">
              <button
                onClick={() => onNavigateToAcoustic(selectedStreet)}
                className="btn-tactical-primary w-full py-2.5 px-4 rounded-xl font-mono font-bold text-xs flex items-center justify-center space-x-2"
              >
                <Volume2 className="w-4 h-4" />
                <span>DISPATCH ACOUSTIC TDoA FOR THIS STREET</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        ) : (
          <div className="text-center py-12 text-slate-500 text-xs font-mono">
            Select a street from the grid to view valve telemetry
          </div>
        )}

        {/* Civic Quick Info */}
        <div className="mt-4 p-3 rounded-xl bg-slate-950/60 border border-slate-800/80 text-[10px] font-mono text-slate-400">
          <span className="text-cyan-400 font-semibold">Triage Note:</span> Bengaluru urban pipelines suffer 35% non-revenue water (NRW) due to unmapped subsurface bursts. Binary search reduces isolation time from 6.5 hours to 22 minutes.
        </div>
      </div>
    </div>
  );
};
