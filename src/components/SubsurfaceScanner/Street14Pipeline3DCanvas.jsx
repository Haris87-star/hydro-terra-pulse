import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { Rotate3d, Layers, Compass, ZoomIn, ZoomOut, Eye } from 'lucide-react';

/**
 * Three.js <Canvas> component that renders:
 * 1. A 3D wireframe cylinder for the Street 14 pipe (length: 85m, buried at -1.5m)
 * 2. A pulsing red sphere at distanceFromValveA
 * 3. An eroded amber sinkhole cavity mesh when void is present
 */
export const Street14Pipeline3DCanvas = ({
  streetName = 'Street 14 (14th Main Road, HAL 3rd Stage)',
  pipeLengthMeters = 85,
  distanceFromValveA = 28.5,
  isVoidPresent = true,
  voidRadiusMeters = 1.45,
  subsurfaceState = 'HOLLOW_SINKHOLE_VOID'
}) => {
  const canvasRef = useRef(null);
  const sceneRef = useRef(null);
  const rendererRef = useRef(null);
  const animFrameRef = useRef(null);

  // Layer & Display controls
  const [isWireframe, setIsWireframe] = useState(true);
  const [showRoadSurface, setShowRoadSurface] = useState(true);
  const [showVoidCavity, setShowVoidCavity] = useState(true);

  // Mesh references for animation updates
  const sphereLeakRef = useRef(null);
  const pipeCylinderRef = useRef(null);
  const voidCavityMeshRef = useRef(null);
  const waterSprayRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const width = canvas.parentElement?.clientWidth || 700;
    const height = 420;

    // 1. Scene, Camera, Renderer
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x050811);
    scene.fog = new THREE.FogExp2(0x050811, 0.035);
    sceneRef.current = scene;

    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
    camera.position.set(0, 6, 12);
    camera.lookAt(0, -1, 0);

    const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    rendererRef.current = renderer;

    // Lights
    const ambient = new THREE.AmbientLight(0xffffff, 0.65);
    scene.add(ambient);

    const cyanDir = new THREE.DirectionalLight(0x00f0ff, 1.2);
    cyanDir.position.set(5, 12, 6);
    scene.add(cyanDir);

    const redPoint = new THREE.PointLight(0xef4444, 3.0, 12);
    redPoint.position.set(0, -1.2, 0);
    scene.add(redPoint);

    // 2. Road Surface Asphalt Layer (Y = 0.0m)
    const roadGrid = new THREE.GridHelper(18, 36, 0x00f0ff, 0x1e293b);
    roadGrid.position.y = 0;
    scene.add(roadGrid);

    // Subgrade excavation bounding volume
    const subgradeGeo = new THREE.BoxGeometry(16, 3.2, 7);
    const subgradeMat = new THREE.MeshBasicMaterial({
      color: 0x1e293b,
      wireframe: true,
      transparent: true,
      opacity: 0.2
    });
    const subgradeMesh = new THREE.Mesh(subgradeGeo, subgradeMat);
    subgradeMesh.position.set(0, -1.6, 0);
    scene.add(subgradeMesh);

    // 3. Street 14 Pipe: 3D Wireframe Cylinder
    // Pipe length mapped visually to 14 Three.js scene units
    const visualLength = 14;
    const pipeRadius = 0.32;
    const pipeGeo = new THREE.CylinderGeometry(pipeRadius, pipeRadius, visualLength, 32, 20, false);
    // Orient cylinder horizontally along the X-axis
    pipeGeo.rotateZ(Math.PI / 2);

    const pipeMat = new THREE.MeshStandardMaterial({
      color: 0x06b6d4,
      emissive: 0x00f0ff,
      emissiveIntensity: 0.4,
      wireframe: isWireframe,
      roughness: 0.2,
      metalness: 0.8
    });
    const pipeCylinder = new THREE.Mesh(pipeGeo, pipeMat);
    pipeCylinder.position.set(0, -1.5, 0); // Buried -1.5m below surface
    scene.add(pipeCylinder);
    pipeCylinderRef.current = pipeCylinder;

    // Boundary Gate Valves: Valve A and Valve B collars
    const collarGeo = new THREE.TorusGeometry(pipeRadius * 1.35, 0.08, 16, 32);
    const collarMatA = new THREE.MeshStandardMaterial({ color: 0x10b981, emissive: 0x10b981, emissiveIntensity: 0.6 });
    const collarMatB = new THREE.MeshStandardMaterial({ color: 0xf59e0b, emissive: 0xf59e0b, emissiveIntensity: 0.6 });

    const valveAMesh = new THREE.Mesh(collarGeo, collarMatA);
    valveAMesh.position.set(-visualLength / 2, -1.5, 0);
    valveAMesh.rotateY(Math.PI / 2);
    scene.add(valveAMesh);

    const valveBMesh = new THREE.Mesh(collarGeo, collarMatB);
    valveBMesh.position.set(visualLength / 2, -1.5, 0);
    valveBMesh.rotateY(Math.PI / 2);
    scene.add(valveBMesh);

    // 4. Pulsing Red Sphere at distanceFromValveA
    // Mapping: distanceFromValveA in [0, pipeLengthMeters] -> X in [-visualLength/2, +visualLength/2]
    const clampedDist = Math.max(0, Math.min(pipeLengthMeters, distanceFromValveA));
    const normalizedFraction = clampedDist / (pipeLengthMeters || 85);
    const leakPosX = (-visualLength / 2) + (normalizedFraction * visualLength);

    const sphereGeo = new THREE.SphereGeometry(0.38, 24, 24);
    const sphereMat = new THREE.MeshStandardMaterial({
      color: 0xef4444,
      emissive: 0xef4444,
      emissiveIntensity: 1.4,
      wireframe: false,
      roughness: 0.1
    });
    const sphereLeak = new THREE.Mesh(sphereGeo, sphereMat);
    sphereLeak.position.set(leakPosX, -1.35, 0); // Directly seated on top of pipe wall
    scene.add(sphereLeak);
    sphereLeakRef.current = sphereLeak;
    redPoint.position.set(leakPosX, -1.2, 0);

    // Water Particle Spray
    const pCount = 90;
    const pPos = new Float32Array(pCount * 3);
    const pVel = [];

    for (let i = 0; i < pCount; i++) {
      pPos[i * 3] = leakPosX + (Math.random() - 0.5) * 0.15;
      pPos[i * 3 + 1] = -1.35;
      pPos[i * 3 + 2] = (Math.random() - 0.5) * 0.15;

      pVel.push({
        vx: (Math.random() - 0.5) * 0.03,
        vy: 0.02 + Math.random() * 0.04,
        vz: (Math.random() - 0.5) * 0.03
      });
    }

    const pGeo = new THREE.BufferGeometry();
    pGeo.setAttribute('position', new THREE.BufferAttribute(pPos, 3));
    const pMat = new THREE.PointsMaterial({
      color: 0x38bdf8,
      size: 0.06,
      transparent: true,
      opacity: 0.85
    });
    const pSystem = new THREE.Points(pGeo, pMat);
    scene.add(pSystem);
    waterSprayRef.current = { system: pSystem, positions: pPos, velocities: pVel, originX: leakPosX };

    // 5. Eroded Sinkhole Cavity Mesh (Amber Wireframe)
    const voidGeo = new THREE.IcosahedronGeometry(Math.max(0.8, voidRadiusMeters), 2);
    // Perturb vertices for organic cavern contours
    const vPos = voidGeo.attributes.position;
    for (let i = 0; i < vPos.count; i++) {
      const vx = vPos.getX(i);
      const vy = vPos.getY(i);
      const vz = vPos.getZ(i);
      const distortion = 1 + Math.sin(vx * 3.5) * 0.14 + Math.cos(vy * 3.2) * 0.12;
      vPos.setXYZ(i, vx * distortion, vy * (distortion * 0.8), vz * distortion);
    }
    voidGeo.computeVertexNormals();

    const voidMat = new THREE.MeshStandardMaterial({
      color: 0xf59e0b,
      emissive: 0xd97706,
      emissiveIntensity: 0.5,
      wireframe: true,
      transparent: true,
      opacity: 0.8
    });
    const voidMesh = new THREE.Mesh(voidGeo, voidMat);
    voidMesh.position.set(leakPosX, -0.9, 0); // Undermining road base directly above leak
    scene.add(voidMesh);
    voidCavityMeshRef.current = voidMesh;

    // Interactive Orbit Mouse Dragging
    let isMouseDown = false;
    let prevMouseX = 0;
    let prevMouseY = 0;
    let rotY = 0.35;
    let rotX = 0.32;
    let zoomDist = 11.5;

    const onMouseDown = (e) => {
      isMouseDown = true;
      prevMouseX = e.clientX;
      prevMouseY = e.clientY;
    };
    const onMouseMove = (e) => {
      if (!isMouseDown) return;
      const dx = e.clientX - prevMouseX;
      const dy = e.clientY - prevMouseY;
      rotY += dx * 0.007;
      rotX = Math.max(-0.2, Math.min(1.2, rotX + dy * 0.007));
      prevMouseX = e.clientX;
      prevMouseY = e.clientY;
    };
    const onMouseUp = () => { isMouseDown = false; };

    const onWheel = (e) => {
      zoomDist = Math.max(6, Math.min(22, zoomDist + e.deltaY * 0.01));
    };

    canvas.addEventListener('mousedown', onMouseDown);
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
    canvas.addEventListener('wheel', onWheel, { passive: true });

    // Animation Render Loop
    let clock = new THREE.Clock();

    const animate = () => {
      animFrameRef.current = requestAnimationFrame(animate);
      const time = clock.getElapsedTime();

      // Camera Orbit
      camera.position.x = zoomDist * Math.sin(rotY) * Math.cos(rotX);
      camera.position.y = zoomDist * Math.sin(rotX);
      camera.position.z = zoomDist * Math.cos(rotY) * Math.cos(rotX);
      camera.lookAt(0, -1, 0);

      // Pulsing Red Sphere Animation
      if (sphereLeakRef.current) {
        const pulse = 1 + Math.sin(time * 7) * 0.35;
        sphereLeakRef.current.scale.set(pulse, pulse, pulse);
      }

      // Water Spray Particles
      if (waterSprayRef.current) {
        const { system, positions, velocities, originX } = waterSprayRef.current;
        for (let i = 0; i < pCount; i++) {
          positions[i * 3] += velocities[i].vx;
          positions[i * 3 + 1] += velocities[i].vy;
          positions[i * 3 + 2] += velocities[i].vz;

          if (positions[i * 3 + 1] > -0.1) {
            positions[i * 3] = originX + (Math.random() - 0.5) * 0.12;
            positions[i * 3 + 1] = -1.35;
            positions[i * 3 + 2] = (Math.random() - 0.5) * 0.12;
          }
        }
        system.geometry.attributes.position.needsUpdate = true;
      }

      // Amber Void Mesh Breathing
      if (voidCavityMeshRef.current) {
        voidCavityMeshRef.current.visible = isVoidPresent && showVoidCavity;
        const breath = 1 + Math.sin(time * 2.2) * 0.04;
        voidCavityMeshRef.current.scale.set(breath, breath, breath);
      }

      roadGrid.visible = showRoadSurface;

      renderer.render(scene, camera);
    };

    animate();

    const handleResize = () => {
      if (!canvas.parentElement) return;
      const w = canvas.parentElement.clientWidth;
      camera.aspect = w / height;
      camera.updateProjectionMatrix();
      renderer.setSize(w, height);
    };
    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(animFrameRef.current);
      window.removeEventListener('resize', handleResize);
      canvas.removeEventListener('mousedown', onMouseDown);
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
      canvas.removeEventListener('wheel', onWheel);
      renderer.dispose();
    };
  }, [distanceFromValveA, pipeLengthMeters, isVoidPresent, isWireframe, showRoadSurface, showVoidCavity]);

  return (
    <div className="glass-panel hud-border rounded-2xl overflow-hidden shadow-2xl relative border-cyan-500/40">
      {/* HUD Header */}
      <div className="flex flex-wrap items-center justify-between gap-2 p-3.5 bg-slate-950/85 backdrop-blur-md border-b border-slate-700/60">
        <div className="flex items-center space-x-2.5">
          <Rotate3d className="w-4 h-4 text-cyan-400 animate-spin" />
          <span className="text-xs font-mono font-bold text-white tracking-wider flex items-center gap-1.5">
            THREE.JS &lt;CANVAS&gt; // <span className="text-cyan-300">{streetName.toUpperCase()}</span>
          </span>
        </div>

        <div className="flex flex-wrap items-center gap-2 text-xs font-mono">
          <button
            onClick={() => setShowRoadSurface(!showRoadSurface)}
            className={`px-3 py-1 rounded-lg border text-[10px] font-bold transition-all ${
              showRoadSurface ? 'bg-cyan-950/80 text-cyan-300 border-cyan-400 shadow-[0_0_8px_rgba(6,182,212,0.4)]' : 'bg-slate-900 text-slate-500 border-slate-800'
            }`}
          >
            ROAD GRID (0.0m)
          </button>
          <button
            onClick={() => setIsWireframe(!isWireframe)}
            className="px-3 py-1 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-700 text-[10px] font-bold transition-all"
          >
            {isWireframe ? 'WIREFRAME CYLINDER' : 'SOLID CYLINDER'}
          </button>
          <button
            onClick={() => setShowVoidCavity(!showVoidCavity)}
            className={`px-3 py-1 rounded-lg border text-[10px] font-bold transition-all ${
              showVoidCavity ? 'bg-amber-950/80 text-amber-300 border-amber-400 shadow-[0_0_8px_rgba(245,158,11,0.4)]' : 'bg-slate-900 text-slate-500 border-slate-800'
            }`}
          >
            AMBER SINKHOLE MESH
          </button>
        </div>
      </div>

      {/* Three.js <Canvas> Viewport */}
      <div className="relative">
        <canvas ref={canvasRef} className="w-full h-[420px] block cursor-grab active:cursor-grabbing bg-[#050811]" />

        {/* Tactical HUD Overlay with Exact Coordinates */}
        <div className="absolute top-4 left-4 bg-slate-950/85 backdrop-blur-md border border-cyan-500/40 p-3.5 rounded-2xl font-mono text-[11px] space-y-1.5 pointer-events-none shadow-2xl">
          <div className="text-cyan-400 font-bold flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 shadow-[0_0_8px_rgba(6,182,212,0.9)] animate-ping" />
            STREET 14 PIPELINE DIGITAL TWIN
          </div>
          <div className="text-slate-300">
            Cylinder: 3D Ductile Iron (L = {pipeLengthMeters}m • Ø 300mm)
          </div>
          <div className="text-rose-400 font-extrabold flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.9)] animate-pulse" />
            PULSING RED SPHERE: distanceFromValveA = {distanceFromValveA}m
          </div>
          <div className="text-slate-400 text-[10px]">
            Valve A: 0.0m (Green Collar) • Valve B: {pipeLengthMeters}m (Amber Collar)
          </div>
          {isVoidPresent ? (
            <div className="text-amber-400 font-bold text-[10px] pt-1 border-t border-slate-800">
              Sinkhole Cavity: Amber Mesh (Radius ~{voidRadiusMeters}m)
            </div>
          ) : (
            <div className="text-emerald-400 font-bold text-[10px] pt-1 border-t border-slate-800">
              Subgrade: Compacted Soil (No Cavity Detected)
            </div>
          )}
        </div>

        {/* Orbit instruction */}
        <div className="absolute bottom-4 right-4 bg-slate-950/85 backdrop-blur-md border border-slate-700/80 text-slate-300 font-mono text-[10px] px-3 py-1.5 rounded-xl pointer-events-none flex items-center gap-1.5 shadow-lg">
          <Compass className="w-3.5 h-3.5 text-cyan-400" />
          <span>Click & Drag to Orbit 3D Scene • Scroll to Zoom</span>
        </div>
      </div>
    </div>
  );
};
