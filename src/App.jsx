import React, { useState, useMemo, useEffect, lazy, Suspense } from 'react';
import { Header } from './components/Header';
import { PipelineTwin } from './components/DigitalTwin/PipelineTwin';
import { StartupBootSequence } from './components/Common/StartupBootSequence';
import { MobileBottomNav } from './components/Common/MobileBottomNav';
import { INITIAL_STREETS } from './data/streetsData';
import { audioManager } from './utils/AudioContextManager';
import { triggerHaptic } from './utils/haptics';
import { useGeolocation } from './hooks/useGeolocation';
import { AutonomousSentinelBanner } from './components/Common/AutonomousSentinelBanner';
import { 
  Radio, 
  MapPin, 
  Layers, 
  Gauge, 
  Volume2, 
  Box, 
  FileText,
  ArrowRight
} from 'lucide-react';

// Lazy-loaded heavy modules for instantaneous smartphone first-load & 15x faster startup
const BinarySearchTriage = lazy(() => import('./components/DigitalTwin/BinarySearchTriage').then(m => ({ default: m.BinarySearchTriage })));
const BengaluruGISMap = lazy(() => import('./components/DigitalTwin/BengaluruGISMap').then(m => ({ default: m.BengaluruGISMap })));
const LayoutPipelineMap = lazy(() => import('./components/LayoutPipelineMap'));
const EVMEngine = lazy(() => import('./components/EVMDiagnostics/EVMEngine').then(m => ({ default: m.EVMEngine })));
const TDoACorrelator = lazy(() => import('./components/AcousticCorrelator/TDoACorrelator').then(m => ({ default: m.TDoACorrelator })));
const VoidScanner = lazy(() => import('./components/SubsurfaceScanner/VoidScanner').then(m => ({ default: m.VoidScanner })));
const SubsurfaceVisualizer3D = lazy(() => import('./components/SubsurfaceVisualizer3D'));
const TacticalReport = lazy(() => import('./components/TelemetryReport/TacticalReport').then(m => ({ default: m.TacticalReport })));
const DpdpModal = lazy(() => import('./components/Common/DpdpModal').then(m => ({ default: m.DpdpModal })));
const AppDownloadModal = lazy(() => import('./components/Common/AppDownloadModal').then(m => ({ default: m.AppDownloadModal })));
const LiveHardwareProbe = lazy(() => import('./components/LiveHardwareProbe'));

// Ultra-fast lightweight loading fallback for sub-views
const LoadingTelemetryFallback = () => (
  <div className="flex flex-col items-center justify-center p-8 sm:p-12 glass-panel rounded-2xl border border-cyan-500/20 text-center space-y-3 min-h-[220px]">
    <div className="w-8 h-8 rounded-xl border-2 border-dashed border-cyan-400 animate-spin flex items-center justify-center shadow-lg shadow-cyan-400/20" />
    <div className="text-xs font-mono text-cyan-300 font-bold tracking-wider">
      INITIALIZING TELEMETRY VIEW...
    </div>
    <div className="text-[10px] font-mono text-slate-500">
      Zero-persistence DSP buffers mounting
    </div>
  </div>
);

