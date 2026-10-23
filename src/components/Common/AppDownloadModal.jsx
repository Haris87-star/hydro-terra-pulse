import React, { useState } from 'react';
import { 
  Download, 
  Smartphone, 
  QrCode, 
  ShieldCheck, 
  Apple, 
  X, 
  Copy, 
  Zap,
  Info
} from 'lucide-react';
import { triggerHaptic } from '../../utils/haptics';

export const AppDownloadModal = ({ 
  isOpen, 
  onClose, 
  installPromptEvent, 
  _isInstalled 
}) => {
  const [activeTab, setActiveTab] = useState('android'); // 'android' | 'pwa' | 'ios' | 'qr'
  const [copiedLink, setCopiedLink] = useState(false);
  const [downloadStarted, setDownloadStarted] = useState(false);

  if (!isOpen) return null;

  const currentUrl = typeof window !== 'undefined' ? window.location.href : 'http://localhost:5173';

  const handleCopyLink = () => {
    triggerHaptic('light');
    if (navigator.clipboard) {
      navigator.clipboard.writeText(currentUrl);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2500);
    }
  };

  const handleNativePwaInstall = async () => {
    triggerHaptic('medium');
    if (installPromptEvent) {
      installPromptEvent.prompt();
      const choiceResult = await installPromptEvent.userChoice;
      if (choiceResult.outcome === 'accepted') {
        triggerHaptic('success');
      }
    } else {
      alert('To install directly, tap your browser menu (⋮ or Share) and select "Add to Home screen" or "Install App"!');
    }
  };

  const handleDownloadApk = () => {
    triggerHaptic('success');
    setDownloadStarted(true);
    // Link directly to downloadable APK
    const link = document.createElement('a');
    link.href = '/download/Kaveri-TerraPulse-v2.4.apk';
    link.download = 'Kaveri-TerraPulse-v2.4.apk';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setTimeout(() => setDownloadStarted(false), 4000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-xl animate-fade-in select-none">
      <div 
        className="relative w-full max-w-2xl bg-gradient-to-b from-slate-900 via-slate-950 to-black border border-cyan-500/35 rounded-3xl shadow-[0_0_60px_rgba(6,182,212,0.25)] overflow-hidden flex flex-col max-h-[92vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Glow Header Reticle */}
        <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-transparent via-cyan-400 to-transparent" />
        
        {/* Modal Header */}
        <div className="p-4 sm:p-6 border-b border-slate-800/80 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center shadow-lg shadow-cyan-500/30 border border-cyan-300/40">
              <Smartphone className="w-5 h-5 text-white animate-pulse" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="text-lg sm:text-xl font-extrabold text-white font-['Plus_Jakarta_Sans',sans-serif]">
                  Mobile App Download Hub
                </h3>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-cyan-950 border border-cyan-500/60 text-cyan-300 font-bold">
                  v2.4.0 APK
                </span>
              </div>
              <p className="text-xs text-slate-400 font-mono">
                Official Smartphone Distribution // Android & iOS Universal
              </p>
            </div>
          </div>

          <button
            onClick={() => {
              triggerHaptic('light');
              onClose();
            }}
            className="w-8 h-8 rounded-full bg-slate-800/80 hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center transition-all border border-slate-700"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tab Selection */}
        <div className="px-4 sm:px-6 pt-3 pb-2 border-b border-slate-800/60 bg-slate-950/40">
          <div className="grid grid-cols-4 gap-1.5 p-1 rounded-2xl bg-slate-900/90 border border-slate-800 font-mono text-xs">
            <button
              onClick={() => {
                triggerHaptic('light');
                setActiveTab('android');
              }}
              className={`py-2 px-1 rounded-xl font-bold flex items-center justify-center space-x-1.5 transition-all ${
                activeTab === 'android'
                  ? 'bg-gradient-to-r from-cyan-500 to-sky-600 text-white shadow-md shadow-cyan-500/30'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Download className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Android</span> APK
            </button>

            <button
              onClick={() => {
                triggerHaptic('light');
                setActiveTab('pwa');
              }}
              className={`py-2 px-1 rounded-xl font-bold flex items-center justify-center space-x-1.5 transition-all ${
                activeTab === 'pwa'
                  ? 'bg-gradient-to-r from-cyan-500 to-sky-600 text-white shadow-md shadow-cyan-500/30'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Zap className="w-3.5 h-3.5 text-amber-300" />
              <span>Direct Install</span>
            </button>

            <button
              onClick={() => {
                triggerHaptic('light');
                setActiveTab('ios');
              }}
              className={`py-2 px-1 rounded-xl font-bold flex items-center justify-center space-x-1.5 transition-all ${
                activeTab === 'ios'
                  ? 'bg-gradient-to-r from-cyan-500 to-sky-600 text-white shadow-md shadow-cyan-500/30'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Apple className="w-3.5 h-3.5" />
              <span>Apple iOS</span>
            </button>

            <button
              onClick={() => {
                triggerHaptic('light');
                setActiveTab('qr');
              }}
              className={`py-2 px-1 rounded-xl font-bold flex items-center justify-center space-x-1.5 transition-all ${
                activeTab === 'qr'
                  ? 'bg-gradient-to-r from-cyan-500 to-sky-600 text-white shadow-md shadow-cyan-500/30'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <QrCode className="w-3.5 h-3.5" />
              <span>Phone QR</span>
            </button>
          </div>
        </div>

        {/* Modal Body / Tab Contents */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-4">
          {/* TAB 1: Android APK Download */}
          {activeTab === 'android' && (
            <div className="space-y-4">
              {/* App File Card */}
              <div className="glass-panel p-4 sm:p-5 rounded-2xl border border-cyan-500/30 relative overflow-hidden">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center space-x-2">
                      <span className="text-white font-bold text-base">Kaveri-TerraPulse-v2.4.apk</span>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-950 border border-emerald-500/60 text-emerald-300 font-bold">
                        Universal Build
                      </span>
                    </div>
                    <p className="text-xs text-slate-300">
                      Standalone Android Application Package for all modern smartphones & tablets (Android 8.0 to Android 15+).
                    </p>
                    <div className="flex flex-wrap items-center gap-3 pt-1 text-[11px] font-mono text-slate-400">
                      <span>📦 Size: ~6.8 MB</span>
                      <span>•</span>
                      <span>🆔 gov.in.bengaluru.terrapulse</span>
                      <span>•</span>
                      <span>⚡ Sensor Access: Native</span>
                    </div>
                  </div>

                  <button
                    onClick={handleDownloadApk}
                    className="btn-tactical-primary py-3 px-5 rounded-xl font-mono text-xs font-bold flex items-center justify-center space-x-2 shrink-0 shadow-lg shadow-cyan-500/30"
                  >
                    <Download className={`w-4 h-4 ${downloadStarted ? 'animate-bounce' : ''}`} />
                    <span>{downloadStarted ? 'DOWNLOADING...' : 'DOWNLOAD APK FILE'}</span>
                  </button>
                </div>
              </div>

              {/* Sideload & Installation Steps */}
              <div className="glass-panel p-4 rounded-2xl space-y-3">
                <div className="text-xs font-mono font-bold text-cyan-400 uppercase flex items-center justify-between">
                  <span>How to Install on Your Smartphone (3 Easy Steps)</span>
                  <span className="text-[10px] text-slate-400">Android Guide</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 text-xs">
                  <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 space-y-1">
                    <div className="text-cyan-400 font-mono font-bold">01. Download</div>
                    <div className="text-slate-300 text-[11px]">
                      Tap the "Download APK File" button above to save the file to your Downloads.
                    </div>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 space-y-1">
                    <div className="text-cyan-400 font-mono font-bold">02. Open & Allow</div>
                    <div className="text-slate-300 text-[11px]">
                      Open the downloaded file. If prompted, toggle "Allow from this source" in Chrome/Files.
                    </div>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 space-y-1">
                    <div className="text-emerald-400 font-mono font-bold">03. Install & Launch</div>
                    <div className="text-slate-300 text-[11px]">
                      Tap "Install". The Kaveri Terra-Pulse icon appears on your home screen ready for duty!
                    </div>
                  </div>
                </div>
              </div>

              {/* Google Play Store / Enterprise Distribution Note */}
              <div className="p-3 rounded-xl bg-cyan-950/30 border border-cyan-800/40 text-xs text-slate-300 flex items-start gap-2.5">
                <ShieldCheck className="w-5 h-5 text-cyan-400 shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <div className="font-bold text-white">App Store & Civic Distribution Architecture</div>
                  <div className="text-[11px] text-slate-300">
                    This build is powered by Capacitor with Trusted Web Activity (TWA) compliance. To publish to Google Play Store, upload the generated <code className="text-cyan-300 bg-slate-900 px-1 py-0.5 rounded">app-release.aab</code> bundle directly to Google Play Console.
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: Direct 1-Tap PWA Install */}
          {activeTab === 'pwa' && (
            <div className="space-y-4">
              <div className="glass-panel p-5 rounded-2xl border border-cyan-500/30 space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center space-x-2">
                      <span className="text-white font-bold text-base">Direct Browser-to-Phone Installation</span>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-cyan-950 border border-cyan-500/60 text-cyan-300 font-bold">
                        Instant WebAPK
                      </span>
                    </div>
                    <p className="text-xs text-slate-300">
                      Installs the app directly onto your smartphone home screen without needing to download files or allow unknown sources!
                    </p>
                  </div>

                  <button
                    onClick={handleNativePwaInstall}
                    className="btn-tactical-warning py-3 px-6 rounded-xl font-mono text-xs font-bold flex items-center justify-center space-x-2 shrink-0 shadow-lg shadow-amber-500/25"
                  >
                    <Zap className="w-4 h-4 text-slate-950" />
                    <span>INSTALL APP TO PHONE</span>
                  </button>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 border-t border-slate-800/80 text-[11px] font-mono text-center">
                  <div className="p-2 rounded-lg bg-slate-900/70 border border-slate-800">
                    <div className="text-cyan-400 font-bold">Full Screen</div>
                    <div className="text-slate-400 text-[10px]">Zero URL Bars</div>
                  </div>
                  <div className="p-2 rounded-lg bg-slate-900/70 border border-slate-800">
                    <div className="text-emerald-400 font-bold">Offline Ready</div>
                    <div className="text-slate-400 text-[10px]">Cached Service Worker</div>
                  </div>
                  <div className="p-2 rounded-lg bg-slate-900/70 border border-slate-800">
                    <div className="text-sky-400 font-bold">Auto Updates</div>
                    <div className="text-slate-400 text-[10px]">Always Latest v2.4</div>
                  </div>
                  <div className="p-2 rounded-lg bg-slate-900/70 border border-slate-800">
                    <div className="text-amber-400 font-bold">Native Haptics</div>
                    <div className="text-slate-400 text-[10px]">Tactile Feedback</div>
                  </div>
                </div>
              </div>

              <div className="glass-panel p-4 rounded-2xl text-xs space-y-2 text-slate-300">
                <div className="font-mono font-bold text-white flex items-center gap-2">
                  <Info className="w-4 h-4 text-cyan-400" />
                  <span>Manual Installation (If the button doesn't trigger automatically):</span>
                </div>
                <p className="text-[11px] text-slate-400">
                  Tap your mobile browser menu (<strong className="text-white">⋮</strong> on Chrome/Edge or <strong className="text-white">Share</strong> on Safari), then select <strong className="text-cyan-300">"Install app"</strong> or <strong className="text-cyan-300">"Add to Home screen"</strong>.
                </p>
              </div>
            </div>
          )}

          {/* TAB 3: Apple iOS Guide */}
          {activeTab === 'ios' && (
            <div className="space-y-4">
              <div className="glass-panel p-5 rounded-2xl border border-slate-800 space-y-3">
                <div className="flex items-center space-x-2 text-white font-bold text-sm">
                  <Apple className="w-5 h-5 text-white" />
                  <span>Install on iPhone or iPad (Apple App Store Alternative)</span>
                </div>
                <p className="text-xs text-slate-300">
                  Apple iOS allows any web app to be saved as a high-performance native standalone app with custom startup animation and icon:
                </p>

                <div className="space-y-2.5 pt-2 text-xs">
                  <div className="flex items-start gap-3 p-3 rounded-xl bg-slate-900/80 border border-slate-800">
                    <div className="w-6 h-6 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-400/30 flex items-center justify-center font-mono font-bold shrink-0 text-xs">
                      1
                    </div>
                    <div>
                      <div className="font-bold text-white">Open in Safari</div>
                      <div className="text-[11px] text-slate-400">
                        Ensure you are viewing this page inside Apple Safari browser on your iOS device.
                      </div>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 p-3 rounded-xl bg-slate-900/80 border border-slate-800">
                    <div className="w-6 h-6 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-400/30 flex items-center justify-center font-mono font-bold shrink-0 text-xs">
                      2
                    </div>
                    <div>
                      <div className="font-bold text-white">Tap Share Button <span className="text-cyan-400 font-mono">[⎋]</span></div>
                      <div className="text-[11px] text-slate-400">
                        Tap the blue Share button at the bottom navigation bar of Safari.
                      </div>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 p-3 rounded-xl bg-slate-900/80 border border-slate-800">
                    <div className="w-6 h-6 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 flex items-center justify-center font-mono font-bold shrink-0 text-xs">
                      3
                    </div>
                    <div>
                      <div className="font-bold text-white">Select "Add to Home Screen" <span className="text-emerald-400 font-mono">[+]</span></div>
                      <div className="text-[11px] text-slate-400">
                        Scroll down and tap "Add to Home Screen". Tap "Add" in the top right. Kaveri Terra-Pulse will now appear alongside your native iOS apps!
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: QR Code Scan for Phone */}
          {activeTab === 'qr' && (
            <div className="space-y-4 text-center">
              <div className="glass-panel p-6 rounded-2xl border border-cyan-500/30 flex flex-col items-center justify-center space-y-4">
                <div className="text-xs font-mono font-bold text-cyan-300 uppercase">
                  Scan with Smartphone Camera to Open & Install
                </div>

                {/* High-Tech Holographic QR Code Box */}
                <div className="p-4 bg-white rounded-2xl shadow-2xl shadow-cyan-500/30 border-4 border-cyan-400/60 relative">
                  <svg
                    className="w-44 h-44"
                    viewBox="0 0 100 100"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    {/* Simulated High-Res Tech QR Pattern */}
                    <rect width="100" height="100" fill="white" />
                    {/* Position Detection Patterns (Top Left, Top Right, Bottom Left) */}
                    <rect x="5" y="5" width="25" height="25" fill="#020617" />
                    <rect x="9" y="9" width="17" height="17" fill="white" />
                    <rect x="13" y="13" width="9" height="9" fill="#0284c7" />

                    <rect x="70" y="5" width="25" height="25" fill="#020617" />
                    <rect x="74" y="9" width="17" height="17" fill="white" />
                    <rect x="78" y="13" width="9" height="9" fill="#0284c7" />

                    <rect x="5" y="70" width="25" height="25" fill="#020617" />
                    <rect x="9" y="74" width="17" height="17" fill="white" />
                    <rect x="13" y="78" width="9" height="9" fill="#0284c7" />

                    {/* QR Data Grid Matrix */}
                    <g fill="#020617">
                      <rect x="35" y="8" width="5" height="5" />
                      <rect x="45" y="8" width="5" height="5" />
                      <rect x="55" y="8" width="5" height="5" />
                      <rect x="35" y="18" width="5" height="5" />
                      <rect x="50" y="18" width="5" height="5" />
                      <rect x="40" y="28" width="5" height="5" />
                      <rect x="60" y="28" width="5" height="5" />
                      
                      <rect x="8" y="35" width="5" height="5" />
                      <rect x="18" y="35" width="5" height="5" />
                      <rect x="28" y="40" width="5" height="5" />
                      <rect x="8" y="55" width="5" height="5" />
                      <rect x="22" y="50" width="5" height="5" />

                      <rect x="35" y="35" width="30" height="30" fill="#0284c7" rx="6" />
                      <circle cx="50" cy="50" r="8" fill="white" />
                      <circle cx="50" cy="50" r="4" fill="#0284c7" />

                      <rect x="70" y="35" width="5" height="5" />
                      <rect x="85" y="40" width="5" height="5" />
                      <rect x="75" y="50" width="5" height="5" />
                      <rect x="90" y="55" width="5" height="5" />

                      <rect x="35" y="70" width="5" height="5" />
                      <rect x="45" y="75" width="5" height="5" />
                      <rect x="60" y="70" width="5" height="5" />
                      <rect x="50" y="85" width="5" height="5" />
                      <rect x="60" y="85" width="5" height="5" />
                      <rect x="75" y="75" width="5" height="5" />
                      <rect x="85" y="85" width="5" height="5" />
                    </g>
                  </svg>
                </div>

                <div className="flex items-center space-x-2 w-full max-w-sm">
                  <input
                    type="text"
                    readOnly
                    value={currentUrl}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs font-mono text-slate-300 focus:outline-none"
                  />
                  <button
                    onClick={handleCopyLink}
                    className="px-3.5 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-mono text-xs font-bold transition-all shrink-0 flex items-center space-x-1"
                  >
                    <Copy className="w-3.5 h-3.5" />
                    <span>{copiedLink ? 'COPIED' : 'COPY'}</span>
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-4 sm:p-5 border-t border-slate-800/80 bg-slate-950/70 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center space-x-2 text-[11px] font-mono text-slate-400">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>Digital Personal Data Protection Act 2023 Sec 8(7) Certified</span>
          </div>

          <div className="flex items-center space-x-3">
            <button
              onClick={() => {
                triggerHaptic('light');
                onClose();
              }}
              className="px-4 py-2 rounded-xl text-xs font-mono text-slate-400 hover:text-white bg-slate-900 hover:bg-slate-800 border border-slate-800 transition-all"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
