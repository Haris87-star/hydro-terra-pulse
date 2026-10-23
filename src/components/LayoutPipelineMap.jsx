import React, { useState } from 'react';

export default function LayoutPipelineMap({
    totalStreets = 24,
    actualLeakStreet = 14,
    selectedStreet,
    onSelectStreet,
}) {
    // Binary Search Triage State
    const [low, setLow] = useState(1);
    const [high, setHigh] = useState(totalStreets);
    const [testedValves, setTestedValves] = useState({});
    const [isolatedStreet, setIsolatedStreet] = useState(null);

    const midValve = Math.floor((low + high) / 2);

    // Simulate touching the smartphone to the midpoint street gate valve
    const handleProbeMidpointValve = () => {
        if (isolatedStreet) return;

        // If leak is downstream (or at) midValve, acoustic hiss/pressure drop is detected
        const isAnomalyDownstream = actualLeakStreet >= midValve;

        setTestedValves((prev) => ({
            ...prev,
            [midValve]: isAnomalyDownstream ? 'HIGH_ACOUSTIC_HISS' : 'NORMAL_FLOW',
        }));

        if (low === high || Math.abs(high - low) <= 1) {
            setIsolatedStreet(actualLeakStreet);
            onSelectStreet(actualLeakStreet);
            return;
        }

        if (actualLeakStreet === midValve) {
            setIsolatedStreet(midValve);
            onSelectStreet(midValve);
        } else if (actualLeakStreet > midValve) {
            setLow(midValve + 1);
        } else {
            setHigh(midValve - 1);
        }
    };

    const handleResetTriage = () => {
        setLow(1);
        setHigh(totalStreets);
        setTestedValves({});
        setIsolatedStreet(null);
    };

    return (
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-xl">
            {/* Header & Binary Search Triage Assistant */}
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-3 mb-4">
                <div>
                    <div className="text-[10px] font-mono uppercase tracking-wider text-sky-400">
                        RADIAL ARTERIAL NETWORK // SINGLE BOREWELL FEED
                    </div>
                    <h2 className="text-base font-bold text-white">
                        24-Street Layout Gate-Valve Triage Map
                    </h2>
                </div>

                <div className="flex items-center gap-2">
                    {!isolatedStreet ? (
                        <button
                            onClick={handleProbeMidpointValve}
                            className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-mono font-bold text-xs px-3 py-2 rounded-lg transition shadow"
                        >
                            🎯 Binary Triage: Probe Street #{midValve} Valve
                        </button>
                    ) : (
                        <span className="bg-red-950 border border-red-500 text-red-300 font-mono text-xs px-3 py-1.5 rounded-lg font-bold">
                            🚨 Isolated: Street #{isolatedStreet} Rupture!
                        </span>
                    )}
                    <button
                        onClick={handleResetTriage}
                        className="bg-slate-800 hover:bg-slate-700 text-slate-300 font-mono text-xs px-2.5 py-2 rounded-lg"
                    >
                        Reset
                    </button>
                </div>
            </div>

            {/* Triage Guidance Banner */}
            <div className="bg-slate-950/90 border border-slate-800 rounded-lg p-2.5 mb-4 text-xs font-mono flex items-center justify-between">
                <div>
                    <span className="text-slate-400">ACTIVE SEARCH WINDOW: </span>
                    <span className="text-sky-400 font-bold">
                        Street {low} → Street {high}
                    </span>
                </div>
                <div>
                    <span className="text-slate-400">NEXT ACTION: </span>
                    {isolatedStreet ? (
                        <span className="text-emerald-400 font-bold">
                            Run 2-Valve TDoA & 3D Scan on Street {isolatedStreet}
                        </span>
                    ) : (
                        <span className="text-amber-400">
                            Touch Phone to Main Junction Valve #{midValve}
                        </span>
                    )}
                </div>
            </div>

            {/* Visual Radial Pipeline Tree: Borewell Trunk + 24 Street Branches */}
            <div className="relative pl-6 border-l-4 border-sky-500 space-y-2 max-h-[360px] overflow-y-auto pr-2">
                {/* Master Borewell Header Node */}
                <div className=" -ml-[31px] flex items-center gap-2 mb-3">
                    <div className="w-4 h-4 rounded-full bg-sky-400 ring-4 ring-sky-500/30" />
                    <span className="bg-sky-950 border border-sky-500/60 text-sky-300 text-xs font-mono px-2.5 py-1 rounded font-bold">
                        🚰 MASTER BOREWELL & BOOSTER PUMP (500 L/min Outflow)
                    </span>
                </div>

                {/* 24 Street Branches Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2.5">
                    {Array.from({ length: totalStreets }, (_, idx) => {
                        const stNum = idx + 1;
                        const isSelected = selectedStreet === stNum;
                        const isIsolated = isolatedStreet === stNum;
                        const isNextMidpoint = !isolatedStreet && stNum === midValve;
                        const inSearchWindow = stNum >= low && stNum <= high;
                        const probeStatus = testedValves[stNum];

                        return (
                            <div
                                key={stNum}
                                onClick={() => onSelectStreet(stNum)}
                                className={`cursor-pointer rounded-lg p-2.5 border transition font-mono text-xs relative ${isIsolated
                                        ? 'bg-red-950/80 border-red-500 text-white shadow-lg shadow-red-950/50'
                                        : isSelected
                                            ? 'bg-sky-950/80 border-sky-400 text-white'
                                            : isNextMidpoint
                                                ? 'bg-amber-950/60 border-amber-400 text-amber-200 animate-pulse'
                                                : inSearchWindow
                                                    ? 'bg-slate-800/80 border-slate-700 text-slate-200 hover:border-slate-500'
                                                    : 'bg-slate-950/40 border-slate-800/50 text-slate-600 opacity-50'
                                    }`}
                            >
                                <div className="flex items-center justify-between mb-1">
                                    <span className="font-bold">STREET #{stNum}</span>
                                    <span
                                        className={`w-2.5 h-2.5 rounded-full ${isIsolated
                                                ? 'bg-red-500 animate-ping'
                                                : probeStatus === 'HIGH_ACOUSTIC_HISS'
                                                    ? 'bg-amber-400'
                                                    : probeStatus === 'NORMAL_FLOW'
                                                        ? 'bg-emerald-400'
                                                        : 'bg-sky-400'
                                            }`}
                                    />
                                </div>

                                <div className="text-[10px] text-slate-400 flex items-center justify-between">
                                    <span>Gate Valve {stNum}A/B</span>
                                    {isIsolated && <span className="text-red-400 font-bold">LEAK</span>}
                                    {isNextMidpoint && <span className="text-amber-300 font-bold">PROBE NEXT</span>}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}