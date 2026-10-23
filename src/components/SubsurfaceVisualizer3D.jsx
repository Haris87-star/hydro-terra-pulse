import React, { useRef, useState, useEffect, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Grid, Html, Line } from '@react-three/drei';
import * as THREE from 'three';

/**
 * 1. Underground Pipeline & Flow Particles
 */
function UndergroundPipe({ pipeLengthMeters = 60, leakDistanceMeters = 18.5 }) {
    // Map 60m real-world street pipe into a 12-unit 3D scene (-6 to +6 on X-axis)
    const sceneLength = 12;
    const leakX = -sceneLength / 2 + (leakDistanceMeters / pipeLengthMeters) * sceneLength;

    return (
        <group position={[0, -1.8, 0]}>
            {/* Outer Wireframe Pipe Casing (Cyan) */}
            <mesh rotation={[0, 0, Math.PI / 2]}>
                <cylinderGeometry args={[0.28, 0.28, sceneLength, 20, 16, true]} />
                <meshBasicMaterial color="#06b6d4" wireframe transparent opacity={0.55} />
            </mesh>

            {/* Inner Solid Core for Depth */}
            <mesh rotation={[0, 0, Math.PI / 2]}>
                <cylinderGeometry args={[0.22, 0.22, sceneLength, 16]} />
                <meshStandardMaterial color="#083344" roughness={0.4} metalness={0.8} transparent opacity={0.7} />
            </mesh>

            {/* Street Gate Valve A (Start of Street) */}
            <group position={[-sceneLength / 2, 0.9, 0]}>
                <mesh>
                    <cylinderGeometry args={[0.08, 0.08, 1.8, 12]} />
                    <meshStandardMaterial color="#38bdf8" wireframe />
                </mesh>
                <Html position={[0, 1.1, 0]} center>
                    <div className="bg-slate-900/90 border border-sky-500 text-sky-400 text-[10px] px-2 py-0.5 rounded font-mono whitespace-nowrap">
                        VALVE A (0.0m)
                    </div>
                </Html>
            </group>

            {/* Street Gate Valve B (End of Street) */}
            <group position={[sceneLength / 2, 0.9, 0]}>
                <mesh>
                    <cylinderGeometry args={[0.08, 0.08, 1.8, 12]} />
                    <meshStandardMaterial color="#38bdf8" wireframe />
                </mesh>
                <Html position={[0, 1.1, 0]} center>
                    <div className="bg-slate-900/90 border border-sky-500 text-sky-400 text-[10px] px-2 py-0.5 rounded font-mono whitespace-nowrap">
                        VALVE B ({pipeLengthMeters}.0m)
                    </div>
                </Html>
            </group>

            {/* Depth Indicator Line from Surface to Rupture Point */}
            <Line
                points={[
                    [leakX, 1.8, 0],
                    [leakX, 0, 0],
                ]}
                color="#ef4444"
                lineWidth={1.5}
                dashed
                dashSize={0.15}
                gapSize={0.1}
            />
        </group>
    );
}

/**
 * 2. Pulsing Red Rupture / Acoustic Leak Node + Eroded Sinkhole Void Mesh
 */
