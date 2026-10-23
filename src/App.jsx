import React, { useState, useMemo, useEffect } from 'react';
import { Header } from './components/Header';
import { PipelineTwin } from './components/DigitalTwin/PipelineTwin';
import { BinarySearchTriage } from './components/DigitalTwin/BinarySearchTriage';
import { BengaluruGISMap } from './components/DigitalTwin/BengaluruGISMap';
import LayoutPipelineMap from './components/LayoutPipelineMap';
import { EVMEngine } from './components/EVMDiagnostics/EVMEngine';
import { TDoACorrelator } from './components/AcousticCorrelator/TDoACorrelator';
import { VoidScanner } from './components/SubsurfaceScanner/VoidScanner';
import SubsurfaceVisualizer3D from './components/SubsurfaceVisualizer3D';
import { TacticalReport } from './components/TelemetryReport/TacticalReport';
import { DpdpModal } from './components/Common/DpdpModal';
import { StartupBootSequence } from './components/Common/StartupBootSequence';
import { MobileBottomNav } from './components/Common/MobileBottomNav';
import { AppDownloadModal } from './components/Common/AppDownloadModal';
import LiveHardwareProbe from './components/LiveHardwareProbe';
import { INITIAL_STREETS } from './data/streetsData';
import { audioManager } from './utils/AudioContextManager';
import { triggerHaptic } from './utils/haptics';
import { 
  Radio, 
  MapPin, 
  GitBranch, 
  Layers, 
  AlertTriangle, 
  CheckCircle2, 
  Cpu, 
  Eye, 
  Volume2, 
  Box, 
  FileText,
  Sliders,
  Gauge,
  Activity,
  Waves,
  Zap,
  ArrowRight
} from 'lucide-react';

