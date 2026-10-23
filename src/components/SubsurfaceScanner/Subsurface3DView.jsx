import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { Layers, Eye, Maximize, Rotate3d, Compass } from 'lucide-react';

export const Subsurface3DView = ({ 
  leakPositionX = 28.5, 
  isVoidPresent = true,
  voidVolume = 3.8,
  voidDepth = 1.25
}) => {
  const mountRef = useRef(null);
  const sceneRef = useRef(null);
  const rendererRef = useRef(null);
  const animIdRef = useRef(null);

  // Layer toggles
  const [showRoadGrid, setShowRoadGrid] = useState(true);
  const [showPipe, setShowPipe] = useState(true);
  const [showVoid, setShowVoid] = useState(true);
  const [isWireframeOnly, setIsWireframeOnly] = useState(true);
  const [depthCutoff, setDepthCutoff] = useState(3.0);

  // Three.js dynamic objects
  const pipeMeshRef = useRef(null);
  const leakPointRef = useRef(null);
  const voidMeshRef = useRef(null);
  const particlesRef = useRef(null);

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    const width = container.clientWidth || 600;
    const height = 400;

    // 1. Scene, Camera, Renderer
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x050811);
    scene.fog = new THREE.FogExp2(0x050811, 0.04);
    sceneRef.current = scene;

    const camera = new THREE.PerspectiveCamera(50, width / height, 0.1, 100);
    camera.position.set(0, 5, 9);
    camera.lookAt(0, -0.8, 0);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    container.innerHTML = '';
    container.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // Ambient & Directional Lights
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    scene.add(ambientLight);

    const dirLight = new THREE.DirectionalLight(0x00f0ff, 1.2);
    dirLight.position.set(5, 10, 7);
    scene.add(dirLight);

    const redLight = new THREE.PointLight(0xef4444, 2.5, 10);
    redLight.position.set(0, -1.2, 0);
    scene.add(redLight);

    // 2. Road Surface Layer (Asphalt Ground Plane Wireframe)
    const roadGrid = new THREE.GridHelper(16, 32, 0x00f0ff, 0x1e293b);
    roadGrid.position.y = 0; // Surface level 0.0m
    scene.add(roadGrid);

    // Subsurface Stratification Bounding Box
    const boxGeo = new THREE.BoxGeometry(14, 3, 6);
    const boxMat = new THREE.MeshBasicMaterial({
      color: 0x1e293b,
      wireframe: true,
      transparent: true,
      opacity: 0.25
    });
    const subgradeBox = new THREE.Mesh(boxGeo, boxMat);
    subgradeBox.position.set(0, -1.5, 0);
    scene.add(subgradeBox);

    // 3. Underground Municipal Pipe in Neon Cyan
    // Cylinder oriented along X axis
    const pipeGeo = new THREE.CylinderGeometry(0.25, 0.25, 14, 24, 1, false);
    pipeGeo.rotateZ(Math.PI / 2); // align along X axis

    const pipeMat = new THREE.MeshStandardMaterial({
      color: 0x06b6d4,
      emissive: 0x00f0ff,
      emissiveIntensity: 0.45,
      wireframe: isWireframeOnly,
      roughness: 0.2,
      metalness: 0.8
    });
    const pipeMesh = new THREE.Mesh(pipeGeo, pipeMat);
    pipeMesh.position.set(0, -1.5, 0); // buried at -1.5 meters depth
    scene.add(pipeMesh);
    pipeMeshRef.current = pipeMesh;

    // 4. Ruptured Leak Point in Pulsing Glowing Red
    const leakGeo = new THREE.SphereGeometry(0.35, 16, 16);
    const leakMat = new THREE.MeshStandardMaterial({
      color: 0xef4444,
      emissive: 0xef4444,
      emissiveIntensity: 1.2,
      wireframe: false
    });
    const leakMesh = new THREE.Mesh(leakGeo, leakMat);
    leakMesh.position.set(0, -1.35, 0); // On pipe surface
    scene.add(leakMesh);
    leakPointRef.current = leakMesh;

    // Water Spray Particle System at Rupture Point
    const particleCount = 120;
    const particleGeo = new THREE.BufferGeometry();
    const particlePositions = new Float32Array(particleCount * 3);
    const particleVelocities = [];

    for (let i = 0; i < particleCount; i++) {
      particlePositions[i * 3] = (Math.random() - 0.5) * 0.2;
      particlePositions[i * 3 + 1] = -1.35;
      particlePositions[i * 3 + 2] = (Math.random() - 0.5) * 0.2;

      particleVelocities.push({
        vx: (Math.random() - 0.5) * 0.04,
        vy: 0.03 + Math.random() * 0.05,
        vz: (Math.random() - 0.5) * 0.04
      });
    }

    particleGeo.setAttribute('position', new THREE.BufferAttribute(particlePositions, 3));
    const particleMat = new THREE.PointsMaterial({
      color: 0x38bdf8,
      size: 0.06,
      transparent: true,
      opacity: 0.8
    });
    const particleSystem = new THREE.Points(particleGeo, particleMat);
    scene.add(particleSystem);
    particlesRef.current = { system: particleSystem, velocities: particleVelocities, positions: particlePositions };

    // 5. Eroded Sinkhole Cavity Mesh in Amber Wireframe
    // Organic distorted icosahedron representing subsurface void volume
    const voidGeo = new THREE.IcosahedronGeometry(1.4, 2);
    // Perturb vertices organically to look like an eroded soil cavity
    const posAttr = voidGeo.attributes.position;
    for (let i = 0; i < posAttr.count; i++) {
      const vx = posAttr.getX(i);
      const vy = posAttr.getY(i);
      const vz = posAttr.getZ(i);
      const noise = 1 + Math.sin(vx * 4) * 0.18 + Math.cos(vy * 3) * 0.15;
      posAttr.setXYZ(i, vx * noise, vy * (noise * 0.85), vz * noise);
    }
    voidGeo.computeVertexNormals();

    const voidMat = new THREE.MeshStandardMaterial({
      color: 0xf59e0b,
      emissive: 0xd97706,
      emissiveIntensity: 0.5,
      wireframe: true,
      transparent: true,
      opacity: 0.85
    });
    const voidMesh = new THREE.Mesh(voidGeo, voidMat);
    voidMesh.position.set(0, -0.9, 0); // Directly above leak rupture, undermining road base
    scene.add(voidMesh);
    voidMeshRef.current = voidMesh;

    // Interactive mouse rotation drag
    let isMouseDown = false;
    let prevMouseX = 0;
    let prevMouseY = 0;
    let rotY = 0.4;
    let rotX = 0.3;

    const onMouseDown = (e) => {
      isMouseDown = true;
      prevMouseX = e.clientX;
      prevMouseY = e.clientY;
    };

    const onMouseMove = (e) => {
      if (!isMouseDown) return;
      const deltaX = e.clientX - prevMouseX;
      const deltaY = e.clientY - prevMouseY;
      rotY += deltaX * 0.008;
      rotX = Math.max(-0.2, Math.min(1.2, rotX + deltaY * 0.008));
      prevMouseX = e.clientX;
      prevMouseY = e.clientY;
    };

    const onMouseUp = () => {
      isMouseDown = false;
    };

    const dom = renderer.domElement;
    dom.addEventListener('mousedown', onMouseDown);
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);

    // Render / Animation Loop
    let clock = new THREE.Clock();

    const animate = () => {
      animIdRef.current = requestAnimationFrame(animate);
      const time = clock.getElapsedTime();

      // Camera position from orbit rotations
      const radius = 8.5;
      camera.position.x = radius * Math.sin(rotY) * Math.cos(rotX);
      camera.position.y = radius * Math.sin(rotX);
      camera.position.z = radius * Math.cos(rotY) * Math.cos(rotX);
      camera.lookAt(0, -0.8, 0);

      // Pulsing glowing red leak rupture
      if (leakPointRef.current) {
        const pulse = 1 + Math.sin(time * 6) * 0.3;
        leakPointRef.current.scale.set(pulse, pulse, pulse);
      }

      // Animate water particles shooting from ruptured pipe
      if (particlesRef.current) {
        const { system, velocities, positions } = particlesRef.current;
        for (let i = 0; i < particleCount; i++) {
          positions[i * 3] += velocities[i].vx;
          positions[i * 3 + 1] += velocities[i].vy;
          positions[i * 3 + 2] += velocities[i].vz;

          // Reset particle if reaches top of void
          if (positions[i * 3 + 1] > -0.2) {
            positions[i * 3] = (Math.random() - 0.5) * 0.15;
            positions[i * 3 + 1] = -1.35;
            positions[i * 3 + 2] = (Math.random() - 0.5) * 0.15;
          }
        }
        system.geometry.attributes.position.needsUpdate = true;
      }

      // Animate amber void cavity mesh gentle breathing
      if (voidMeshRef.current) {
        voidMeshRef.current.visible = isVoidPresent && showVoid;
        const breath = 1 + Math.sin(time * 2) * 0.03;
        voidMeshRef.current.scale.set(breath, breath, breath);
      }

      if (pipeMeshRef.current) {
        pipeMeshRef.current.visible = showPipe;
      }

      roadGrid.visible = showRoadGrid;

      renderer.render(scene, camera);
    };

    animate();

    // Resize observer
    const handleResize = () => {
      if (!container) return;
      const w = container.clientWidth;
      camera.aspect = w / height;
      camera.updateProjectionMatrix();
      renderer.setSize(w, height);
    };
    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(animIdRef.current);
      window.removeEventListener('resize', handleResize);
      dom.removeEventListener('mousedown', onMouseDown);
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
      renderer.dispose();
    };
  }, [isVoidPresent, showRoadGrid, showPipe, showVoid, isWireframeOnly]);

  return (
    <div className="bg-[#070c18] border border-slate-800 rounded-xl overflow-hidden tactical-glass">
      {/* 3D Viewport Controls & HUD Header */}
      <div className="flex flex-wrap items-center justify-between gap-2 p-3 bg-slate-900/90 border-b border-slate-800">
        <div className="flex items-center space-x-2">
          <Rotate3d className="w-4 h-4 text-cyan-400" />
          <span className="text-xs font-mono font-bold text-white tracking-wider">
            THREE.JS / WEBXR SUBSURFACE 3D WIREFRAME
          </span>
        </div>

        <div className="flex flex-wrap items-center gap-2 text-xs font-mono">
          {/* Layer toggles */}
          <button
            onClick={() => setShowRoadGrid(!showRoadGrid)}
            className={`px-2 py-1 rounded border text-[10px] font-bold ${
              showRoadGrid ? 'bg-cyan-950 text-cyan-300 border-cyan-500' : 'bg-slate-800 text-slate-500 border-slate-700'
            }`}
          >
            ROAD GRID (0.0m)
          </button>
          <button
            onClick={() => setShowPipe(!showPipe)}
            className={`px-2 py-1 rounded border text-[10px] font-bold ${
              showPipe ? 'bg-cyan-950 text-cyan-300 border-cyan-500' : 'bg-slate-800 text-slate-500 border-slate-700'
            }`}
          >
            CYAN PIPE (-1.5m)
          </button>
          <button
            onClick={() => setShowVoid(!showVoid)}
            className={`px-2 py-1 rounded border text-[10px] font-bold ${
              showVoid ? 'bg-amber-950 text-amber-300 border-amber-500' : 'bg-slate-800 text-slate-500 border-slate-700'
            }`}
          >
            AMBER VOID CAVITY
          </button>
          <button
            onClick={() => setIsWireframeOnly(!isWireframeOnly)}
            className="px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 text-[10px]"
          >
            {isWireframeOnly ? 'WIREFRAME' : 'SHADED'}
          </button>
        </div>
      </div>

      {/* 3D Canvas Container */}
      <div className="relative">
        <div ref={mountRef} className="w-full h-[380px] cursor-grab active:cursor-grabbing" />

        {/* Tactical 3D HUD Overlay */}
        <div className="absolute top-3 left-3 bg-black/70 backdrop-blur-sm border border-slate-700/80 p-2.5 rounded-lg font-mono text-[10px] space-y-1 pointer-events-none">
          <div className="text-cyan-400 font-bold flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
            SUBSURFACE VOLUMETRIC SCAN
          </div>
          <div className="text-slate-300">Pipe Depth: -1.50m (Ductile Iron)</div>
          <div className="text-red-400 font-bold">Rupture: dA = {leakPositionX}m</div>
          {isVoidPresent ? (
            <div className="text-amber-400 font-bold">
              Cavity Volume: ~{voidVolume} m³ • Max Depth: {voidDepth}m
            </div>
          ) : (
            <div className="text-emerald-400 font-bold">Sub-base: Solid Compacted Soil</div>
          )}
        </div>

        {/* WebXR Simulator Badge */}
        <div className="absolute bottom-3 right-3 bg-cyan-950/80 border border-cyan-500/60 text-cyan-300 font-mono text-[10px] px-2.5 py-1 rounded-lg flex items-center gap-1.5 pointer-events-none">
          <Compass className="w-3.5 h-3.5 text-cyan-400 animate-spin" />
          <span>WebXR AR/VR Ground-Plane Ready</span>
        </div>
      </div>
    </div>
  );
};
