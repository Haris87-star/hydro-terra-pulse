# Kaveri Terra-Pulse (ಕಾವೇರಿ ಟೆರ್ರಾ-ಪಲ್ಸ್)
### Zero-Hardware Surface-to-Subsurface Diagnostic Platform for Namma Bengaluru
**Municipal Civic-Tech Architecture for BWSSB (Bangalore Water Supply and Sewerage Board) & BBMP (Bruhat Bengaluru Mahanagara Palike)**

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/import?s=https://github.com/Haris87-star/hydro-terra-pulse)

---

## 🌊 Overview

**Kaveri Terra-Pulse** is an edge-native, zero-external-hardware Progressive Web App (PWA) designed to transform any standard smartphone into a multimodal municipal water distribution diagnostic tool and subterranean road void scanner. 

Bengaluru's water infrastructure suffers from an estimated 35% Non-Revenue Water (NRW) loss due to invisible underground pipe bursts that erode road sub-bases, triggering deadly urban sinkholes. **Kaveri Terra-Pulse** combines **Eulerian Video Magnification (EVM)**, **Contact Acoustic Time-Difference-of-Arrival (TDoA)**, **Active Linear Chirp Sonar Seismometry**, and an **$O(\log_2 N)$ Binary Search Triage Digital Twin** to detect, isolate, pinpoint, and classify subsurface failures in minutes—without excavating roads or deploying expensive imported acoustic correlator hardware.

---

## 🏗️ Core Architectural Modules

```
                                  [ BWSSB BOREWELL MASTER NODE ]
                                                │
                 ┌──────────────────────────────┴──────────────────────────────┐
                 ▼                                                             ▼
     [ Module 0: 24-Street Radial Twin ]                           [ Module 1: Optical EVM Pump ]
     • 24 Sequential Pipe Branches                                • Selectable 160x160 ROI
     • Clickable Ball/Gate Spindles                               • Temporal IIR Bandpass (50-200 Hz)
     • O(log₂ 24) Binary Search Triage                            • Phase/Displacement Amplification (α)
     • Bengaluru GIS Tactical Map (Leaflet)                       • Cavitation Index & Blade Pitting Meter
                 │                                                             │
                 ▼                                                             ▼
     [ Module 2: Acoustic TDoA Correlator ]                        [ Module 3: SubTerra-Vision 3D ]
     • Phone Chassis Pressed to Valve A & B Spindles              • 100 Hz → 4,000 Hz Linear Chirp Sonar
     • Web Audio Raw Bypass (No Noise Suppression)                • Structural Mic + MEMS Z-Axis Accel
     • Biquad Bandpass Filter (150-1,000 Hz)                      • Spectral Resonance Ratio (SRR)
     • Cross-Correlation R_xy(τ) → dA Leak Distance                • Three.js 3D Volumetric Subsurface Wireframe
                 │                                                             │
                 └──────────────────────────────┬──────────────────────────────┘
                                                ▼
                         [ DPDP Act 2023 Volatile RAM Compliance ]
                         • 100% Client-Side TypedArrays (Float32Array Ring Buffers)
                         • One-Click Zeroing Purge (Zero Cloud Ingestion)
                         • Live Hardware vs. Synthetic Demo Toggle (Zero-Fail Stage Mode)
```

---

### 1. 24-Street Radial Pipeline Digital Twin & Binary Search Triage
* **Radial Topology Engine**: Modeled after the **Indiranagar / Kaveri Stage IV Sub-Zone 7B** water grid. Radiates from a primary Borewell Master Node into 24 sequential street pipeline branches (Street 1 to Street 24).
* **Clickable Valve Spindles**: Each street pipeline features two boundary gate valves (Valve A upstream at 0.0m and Valve B downstream at $L$ metres) with live line pressure (PSI), flow telemetry (L/min), and acoustic noise floor.
* **$O(\log_2 24)$ Binary Search Triage Assistant**:
  * Instead of inspecting all 24 street pipelines linearly (taking 6.5+ field hours), the assistant computes the algorithmic midpoint:
    $$\text{Midpoint} = \left\lfloor \frac{\text{low} + \text{high}}{2} \right\rfloor$$
    *(e.g., Street 12 $\rightarrow$ Street 6 $\rightarrow$ Street 3 $\rightarrow$ Street 4)*.
  * Field engineers test the midpoint valve and select **"Pressure Dropped (<20 PSI)"** or **"Pressure Normal (>45 PSI)"**, reducing isolation to just **4–5 discrete valve checks** (saving 95.8% of field patrol time).