export default function App() {
  // Navigation: 'twin' | 'evm' | 'acoustic' | 'subterra' | 'report'
  const [activeTab, setActiveTab] = useState('twin');
  const [twinSubView, setTwinSubView] = useState('grid'); // 'grid' | 'triage' | 'gis' | 'layout'
  const [isSyntheticDemo, setIsSyntheticDemo] = useState(true);
  const [isDpdpModalOpen, setIsDpdpModalOpen] = useState(false);
  const [showLiveProbeDock, setShowLiveProbeDock] = useState(false);

  // Startup Animation & Mobile App Download Hub State
  const [showBootSequence, setShowBootSequence] = useState(true);
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
    triggerHaptic('light');
    setValveStates((prev) => ({
      ...prev,
      [`${streetId}-${valve}`]: !prev[`${streetId}-${valve}`]
    }));
  };

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
    <div className="min-h-screen bg-tactical-grid text-slate-100 font-sans flex flex-col selection:bg-cyan-500 selection:text-black">
      {/* Cinematic Startup Boot Sequence & Calibration */}
      {showBootSequence && (
        <StartupBootSequence onComplete={() => setShowBootSequence(false)} />
      )}

      {/* Sticky Modular Header */}
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
      />

      {/* Floating or Docked Live Hardware Probe (When in Live Sensors mode or manually triggered) */}
      {(!isSyntheticDemo || showLiveProbeDock) && (
        <div className="max-w-7xl mx-auto w-full px-4 pt-4">
          <div className="relative">
            <LiveHardwareProbe onLiveTelemetryUpdate={updateTelemetryField} />
            <button
              onClick={() => setShowLiveProbeDock(false)}
              className="absolute top-3 right-3 text-xs font-mono text-slate-400 hover:text-white px-2.5 py-1 rounded-lg bg-slate-800/80 border border-slate-700 hover:border-slate-500 transition-all"
            >
              ✕ Close Dock
            </button>
          </div>
        </div>
      )}

      {/* High-Tech Tactical Telemetry HUD Strip */}
      <section className="border-b border-slate-800/80 bg-slate-950/70 backdrop-blur-md px-4 py-3">
        <div className="max-w-7xl mx-auto grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {/* HUD Item 1: Active Street Feeder */}
          <div className="glass-panel p-2.5 rounded-xl flex items-center space-x-3">
            <div className="w-9 h-9 rounded-lg bg-cyan-500/15 border border-cyan-400/40 flex items-center justify-center shrink-0">
              <Radio className="w-4 h-4 text-cyan-400 animate-pulse" />
            </div>
            <div className="min-w-0 flex-1 font-mono">
              <div className="text-[10px] text-slate-400 uppercase tracking-wider flex items-center justify-between">
                <span>SECTOR TARGET</span>
                <span className="text-cyan-400 font-bold">STREET #{activeLeakStreetId}</span>
              </div>
              <div className="text-xs font-bold text-white truncate" title={currentStreet?.name}>
                {currentStreet?.name}
              </div>
            </div>
          </div>

          {/* HUD Item 2: Hydro Pressure Status */}
          <div className="glass-panel p-2.5 rounded-xl flex items-center space-x-3">
            <div className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${
              currentStreet?.pressure < 25 
                ? 'bg-red-500/15 border border-red-500/40 text-red-400' 
                : 'bg-emerald-500/15 border border-emerald-500/40 text-emerald-400'
            }`}>
              <Gauge className="w-4 h-4" />
            </div>
            <div className="min-w-0 flex-1 font-mono">
              <div className="text-[10px] text-slate-400 uppercase tracking-wider flex items-center justify-between">
                <span>LINE PRESSURE</span>
                <span className={currentStreet?.pressure < 25 ? 'text-red-400 font-bold' : 'text-emerald-400 font-bold'}>
                  {currentStreet?.pressure < 25 ? 'DROP DETECTED' : 'NORMAL'}
                </span>
              </div>
              <div className="text-xs font-bold text-white flex items-baseline gap-1">
                <span className={currentStreet?.pressure < 25 ? 'text-red-400' : 'text-emerald-400'}>
                  {currentStreet?.pressure} PSI
                </span>
                <span className="text-[10px] text-slate-400">({currentStreet?.material || 'DI'})</span>
              </div>
            </div>
          </div>

          {/* HUD Item 3: Acoustic TDoA Rupture Offset */}
          <div className="glass-panel p-2.5 rounded-xl flex items-center space-x-3">
            <div className="w-9 h-9 rounded-lg bg-sky-500/15 border border-sky-400/40 flex items-center justify-center shrink-0">
              <Volume2 className="w-4 h-4 text-sky-400" />
            </div>
            <div className="min-w-0 flex-1 font-mono">
              <div className="text-[10px] text-slate-400 uppercase tracking-wider flex items-center justify-between">
                <span>TDoA PINPOINT</span>
                <span className="text-sky-300 font-bold">{telemetry.correlationConfidence}% CONF</span>
              </div>
              <div className="text-xs font-bold text-sky-400">
                +{telemetry.distanceFromValveA}m <span className="text-[10px] text-slate-300 font-normal">from Valve A</span>
              </div>
            </div>
          </div>

          {/* HUD Item 4: SubTerra Cavity Hazard */}
          <div className="glass-panel p-2.5 rounded-xl flex items-center space-x-3">
            <div className="w-9 h-9 rounded-lg bg-amber-500/15 border border-amber-500/40 flex items-center justify-center shrink-0">
              <Box className="w-4 h-4 text-amber-400" />
            </div>
            <div className="min-w-0 flex-1 font-mono">
              <div className="text-[10px] text-slate-400 uppercase tracking-wider flex items-center justify-between">
                <span>SINKHOLE HAZARD</span>
                <span className="text-amber-400 font-bold">{telemetry.voidProbability}% CRIT</span>
              </div>
              <div className="text-xs font-bold text-amber-300">
                {telemetry.estimatedVoidRadiusMeters}m <span className="text-[10px] text-slate-300 font-normal">Void Radius</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 space-y-6 pb-24 md:pb-6">
        {/* TAB 1: 24-Street Digital Twin & Triage */}
        {activeTab === 'twin' && (
          <div className="space-y-5">
            {/* Sub-view selector tabs with modern pill styling */}
            <div className="glass-panel p-2 rounded-2xl flex flex-wrap items-center justify-between gap-3">
              <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
                <span className="text-[11px] font-mono text-slate-400 px-2 font-bold tracking-wider">
                  PERSPECTIVE:
                </span>
                
                <button
                  onClick={() => setTwinSubView('grid')}
                  className={`px-3.5 py-2 rounded-xl text-xs font-mono font-bold transition-all flex items-center gap-2 ${
                    twinSubView === 'grid'
                      ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-400/50 shadow-md shadow-cyan-500/20'
                      : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
                  }`}
                >
                  <Layers className="w-3.5 h-3.5" />
                  <span>Radial Pipeline Grid</span>
                </button>

                <button
                  onClick={() => setTwinSubView('triage')}
                  className={`px-3.5 py-2 rounded-xl text-xs font-mono font-bold transition-all flex items-center gap-2 ${
                    twinSubView === 'triage'
                      ? 'bg-amber-500/20 text-amber-300 border border-amber-400/50 shadow-md shadow-amber-500/20'
                      : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
                  }`}
                >
                  <GitBranch className="w-3.5 h-3.5" />
                  <span>O(log₂ 24) Binary Triage</span>
                </button>

                <button
                  onClick={() => setTwinSubView('gis')}
                  className={`px-3.5 py-2 rounded-xl text-xs font-mono font-bold transition-all flex items-center gap-2 ${
                    twinSubView === 'gis'
                      ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-400/50 shadow-md shadow-emerald-500/20'
                      : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
                  }`}
                >
                  <MapPin className="w-3.5 h-3.5" />
                  <span>Bengaluru Tactical GIS</span>
                </button>

                <button
                  onClick={() => setTwinSubView('layout')}
                  className={`px-3.5 py-2 rounded-xl text-xs font-mono font-bold transition-all flex items-center gap-2 ${
                    twinSubView === 'layout'
                      ? 'bg-purple-500/20 text-purple-300 border border-purple-400/50 shadow-md shadow-purple-500/20'
                      : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
                  }`}
                >
                  <Sliders className="w-3.5 h-3.5" />
                  <span>Gate-Valve Layout Map</span>
                </button>
              </div>

              <div className="flex items-center gap-2 pl-2">
                <button
                  onClick={() => setActiveTab('acoustic')}
                  className="btn-tactical-primary text-xs font-mono font-bold px-3.5 py-2 rounded-xl flex items-center gap-1.5"
                >
                  <Volume2 className="w-3.5 h-3.5" />
                  <span>Pinpoint via Acoustic TDoA</span>
                  <ArrowRight className="w-3 h-3" />
                </button>
              </div>
            </div>

            {/* Sub-view Content */}
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
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
                <div className="lg:col-span-7">
                  <BinarySearchTriage
                    streets={streets}
                    activeLeakStreetId={activeLeakStreetId}
                    onTriageRangeChange={setTriageRange}
                    onSelectLeakStreet={handleSelectLeakStreet}
                    onNavigateToAcoustic={() => setActiveTab('acoustic')}
                  />
                </div>
                <div className="lg:col-span-5">
                  <LayoutPipelineMap
                    totalStreets={24}
                    actualLeakStreet={activeLeakStreetId}
                    selectedStreet={activeLeakStreetId}
                    onSelectStreet={(st) => handleSelectLeakStreet(st)}
                  />
                </div>
              </div>
            )}

            {twinSubView === 'gis' && (
              <div className="glass-panel p-5 rounded-2xl space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-slate-800">
                  <div>
                    <h3 className="text-sm font-bold text-cyan-400 font-mono flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-cyan-400" />
                      NAMMA BENGALURU TACTICAL GIS WATER DISTRIBUTION LAYER
                    </h3>
                    <p className="text-xs text-slate-400 font-mono mt-0.5">
                      Indiranagar / CMH Road / 100ft Road Feeder Sub-Zone 7B
                    </p>
                  </div>
                  <span className="text-xs font-mono px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-700 text-slate-300">
                    Target: Street #{activeLeakStreetId} Geofence
                  </span>
                </div>
                <BengaluruGISMap
                  streets={streets}
                  activeLeakStreetId={activeLeakStreetId}
                  onSelectStreet={(st) => handleSelectLeakStreet(st.id)}
                  onNavigateToAcoustic={() => setActiveTab('acoustic')}
                />
              </div>
            )}

            {twinSubView === 'layout' && (
              <LayoutPipelineMap
                totalStreets={24}
                actualLeakStreet={activeLeakStreetId}
                selectedStreet={activeLeakStreetId}
                onSelectStreet={(st) => handleSelectLeakStreet(st)}
              />
            )}
          </div>
        )}

        {/* TAB 2: Module 1 Optical EVM Pump Diagnostics */}
        {activeTab === 'evm' && (
          <div className="space-y-5">
            <EVMEngine isSyntheticDemo={isSyntheticDemo} />
            <div className="flex justify-end pt-2">
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
        )}

        {/* TAB 3: Module 2 Acoustic Valve TDoA Correlator */}
        {activeTab === 'acoustic' && (
          <div className="space-y-5">
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
        )}

        {/* TAB 4: Module 3 SubTerra Sonar & 3D WebXR Subsurface Twin */}
        {activeTab === 'subterra' && (
          <div className="space-y-6">
            <VoidScanner
              isSyntheticDemo={isSyntheticDemo}
              leakPositionX={telemetry.distanceFromValveA}
              selectedStreet={currentStreet}
              onNavigateToReport={() => setActiveTab('report')}
            />

            {/* Interactive 3D WebXR Subsurface Canvas & Calibrator */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              <div className="lg:col-span-8">
                <SubsurfaceVisualizer3D
                  streetName={`Street #${activeLeakStreetId}: ${currentStreet?.name}`}
                  pipeLengthMeters={telemetry.pipeLengthMeters}
                  leakDistanceMeters={telemetry.distanceFromValveA}
                  voidRadiusMeters={telemetry.estimatedVoidRadiusMeters}
                  voidProbability={telemetry.voidProbability}
                />
              </div>

              <div className="lg:col-span-4 space-y-4">
                <div className="glass-panel p-5 rounded-2xl space-y-4">
                  <div className="text-xs font-mono uppercase text-sky-400 font-bold border-b border-slate-800 pb-2.5 flex items-center justify-between">
                    <span>🎛️ 3D Model Telemetry Calibrator</span>
                    <span className="text-[10px] text-slate-400">Interactive</span>
                  </div>

                  <div>
                    <div className="flex justify-between text-xs font-mono mb-1.5">
                      <span className="text-slate-300">Rupture Offset (Valve A):</span>
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
                      <span className="text-slate-300">Sinkhole Void Probability:</span>
                      <span className="text-amber-400 font-bold">
                        {telemetry.voidProbability}% ({telemetry.estimatedVoidRadiusMeters}m radius)
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

                  <div className="pt-3 border-t border-slate-800/80">
                    <button
                      onClick={() => setActiveTab('report')}
                      className="btn-tactical-warning w-full py-2.5 px-4 rounded-xl font-mono text-xs font-bold flex items-center justify-center gap-2"
                    >
                      <FileText className="w-4 h-4 text-slate-950" />
                      <span>Dispatch Civic Precision JCB Ticket</span>
                      <ArrowRight className="w-3.5 h-3.5 text-slate-950" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 5: Civic Tactical Field Report */}
        {activeTab === 'report' && (
          <div className="space-y-5">
            <TacticalReport
              selectedStreet={currentStreet}
              leakPositionX={telemetry.distanceFromValveA}
              isSyntheticDemo={isSyntheticDemo}
            />
          </div>
        )}
      </main>

      {/* DPDP Act 2023 Statutory Compliance Modal */}
      <DpdpModal
        isOpen={isDpdpModalOpen}
        onClose={() => setIsDpdpModalOpen(false)}
        onPurge={handlePurgeMemory}
        purgeAuditLog={auditLogs}
      />

      {/* Mobile-Native Thumb Bottom Navigation Bar */}
      <MobileBottomNav
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenDownloadModal={() => setIsDownloadModalOpen(true)}
        isInstallAvailable={!!deferredInstallPrompt}
      />

      {/* Mobile App Download & Store Packaging Hub Modal */}
      <AppDownloadModal
        isOpen={isDownloadModalOpen}
        onClose={() => setIsDownloadModalOpen(false)}
        installPromptEvent={deferredInstallPrompt}
        isInstalled={isAppInstalled}
      />
    </div>
  );
}