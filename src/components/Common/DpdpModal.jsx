import React from 'react';
import { ShieldCheck, X, Trash2, Lock, Cpu, ServerOff, CheckCircle2 } from 'lucide-react';

export const DpdpModal = ({ isOpen, onClose, onPurge, purgeAuditLog = [] }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
      <div className="glass-panel border border-cyan-500/50 rounded-2xl max-w-lg w-full p-6 shadow-2xl relative hud-border">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-white p-1.5 rounded-xl bg-slate-800/60 hover:bg-slate-700/80 transition-all border border-slate-700/60"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Header */}
        <div className="flex items-center space-x-3.5 mb-5 pb-3.5 border-b border-slate-800/80">
          <div className="p-2.5 rounded-xl bg-emerald-950/80 border border-emerald-500/50 text-emerald-400">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-base font-bold text-white tracking-wide font-['Plus_Jakarta_Sans',sans-serif]">
              DPDP ACT 2023 PRIVACY ARCHITECTURE
            </h3>
            <p className="text-xs font-mono text-emerald-400">
              India Digital Personal Data Protection Act (Sec 8(7) Compliant)
            </p>
          </div>
        </div>

        {/* Statutory Guarantees */}
        <div className="space-y-3 mb-5 font-mono text-xs">
          <div className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800/80 flex items-start space-x-3">
            <ServerOff className="w-4 h-4 text-cyan-400 mt-0.5 shrink-0" />
            <div>
              <span className="text-white font-bold">100% Volatile RAM Execution:</span>
              <p className="text-slate-400 text-[11px] mt-1 leading-relaxed">
                Microphone audio streams and camera pixel buffers reside exclusively in client-side TypedArrays (Float32Array circular ring-buffers). Zero audio or video frames are transmitted over network sockets or stored in persistent databases.
              </p>
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800/80 flex items-start space-x-3">
            <Cpu className="w-4 h-4 text-emerald-400 mt-0.5 shrink-0" />
            <div>
              <span className="text-white font-bold">Deterministic Memory Purging:</span>
              <p className="text-slate-400 text-[11px] mt-1 leading-relaxed">
                Calling "Purge Memory" immediately writes 0x00 to all audio arrays and disposes WebGL textures, satisfying statutory data erasure mandates.
              </p>
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800/80 flex items-start space-x-3">
            <Lock className="w-4 h-4 text-amber-400 mt-0.5 shrink-0" />
            <div>
              <span className="text-white font-bold">Zero-Hardware Stage Guarantee:</span>
              <p className="text-slate-400 text-[11px] mt-1 leading-relaxed">
                In Synthetic Demo Mode, all data generation occurs deterministically client-side without requiring microphone or camera hardware permissions.
              </p>
            </div>
          </div>
        </div>

        {/* Purge Audit Log */}
        {purgeAuditLog.length > 0 && (
          <div className="mb-5">
            <div className="text-[11px] font-mono text-slate-400 mb-1.5 font-bold uppercase tracking-wider">
              RECENT RAM PURGE AUDIT LOG:
            </div>
            <div className="max-h-24 overflow-y-auto space-y-1.5 bg-slate-950/80 p-2.5 rounded-xl border border-slate-800 text-[10px] font-mono text-slate-300">
              {purgeAuditLog.slice(-3).map((item, idx) => (
                <div key={idx} className="flex justify-between items-center">
                  <span className="text-emerald-400 font-bold">{item.timestamp}</span>
                  <span className="text-slate-400 truncate max-w-[280px]">{item.event || `${item.bytesWiped || 0} bytes wiped`}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Action Button */}
        <div className="flex space-x-3 pt-2">
          <button
            onClick={() => {
              onPurge();
              onClose();
            }}
            className="btn-tactical-danger flex-1 py-2.5 px-4 rounded-xl text-xs font-bold font-mono flex items-center justify-center space-x-2"
          >
            <Trash2 className="w-4 h-4 text-white" />
            <span>PURGE VOLATILE MEMORY NOW</span>
          </button>
          <button
            onClick={onClose}
            className="py-2.5 px-5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold font-mono transition-colors"
          >
            CLOSE
          </button>
        </div>
      </div>
    </div>
  );
};
