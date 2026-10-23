import React, { useEffect, useRef, useState, useCallback } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { 
  MapPin, 
  Navigation, 
  AlertTriangle, 
  Layers, 
  Crosshair, 
  Satellite, 
  Compass, 
  ShieldCheck, 
  Radio, 
  Sliders, 
  Check, 
  RefreshCw 
} from 'lucide-react';
import { triggerHaptic } from '../../utils/haptics';

export const BengaluruGISMap = ({ 
  streets, 
  activeLeakStreetId, 
  onSelectStreet,
  onNavigateToAcoustic,
  onToggleValve,
  userLocation,
  onDetectLocation
}) => {
  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const tileLayerRef = useRef(null);
  const layersRef = useRef({ markers: [], lines: [], leakCircle: null, userMarker: null });

  // Map Tile Modes: Zero API Keys Required
  const [mapMode, setMapMode] = useState('satellite'); // 'tactical' | 'satellite' | 'street'
  const [tileError, setTileError] = useState(false);

  // Center of Namma Bengaluru (Indiranagar / CMH Road / 100ft Road pipeline corridor)
  const BENGALURU_CENTER = [12.9716, 77.6412];

  const getTileConfig = useCallback((mode) => {
    switch (mode) {
      case 'satellite':
        return {
          url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
          options: {
            maxZoom: 19,
            attribution: 'Esri World Imagery • Civic GIS (Zero API Key)'
          }
        };
      case 'street':
        return {
          url: 'https://tile.openstreetmap.org/{z}/{x}/{y}.png',
          options: {
            maxZoom: 19,
            attribution: 'OpenStreetMap Contributors (Zero API Key)'
          }
        };
      case 'tactical':
      default:
        return {
          url: 'https://tile.openstreetmap.org/{z}/{x}/{y}.png',
          options: {
            maxZoom: 19,
            className: 'tactical-dark-map-tiles',
            attribution: 'OpenStreetMap Dark Tactical (Zero API Key)'
          }
        };
    }
  }, []);

  // Initialize Map
  useEffect(() => {
    if (!mapContainerRef.current) return;

    if (!mapInstanceRef.current) {
      const initialCenter = (userLocation?.isLive && userLocation?.coordinates) 
        ? userLocation.coordinates 
        : BENGALURU_CENTER;

      const map = L.map(mapContainerRef.current, {
        center: initialCenter,
        zoom: 15,
        zoomControl: true,
        attributionControl: false
      });

      const config = getTileConfig(mapMode);
      const tileLayer = L.tileLayer(config.url, config.options);
      tileLayer.on('tileerror', () => setTileError(true));
      tileLayer.addTo(map);
      tileLayerRef.current = tileLayer;

      mapInstanceRef.current = map;
    }
  }, []);

  // Switch Tile Layer when mapMode changes
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    if (tileLayerRef.current) {
      map.removeLayer(tileLayerRef.current);
    }

    const config = getTileConfig(mapMode);
    const newLayer = L.tileLayer(config.url, config.options);
    newLayer.addTo(map);
    tileLayerRef.current = newLayer;
  }, [mapMode, getTileConfig]);

  // Update dynamic layers (Pipelines, Leak Circles, User Location Marker)
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    // Clear previous vector layers
    layersRef.current.markers.forEach(m => map.removeLayer(m));
    layersRef.current.lines.forEach(l => map.removeLayer(l));
    if (layersRef.current.leakCircle) map.removeLayer(layersRef.current.leakCircle);
    if (layersRef.current.userMarker) map.removeLayer(layersRef.current.userMarker);
    layersRef.current.markers = [];
    layersRef.current.lines = [];

    // Master Borewell Node Marker
    const masterIcon = L.divIcon({
      className: 'custom-master-icon',
      html: `
        <div style="
          width: 26px; 
          height: 26px; 
          background: #00f0ff; 
          border: 3px solid #ffffff; 
          border-radius: 50%; 
          box-shadow: 0 0 20px #00f0ff, 0 0 40px rgba(0,240,255,0.4);
          display: flex;
          align-items: center;
          justify-content: center;
        ">
          <div style="width: 8px; height: 8px; background: #030712; border-radius: 50%;"></div>
        </div>
      `,
      iconSize: [26, 26],
      iconAnchor: [13, 13]
    });

    const masterMarker = L.marker(BENGALURU_CENTER, { icon: masterIcon })
      .bindPopup(`
        <div style="background:#090f1d; color:#fff; padding:8px; font-family:monospace; border-radius:8px; border:1px solid #00f0ff; min-width:180px;">
          <strong style="color:#00f0ff; font-size:12px;">BWSSB Borewell Master Hub</strong><br/>
          <span style="color:#94a3b8; font-size:11px;">Stage IV Primary Booster Feeder</span><br/>
          <div style="margin-top:6px; font-size:11px;">
            <span style="color:#38bdf8;">Pressure:</span> 56.4 PSI<br/>
            <span style="color:#34d399;">Outflow:</span> 500 L/min<br/>
            <span style="color:#a78bfa;">Status:</span> OPERATIONAL
          </div>
        </div>
      `)
      .addTo(map);

    layersRef.current.markers.push(masterMarker);

    // Plot 24 street pipelines radiating across layout
    streets.forEach((street) => {
      const isLeak = street.id === activeLeakStreetId;
      const lineColor = isLeak ? '#ef4444' : '#06b6d4';
      const lineWeight = isLeak ? 6 : 3.5;

      // Pipeline Polyline
      const polyline = L.polyline(street.geoCoordinates, {
        color: lineColor,
        weight: lineWeight,
        opacity: isLeak ? 1 : 0.8,
        dashArray: isLeak ? '8, 8' : undefined
      }).addTo(map);

      polyline.on('click', () => {
        triggerHaptic('light');
        if (onSelectStreet) onSelectStreet(street);
      });

      layersRef.current.lines.push(polyline);

      // Valve A marker (Spindle contact tap)
      const valveAIcon = L.divIcon({
        className: 'valve-icon',
        html: `
          <div style="
            width: 14px; 
            height: 14px; 
            background: ${street.valveAOpen ? '#10b981' : '#ef4444'}; 
            border: 2px solid #ffffff; 
            border-radius: 50%;
            box-shadow: 0 0 10px ${street.valveAOpen ? '#10b981' : '#ef4444'};
            cursor: pointer;
          "></div>
        `,
        iconSize: [14, 14],
        iconAnchor: [7, 7]
      });

      const valveMarker = L.marker(street.geoCoordinates[0], { icon: valveAIcon })
        .bindPopup(`
          <div style="background:#090f1d; color:#fff; padding:8px; font-family:monospace; border-radius:8px; border:1px solid #334155; min-width:200px;">
            <strong style="color:${isLeak ? '#ef4444' : '#00f0ff'}; font-size:12px;">St #${street.id}: ${street.name}</strong><br/>
            <span style="color:#cbd5e1; font-size:10px;">Gate Valve A (Spindle Contact Tap)</span>
            <div style="margin-top:6px; font-size:11px; line-height:1.5;">
              Pressure: <strong style="color:${street.pressure < 25 ? '#ef4444' : '#34d399'};">${street.pressure} PSI</strong><br/>
              Status: <span style="color:${street.valveAOpen ? '#34d399' : '#ef4444'}; font-weight:bold;">${street.valveAOpen ? '● OPEN' : '✕ CLOSED (ISOLATED)'}</span><br/>
              Pipe: ${street.material} (${street.lengthMeters}m)
            </div>
            <div style="margin-top:8px; padding-top:6px; border-top:1px solid #1e293b; text-align:center;">
              <span style="font-size:10px; color:#38bdf8; font-weight:bold;">Tap branch card to toggle valve</span>
            </div>
          </div>
        `)
        .addTo(map);

      layersRef.current.markers.push(valveMarker);

      // Pulsing Hazard Geofence Circle on Leak Street
      if (isLeak && street.geoCoordinates.length > 0) {
        const leakCenter = street.geoCoordinates[Math.floor(street.geoCoordinates.length / 2)];
        const leakCircle = L.circle(leakCenter, {
          radius: 130, // 130 meters radius hazard zone
          color: '#ef4444',
          fillColor: '#ef4444',
          fillOpacity: 0.22,
          weight: 2.5,
          dashArray: '6, 6'
        }).addTo(map);

        layersRef.current.leakCircle = leakCircle;
      }
    });

    // Plot Live User GPS Location Marker if available
    if (userLocation?.isLive && userLocation?.coordinates) {
      const userIcon = L.divIcon({
        className: 'user-gps-pulse-icon',
        html: `
          <div style="position:relative; width:30px; height:30px; display:flex; align-items:center; justify-content:center;">
            <div style="
              position:absolute; 
              width:28px; 
              height:28px; 
              border-radius:50%; 
              background:rgba(14,165,233,0.35); 
              border:2px solid #38bdf8; 
              animation:ping 1.8s cubic-bezier(0, 0, 0.2, 1) infinite;
            "></div>
            <div style="
              width:14px; 
              height:14px; 
              border-radius:50%; 
              background:#0284c7; 
              border:2.5px solid #ffffff; 
              box-shadow:0 0 14px #38bdf8;
            "></div>
          </div>
        `,
        iconSize: [30, 30],
        iconAnchor: [15, 15]
      });

      const userMarker = L.marker(userLocation.coordinates, { icon: userIcon })
        .bindPopup(`
          <div style="background:#090f1d; color:#fff; padding:8px; font-family:monospace; border-radius:8px; border:1px solid #0284c7; min-width:210px;">
            <strong style="color:#38bdf8; font-size:12px;">📍 YOUR EXACT GPS POSITION</strong><br/>
            <span style="color:#94a3b8; font-size:10px;">${userLocation.locality}</span>
            <div style="margin-top:6px; font-size:11px; line-height:1.4;">
              Lat: ${userLocation.latitude.toFixed(5)}°N<br/>
              Lng: ${userLocation.longitude.toFixed(5)}°E<br/>
              Accuracy: ±${userLocation.accuracy} meters<br/>
              <span style="color:#34d399; font-weight:bold;">● Live Sensor Node Synced</span>
            </div>
          </div>
        `)
        .addTo(map);

      layersRef.current.userMarker = userMarker;
    }

  }, [streets, activeLeakStreetId, userLocation]);

  // Actions
  const handleFocusLeak = () => {
    triggerHaptic('medium');
    const map = mapInstanceRef.current;
    if (!map) return;

    const leakStreet = streets.find(s => s.id === activeLeakStreetId);
    if (leakStreet && leakStreet.geoCoordinates.length > 0) {
      map.flyTo(leakStreet.geoCoordinates[0], 17, { duration: 1.2 });
    }
  };

  const handleFocusUserLocation = () => {
    triggerHaptic('medium');
    if (onDetectLocation) onDetectLocation();
    
    const map = mapInstanceRef.current;
    if (map && userLocation?.coordinates) {
      map.flyTo(userLocation.coordinates, 17, { duration: 1.2 });
    }
  };

  const handleResetView = () => {
    triggerHaptic('light');
    const map = mapInstanceRef.current;
    if (map) {
      map.flyTo(BENGALURU_CENTER, 14, { duration: 1.0 });
    }
  };

  return (
    <div className="glass-panel hud-border rounded-2xl p-3 sm:p-5 shadow-2xl relative overflow-hidden border-cyan-500/40">
      <div className="absolute top-0 right-0 w-80 h-80 bg-cyan-500/5 rounded-full blur-3xl pointer-events-none" />

      {/* Top Header: Civic Layer & Real GPS Telemetry */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-3 mb-3 border-b border-slate-700/60 relative z-10">
        <div>
          <h3 className="text-xs sm:text-sm font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-sky-200 tracking-wide flex items-center gap-2">
            <Layers className="w-4 h-4 text-cyan-400" />
            NAMMA BENGALURU CIVIC GIS PIPELINE LAYER (BWSSB ZONE 7)
          </h3>
          <p className="text-[11px] font-mono text-slate-400 mt-0.5">
            Original geographic street map & satellite visualizer with zero external API key requirements
          </p>
        </div>

        {/* Live GPS Telemetry Chip */}
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-2 text-[10px] sm:text-xs font-mono bg-slate-950/80 border border-slate-800 px-3 py-1.5 rounded-xl shadow-inner">
            <span className={`w-2 h-2 rounded-full ${userLocation?.isLive ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'}`} />
            <span className="text-slate-300 truncate max-w-[170px] sm:max-w-none">
              {userLocation?.locality || 'Locating GPS...'}
            </span>
            {userLocation?.accuracy && (
              <span className="text-cyan-400 hidden xs:inline">±{userLocation.accuracy}m</span>
            )}
          </div>

          <button
            onClick={handleFocusUserLocation}
            className="p-1.5 sm:px-2.5 sm:py-1.5 rounded-xl bg-cyan-950/60 hover:bg-cyan-900/80 border border-cyan-500/50 text-cyan-300 text-xs font-mono flex items-center gap-1.5 transition-all shadow-sm active:scale-95"
            title="Detect and fly to your exact GPS coordinates"
          >
            <Compass className="w-3.5 h-3.5 text-cyan-400" />
            <span className="hidden sm:inline font-bold">LOCATE ME</span>
          </button>
        </div>
      </div>

      {/* Map Action Toolbar: Layer Switcher + Zoom Controls */}
      <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
        {/* Layer Mode Selector: 100% Free Zero-Key Tile Providers */}
        <div className="flex items-center bg-slate-950/90 border border-slate-800 rounded-xl p-1 shadow-inner">
          <button
            onClick={() => {
              triggerHaptic('light');
              setMapMode('satellite');
            }}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-mono font-bold transition-all ${
              mapMode === 'satellite'
                ? 'bg-cyan-500 text-slate-950 shadow-md shadow-cyan-500/30'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Satellite className="w-3 h-3" />
            <span>Satellite Photo</span>
          </button>

          <button
            onClick={() => {
              triggerHaptic('light');
              setMapMode('street');
            }}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-mono font-bold transition-all ${
              mapMode === 'street'
                ? 'bg-cyan-500 text-slate-950 shadow-md shadow-cyan-500/30'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Navigation className="w-3 h-3" />
            <span>Original Streets</span>
          </button>

          <button
            onClick={() => {
              triggerHaptic('light');
              setMapMode('tactical');
            }}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-mono font-bold transition-all ${
              mapMode === 'tactical'
                ? 'bg-cyan-500 text-slate-950 shadow-md shadow-cyan-500/30'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Layers className="w-3 h-3" />
            <span>Tactical Dark</span>
          </button>
        </div>

        {/* Quick Fly Controls */}
        <div className="flex items-center gap-2">
          <button
            onClick={handleFocusLeak}
            className="px-2.5 py-1.5 rounded-lg bg-red-950/80 hover:bg-red-900 border border-red-500/50 text-red-200 text-xs font-mono font-bold flex items-center gap-1.5 transition-all shadow-sm active:scale-95"
          >
            <Crosshair className="w-3.5 h-3.5 text-red-400" />
            <span>FOCUS RUPTURE (ST #{activeLeakStreetId})</span>
          </button>

          <button
            onClick={handleResetView}
            className="px-2.5 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-300 text-xs font-mono transition-all active:scale-95"
          >
            RESET
          </button>
        </div>
      </div>

      {/* Map Canvas Container */}
      <div 
        ref={mapContainerRef} 
        className="w-full h-[320px] sm:h-[400px] md:h-[470px] rounded-xl overflow-hidden border border-slate-700/80 relative shadow-2xl z-0"
      />

      {/* Footer Status Bar: Zero API Key Assurance */}
      <div className="flex flex-wrap items-center justify-between gap-2 mt-2.5 pt-2 border-t border-slate-800/80 text-[10px] font-mono text-slate-400">
        <div className="flex items-center gap-1.5 text-emerald-400 font-bold">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
          <span>ZERO API KEY REQUIRED • OPEN GIS & PUBLIC SATELLITE ENGINE</span>
        </div>
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1 text-cyan-300">
            <span className="w-2 h-2 rounded-full bg-cyan-400" /> Feeder
          </span>
          <span className="flex items-center gap-1 text-emerald-300">
            <span className="w-2 h-2 rounded-full bg-emerald-400" /> Valve Open
          </span>
          <span className="flex items-center gap-1 text-red-400">
            <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" /> Rupture Zone
          </span>
        </div>
      </div>
    </div>
  );
};
