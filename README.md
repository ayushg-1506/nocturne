# NOCTURNE: Air-Gapped Environmental Telemetry Forensics & Anomaly Reasoning Engine

NOCTURNE is a local-first, air-gapped environmental telemetry forensics platform engineered to investigate anomalous microclimate and electrical deviations across residential and facility IoT sensor networks. 

By combining tabular foundation model statistical scoring (TabPFN) with open-weight deductive reasoning (Google Gemma 2), Nocturne processes multi-variate nocturnal time-series to determine causality: differentiating between mechanical system failures (e.g., HVAC damper collapse, unshielded induction transients) and unclassified anomalous environmental phenomena.

---

## Technical Specifications & Architecture

- **Air-Gapped Privacy:** 100% client-side execution. Sensitive domestic sensor logs (occupancy, bedroom microclimates, portal access states) are analyzed locally without transmitting telemetry to cloud vendors.
- **Tabular Foundation Scoring (TabPFN):** Multi-variate z-score and Bayesian tabular inference across ambient temperature, acoustic sound pressure level (SPL), resonant frequency, PIR motion, electromagnetic flux (EMF), and circuit wattage.
- **Open-Weight Deductive Reasoning (Gemma 2):** Generates dual-verdict causal hypotheses (Rational Physical Hypothesis vs Anomalous Phenomenon Deduction) sealed with a SHA-256 evidence checksum.
- **Infrasonic Resonant Analysis:** Synthesizes and isolates the 18.98 Hz acoustic band (the Vic Tandy human ocular resonant frequency responsible for inducing optical illusions and involuntary autonomic dread).
- **Spatial Floorplan Telemetry Grid:** 2D SVG spatial mapping with real-time thermal drift boundaries, PIR motion vectors, and magnetic solenoid lock states.

```
+------------------------------------------------------------------------------------+
|                               NOCTURNE SYSTEM PIPELINE                             |
+------------------------------------------------------------------------------------+
|                                                                                    |
|   [IoT / Edge Telemetry] ---> [CSV / JSON Ingestion Engine]                        |
|   (Zigbee2MQTT, ESPHome,      (Timestamp alignment, normalization,                 |
|    Home Assistant, Modbus)     null imputation, delta tracking)                    |
|                                         |                                          |
|                                         v                                          |
|                       [TabPFN Tabular Anomaly Engine]                              |
|                       (Multivariate residual variance,                             |
|                        Z-score thresholding, divergence scoring)                   |
|                                         |                                          |
|                                         v                                          |
|                       [Google Gemma 2 Reasoning Engine]                            |
|                       (Local Ollama :11434 / Air-Gapped Adapter)                   |
|                                         |                                          |
|                  +----------------------+----------------------+                    |
|                  |                                             |                    |
|                  v                                             v                    |
|      [Rational Physical Hypothesis]             [Anomalous Phenomenon Deduction]    |
|      (HVAC failure, thermal bridging,           (Thermodynamic extraction,          |
|       induction loops, solenoid drift)           ocular infrasonic resonance)       |
|                  |                                             |                    |
|                  +----------------------+----------------------+                    |
|                                         |                                          |
|                                         v                                          |
|                   [SHA-256 Tamper-Evident Evidence Seal]                           |
|                   [Interactive Workstation: http://localhost:5173]                 |
|                                                                                    |
+------------------------------------------------------------------------------------+
```

---

## Repository Structure

```
nocturne/
├── src/
│   ├── components/
│   │   ├── Header.tsx              # System status bar & runtime selector
│   │   ├── ExecutiveBriefing.tsx   # Operational specification & causality HUD
│   │   ├── SensorStatusStrip.tsx   # Real-time multi-sensor KPI metrics
│   │   ├── TimeScrubber.tsx        # Chronological playback controller
│   │   ├── NavigationTabs.tsx      # Segmented terminal navigation
│   │   ├── FloorplanView.tsx       # SVG architectural telemetry matrix
│   │   ├── TelemetryLabView.tsx    # Waveform channels & raw data table
│   │   ├── TelemetryCharts.tsx     # Synchronized SVG waveform channels
│   │   ├── SpectralScope.tsx       # Real-time CRT oscilloscope (18.98 Hz)
│   │   ├── DossierView.tsx         # Classified incident dossier & SHA-256 seal
│   │   ├── SimulationLabView.tsx   # Synthetic anomaly injection & CSV ingestion
│   │   └── SettingsModal.tsx       # AI engine & endpoint configuration
│   ├── engine/
│   │   ├── anomalyDetector.ts      # TabPFN-style tabular statistical scoring
│   │   ├── audioSynthesizer.ts     # Web Audio API procedural acoustics
│   │   └── gemmaForensics.ts       # Gemma 2 deductive dual-verdict engine
│   ├── data/
│   │   └── cases.ts                # Pre-loaded multi-variate incident cases
│   ├── types/
│   │   └── telemetry.ts            # TypeScript interfaces and telemetry models
│   ├── App.tsx                     # Main forensic workstation entry point
│   ├── index.css                   # Phosphor green / tactical amber terminal styling
│   └── main.tsx                    # React DOM bootstrap
├── nocturne_forensics.py           # Standalone Python CLI forensic utility
├── sample_telemetry.csv            # Sample multi-variate sensor input
├── package.json
├── tsconfig.json
└── vite.config.ts
```

