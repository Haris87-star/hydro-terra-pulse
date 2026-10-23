import React, { useEffect, useRef } from 'react';
import L from 'leaflet';
import { MapPin, Navigation, AlertTriangle, Layers } from 'lucide-react';

export const BengaluruGISMap = ({ 
  streets, 
  activeLeakStreetId, 
  onSelectStreet,
  onNavigateToAcoustic 
}) => {
  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const layersRef = useRef({ markers: [], lines: [], leakCircle: null });

  // Center of Namma Bengaluru (Indiranagar / CMH Road / 100ft Road pipeline corridor)
  const BENGALURU_CENTER = [12.9716, 77.6412];

  useEffect(() => {
    if (!mapContainerRef.current) return;

    // Initialize Leaflet map if not already created
    if (!mapInstanceRef.current) {
      const map = L.map(mapContainerRef.current, {
        center: BENGALURU_CENTER,
        zoom: 14,
        zoomControl: true,
        attributionControl: false
      });

      // Dark tactical CartoDB / OSM tiles
      L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
        maxZoom: 19,
        subdomains: 'abcd',
      }).addTo(map);

      mapInstanceRef.current = map;
    }

    const map = mapInstanceRef.current;

    // Clear previous dynamic layers
    layersRef.current.markers.forEach(m => map.removeLayer(m));
    layersRef.current.lines.forEach(l => map.removeLayer(l));
    if (layersRef.current.leakCircle) map.removeLayer(layersRef.current.leakCircle);
    layersRef.current.markers = [];
    layersRef.current.lines = [];

    // Borewell Master Node Marker (Indiranagar Water Supply Station)
    const masterIcon = L.divIcon({
      className: 'custom-master-icon',
      html: `
        <div style="
          width: 24px; 
          height: 24px; 
          background: #00f0ff; 
          border: 3px solid #ffffff; 
          border-radius: 50%; 
          box-shadow: 0 0 15px #00f0ff;
          display: flex;
          align-items: center;
          justify-content: center;
        ">
          <div style="width: 8px; height: 8px; background: #080c14; border-radius: 50%;"></div>
        </div>
      `,
      iconSize: [24, 24],
      iconAnchor: [12, 12]
    });

    const masterMarker = L.marker(BENGALURU_CENTER, { icon: masterIcon })
      .bindPopup(`
        <div style="background:#090f1d; color:#fff; padding:6px; font-family:monospace; border-radius:6px;">
          <strong style="color:#00f0ff;">BWSSB Borewell Master Node</strong><br/>
          Stage IV Indiranagar Feeder<br/>
          Head Pressure: 56.4 PSI
        </div>
      `)
      .addTo(map);

    layersRef.current.markers.push(masterMarker);

    // Plot 24 street pipelines radiating across Indiranagar & Koramangala
    streets.forEach((street) => {
      const isLeak = street.id === activeLeakStreetId;
      const lineColor = isLeak ? '#ef4444' : '#06b6d4';
      const lineWeight = isLeak ? 5 : 3;

      // Pipeline Polyline
      const polyline = L.polyline(street.geoCoordinates, {
        color: lineColor,
        weight: lineWeight,
        opacity: isLeak ? 1 : 0.75,
        dashArray: isLeak ? '6, 6' : undefined
      }).addTo(map);

      polyline.on('click', () => {
        onSelectStreet(street);
      });

      layersRef.current.lines.push(polyline);

      // Valve A marker (Start of street)
      const valveAIcon = L.divIcon({
        className: 'valve-icon',
        html: `
          <div style="
            width: 12px; 
            height: 12px; 
            background: ${street.valveAOpen ? '#10b981' : '#f59e0b'}; 
            border: 2px solid #000; 
            border-radius: 50%;
            cursor: pointer;
          "></div>
        `,
        iconSize: [12, 12],
        iconAnchor: [6, 6]
      });

      const valveMarker = L.marker(street.geoCoordinates[0], { icon: valveAIcon })
        .bindPopup(`
          <div style="background:#090f1d; color:#fff; padding:6px; font-family:monospace; border-radius:6px; font-size:11px;">
            <strong style="color:${isLeak ? '#ef4444' : '#00f0ff'};">St ${street.id}: ${street.name}</strong><br/>
            Valve A (Spindle Contact Tap)<br/>
            Pressure: ${street.pressure} PSI<br/>
            Material: ${street.material}<br/>
            Status: ${isLeak ? '⚠️ RUPTURE DETECTED' : '✅ NORMAL'}
          </div>
        `)
        .addTo(map);

      layersRef.current.markers.push(valveMarker);

      // If active leak street, add pulsing hazard geofence circle
      if (isLeak) {
        const leakCenter = street.geoCoordinates[Math.floor(street.geoCoordinates.length / 2)];
        const leakCircle = L.circle(leakCenter, {
          radius: 120, // 120 meters radius hazard zone
          color: '#ef4444',
          fillColor: '#ef4444',
          fillOpacity: 0.18,
          weight: 2,
          dashArray: '4, 4'
        }).addTo(map);

        layersRef.current.leakCircle = leakCircle;
      }
    });

  }, [streets, activeLeakStreetId]);

  return (
    <div className="glass-panel hud-border rounded-2xl p-6 shadow-2xl relative overflow-hidden border-cyan-500/40">
      <div className="absolute top-0 right-0 w-80 h-80 bg-cyan-500/5 rounded-full blur-3xl pointer-events-none" />

      <div className="flex flex-wrap items-center justify-between gap-3 pb-4 mb-4 border-b border-slate-700/60 relative z-10">
        <div>
          <h3 className="text-sm font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-sky-200 tracking-wide flex items-center gap-2">
            <Layers className="w-4 h-4 text-cyan-400" />
            NAMMA BENGALURU CIVIC GIS PIPELINE LAYER (BWSSB ZONE 7)
          </h3>
          <p className="text-xs font-mono text-slate-400 mt-0.5">
            Real-time geospatial layout of 24 street pipelines, valve spindles, and geofenced rupture zones
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3 text-xs font-mono bg-slate-950/80 border border-slate-800 px-3.5 py-1.5 rounded-xl shadow-inner">
          <span className="flex items-center gap-1.5 text-cyan-300">
            <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 shadow-[0_0_6px_rgba(6,182,212,0.8)]" /> Feeder
          </span>
          <span className="flex items-center gap-1.5 text-emerald-300">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 shadow-[0_0_6px_rgba(16,185,129,0.8)]" /> Valve Open
          </span>
          <span className="flex items-center gap-1.5 text-rose-300">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-500 shadow-[0_0_6px_rgba(244,63,94,0.8)] animate-pulse" /> Rupture Zone
          </span>
        </div>
      </div>

      {/* Map Container */}
      <div 
        ref={mapContainerRef} 
        className="w-full h-[420px] rounded-xl overflow-hidden border border-slate-700/80 relative shadow-2xl z-0"
      />
    </div>
  );
};
