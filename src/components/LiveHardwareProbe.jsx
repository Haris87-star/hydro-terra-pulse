import React, { useEffect, useRef, useState } from 'react';
import { OpticalEVMProcessor } from '../engines/evmOptical';
import { runActiveVoidSweep } from '../engines/subterraChirp';

export default function LiveHardwareProbe({ onLiveTelemetryUpdate }) {
    const videoRef = useRef(null);
    const canvasRef = useRef(null);
    const [evmActive, setEvmActive] = useState(false);
    const [chirpRunning, setChirpRunning] = useState(false);
    const [liveStatus, setLiveStatus] = useState('Idle — Select a Live Probe below');

    // 1. Live Optical EVM Camera Loop
    useEffect(() => {
        let animId;
        let stream;
        const evm = new OpticalEVMProcessor(120, 25, 0.08, 0.4);

        if (evmActive) {
            navigator.mediaDevices
                .getUserMedia({ video: { width: 320, height: 240, facingMode: 'environment' } })
                .then((s) => {
                    stream = s;
                    if (videoRef.current) videoRef.current.srcObject = s;
                    setLiveStatus('Running Optical Phase/IIR Magnification on 120x120 ROI...');

                    const renderLoop = () => {
                        if (videoRef.current && canvasRef.current && videoRef.current.readyState === 4) {
                            const ctx = canvasRef.current.getContext('2d');
                            ctx.drawImage(videoRef.current, 0, 0, 320, 240);
                            const res = evm.processFrame(ctx, 100, 60);
                            if (onLiveTelemetryUpdate && res) {
                                onLiveTelemetryUpdate('cavitationIndex', res.cavitationIndex);
                            }
                        }
                        animId = requestAnimationFrame(renderLoop);
                    };
                    renderLoop();
                })
                .catch(() => setLiveStatus('Camera access denied or unavailable.'));
        }

        return () => {
            if (animId) cancelAnimationFrame(animId);
            if (stream) stream.getTracks().forEach((t) => t.stop());
        };
    }, [evmActive, onLiveTelemetryUpdate]);

    // 2. Live SubTerra Active Acoustic Chirp Sweep
    const triggerChirpScan = async () => {
        try {
            setChirpRunning(true);
            setLiveStatus('Emitting 100Hz -> 3.5kHz Acoustic Sweep & Sampling Resonance...');
            const AudioCtx = window.AudioContext || window.webkitAudioContext;
            const audioCtx = new AudioCtx();
            const stream = await navigator.mediaDevices.getUserMedia({
                audio: { echoCancellation: false, noiseSuppression: false, autoGainControl: false },
            });
            const source = audioCtx.createMediaStreamSource(stream);
            const analyser = audioCtx.createAnalyser();
            analyser.fftSize = 2048;
            source.connect(analyser);

            const result = await runActiveVoidSweep(audioCtx, analyser, 1.5);
            if (onLiveTelemetryUpdate && result) {
                onLiveTelemetryUpdate('voidProbability', result.voidProbability);
                onLiveTelemetryUpdate('estimatedVoidRadiusMeters', result.estimatedVoidRadiusMeters || 0.8);
            }
            setLiveStatus(`Sweep Complete: ${result.subsurfaceState} (${result.voidProbability}% conf)`);

            stream.getTracks().forEach((t) => t.stop());
            audioCtx.close();
        } catch (e) {
            setLiveStatus('Microphone access required for Acoustic Sweep.');
        } finally {
            setChirpRunning(false);
        }
    };

    return (
        <div className="glass-panel hud-border rounded-2xl p-5 mb-6 shadow-2xl relative overflow-hidden border-cyan-500/40">
            <div className="absolute top-0 right-0 w-64 h-64 bg-cyan-500/5 rounded-full blur-3xl pointer-events-none" />
            
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-700/60 pb-3 mb-4 relative z-10">
                <div className="flex items-center space-x-2.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 shadow-[0_0_8px_rgba(6,182,212,0.9)] animate-ping" />
                    <span className="text-xs font-mono font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-sky-200 tracking-wider uppercase">
                        LIVE HARDWARE EDGE SENSOR PROBE // WEBAUDIO &amp; WEBRTC EVM
                    </span>
                </div>
                <div className="flex items-center space-x-2 bg-slate-950/80 border border-slate-800 px-3 py-1 rounded-full text-xs font-mono">
                    <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
                    <span className="text-amber-300 font-medium">{liveStatus}</span>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 items-center relative z-10">
                <div className="space-y-3">
                    <p className="text-xs text-slate-300 leading-relaxed">
                        Tap into your device’s live cameras and audio transducers to measure real-world pump cavitation frequencies and sub-asphalt acoustic chirps directly at the edge.
                    </p>

                    <button
                        onClick={() => setEvmActive(!evmActive)}
                        className={`w-full py-2.5 px-4 rounded-xl font-mono text-xs font-bold transition-all flex items-center justify-center space-x-2 shadow-md ${
                            evmActive 
                                ? 'bg-rose-600 hover:bg-rose-500 text-white shadow-rose-950/40' 
                                : 'btn-tactical-primary'
                        }`}
                    >
                        <span>{evmActive ? '⏹ STOP LIVE PUMP EVM CAMERA' : '📷 1. START LIVE OPTICAL EVM (PUMP ROI)'}</span>
                    </button>

                    <button
                        onClick={triggerChirpScan}
                        disabled={chirpRunning}
                        className="btn-tactical-warning w-full py-2.5 px-4 rounded-xl font-mono text-xs font-bold transition-all disabled:opacity-40 flex items-center justify-center space-x-2"
                    >
                        <span>{chirpRunning ? '🔊 SWEEPING 100Hz - 3.5kHz...' : '🔊 2. FIRE ACTIVE SUBTERRA ACOUSTIC CHIRP'}</span>
                    </button>
                </div>

                <div className="flex flex-col items-center justify-center bg-slate-950/90 border border-slate-800/90 rounded-xl p-3 shadow-inner">
                    <video ref={videoRef} autoPlay playsInline muted className="hidden" />
                    <div className="relative">
                        <canvas
                            ref={canvasRef}
                            width={320}
                            height={240}
                            className="rounded-lg border border-slate-800 w-[240px] h-[180px] bg-black block shadow-lg"
                        />
                        <div className="absolute top-2 left-2 text-[9px] font-mono text-cyan-400 bg-slate-950/80 px-2 py-0.5 rounded border border-cyan-500/30">
                            120x120 EVM ROI
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