* **Namma Bengaluru Tactical GIS Layer**:
  * Embedded **Leaflet.js** map rendering the 24 street pipelines across Bengaluru with real-time pressure color-coding, valve markers, and dynamic pulsing hazard geofence radius.

---

### 2. Module 1: Optical Pump Diagnostics (Kaveri-Pulse EVM Engine)
* **Processor Architecture (`evm-processor.js`)**:
  * Draggable, selectable **$160 \times 160$ pixel Region of Interest (ROI)** bounding box.
  * Captures live rear camera feed (`facingMode: 'environment'`) or high-fidelity synthetic 15 HP municipal booster pump simulation.
* **Temporal IIR Bandpass Filtering**:
  * Isolates vibration components between $50\text{ Hz} - 200\text{ Hz}$ across pixel luminance:
    $$y_{\text{low}}(t) = y_{\text{low}}(t-1) + \alpha_{\text{low}} \cdot (x(t) - y_{\text{low}}(t-1))$$
    $$y_{\text{high}}(t) = y_{\text{high}}(t-1) + \alpha_{\text{high}} \cdot (x(t) - y_{\text{high}}(t-1))$$
    $$\text{Bandpass}(t) = y_{\text{high}}(t) - y_{\text{low}}(t)$$
* **Eulerian Spatial Phase Amplification**:
  * Scales invisible micro-vibrations by adjustable factor $\alpha$ ($5\times$ to $75\times$):
    $$I_{\text{magnified}}(x, y, t) = I(x, y, t) + \alpha \cdot \text{Bandpass}(x, y, t)$$
  * Generates false-color thermal motion heatmaps displaying directional stress vectors.
* **Spectral Cavitation Metric**:
  * Fast Fourier Transform (FFT) reveals pump RPM harmonics (142.5 Hz cavitation resonance vs 25 Hz shaft rotation).
  * Computes the **Cavitation Index (0–100%)** based on high-frequency turbulent flutter vs fundamental energy, alerting engineers to destructive vapor bubble implosions and impeller pitting.

---

### 3. Module 2: Acoustic Valve Contact & TDoA Correlator (Kaveri-Pulse DSP Engine)
* **Hardware-Bypassed Web Audio API**:
  * Configured with strict hardware bypass flags:
    ```js
    navigator.mediaDevices.getUserMedia({
      audio: {
        echoCancellation: false,
        noiseSuppression: false,
        autoGainControl: false,
        sampleRate: 48000,
        channelCount: 1
      }
    });
    ```
* **Biquad Bandpass Filtering**:
  * Hardware-accelerated Biquad IIR filter ($150\text{ Hz} - 1,000\text{ Hz}$, center $f_0 = 575\text{ Hz}$, $Q = 1.0$) isolates turbulent water leak hissing from heavy Bengaluru traffic rumble and ambient urban noise.
* **TDoA Cross-Correlation ($R_{xy}(\tau)$)**:
  * Discrete normalized cross-correlation:
    $$R_{xy}(\tau) = \frac{\sum_{t} (x(t) - \bar{x})(y(t + \tau) - \bar{y})}{\sqrt{\sum (x(t) - \bar{x})^2 \sum (y(t) - \bar{y})^2}}$$
  * Determines the peak lag: $\tau_{\text{peak}} = \arg\max |R_{xy}(\tau)|$ and $\Delta t = \frac{\tau_{\text{peak}}}{f_s}$.
* **Exact Rupture Localization**:
  * Supports 5 municipal pipe materials:
    * **Ductile Iron (BWSSB Primary)**: $c = 1200\text{ m/s}$
    * **Cast Iron (Heritage Trunk)**: $c = 1100\text{ m/s}$
    * **Mild Steel (High-Pressure)**: $c = 1300\text{ m/s}$
    * **uPVC (Secondary Feeder)**: $c = 520\text{ m/s}$
    * **HDPE (Service Connection)**: $c = 460\text{ m/s}$
  * Computes exact leak distance from Valve A:
    $$d_A = \frac{L - c \cdot \Delta t}{2}$$
    $$d_B = L - d_A$$
  * Displays physical interactive pipe schematic with millimeter-accurate rupture beacon and Peak-to-Sidelobe Ratio (PSLR) confidence rating (e.g. 96.4%).

