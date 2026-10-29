*This is a submission for the [Hacktoberfest Open-Source AI Challenge Week 4: Ghost in the Machine](https://dev.to/challenges/hacktoberfest-week4-2026-10-26)*

# NOCTURNE: Air-Gapped Environmental Telemetry Forensics & Anomaly Reasoning Engine

## What I Built

In modern smart homes and automated facilities, thousands of IoT sensors hum silently in the dark—tracking ambient microclimates, circuit wattage, acoustic pressure, and magnetic deadbolt states. When inexplicable events occur—a bedroom drops 7°C in under three minutes, a locked door unlatches with zero network authorization, or a sub-panel breaker registers 2,400W despite being physically switched off—homeowners either dismiss them as unexplained "glitches" or jump to supernatural conclusions.

**NOCTURNE** is an air-gapped, local-first environmental telemetry forensics platform built to investigate the literal *ghosts in our machines*.

Instead of building a conversational chatbot, I built an aerospace-grade forensic workstation that ingests multi-variate nocturnal time-series (from Zigbee2MQTT, ESPHome, or Home Assistant) and uses open-source AI to determine causality. It pits rigorous physical mechanics (HVAC damper collapse, thermal bridging, induction loop transients) against anomalous environmental signatures (thermodynamic entropy extraction, 18.98 Hz ocular infrasound resonance) and seals every verdict with a cryptographic SHA-256 evidence checksum.

---

## Demo

- **Live Production Workstation:** https://nocturne-nb2y.onrender.com
- **Source Code Repository:** https://github.com/ayushg-1506/nocturne

### Key Workstation Modules
1. **[01] Architectural Spatial Matrix:** Interactive 2D floorplan showing real-time microclimate boundaries, thermal collapse plumes, motion detection vectors, and centered dynamic door latch telemetry.
2. **[02] Telemetry Waveform Lab:** Synchronized four-channel oscillograms measuring Ambient Temperature, Acoustic Sound Pressure / Frequency, Electromagnetic Flux (EMF), and Circuit Active Power.
3. **[03] Incident Dossiers & Forensic Audit:** Cryptographically sealed dossiers featuring dual-verdict causal divergence, sensory signature breakdowns, and a 6-phase chronological audit log.
4. **[04] Spectral Lab & CRT Oscilloscope:** Real-time CRT oscilloscope visualizer rendering audio waveforms and isolating the infamous 18.98 Hz acoustic resonance frequency, paired with procedural Web Audio API synthesis.
5. **[05] Data Ingest & Simulation Lab:** Synthetic anomaly injection engine allowing operators to inject flash cold drops, infrasound spikes, phantom wattage surges, and zero-token lock cycles into live streams, alongside custom CSV file ingestion.
6. **[06] System Configuration:** Local AI endpoint adapter configuration (Ollama, local vLLM, or air-gapped heuristic reasoning).

---

## Code

The entire codebase is open-source under the MIT license:

{% github ayushg-1506/nocturne %}

### Architecture Stack
- **Frontend Core:** React 19, TypeScript, Vite
- **Styling:** Custom Obsidian Black (`#000000`) & Phosphor Green tactical design system with zero external CSS frameworks
- **Acoustic Simulation:** Web Audio API procedural synthesis (binaural 18.98 Hz infrasound, 60 Hz domestic hum, Geiger counter EMF clicks)
- **Deployment:** Render (Static Site with global CDN edge delivery)

---

## How I Built It

NOCTURNE is architected around a two-stage local AI reasoning pipeline:

```
[IoT / Edge Telemetry] ---> [CSV / JSON Ingestion Engine]
                                      |
                                      v
                    [TabPFN Tabular Anomaly Scoring]
                    (Residual variance, Z-score thresholds)
                                      |
                                      v
                    [Google Gemma 2 Reasoning Engine]
                    (Local Ollama :11434 / Air-Gapped Adapter)
                                      |
               +----------------------+----------------------+
               |                                             |
               v                                             v
   [Rational Physical Hypothesis]             [Anomalous Phenomenon Deduction]
   (HVAC damper failure, induction            (Thermodynamic collapse,
    coupling, solenoid drift)                  ocular infrasonic resonance)
               |                                             |
               +----------------------+----------------------+
                                      |
                                      v
                    [SHA-256 Tamper-Evident Evidence Seal]
```

1. **Tabular Anomaly Scoring (TabPFN):**
   Prior-Data Fitted Networks (TabPFN) analyze heterogeneous sensor rows without fine-tuning, calculating tabular divergence scores across temperature deltas (Δ°C), sound pressure levels (SPL dB), electromagnetic induction (µT), and circuit power spikes.
2. **Open-Weight Deductive Reasoning (Google Gemma 2):**
   The sensor deltas are evaluated through open-weight **Gemma 2** (via local Ollama or an embedded air-gapped heuristic engine). Rather than hallucinating a single generic answer, Gemma produces a side-by-side **Dual Verdict**:
   - **Rational Physical Hypothesis:** Evaluates mechanical damper failures, thermal bridging, plumbing water hammer, and solenoid inductive false-triggers.
   - **Anomalous Phenomenon Deduction:** Evaluates localized thermodynamic extraction, ocular resonant frequency illusions, and unclassified environmental signatures.
3. **Cryptographic Immutability:**
   Every forensic dossier generates a SHA-256 hash across the raw sensor readings and reasoning outputs, creating a tamper-evident audit trail suitable for investigation reports.

---

## Why Does Open Innovation Matter?

Domestic sensor telemetry contains our most intimate private signatures—sleep schedules, bedroom temperatures, movement patterns, and door latch cycles. 

Sending continuous nocturnal smart-home logs to closed proprietary cloud APIs is an unacceptable privacy hazard. Open-weight models like **Google Gemma 2** and open tabular frameworks make it possible to run sophisticated forensic AI **100% locally and air-gapped on commodity hardware**. 

Open innovation ensures that privacy-sensitive analysis remains in the hands of the user—operating completely offline without vendor lock-in, recurring subscriptions, or corporate data harvesting.

---

## The Spirit of It

This project was inspired by British engineer Vic Tandy's 1998 research paper, *"The Ghost in the Machine"*. While working in a medical laboratory reputed to be haunted, Tandy experienced unexplained dread, cold sweats, and fleeting apparitions. He eventually discovered that a newly installed extraction fan was emitting an imperceptible standing sound wave at **18.98 Hz**—the exact resonant frequency of the human eyeball. The infrasound caused the eye's vitreous humor to vibrate, producing optical illusions of gray figures in the peripheral vision.

When you load Case #0317 (The Nursery Cold Spot) in NOCTURNE, scrub the timeline to 03:14 AM, and toggle the Spectral Scope audio, you hear the low 18.98 Hz thrum alongside a 7.2°C temperature drop and an unauthenticated deadbolt release. Watching open-source AI dissect the physical vs. anomalous causal chains in real time captures the eerie intersection of physical phenomena and human perception.

---

## Prize Categories

- **Primary Track:** Hacktoberfest Open-Source AI Challenge: Week 4 ("Ghost in the Machine")
- **Partner Track:** Render (Deployed as an optimized static site on Render)