function LeakAndVoidAnomaly({
    pipeLengthMeters = 60,
    leakDistanceMeters = 18.5,
    voidRadiusMeters = 1.4,
    voidProbability = 78,
}) {
    const pulseRef = useRef();
    const voidMeshRef = useRef();

    const sceneLength = 12;
    const leakX = -sceneLength / 2 + (leakDistanceMeters / pipeLengthMeters) * sceneLength;
    const scaledVoidRadius = Math.max(0.5, voidRadiusMeters * 0.75);

    // Deform an icosahedron to look like an irregular underground soil erosion cavity
    const voidGeometry = useMemo(() => {
        const geo = new THREE.IcosahedronGeometry(scaledVoidRadius, 2);
        const pos = geo.attributes.position;
        for (let i = 0; i < pos.count; i++) {
            const vx = pos.getX(i);
            const vy = pos.getY(i);
            const vz = pos.getZ(i);
            // Organic noise distortion
            const noise = 1 + 0.22 * Math.sin(vx * 3) * Math.cos(vy * 2.5) * Math.sin(vz * 3);
            pos.setXYZ(i, vx * noise * 1.3, vy * noise * 0.65, vz * noise);
        }
        geo.computeVertexNormals();
        return geo;
    }, [scaledVoidRadius]);

    useFrame(({ clock }) => {
        const t = clock.getElapsedTime();
        if (pulseRef.current) {
            const scale = 1 + 0.35 * Math.sin(t * 6);
            pulseRef.current.scale.set(scale, scale, scale);
        }
        if (voidMeshRef.current) {
            voidMeshRef.current.rotation.y = Math.sin(t * 0.3) * 0.12;
        }
    });

    return (
        <group position={[leakX, -1.8, 0]}>
            {/* Core Rupture Point (Solid Red) */}
            <mesh>
                <sphereGeometry args={[0.24, 16, 16]} />
                <meshBasicMaterial color="#ef4444" />
            </mesh>

            {/* Expanding Acoustic Shockwave Ring */}
            <mesh ref={pulseRef}>
                <sphereGeometry args={[0.42, 16, 16]} />
                <meshBasicMaterial color="#f87171" wireframe transparent opacity={0.6} />
            </mesh>

            {/* SubTerra Eroded Sinkhole Void Mesh (Amber Wireframe above/around the pipe leak) */}
            {voidProbability > 50 && (
                <mesh ref={voidMeshRef} geometry={voidGeometry} position={[0, 0.55, 0]}>
                    <meshBasicMaterial color="#f59e0b" wireframe transparent opacity={0.48} />
                </mesh>
            )}

            {/* Floating Tactical Callout HUD */}
            <Html position={[0, 2.2, 0]} center>
                <div className="bg-slate-950/90 border border-red-500/80 text-slate-100 p-2.5 rounded-lg shadow-xl text-xs font-mono w-56 backdrop-blur-md">
                    <div className="flex items-center justify-between text-red-400 font-bold border-b border-slate-800 pb-1 mb-1">
                        <span>⚠️ RUPTURE + VOID</span>
                        <span>{voidProbability}% CONF</span>
                    </div>
                    <div className="space-y-0.5 text-[11px]">
                        <div>OFFSET: <span className="text-sky-400">+{leakDistanceMeters}m from Valve A</span></div>
                        <div>EXCAVATION DEPTH: <span className="text-amber-400">1.80m (Asphalt)</span></div>
                        <div>VOID RADIUS: <span className="text-amber-400">{voidRadiusMeters}m Cavity</span></div>
                    </div>
                </div>
            </Html>
        </group>
    );
}

/**
 * 3. Main Wrapper Component with Live Camera AR / X-Ray Overlay Toggle
 */
