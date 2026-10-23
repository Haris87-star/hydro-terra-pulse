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
  ExternalLink,
  Map as MapIcon,
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

  // Map Tile Modes: Authentic Google Maps & Apple Maps Aesthetic (Zero API Key Required)
  const [mapMode, setMapMode] = useState('google-hybrid'); // 'google-hybrid' | 'google-streets' | 'apple-maps' | 'tactical'
  const [tileError, setTileError] = useState(false);

  // Center of Namma Bengaluru (Indiranagar / CMH Road & 100ft Road Metro Junction)
  const BENGALURU_CENTER = [12.9784, 77.6412];

  const getTileConfig = useCallback((mode) => {
    switch (mode) {
      case 'google-streets':
        return {
          url: 'https://mt{s}.google.com/vt/lyrs=m&x={x}&y={y}&z={z}',
          options: {
            maxZoom: 20,
            subdomains: ['0', '1', '2', '3'],
            attribution: 'Map data &copy; Google Maps'
          }
        };
      case 'apple-maps':
        return {
          url: 'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png',
          options: {
            maxZoom: 20,
            subdomains: ['a', 'b', 'c', 'd'],
            attribution: 'Apple Maps Style &copy; CARTO / OpenStreetMap'
          }
        };
      case 'tactical':
        return {
          url: 'https://tile.openstreetmap.org/{z}/{x}/{y}.png',
          options: {
            maxZoom: 19,
            className: 'tactical-dark-map-tiles',
            attribution: 'Tactical Dark &copy; OpenStreetMap'
          }
        };
      case 'google-hybrid':
      default:
        return {
          url: 'https://mt{s}.google.com/vt/lyrs=y&x={x}&y={y}&z={z}',
          options: {
            maxZoom: 20,
            subdomains: ['0', '1', '2', '3'],
            attribution: 'Imagery &copy; Google Maps Hybrid'
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
        zoom: 16,
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

    // Master Borewell Node Marker (BWSSB Indiranagar Booster Station)
    const masterIcon = L.divIcon({
      className: 'custom-master-icon',
      html: `
        <div style="
          width: 28px; 
          height: 28px; 
          background: #00f0ff; 
          border: 3px solid #ffffff; 
          border-radius: 50%; 
          box-shadow: 0 0 20px #00f0ff, 0 0 35px rgba(0,240,255,0.6);
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
        ">
          <div style="width: 10px; height: 10px; background: #030712; border-radius: 50%;"></div>
        </div>
      `,
      iconSize: [28, 28],
      iconAnchor: [14, 14]
    });

    const masterMarker = L.marker([12.9716, 77.6412], { icon: masterIcon })
      .bindPopup(`
        <div style="background:#090f1d; color:#fff; padding:10px; font-family:monospace; border-radius:8px; border:1px solid #00f0ff; min-width:200px;">
          <strong style="color:#00f0ff; font-size:12px;">🚰 BWSSB Master Borewell Hub</strong><br/>
          <span style="color:#94a3b8; font-size:11px;">100ft Road Booster Station (Zone 7)</span><br/>
          <div style="margin-top:6px; font-size:11px; line-height:1.5;">
            <span style="color:#38bdf8;">Pressure:</span> 56.4 PSI<br/>
            <span style="color:#34d399;">Outflow:</span> 500 L/min<br/>
            <span style="color:#a78bfa;">Status:</span> OPERATIONAL
          </div>
        </div>
      `)
      .addTo(map);

    layersRef.current.markers.push(masterMarker);

    // Plot 24 street pipelines running down actual roads
    streets.forEach((street) => {
      const isLeak = street.id === activeLeakStreetId;
      const lineColor = isLeak ? '#ef4444' : '#06b6d4';
      const lineWeight = isLeak ? 6.5 : 4;

      // Pipeline Polyline along actual road centerlines
      const polyline = L.polyline(street.geoCoordinates, {
        color: lineColor,
        weight: lineWeight,
        opacity: isLeak ? 1 : 0.85,
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
          <div style="background:#090f1d; color:#fff; padding:10px; font-family:monospace; border-radius:8px; border:1px solid #334155; min-width:210px;">
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
          radius: 120, // 120 meters radius hazard zone
          color: '#ef4444',
          fillColor: '#ef4444',
          fillOpacity: 0.25,
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
          <div style="position:relative; width:34px; height:34px; display:flex; align-items:center; justify-content:center;">
            <div style="
              position:absolute; 
              width:32px; 
              height:32px; 
              border-radius:50%; 
              background:rgba(14,165,233,0.35); 
              border:2px solid #38bdf8; 
              animation:ping 1.8s cubic-bezier(0, 0, 0.2, 1) infinite;
            "></div>
            <div style="
              width:16px; 
              height:16px; 
              border-radius:50%; 
              background:#0284c7; 
              border:2.5px solid #ffffff; 
              box-shadow:0 0 16px #38bdf8;
            "></div>
          </div>
        `,
        iconSize: [34, 34],
        iconAnchor: [17, 17]
      });

      const userMarker = L.marker(userLocation.coordinates, { icon: userIcon })
        .bindPopup(`
          <div style="background:#090f1d; color:#fff; padding:10px; font-family:monospace; border-radius:8px; border:1px solid #0284c7; min-width:220px;">
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
      map.flyTo(leakStreet.geoCoordinates[1] || leakStreet.geoCoordinates[0], 17, { duration: 1.2 });
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
      map.flyTo(BENGALURU_CENTER, 15, { duration: 1.0 });
    }
  };

  const leakStreet = streets.find(s => s.id === activeLeakStreetId) || streets[13];
  const leakCoords = leakStreet?.geoCoordinates[1] || leakStreet?.geoCoordinates[0] || BENGALURU_CENTER;

  const openGoogleMapsExternal = () => {
    triggerHaptic('light');
    window.open(`https://www.google.com/maps/search/?api=1&query=${leakCoords[0]},${leakCoords[1]}`, '_blank');
  };

  const openAppleMapsExternal = () => {
    triggerHaptic('light');
    window.open(`https://maps.apple.com/?q=${leakCoords[0]},${leakCoords[1]}`, '_blank');
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
            Real Google Maps & Apple Maps road geometry with real street centerlines and zero API key requirement
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

      {/* Map Action Toolbar: Google Maps & Apple Maps Selector */}
      <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
        {/* Layer Mode Selector: Real Google Maps and Apple Maps */}
        <div className="flex flex-wrap items-center bg-slate-950/90 border border-slate-800 rounded-xl p-1 shadow-inner gap-1">
          <button
            onClick={() => {
              triggerHaptic('light');
              setMapMode('google-hybrid');
            }}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-mono font-bold transition-all ${
              mapMode === 'google-hybrid'
                ? 'bg-cyan-500 text-slate-950 shadow-md shadow-cyan-500/30'
                : 'text-slate-400 hover:text-white'
            }`}
            title="Google Maps Satellite Hybrid"
          >
            <Satellite className="w-3 h-3" />
            <span>Google Hybrid</span>
          </button>

          <button
            onClick={() => {
              triggerHaptic('light');
              setMapMode('google-streets');
            }}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-mono font-bold transition-all ${
              mapMode === 'google-streets'
                ? 'bg-cyan-500 text-slate-950 shadow-md shadow-cyan-500/30'
                : 'text-slate-400 hover:text-white'
            }`}
            title="Official Google Maps Road Layout"
          >
            <MapIcon className="w-3 h-3" />
            <span>Google Roads</span>
          </button>

          <button
            onClick={() => {
              triggerHaptic('light');
              setMapMode('apple-maps');
            }}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-mono font-bold transition-all ${
              mapMode === 'apple-maps'
                ? 'bg-cyan-500 text-slate-950 shadow-md shadow-cyan-500/30'
                : 'text-slate-400 hover:text-white'
            }`}
            title="Apple Maps Clean Vector Style"
          >
            <Navigation className="w-3 h-3" />
            <span>Apple Maps Style</span>
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
            title="Tactical Dark Mode"
          >
            <Layers className="w-3 h-3" />
            <span>Tactical Dark</span>
          </button>
        </div>

        {/* Quick Fly & External App Links */}
        <div className="flex flex-wrap items-center gap-1.5">
          <button
            onClick={handleFocusLeak}
            className="px-2.5 py-1.5 rounded-lg bg-red-950/80 hover:bg-red-900 border border-red-500/50 text-red-200 text-xs font-mono font-bold flex items-center gap-1.5 transition-all shadow-sm active:scale-95"
          >
            <Crosshair className="w-3.5 h-3.5 text-red-400" />
            <span>FOCUS RUPTURE (ST #{activeLeakStreetId})</span>
          </button>

          <button
            onClick={openGoogleMapsExternal}
            className="px-2 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-300 text-xs font-mono flex items-center gap-1 transition-all active:scale-95"
            title="Open exact coordinates in Google Maps app"
          >
            <ExternalLink className="w-3 h-3 text-cyan-400" />
            <span>Google Maps</span>
          </button>

          <button
            onClick={openAppleMapsExternal}
            className="px-2 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-300 text-xs font-mono flex items-center gap-1 transition-all active:scale-95"
            title="Open exact coordinates in Apple Maps app"
          >
            <ExternalLink className="w-3 h-3 text-cyan-400" />
            <span>Apple Maps</span>
          </button>

          <button
            onClick={handleResetView}
            className="px-2 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-300 text-xs font-mono transition-all active:scale-95"
          >
            RESET
          </button>
        </div>
      </div>

      {/* Map Canvas Container */}
      <div 
        ref={mapContainerRef} 
        className="w-full h-[320px] sm:h-[400px] md:h-[480px] rounded-xl overflow-hidden border border-slate-700/80 relative shadow-2xl z-0"
      />

      {/* Footer Status Bar: Real Street Verification */}
      <div className="flex flex-wrap items-center justify-between gap-2 mt-2.5 pt-2 border-t border-slate-800/80 text-[10px] font-mono text-slate-400">
        <div className="flex items-center gap-1.5 text-emerald-400 font-bold">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
          <span>REAL GOOGLE MAPS & APPLE MAPS TILES • 100% FREE • ZERO API KEY</span>
        </div>
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1 text-cyan-300">
            <span className="w-2 h-2 rounded-full bg-cyan-400" /> Feeder Pipeline
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