---

## Installation & Quickstart

### 1. Web Workstation (React + TypeScript + Vite)

Ensure Node.js (v18+) is installed:

```bash
# Clone the repository
git clone https://github.com/ayushg-1506/nocturne.git
cd nocturne

# Install dependencies
npm install

# Start local development server
npm run dev
```

Open `http://localhost:5173` in your browser.

### 2. Standalone Python CLI Engine

For headless server environments, automated pipelines, or edge gateways:

```bash
# Install Python dependencies
pip install tabpfn pandas numpy scipy

# Execute offline forensic analysis on sample telemetry
python3 nocturne_forensics.py --csv sample_telemetry.csv --output dossier_output.json

# Optional: Run with local Ollama Gemma 2 instance
python3 nocturne_forensics.py --csv sample_telemetry.csv --provider ollama --model gemma2:9b
```

---

## Core Capabilities

### 1. Architectural Telemetry Matrix
- Real-time 2D spatial rendering of monitored rooms and facilities.
- Dynamic thermal mapping: tracks localized microclimate collapses and temperature drop boundaries.
- Optical motion tracking: correlates passive infrared (PIR) triggers against structural vibration sensors to detect massless kinetic pacing.
- Monitored portal deadbolt states (`SECURE`, `AJAR`, `UNLATCHED`).

### 2. Multi-Spectral Waveform Channels
- **Channel 01: Ambient Temperature:** Threshold detection for rapid thermal collapse (>3.5°C drop in <180s).
- **Channel 02: Acoustic SPL & Resonant Frequency:** Continuous acoustic monitoring with real-time detection of 18.98 Hz infrasonic standing waves.
- **Channel 03: Electromagnetic Induction Flux (µT):** Measures baseline drift and transient spikes (>3.0 µT above domestic ambient).
- **Channel 04: Circuit Wattage:** Monitors phantom electrical draws on dead branch circuits.

### 3. Spectral Oscilloscope & Acoustic Synthesizer
- Canvas-based CRT oscilloscope rendering real-time acoustic waveforms.
- Web Audio API procedural synthesis: reproduces ambient 60 Hz domestic baseline, electromagnetic Geiger clicks, and the 18.98 Hz sub-bass tone.

### 4. Classified AI Forensic Dossier
- Generates side-by-side Dual Verdict analyses:
  - **Rational Physical Hypothesis:** Evaluates mechanical damper failures, thermal bridging, plumbing water hammer, and solenoid inductive false-triggers.
  - **Anomalous Phenomenon Deduction:** Evaluates localized thermodynamic extraction, ocular resonant frequency illusions, and unclassified environmental signatures.
- Sealed with a cryptographic **SHA-256** checksum to verify evidence immutability.
- One-click export to Markdown or JSON audit logs.

### 5. Synthetic Anomaly Injection & CSV Ingestion
- Inject test anomalies into the active timeline:
  - Flash Cold Drop (-7.2°C in 180s)
  - 18.98 Hz Infrasonic Wave (44 dB acoustic spike)
  - Phantom Wattage Surge (+2,380 W on dead breaker)
  - Zero-Token Latch Release (magnetic deadbolt cycle)
  - Multi-Vector Convergence Event (all vectors synchronized)
- Ingest raw CSV data exported from Zigbee2MQTT, ESPHome, or Home Assistant.

---

## Verification & Testing

To compile the TypeScript project and generate the production bundle:

```bash
npm run build
```

Production assets will be emitted to `dist/index.html` and `dist/assets/`.

---

## License

MIT License. Copyright (c) 2026 Ayush Gupta.