export default function SubsurfaceVisualizer3D({
    streetName = 'Street 14 Branch Line',
    pipeLengthMeters = 60,
    leakDistanceMeters = 18.5,
    voidRadiusMeters = 1.4,
    voidProbability = 84,
}) {
    const [arCameraActive, setArCameraActive] = useState(false);
    const videoRef = useRef(null);

    useEffect(() => {
        let stream = null;
        if (arCameraActive) {
            navigator.mediaDevices
                .getUserMedia({ video: { facingMode: 'environment' }, audio: false })
                .then((mediaStream) => {
                    stream = mediaStream;
                    if (videoRef.current) videoRef.current.srcObject = mediaStream;
                })
                .catch((err) => {
                    console.warn('Camera unavailable, staying in synthetic 3D grid mode:', err);
                    setArCameraActive(false);
                });
        } else if (videoRef.current && videoRef.current.srcObject) {
            videoRef.current.srcObject.getTracks().forEach((t) => t.stop());
        }
        return () => {
            if (stream) stream.getTracks().forEach((t) => t.stop());
        };
    }, [arCameraActive]);

    return (
        <div className="relative w-full h-[320px] sm:h-[460px] md:h-[520px] bg-[#030712] rounded-2xl overflow-hidden border border-slate-800/80 shadow-2xl hud-border">
            {/* Optional Live Smartphone Camera Background for X-Ray AR Effect */}
            {arCameraActive && (
                <video
                    ref={videoRef}
                    autoPlay
                    playsInline
                    muted
                    className="absolute inset-0 w-full h-full object-cover opacity-45"
                />
            )}

            {/* Top HUD Overlay */}
            <div className="absolute top-2.5 left-2.5 right-2.5 sm:top-3.5 sm:left-3.5 sm:right-3.5 z-10 flex flex-wrap items-center justify-between gap-2 pointer-events-none">
                <div className="glass-panel px-2.5 py-1.5 sm:px-3.5 sm:py-2 rounded-xl backdrop-blur-xl border border-white/10 pointer-events-auto">
                    <div className="text-[9px] sm:text-[10px] text-cyan-400 font-mono uppercase tracking-wider font-bold flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
                        SUBTERRA-VISION // 3D TWIN
                    </div>
                    <div className="text-xs sm:text-sm font-bold text-white font-['Plus_Jakarta_Sans',sans-serif] mt-0.5 truncate max-w-[200px] sm:max-w-none">{streetName}</div>
                </div>

                <div className="flex items-center gap-1.5 sm:gap-2 pointer-events-auto">
                    <span className="bg-emerald-950/80 border border-emerald-500/40 text-emerald-300 text-[9px] sm:text-[10px] font-mono px-2 py-1 sm:px-3 sm:py-1.5 rounded-xl font-bold hidden xs:inline">
                        VOLATILE RAM
                    </span>
                    <button
                        onClick={() => setArCameraActive(!arCameraActive)}
                        className={`px-2.5 py-1 sm:px-3.5 sm:py-1.5 rounded-xl text-[11px] sm:text-xs font-mono font-bold transition-all shadow-md ${arCameraActive
                                ? 'bg-red-600 hover:bg-red-500 text-white border border-red-400/50'
                                : 'btn-tactical-primary'
                            }`}
                    >
                        {arCameraActive ? 'Disable AR' : '📷 AR X-Ray'}
                    </button>
                </div>
            </div>

            {/* Three.js 3D WebGL Canvas */}
            <Canvas camera={{ position: [0, 2.2, 8.5], fov: 48 }}>
                <ambientLight intensity={0.9} />
                <pointLight position={[5, 8, 5]} intensity={1.5} />

                {/* Road Surface Reference Grid (Y = 0 represents Street Tar Level) */}
                <Grid
                    position={[0, 0, 0]}
                    args={[16, 10]}
                    cellSize={0.5}
                    cellThickness={0.6}
                    cellColor="#1e293b"
                    sectionSize={2}
                    sectionThickness={1.2}
                    sectionColor="#0ea5e9"
                    fadeDistance={20}
                    fadeStrength={1}
                />

                {/* Underground Pipe & Valves (Y = -1.8m below street surface) */}
                <UndergroundPipe
                    pipeLengthMeters={pipeLengthMeters}
                    leakDistanceMeters={leakDistanceMeters}
                />

                {/* Rupture Node & Hollow Sinkhole Void Mesh */}
                <LeakAndVoidAnomaly
                    pipeLengthMeters={pipeLengthMeters}
                    leakDistanceMeters={leakDistanceMeters}
                    voidRadiusMeters={voidRadiusMeters}
                    voidProbability={voidProbability}
                />

                <OrbitControls
                    enablePan={true}
                    enableZoom={true}
                    maxPolarAngle={Math.PI / 1.6}
                    minDistance={3}
                    maxDistance={16}
                />
            </Canvas>

            {/* Bottom Legend Bar */}
            <div className="absolute bottom-2 left-2 right-2 sm:bottom-3.5 sm:left-3.5 sm:right-3.5 z-10 flex flex-wrap items-center justify-between glass-panel px-2.5 py-1.5 sm:px-4 sm:py-2 rounded-xl text-[9px] sm:text-[11px] font-mono text-slate-300 gap-1.5">
                <div className="flex items-center gap-2.5 sm:gap-4 flex-wrap">
                    <span className="flex items-center gap-1">
                        <span className="w-2 h-2 sm:w-2.5 sm:h-2.5 rounded-full bg-cyan-400 inline-block shadow-[0_0_8px_rgba(6,182,212,0.8)]"></span>
                        Trunk (-1.8m)
                    </span>
                    <span className="flex items-center gap-1">
                        <span className="w-2 h-2 sm:w-2.5 sm:h-2.5 rounded-full bg-red-500 inline-block shadow-[0_0_8px_rgba(239,68,68,0.8)] animate-pulse"></span>
                        TDoA Rupture
                    </span>
                    <span className="flex items-center gap-1">
                        <span className="w-2 h-2 sm:w-2.5 sm:h-2.5 rounded-full bg-amber-400 inline-block shadow-[0_0_8px_rgba(245,158,11,0.8)]"></span>
                        Void Hazard
                    </span>
                </div>
                <div className="text-slate-400 hidden md:block">Orbit: Drag • Zoom: Scroll</div>
            </div>
        </div>
    );
}