import React from 'react';
import { 
  MapPin, 
  Eye, 
  Volume2, 
  Box, 
  FileText, 
  Download,
  Sparkles
} from 'lucide-react';
import { triggerHaptic } from '../../utils/haptics';

export const MobileBottomNav = ({ 
  activeTab, 
  setActiveTab, 
  onOpenDownloadModal,
  isInstallAvailable 
}) => {
  const tabs = [
    { id: 'twin', label: 'Twin', icon: MapPin, badge: '24' },
    { id: 'evm', label: 'EVM', icon: Eye, badge: 'M1' },
    { id: 'acoustic', label: 'TDoA', icon: Volume2, badge: 'M2' },
    { id: 'subterra', label: '3D Sonar', icon: Box, badge: 'M3' },
    { id: 'report', label: 'Report', icon: FileText, badge: 'JCB' },
  ];

  const handleTabClick = (tabId) => {
    triggerHaptic('medium');
    setActiveTab(tabId);
  };

  return (
    <div className="fixed bottom-0 inset-x-0 z-40 md:hidden bg-[#030712]/92 backdrop-blur-2xl border-t border-cyan-500/20 shadow-[0_-8px_30px_rgba(0,0,0,0.85)] pb-[env(safe-area-inset-bottom,12px)]">
      {/* Top micro-glow accent line */}
      <div className="w-full h-[1px] bg-gradient-to-r from-transparent via-cyan-400/60 to-transparent" />

      <div className="max-w-md mx-auto px-2 py-1.5 flex items-center justify-around">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => handleTabClick(tab.id)}
              className={`relative flex flex-col items-center justify-center py-1.5 px-2.5 rounded-xl transition-all duration-200 active:scale-95 ${
                isActive 
                  ? 'text-cyan-300 font-bold' 
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {/* Active Tab Glow & Pill */}
              {isActive && (
                <span className="absolute -top-1 w-6 h-1 rounded-full bg-cyan-400 shadow-[0_0_8px_rgba(6,182,212,1)]" />
              )}

              <div className="relative">
                <Icon className={`w-5 h-5 transition-transform ${isActive ? 'scale-110 text-cyan-400 drop-shadow-[0_0_8px_rgba(6,182,212,0.8)]' : 'text-slate-400'}`} />
                {tab.badge && (
                  <span className={`absolute -top-1.5 -right-2 text-[8px] font-mono px-1 py-0.2 rounded-full font-bold ${
                    isActive 
                      ? 'bg-cyan-500 text-slate-950 shadow-sm shadow-cyan-400' 
                      : 'bg-slate-800 text-slate-400 border border-slate-700'
                  }`}>
                    {tab.badge}
                  </span>
                )}
              </div>

              <span className={`text-[10px] mt-1 font-mono tracking-tight ${isActive ? 'text-cyan-300 font-semibold' : 'text-slate-400'}`}>
                {tab.label}
              </span>
            </button>
          );
        })}

        {/* Quick App Install Hub Trigger */}
        <button
          onClick={() => {
            triggerHaptic('success');
            onOpenDownloadModal();
          }}
          className="relative flex flex-col items-center justify-center py-1 px-2.5 rounded-xl bg-gradient-to-b from-cyan-500/20 to-blue-600/20 border border-cyan-400/40 text-cyan-300 shadow-md shadow-cyan-500/20 active:scale-95 transition-all"
        >
          <div className="relative">
            <Download className="w-5 h-5 text-cyan-300 animate-bounce" />
            <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
          </div>
          <span className="text-[9px] mt-1 font-mono uppercase font-bold text-cyan-200">
            App File
          </span>
        </button>
      </div>
    </div>
  );
};