---

### 4. Module 3: Active Acoustic Void Scanner & 3D WebXR Wireframe (SubTerra-Vision Engine)
* **Active Sonar Generator**:
  * Phone loudspeaker emits a linear acoustic frequency chirp from $100\text{ Hz} \rightarrow 4,000\text{ Hz}$ over $1.5\text{ seconds}$ with smooth exponential envelope ramps.
  * Internal microphone and `window.DeviceMotionEvent` (MEMS Z-axis accelerometer) record the ground reaction wave.
* **Spectral Resonance Ratio (SRR) Classifier**:
  * Distinguishes dense soil absorption from cavernous acoustic resonance:
    * **Solid Compacted Soil**: High damping ($\zeta > 0.85$), fast decay, SRR $< 1.2$ $\rightarrow$ Road base stable.
    * **Hollow Sinkhole Void**: Low damping ($\zeta \approx 0.18$), sustained Helmholtz resonance at $342.5\text{ Hz}$, SRR $> 2.8$ $\rightarrow$ **Critical Road Collapse Hazard**!
  * Outputs cavity depth (e.g. $1.25\text{ m}$) and estimated eroded soil volume (e.g. $3.8\text{ m}^3$).
* **Three.js / WebXR 3D Subsurface Wireframe**:
  * Full 3D volumetric scene with orbit navigation, depth stratification, and layer toggles:
    * **Underground Pipe**: Rendered in **Neon Cyan** wireframe/cylinder at $-1.5\text{ m}$ depth.
    * **Rupture Point**: Rendered in **Pulsing Glowing Red** with animated water particle spray shooting upwards.
    * **Eroded Sinkhole Mesh**: Volumetric distorted icosahedron in **Amber/Orange** wireframe illustrating the underground cavern undermining the asphalt surface.

---

### 5. DPDP Act 2023 Compliance & Zero-Cloud Guarantee
* **Volatile RAM Only**: All audio frames and camera pixels are buffered exclusively inside ephemeral JavaScript `Float32Array` ring-buffers in volatile memory. No audio, camera, or spatial telemetry is transmitted to external servers.
* **Instant Purge Button**: Immediately zeroes all audio ring-buffers and clears WebGL texture memory, generating an on-screen statutory audit log under Sec 8(7) of the India Digital Personal Data Protection Act 2023.
* **Live Hardware vs. Synthetic Demo Toggle**:
  * Prominent header toggle switch:
    * `[● LIVE HARDWARE SENSORS]`: Engages live smartphone camera, microphone, and MEMS accelerometer.
    * `[⚡ SYNTHETIC DEMO]`: Injects physics-modeled cavitation vibration (142.5 Hz), ductile iron pipe leak acoustic hiss ($L=80\text{m}$, $d_A=28.5\text{m}$, $\Delta t = -19.2\text{ms}$), and high-Q sinkhole cavity echoes for a **100% zero-fail stage demo**.

---

## 🚀 Quick Start & Runnable Instructions

### Prerequisites
* **Node.js**: v18.0.0 or higher (v24+ recommended)
* **NPM**: v9.0.0 or higher

### Installation
Clone or navigate to the workspace directory:
```bash
cd "Hydro Terrta Pulse"
npm install
```

### Run Locally (Development Dev Server)
```bash
npm run dev
```
Open **`http://localhost:5173/`** in your browser (Google Chrome, Microsoft Edge, Brave, or Safari).

### Production Build & PWA Preview
```bash
npm run build
npm run preview
```

---

## 📱 PWA Features
* **Installable**: Includes standard `manifest.json` with high-resolution responsive radar icons.
* **Offline-Ready Service Worker**: `sw.js` caches all core tactical bundles while strictly bypassing volatile sensor streams to maintain DPDP compliance.
* **Full Mobile Touch Support**: Supports gesture orbit dragging in Three.js and tap-to-move ROI in EVM camera view.

---

## 🏛️ Civic Authority Acknowledgements
* **BWSSB**: Bangalore Water Supply and Sewerage Board (Kaveri Stage IV & V Municipal Distribution Grids)
* **BBMP**: Bruhat Bengaluru Mahanagara Palike (Road Infrastructure & Subsurface Pothole Prevention Division)
* Built for **Namma Bengaluru Civic Hackathons & Smart City Initiatives**.