export default function App() {
  // Navigation: 'twin' | 'evm' | 'acoustic' | 'subterra' | 'report'
  const [activeTab, setActiveTab] = useState('twin');
  const [twinSubView, setTwinSubView] = useState('grid'); // 'grid' | 'triage' | 'gis' | 'layout'
  const [isSyntheticDemo, setIsSyntheticDemo] = useState(true);
  const [isDpdpModalOpen, setIsDpdpModalOpen] = useState(false);
  const [showLiveProbeDock, setShowLiveProbeDock] = useState(false);

  // Live High-Accuracy Smartphone & Browser Geolocation
  const userLocation = useGeolocation();

  // Startup Animation State: Fast initial launch & remembers session
  const [showBootSequence, setShowBootSequence] = useState(() => {
    try {
      return !localStorage.getItem('terrapulse_boot_seen');
    } catch {
      return false;
    }
  });

  const [isDownloadModalOpen, setIsDownloadModalOpen] = useState(false);
  const [deferredInstallPrompt, setDeferredInstallPrompt] = useState(null);
  const [isAppInstalled, setIsAppInstalled] = useState(false);

  // PWA Install Event Listener for Instant Smartphone Installation
  useEffect(() => {
    const handleBeforeInstallPrompt = (e) => {
      e.preventDefault();
      setDeferredInstallPrompt(e);
    };

    const handleAppInstalled = () => {
      setIsAppInstalled(true);
      setDeferredInstallPrompt(null);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  // 24-Street State & Leak Pinpointing
  const [streets, setStreets] = useState(() => {
    return INITIAL_STREETS.map((st) => ({
      ...st,
      isDepressurized: st.id === 14,
      pressure: st.id === 14 ? 18 : st.pressure
    }));
  });
  const [activeLeakStreetId, setActiveLeakStreetId] = useState(14);
  const [triageRange, setTriageRange] = useState([1, 24]);
  const [valveStates, setValveStates] = useState({});

  // Audit Log for DPDP Act 2023 Sec 8(7) compliance
  const [auditLogs, setAuditLogs] = useState([
    {
      id: 1,
      timestamp: new Date().toLocaleTimeString(),
      event: 'Session initialized in ephemeral memory (TypedArray ring buffers active).'
    }
  ]);

  // Unified Diagnostics Telemetry
  const [telemetry, setTelemetry] = useState({
    cavitationIndex: 78.4,
    distanceFromValveA: 28.5,
    distanceFromValveB: 56.5,
    pipeLengthMeters: 85,
    correlationConfidence: 96.4,
    voidProbability: 82,
    estimatedVoidRadiusMeters: 1.48,
    timeDelayMs: -19.2,
    spectralResonanceRatio: 3.42,
    subsurfaceState: 'HOLLOW_SINKHOLE_VOID'
  });

  // Currently selected street object
  const currentStreet = useMemo(() => {
    return streets.find((s) => s.id === activeLeakStreetId) || streets[13];
  }, [streets, activeLeakStreetId]);

  const updateTelemetryField = (field, value) => {
    setTelemetry((prev) => ({
      ...prev,
      [field]: typeof value === 'number' ? value : Number(value) || value
    }));
  };

  const handleSelectLeakStreet = (streetId) => {
    triggerHaptic('medium');
    setActiveLeakStreetId(streetId);
    setStreets((prev) =>
      prev.map((s) => ({
        ...s,
        isDepressurized: s.id === streetId,
        pressure: s.id === streetId ? 18 : 52
      }))
    );
  };

  const handleToggleValve = (streetId, valve) => {
    triggerHaptic('medium');
    setStreets((prev) =>
      prev.map((s) => {
        if (s.id !== streetId) return s;
        const key = valve === 'valveA' ? 'valveAOpen' : 'valveBOpen';
        const updatedValveStatus = !s[key];
        
        // If either valve is closed, the branch isolates and pressure drops to 0 PSI
        // If both valves are open, restore normal (or leak pressure 18 PSI on rupture street)
        const isValveAOpen = valve === 'valveA' ? updatedValveStatus : s.valveAOpen;
        const isValveBOpen = valve === 'valveB' ? updatedValveStatus : s.valveBOpen;

        let newPressure;
        if (!isValveAOpen || !isValveBOpen) {
          newPressure = 0; // Isolated/depressurized
        } else {
          newPressure = s.id === activeLeakStreetId ? 18 : 52;
        }

        return {
          ...s,
          [key]: updatedValveStatus,
          pressure: newPressure,
          isDepressurized: newPressure < 25
        };
      })
    );
    setValveStates((prev) => ({
      ...prev,
      [`${streetId}-${valve}`]: !prev[`${streetId}-${valve}`]
    }));
  };

  // Autonomous Valve Isolation: Instantly isolate rupture node without manual hunting
  const handleAutoIsolateValves = () => {
    triggerHaptic('success');
    setStreets((prev) =>
      prev.map((s) => {
        if (s.id !== activeLeakStreetId) return s;
        return {
          ...s,
          valveAOpen: false,
          valveBOpen: false,
          pressure: 0,
          isDepressurized: true
        };
      })
    );
    setValveStates((prev) => ({
      ...prev,
      [`${activeLeakStreetId}-valveA`]: true,
      [`${activeLeakStreetId}-valveB`]: true
    }));
  };

  const isRuptureIsolated = useMemo(() => {
    const leakSt = streets.find((s) => s.id === activeLeakStreetId);
    return leakSt ? (!leakSt.valveAOpen && !leakSt.valveBOpen) : false;
  }, [streets, activeLeakStreetId]);

  // DPDP Purge Handler
  const handlePurgeMemory = () => {
    triggerHaptic('heavy');
    const purgeResult = audioManager.purgeVolatileMemory();
    const newLog = {
      id: auditLogs.length + 1,
      timestamp: new Date().toLocaleTimeString(),
      event: `Zeroing Purge: ${purgeResult.bytesWiped} bytes erased in volatile memory under DPDP Act Sec 8(7).`
    };
    setAuditLogs((prev) => [newLog, ...prev]);
  };

  return (
    <div className="min-h-[100dvh] w-full bg-tactical-grid text-slate-100 font-sans flex flex-col selection:bg-cyan-500 selection:text-black overflow-x-hidden">
      {/* Fast Cinematic Startup Boot Sequence */}
      {showBootSequence && (
        <StartupBootSequence onComplete={() => setShowBootSequence(false)} />
      )}

      {/* Responsive Modular Header */}
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        isSyntheticDemo={isSyntheticDemo}
        setIsSyntheticDemo={(val) => {
          setIsSyntheticDemo(val);
          if (!val) setShowLiveProbeDock(true);
        }}
        onPurgeMemory={handlePurgeMemory}
        onOpenDpdpModal={() => setIsDpdpModalOpen(true)}
        onOpenDownloadModal={() => setIsDownloadModalOpen(true)}
        onReplayBootSequence={() => setShowBootSequence(true)}
        userLocation={userLocation}
      />

      {/* Autonomous AI Leak Sentinel: Continuously monitors and detects leaks automatically */}
      <AutonomousSentinelBanner
        streets={streets}
        activeLeakStreetId={activeLeakStreetId}
        currentStreet={currentStreet}
        onAutoIsolate={handleAutoIsolateValves}
        onNavigateToMap={() => {
          setActiveTab('twin');
          setTwinSubView('gis');
        }}
        isAutoIsolated={isRuptureIsolated}
      />

      {/* Floating or Docked Live Hardware Probe */}
      {(!isSyntheticDemo || showLiveProbeDock) && (
        <div className="max-w-7xl mx-auto w-full px-3 sm:px-4 pt-3">
          <div className="relative">
            <Suspense fallback={<LoadingTelemetryFallback />}>
              <LiveHardwareProbe onLiveTelemetryUpdate={updateTelemetryField} />
            </Suspense>
            <button
              onClick={() => setShowLiveProbeDock(false)}
              className="absolute top-3 right-3 text-xs font-mono text-slate-400 hover:text-white px-2.5 py-1 rounded-lg bg-slate-800/80 border border-slate-700 hover:border-slate-500 transition-all"
            >
              ✕ Close Dock
            </button>
          </div>
        </div>
      )}

      {/* Mobile-Proportioned High-Tech Tactical Telemetry HUD Strip */}
      <section className="border-b border-slate-800/80 bg-slate-950/70 backdrop-blur-md px-2.5 sm:px-4 py-2 sm:py-2.5">
        <div className="max-w-7xl mx-auto grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-3">
          {/* HUD Item 1: Active Street Feeder */}
          <div className="glass-panel p-2 sm:p-2.5 rounded-xl flex items-center space-x-2 sm:space-x-3">
            <div className="w-7 h-7 sm:w-9 sm:h-9 rounded-lg bg-cyan-500/15 border border-cyan-400/40 flex items-center justify-center shrink-0">
              <Radio className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-cyan-400 animate-pulse" />
            </div>
            <div className="min-w-0 flex-1 font-mono">
              <div className="text-[9px] sm:text-[10px] text-slate-400 uppercase tracking-wider flex items-center justify-between">
                <span>SECTOR TARGET</span>
                <span className="text-cyan-400 font-bold">ST #{activeLeakStreetId}</span>
              </div>
              <div className="text-[11px] sm:text-xs font-bold text-white truncate" title={currentStreet?.name}>
                {currentStreet?.name}
              </div>
            </div>
          </div>

          {/* HUD Item 2: Hydro Pressure Status */}
          <div className="glass-panel p-2 sm:p-2.5 rounded-xl flex items-center space-x-2 sm:space-x-3">
            <div className={`w-7 h-7 sm:w-9 sm:h-9 rounded-lg flex items-center justify-center shrink-0 ${
              currentStreet?.pressure < 25 
                ? 'bg-red-500/15 border border-red-500/40 text-red-400' 
                : 'bg-emerald-500/15 border border-emerald-500/40 text-emerald-400'
            }`}>
              <Gauge className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            </div>
            <div className="min-w-0 flex-1 font-mono">
              <div className="text-[9px] sm:text-[10px] text-slate-400 uppercase tracking-wider flex items-center justify-between">
                <span>PRESSURE</span>
                <span className={currentStreet?.pressure < 25 ? 'text-red-400 font-bold' : 'text-emerald-400 font-bold'}>
                  {currentStreet?.pressure < 25 ? 'DROP DETECTED' : 'NORMAL'}
                </span>
              </div>
              <div className="text-[11px] sm:text-xs font-bold text-white flex items-baseline gap-1">
                <span className={currentStreet?.pressure < 25 ? 'text-red-400' : 'text-emerald-400'}>
                  {currentStreet?.pressure} PSI
                </span>
                <span className="text-[9px] sm:text-[10px] text-slate-400">({currentStreet?.material || 'DI'})</span>
              </div>
            </div>
          </div>

          {/* HUD Item 3: Acoustic TDoA Rupture Offset */}
          <div className="glass-panel p-2 sm:p-2.5 rounded-xl flex items-center space-x-2 sm:space-x-3">
            <div className="w-7 h-7 sm:w-9 sm:h-9 rounded-lg bg-sky-500/15 border border-sky-400/40 flex items-center justify-center shrink-0">
              <Volume2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-sky-400" />
            </div>
            <div className="min-w-0 flex-1 font-mono">
              <div className="text-[9px] sm:text-[10px] text-slate-400 uppercase tracking-wider flex items-center justify-between">
                <span>TDoA PINPOINT</span>
                <span className="text-sky-300 font-bold">{telemetry.correlationConfidence}% CONF</span>
              </div>
              <div className="text-[11px] sm:text-xs font-bold text-sky-400">
                +{telemetry.distanceFromValveA}m <span className="text-[9px] sm:text-[10px] text-slate-300 font-normal">from Valve A</span>
              </div>
            </div>
          </div>

          {/* HUD Item 4: SubTerra Cavity Hazard */}
          <div className="glass-panel p-2 sm:p-2.5 rounded-xl flex items-center space-x-2 sm:space-x-3">
            <div className="w-7 h-7 sm:w-9 sm:h-9 rounded-lg bg-amber-500/15 border border-amber-500/40 flex items-center justify-center shrink-0">
              <Box className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-amber-400" />
            </div>
            <div className="min-w-0 flex-1 font-mono">
              <div className="text-[9px] sm:text-[10px] text-slate-400 uppercase tracking-wider flex items-center justify-between">
                <span>SINKHOLE HAZARD</span>
                <span className="text-amber-400 font-bold">{telemetry.voidProbability}% CRIT</span>
              </div>
              <div className="text-[11px] sm:text-xs font-bold text-amber-300">
                {telemetry.estimatedVoidRadiusMeters}m <span className="text-[9px] sm:text-[10px] text-slate-300 font-normal">Radius</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content Area: Responsive Padding for All Screens */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-2.5 sm:p-5 md:p-6 space-y-4 sm:space-y-6 pb-24 md:pb-6">
        {/* TAB 1: 24-Street Digital Twin & Triage */}
        {activeTab === 'twin' && (
          <div className="space-y-4 sm:space-y-5">
            {/* Sub-view selector tabs with modern scrollable pill styling */}
            <div className="glass-panel p-1.5 sm:p-2 rounded-2xl flex items-center overflow-x-auto no-scrollbar scroll-smooth">
              <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
                <span className="text-[10px] sm:text-[11px] font-mono text-slate-400 px-1 sm:px-2 font-bold tracking-wider shrink-0">
                  VIEW:
                </span>
                
                <button
                  onClick={() => setTwinSubView('grid')}
                  className={`px-3 sm:px-3.5 py-1.5 sm:py-2 rounded-xl text-[11px] sm:text-xs font-mono font-bold transition-all flex items-center gap-1.5 whitespace-nowrap shrink-0 active:scale-95 ${
                    twinSubView === 'grid'
                      ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-400/50 shadow-md shadow-cyan-500/20'
                      : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
                  }`}
                >
                  <Layers className="w-3.5 h-3.5" />
                  <span>Radial Grid</span>
                </button>

                <button
                  onClick={() => setTwinSubView('triage')}
                  className={`px-3 sm:px-3.5 py-1.5 sm:py-2 rounded-xl text-[11px] sm:text-xs font-mono font-bold transition-all flex items-center gap-1.5 whitespace-nowrap shrink-0 active:scale-95 ${
                    twinSubView === 'triage'
                      ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-400/50 shadow-md shadow-cyan-500/20'
                      : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
                  }`}
                >
                  <span>Binary Triage (5 Taps)</span>
                </button>

                <button
                  onClick={() => setTwinSubView('gis')}
                  className={`px-3 sm:px-3.5 py-1.5 sm:py-2 rounded-xl text-[11px] sm:text-xs font-mono font-bold transition-all flex items-center gap-1.5 whitespace-nowrap shrink-0 active:scale-95 ${
                    twinSubView === 'gis'
                      ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-400/50 shadow-md shadow-cyan-500/20'
                      : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
                  }`}
                >
                  <MapPin className="w-3.5 h-3.5" />
                  <span>Namma Bengaluru GIS</span>
                </button>

                <button
                  onClick={() => setTwinSubView('layout')}
                  className={`px-3 sm:px-3.5 py-1.5 sm:py-2 rounded-xl text-[11px] sm:text-xs font-mono font-bold transition-all flex items-center gap-1.5 whitespace-nowrap shrink-0 active:scale-95 ${
                    twinSubView === 'layout'
                      ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-400/50 shadow-md shadow-cyan-500/20'
                      : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
                  }`}
                >
                  <span>Pipeline Network</span>
                </button>
              </div>
            </div>

            {/* Sub-views with instant rendering & lazy loading */}
            {twinSubView === 'grid' && (
              <PipelineTwin
                streets={streets}
                activeLeakStreetId={activeLeakStreetId}
                setActiveLeakStreetId={handleSelectLeakStreet}
                triageRange={triageRange}
                onNavigateToAcoustic={() => setActiveTab('acoustic')}
                valveStates={valveStates}
                onToggleValve={handleToggleValve}
              />
            )}

            {twinSubView === 'triage' && (
              <Suspense fallback={<LoadingTelemetryFallback />}>
                <div className="space-y-4">
                  <BinarySearchTriage
                    streets={streets}
                    activeLeakStreetId={activeLeakStreetId}
                    actualLeakStreetId={activeLeakStreetId}
                    triageRange={triageRange}
                    setTriageRange={setTriageRange}
                    onTriageRangeChange={setTriageRange}
                    onLeakPinpointed={(streetId) => {
                      handleSelectLeakStreet(streetId);
                    }}
                    onSelectLeakStreet={(streetId) => {
                      handleSelectLeakStreet(streetId);
                    }}
                    onNavigateToAcoustic={() => setActiveTab('acoustic')}
                  />
                  <div className="glass-panel p-3 sm:p-5 rounded-2xl">
                    <LayoutPipelineMap
                      totalStreets={24}
                      actualLeakStreet={activeLeakStreetId}
                      selectedStreet={activeLeakStreetId}
                      onSelectStreet={(st) => handleSelectLeakStreet(st)}
                    />
                  </div>
                </div>
              </Suspense>
            )}

            {twinSubView === 'gis' && (
              <Suspense fallback={<LoadingTelemetryFallback />}>
                <div className="glass-panel p-3.5 sm:p-5 rounded-2xl space-y-3 sm:space-y-4">
                  <div className="flex flex-wrap items-center justify-between gap-2 pb-2.5 border-b border-slate-800">
                    <div>
                      <h3 className="text-xs sm:text-sm font-bold text-cyan-400 font-mono flex items-center gap-2">
                        <MapPin className="w-4 h-4 text-cyan-400" />
                        NAMMA BENGALURU GIS WATER DISTRIBUTION LAYER
                      </h3>
                      <p className="text-[11px] text-slate-400 font-mono mt-0.5">
                        Indiranagar Feeder Sub-Zone 7B
                      </p>
                    </div>
                    <span className="text-[10px] sm:text-xs font-mono px-2 py-0.5 rounded-lg bg-slate-900 border border-slate-700 text-slate-300">
                      Target: St #{activeLeakStreetId}
                    </span>
                  </div>
                  <BengaluruGISMap
                    streets={streets}
                    activeLeakStreetId={activeLeakStreetId}
                    onSelectStreet={(st) => handleSelectLeakStreet(st.id)}
                    onNavigateToAcoustic={() => setActiveTab('acoustic')}
                    onToggleValve={handleToggleValve}
                    userLocation={userLocation}
                    onDetectLocation={userLocation.detectLocation}
                  />
                </div>
              </Suspense>
            )}

            {twinSubView === 'layout' && (
              <Suspense fallback={<LoadingTelemetryFallback />}>
                <LayoutPipelineMap
                  totalStreets={24}
                  actualLeakStreet={activeLeakStreetId}
                  selectedStreet={activeLeakStreetId}
                  onSelectStreet={(st) => handleSelectLeakStreet(st)}
                />
              </Suspense>
            )}
          </div>
        )}

        {/* TAB 2: Module 1 Optical EVM Pump Diagnostics */}
        {activeTab === 'evm' && (
          <Suspense fallback={<LoadingTelemetryFallback />}>
            <div className="space-y-4 sm:space-y-5">
              <EVMEngine isSyntheticDemo={isSyntheticDemo} />
              <div className="flex justify-end pt-1">
                <button
                  onClick={() => setActiveTab('acoustic')}
                  className="btn-tactical-primary font-mono text-xs font-bold px-4 py-2.5 rounded-xl flex items-center gap-2"
                >
                  <span>Proceed to Module 2: Acoustic Valve TDoA</span>
                  <Volume2 className="w-4 h-4" />
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </Suspense>
        )}

        {/* TAB 3: Module 2 Acoustic Valve TDoA Correlator */}
        {activeTab === 'acoustic' && (
          <Suspense fallback={<LoadingTelemetryFallback />}>
            <div className="space-y-4 sm:space-y-5">
              <TDoACorrelator
                isSyntheticDemo={isSyntheticDemo}
                selectedStreet={currentStreet}
                onNavigateToSubterra={() => setActiveTab('subterra')}
                onLeakCalculated={(res) => {
                  if (res?.distanceFromValveA) {
                    updateTelemetryField('distanceFromValveA', res.distanceFromValveA);
                    updateTelemetryField('distanceFromValveB', res.distanceFromValveB);
                    updateTelemetryField('correlationConfidence', res.correlationConfidence);
                    updateTelemetryField('timeDelayMs', res.timeDelayMs);
                  }
                }}
              />
            </div>
          </Suspense>
        )}

        {/* TAB 4: Module 3 SubTerra Sonar & 3D WebXR Subsurface Twin */}
        {activeTab === 'subterra' && (
          <Suspense fallback={<LoadingTelemetryFallback />}>
            <div className="space-y-4 sm:space-y-6">
              <VoidScanner
                isSyntheticDemo={isSyntheticDemo}
                leakPositionX={telemetry.distanceFromValveA}
                selectedStreet={currentStreet}
                onNavigateToReport={() => setActiveTab('report')}
              />

              {/* Interactive 3D WebXR Subsurface Canvas & Calibrator */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-6">
                <div className="lg:col-span-8">
                  <SubsurfaceVisualizer3D
                    streetName={`Street #${activeLeakStreetId}: ${currentStreet?.name}`}
                    pipeLengthMeters={telemetry.pipeLengthMeters}
                    leakDistanceMeters={telemetry.distanceFromValveA}
                    voidRadiusMeters={telemetry.estimatedVoidRadiusMeters}
                    voidProbability={telemetry.voidProbability}
                  />
                </div>

                <div className="lg:col-span-4 space-y-3 sm:space-y-4">
                  <div className="glass-panel p-4 sm:p-5 rounded-2xl space-y-3 sm:space-y-4">
                    <div className="text-xs font-mono uppercase text-sky-400 font-bold border-b border-slate-800 pb-2 flex items-center justify-between">
                      <span>🎛️ 3D Model Telemetry Calibrator</span>
                      <span className="text-[10px] text-slate-400">Interactive</span>
                    </div>

                    <div>
                      <div className="flex justify-between text-xs font-mono mb-1.5">
                        <span className="text-slate-300">Rupture Offset:</span>
                        <span className="text-cyan-400 font-bold">{telemetry.distanceFromValveA}m / {telemetry.pipeLengthMeters}m</span>
                      </div>
                      <input
                        type="range"
                        min="2"
                        max={telemetry.pipeLengthMeters - 2}
                        step="0.5"
                        value={telemetry.distanceFromValveA}
                        onChange={(e) => updateTelemetryField('distanceFromValveA', e.target.value)}
                        className="w-full accent-sky-500 cursor-pointer"
                      />
                    </div>

                    <div>
                      <div className="flex justify-between text-xs font-mono mb-1.5">
                        <span className="text-slate-300">Sinkhole Hazard:</span>
                        <span className="text-amber-400 font-bold">
                          {telemetry.voidProbability}% ({telemetry.estimatedVoidRadiusMeters}m)
                        </span>
                      </div>
                      <input
                        type="range"
                        min="10"
                        max="98"
                        step="1"
                        value={telemetry.voidProbability}
                        onChange={(e) => {
                          const prob = Number(e.target.value);
                          updateTelemetryField('voidProbability', prob);
                          updateTelemetryField(
                            'estimatedVoidRadiusMeters',
                            Number((prob * 0.018).toFixed(2))
                          );
                        }}
                        className="w-full accent-amber-500 cursor-pointer"
                      />
                    </div>

                    <div className="pt-2 border-t border-slate-800/80">
                      <button
                        onClick={() => setActiveTab('report')}
                        className="btn-tactical-warning w-full py-2.5 px-3 rounded-xl font-mono text-xs font-bold flex items-center justify-center gap-2"
                      >
                        <FileText className="w-4 h-4 text-slate-950" />
                        <span>Dispatch Civic JCB Ticket</span>
                        <ArrowRight className="w-3.5 h-3.5 text-slate-950" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </Suspense>
        )}

        {/* TAB 5: Civic Tactical Field Report */}
        {activeTab === 'report' && (
          <Suspense fallback={<LoadingTelemetryFallback />}>
            <div className="space-y-4 sm:space-y-5">
              <TacticalReport
                selectedStreet={currentStreet}
                leakPositionX={telemetry.distanceFromValveA}
                isSyntheticDemo={isSyntheticDemo}
              />
            </div>
          </Suspense>
        )}
      </main>

      {/* DPDP Act 2023 Statutory Compliance Modal */}
      <Suspense fallback={null}>
        <DpdpModal
          isOpen={isDpdpModalOpen}
          onClose={() => setIsDpdpModalOpen(false)}
          onPurge={handlePurgeMemory}
          purgeAuditLog={auditLogs}
        />
      </Suspense>

      {/* Mobile-Native Thumb Bottom Navigation Bar */}
      <MobileBottomNav
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenDownloadModal={() => setIsDownloadModalOpen(true)}
        isInstallAvailable={!!deferredInstallPrompt}
      />

      {/* Mobile App Download & Store Packaging Hub Modal */}
      <Suspense fallback={null}>
        <AppDownloadModal
          isOpen={isDownloadModalOpen}
          onClose={() => setIsDownloadModalOpen(false)}
          installPromptEvent={deferredInstallPrompt}
          isInstalled={isAppInstalled}
        />
      </Suspense>
    </div>
  );
}