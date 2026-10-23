import React, { useState } from 'react';
import { 
  GitBranch, 
  ArrowRight, 
  CheckCircle2, 
  RotateCcw, 
  AlertTriangle, 
  Volume2, 
  Gauge, 
  HelpCircle,
  TrendingDown,
  Zap,
  Sparkles
} from 'lucide-react';
import { triggerHaptic } from '../../utils/haptics';

export const BinarySearchTriage = ({ 
  streets, 
  activeLeakStreetId, 
  actualLeakStreetId,
  onTriageRangeChange, 
  setTriageRange,
  onSelectLeakStreet,
  onLeakPinpointed,
  onNavigateToAcoustic 
}) => {
  const [low, setLow] = useState(1);
  const [high, setHigh] = useState(24);
  const [history, setHistory] = useState([]);
  const [isResolved, setIsResolved] = useState(false);

  const leakTargetId = activeLeakStreetId || actualLeakStreetId || 14;

  // Compute current midpoint valve
  const midpoint = Math.floor((low + high) / 2);
  const targetStreet = streets.find(s => s.id === midpoint);

  const notifyRangeChange = (newLow, newHigh) => {
    if (onTriageRangeChange) onTriageRangeChange([newLow, newHigh]);
    if (setTriageRange) setTriageRange([newLow, newHigh]);
  };

  const notifyStreetSelected = (streetId) => {
    if (onSelectLeakStreet) onSelectLeakStreet(streetId);
    if (onLeakPinpointed) onLeakPinpointed(streetId);
  };

  const updateRange = (newLow, newHigh, reason, actionTaken) => {
    triggerHaptic('medium');
    const step = {
      stepNumber: history.length + 1,
      testedMidpoint: midpoint,
      streetName: targetStreet?.name,
      previousRange: [low, high],
      newRange: [newLow, newHigh],
      reason,
      actionTaken
    };

    setHistory([...history, step]);
    setLow(newLow);
    setHigh(newHigh);
    notifyRangeChange(newLow, newHigh);

    if (newLow === newHigh) {
      setIsResolved(true);
      notifyStreetSelected(newLow);
    }
  };

  const handlePressureDropped = () => {
    triggerHaptic('medium');
    if (leakTargetId <= midpoint) {
      updateRange(low, midpoint, 'Low Pressure (<20 PSI)', `Pressure drop confirmed at St ${midpoint}. Search narrowed to lower branch.`);
    } else {
      updateRange(midpoint + 1, high, 'Pressure Gradient Shift', `Pressure drop observed upstream. Narrowing to higher branch.`);
    }
  };

  const handlePressureNormal = () => {
    triggerHaptic('medium');
    if (leakTargetId > midpoint) {
      updateRange(midpoint + 1, high, 'Normal Pressure (>45 PSI)', `St ${midpoint} healthy. Rupture is in downstream branches.`);
    } else {
      updateRange(low, midpoint, 'Normal Pressure (>45 PSI)', `Downstream normal. Narrowing to upstream branches.`);
    }
  };

  const handleAutoTriage = () => {
    triggerHaptic('success');
    const steps = [];
    let curLow = 1;
    let curHigh = 24;
    let stepCount = 0;

    while (curLow < curHigh && stepCount < 5) {
      stepCount++;
      const mid = Math.floor((curLow + curHigh) / 2);
      const st = streets.find(s => s.id === mid);
      const isDownstream = leakTargetId > mid;
      const nextLow = isDownstream ? mid + 1 : curLow;
      const nextHigh = isDownstream ? curHigh : mid;

      steps.push({
        stepNumber: stepCount,
        testedMidpoint: mid,
        streetName: st?.name || `Street ${mid}`,
        previousRange: [curLow, curHigh],
        newRange: [nextLow, nextHigh],
        reason: isDownstream ? 'Normal Pressure (>45 PSI)' : 'Pressure Drop (<20 PSI)',
        actionTaken: isDownstream ? `St ${mid} normal. Narrowed to St [${nextLow}..${nextHigh}]` : `Pressure drop at St ${mid}. Narrowed to St [${nextLow}..${nextHigh}]`
      });

      curLow = nextLow;
      curHigh = nextHigh;
    }

    setHistory(steps);
    setLow(curLow);
    setHigh(curHigh);
    setIsResolved(true);
    notifyRangeChange(curLow, curHigh);
    notifyStreetSelected(curLow);
  };

  const handleReset = () => {
    triggerHaptic('light');
    setLow(1);
    setHigh(24);
    setHistory([]);
    setIsResolved(false);
    notifyRangeChange(1, 24);
  };

  const isolatedStreet = streets.find(s => s.id === low) || streets.find(s => s.id === leakTargetId);

  return (
    <div className="glass-panel rounded-2xl p-5 space-y-4">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-800/80">
        <div className="flex items-center space-x-3">
          <div className="p-2 rounded-xl bg-cyan-500/15 border border-cyan-400/40 text-cyan-400">
            <GitBranch className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white tracking-wide font-mono">
              O(log₂ 24) BINARY SEARCH TRIAGE ASSISTANT
            </h3>
            <p className="text-xs font-mono text-slate-400">
              Isolate any street burst across 24 branches in &le; 5 discrete valve tests
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleAutoTriage}
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-cyan-950/90 hover:bg-cyan-900 border border-cyan-500/60 text-cyan-200 text-xs font-mono font-bold transition-all shadow-md active:scale-95"
            title="Automatically run 5-stage binary search to pinpoint rupture in 0.1s"
          >
            <Zap className="w-3.5 h-3.5 text-cyan-400" />
            <span>1-TAP AUTO TRIAGE</span>
          </button>

          <button
            onClick={handleReset}
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 text-xs font-mono border border-slate-700/80 transition-all shadow-sm active:scale-95"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>RESET</span>
          </button>
        </div>
      </div>

      {/* Visual Search Space Narrowing Bar */}
      <div className="bg-slate-950/70 p-3.5 rounded-xl border border-slate-800/80 space-y-2">
        <div className="flex items-center justify-between text-xs font-mono text-slate-400">
          <span>ACTIVE CANDIDATE WINDOW: <strong className="text-white">[St {low} → St {high}]</strong></span>
          <span className="text-cyan-400 font-bold">
            {high - low + 1} Streets Remaining ({Math.round(((24 - (high - low + 1)) / 24) * 100)}% Excluded)
          </span>
        </div>

        {/* 24-Segment Graphic Progress */}
        <div className="grid grid-cols-24 gap-1 h-4 w-full bg-slate-900 rounded-lg overflow-hidden p-0.5 border border-slate-800">
          {streets.map((s) => {
            const inRange = s.id >= low && s.id <= high;
            const isMid = s.id === midpoint && !isResolved;
            const isIso = isResolved && s.id === low;

            let col = 'bg-slate-800/40';
            if (isIso) col = 'bg-red-500 animate-pulse';
            else if (isMid) col = 'bg-amber-400 animate-ping';
            else if (inRange) col = 'bg-cyan-500';

            return (
              <div 
                key={s.id} 
                className={`${col} rounded-sm transition-all`} 
                title={`Street ${s.id}: ${s.name}`} 
              />
            );
          })}
        </div>
        <div className="flex justify-between text-[10px] font-mono text-slate-500">
          <span>St 1 (Borewell Root)</span>
          <span>St 12 (Feeder Midpoint)</span>
          <span>St 24 (Grid Periphery)</span>
        </div>
      </div>

      {/* Main Guidance Card or Resolution Banner */}
      {!isResolved ? (
        <div className="p-4 rounded-xl bg-gradient-to-br from-cyan-950/40 via-slate-900 to-slate-950 border border-cyan-500/40 shadow-xl space-y-4">
          <div className="flex items-start justify-between gap-4">
            <div>
              <div className="text-[10px] font-mono uppercase text-cyan-400 font-bold tracking-wider mb-1 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
                STEP #{history.length + 1} OF 5 // FIELD TEST DIRECTIVE
              </div>
              <h4 className="text-base font-bold text-white font-['Plus_Jakarta_Sans',sans-serif]">
                Touch Sensor Probe to <span className="text-cyan-300">Street #{midpoint}: {targetStreet?.name}</span>
              </h4>
              <p className="text-xs text-slate-300 font-mono mt-1 leading-relaxed">
                Probe the spindle tap at Valve A. Compare the acoustic noise floor & pressure gradient against normal feeder pressure.
              </p>
            </div>
            <div className="p-3 rounded-xl bg-slate-950 border border-cyan-500/30 text-center shrink-0">
              <Gauge className="w-5 h-5 text-cyan-400 mx-auto mb-1" />
              <div className="text-[9px] font-mono text-slate-400">TEST VALVE</div>
              <div className="text-base font-bold text-white font-mono">St #{midpoint}</div>
            </div>
          </div>

          {/* Engineer Response Buttons */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-slate-800">
            <button
              onClick={handlePressureDropped}
              className="btn-tactical-danger py-2.5 px-4 rounded-xl text-xs font-mono font-bold flex items-center justify-center space-x-2"
            >
              <TrendingDown className="w-4 h-4 text-white" />
              <span>PRESSURE DROPPED (&lt; 20 PSI)</span>
            </button>
            <button
              onClick={handlePressureNormal}
              className="py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white border border-emerald-400/40 text-xs font-mono font-bold flex items-center justify-center space-x-2 shadow-lg shadow-emerald-700/30 transition-all"
            >
              <CheckCircle2 className="w-4 h-4 text-white" />
              <span>PRESSURE NORMAL (&gt; 45 PSI)</span>
            </button>
          </div>
        </div>
      ) : (
        /* Isolation Resolution Banner */
        <div className="p-4 rounded-xl bg-gradient-to-r from-red-950/80 via-slate-900 to-red-950/80 border border-red-500 shadow-xl space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center space-x-3.5">
              <div className="w-11 h-11 rounded-xl bg-red-500/20 border border-red-400 flex items-center justify-center text-red-400 shrink-0">
                <AlertTriangle className="w-6 h-6 animate-pulse" />
              </div>
              <div>
                <span className="text-[10px] font-mono uppercase text-red-400 font-bold tracking-wider">
                  TRIAGE COMPLETE // ISOLATED IN {history.length} CHECKS
                </span>
                <h4 className="text-base font-bold text-white">
                  Rupture Point: <span className="text-red-300">Street #{isolatedStreet?.id} ({isolatedStreet?.name})</span>
                </h4>
                <p className="text-xs text-slate-300 font-mono mt-0.5">
                  Pipe: {isolatedStreet?.material} ({isolatedStreet?.lengthMeters}m) • Flow Disruption Confirmed
                </p>
              </div>
            </div>

            <button
              onClick={() => onNavigateToAcoustic(isolatedStreet)}
              className="btn-tactical-primary py-2.5 px-4 rounded-xl font-mono font-bold text-xs flex items-center space-x-2"
            >
              <Volume2 className="w-4 h-4" />
              <span>LAUNCH MODULE 2 ACOUSTIC TDoA</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* Triage Decision History Log */}
      {history.length > 0 && (
        <div className="space-y-2 pt-1">
          <div className="text-xs font-mono text-slate-400 font-bold uppercase tracking-wider">
            TRIAGE DECISION AUDIT LOG
          </div>
          <div className="space-y-1.5 max-h-36 overflow-y-auto">
            {history.map((step) => (
              <div
                key={step.stepNumber}
                className="p-2.5 rounded-lg bg-slate-950/70 border border-slate-800 text-[11px] font-mono flex items-center justify-between"
              >
                <div className="flex items-center space-x-2">
                  <span className="px-2 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-800 text-[10px] font-bold">
                    Step {step.stepNumber}
                  </span>
                  <span className="text-slate-300">
                    Tested St #{step.testedMidpoint} ({step.streetName})
                  </span>
                </div>
                <div className="flex items-center space-x-3 text-slate-400">
                  <span className="text-amber-400 font-medium">{step.reason}</span>
                  <span className="text-slate-600">→</span>
                  <span className="text-cyan-400 font-bold">
                    [St {step.newRange[0]}..{step.newRange[1]}]
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
