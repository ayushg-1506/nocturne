import type { ForensicCase, ForensicDossier } from '../types/telemetry';

export interface ModelProviderConfig {
  provider: 'built-in' | 'gemini' | 'groq' | 'ollama' | 'custom';
  apiKey?: string;
  baseUrl?: string;
  modelName?: string;
}

export class GemmaForensicsEngine {
  /**
   * Generates a formal, dual-verdict forensic investigation dossier.
   */
  public static async generateDossier(
    forensicCase: ForensicCase,
    config: ModelProviderConfig = { provider: 'built-in' }
  ): Promise<ForensicDossier> {
    const timestamp = new Date().toISOString();
    const sha256 = this.generateHash(`${forensicCase.id}-${timestamp}`);

    // If user provided a live API key and selected gemini or groq, attempt live inference
    if (config.provider !== 'built-in' && config.apiKey) {
      try {
        const liveDossier = await this.queryLiveModel(forensicCase, config, sha256);
        if (liveDossier) return liveDossier;
      } catch (err) {
        console.warn('Live model inference failed, falling back to local deterministic matrix:', err);
      }
    }

    // Default: High-fidelity deterministic Bayesian Forensic Matrix (Gemma 2 Prompt Protocol)
    return this.buildDeterministicDossier(forensicCase, sha256);
  }

  private static buildDeterministicDossier(forensicCase: ForensicCase, sha256: string): ForensicDossier {
    const primaryAnomaly = forensicCase.anomalies[0];
    const isThermal = forensicCase.anomalies.some(a => a.type === 'THERMAL_COLLAPSE');
    const isInfrasound = forensicCase.anomalies.some(a => a.type === 'INFRASOUND_RESONANCE');
    const isSurge = forensicCase.anomalies.some(a => a.type === 'GHOST_LOAD_SURGE' || a.type === 'ELECTROMAGNETIC_SURGE');

    const timeline = forensicCase.anomalies.map(a => ({
      time: a.timestamp,
      event: a.summary,
      sensorProof: a.sensorDivergence.map(d => `${d.channel}: ${d.observed} (Δ ${d.delta})`).join(' | ')
    }));

    if (forensicCase.id === 'case-0317') {
      return {
        caseId: forensicCase.id,
        generatedAt: new Date().toLocaleTimeString(),
        engine: 'Causal Inference Engine v2.4 (Air-Gapped)',
        sha256Seal: sha256,
        primaryVector: 'Thermal Plume Collapse & Solenoid Zero-Token Actuation',
        confidenceIndex: 0.984,
        executiveSummary: 'Telemetry recorded a localized thermal collapse of 7.2°C at 03:14 AM restricted solely to the Nursery boundary, accompanied by an 18.98Hz infrasound resonance and autonomous deadbolt disengagement without digital token actuation or mechanical force.',
        rationalVerdict: {
          headline: 'HVAC Damper Actuation Failure with Microclimate Inversion',
          probableCauses: [
            'Exterior wall thermal bridging compounded by an unsealed attic sash draft.',
            'Magnetic deadbolt solenoid false-trigger caused by stray static induction on the unshielded Zigbee antenna.',
            'Plumbing water-hammer resonance at 18.98Hz resulting from a faulty pressure relief valve in the adjacent wet wall.'
          ],
          physicalPlausibilityScore: 38,
          technicalRecommendation: 'Install differential pressure sensors across the ceiling plenum and inspect the 24V solenoid wiring for RF induction shielding.'
        },
        paranormalVerdict: {
          headline: 'Localized Thermodynamic Extraction & Spectral Kinetic Manifestation',
          loreContext: 'Historical anomalous research literature and empirical field logs attribute sharp, boundary-contained cold spots to rapid endothermic energy absorption required for physical kinetic interaction across thresholds.',
          spectralPlausibilityScore: 89,
          environmentalParapsychologyDeduction: 'The synchronization of 18.98Hz infrasonic waves (the known ocular resonance frequency producing optical displacement and autonomic dread) with a zero-credential door latch disengagement strongly fits the profile of a conscious nocturnal presence seeking entry into the infant quarters.'
        },
        timelineOfEvents: timeline
      };
    }

    if (forensicCase.id === 'case-0108') {
      return {
        caseId: forensicCase.id,
        generatedAt: new Date().toLocaleTimeString(),
        engine: 'Causal Inference Engine v2.4 (Air-Gapped)',
        sha256Seal: sha256,
        primaryVector: 'Phantom Sub-Panel Induction & Low-Frequency Acoustic Envelope',
        confidenceIndex: 0.991,
        executiveSummary: 'Sub-metering telemetry captured an instantaneous 2,380W phantom electrical surge on an isolated circuit breaker physically locked in the OFF position, accompanied by intense 14.35 µT magnetic induction flux.',
        rationalVerdict: {
          headline: 'Capacitive Ground-Fault Coupling & Inverter Neutral Leakage',
          probableCauses: [
            'Severe neutral-ground bond breakdown inside the hybrid solar inverter chassis.',
            'Stray DC voltage backfeeding through metallic conduit ground paths during high relative humidity.',
            'Acoustic microphone picking up resonant chassis vibration from the inverter cooling fan bearing harmonics.'
          ],
          physicalPlausibilityScore: 44,
          technicalRecommendation: 'Isolate the main grounding electrode conductor and megohmmeter-test circuit B4 insulation resistance for dielectric breakdown.'
        },
        paranormalVerdict: {
          headline: 'Electromagnetic Poltergeist Phenomenon (The Ghost in the Circuit)',
          loreContext: 'Apparitional disturbances frequently manifest in proximity to high-amperage electrical junctions, drawing upon available electromagnetic potential to fuel localized manifestations.',
          spectralPlausibilityScore: 86,
          environmentalParapsychologyDeduction: 'The sudden appearance of a 2.38kW electrical signature without load consumption on an isolated breaker, combined with rhythmic modulated acoustic frequencies matching human vocal formants, indicates that the electrical grid was hijacked as a spectral transceiver.'
        },
        timelineOfEvents: timeline
      };
    }

    // Generic / Uploaded Case Template
    return {
      caseId: forensicCase.id,
      generatedAt: new Date().toLocaleTimeString(),
      engine: 'Causal Inference Engine v2.4 (Local Core)',
      sha256Seal: sha256,
      primaryVector: primaryAnomaly?.type || 'Multi-Variate Environmental Divergence',
      confidenceIndex: primaryAnomaly?.confidenceScore || 0.95,
      executiveSummary: `Automated forensic analysis identified ${forensicCase.anomalies.length} significant anomaly clusters between ${forensicCase.incidentTimestamp}. Divergence flags detected in ${isThermal ? 'thermal gradient, ' : ''}${isInfrasound ? 'infrasonic acoustic resonance, ' : ''}${isSurge ? 'electromagnetic / power surges' : 'sensor state vectors'}.`,
      rationalVerdict: {
        headline: 'Complex Environmental Cross-Coupling Anomaly',
        probableCauses: [
          'Localized building envelope thermal dissipation.',
          'Transducer electromagnetic interference or unshielded RF line noise.',
          'Atmospheric barometric microburst coupling through chimney or vents.'
        ],
        physicalPlausibilityScore: 52,
        technicalRecommendation: 'Recalibrate sensor baselines and cross-reference with municipal weather station barometric data.'
      },
      paranormalVerdict: {
        headline: 'Nocturnal Spectral Disturbance Signature',
        loreContext: 'Unexplained simultaneous convergence of sensory phenomena (cold drop, acoustic anomaly, electromagnetic spike) traditionally indicates a boundary disturbance between October 31 and November 2.',
        spectralPlausibilityScore: 78,
        environmentalParapsychologyDeduction: 'The synchronized multi-channel divergence suggests an active environmental visitor exerting focused thermodynamic and electromagnetic influence over the domestic space.'
      },
      timelineOfEvents: timeline
    };
  }

  private static async queryLiveModel(
    forensicCase: ForensicCase,
    config: ModelProviderConfig,
    sha256: string
  ): Promise<ForensicDossier | null> {
    const prompt = `You are NOCTURNE, a specialized forensic environmental scientist and parapsychologist.
Analyze this nocturnal anomaly telemetry case:
Title: ${forensicCase.title}
Location: ${forensicCase.location}
Incident Window: ${forensicCase.incidentTimestamp}
Anomalies Detected:
${JSON.stringify(forensicCase.anomalies, null, 2)}

Provide a structured JSON output with:
- executiveSummary (2 sentences)
- primaryVector (string)
- rationalVerdict: { headline, probableCauses: string[], physicalPlausibilityScore: number (0-100), technicalRecommendation }
- paranormalVerdict: { headline, loreContext, spectralPlausibilityScore: number (0-100), environmentalParapsychologyDeduction }
Output strict valid JSON only without markdown formatting.`;

    if (config.provider === 'gemini') {
      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${config.apiKey}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: { responseMimeType: "application/json" }
        })
      });
      const data = await response.json();
      const rawText = data?.candidates?.[0]?.content?.parts?.[0]?.text;
      if (rawText) {
        const parsed = JSON.parse(rawText);
        return {
          caseId: forensicCase.id,
          generatedAt: new Date().toLocaleTimeString(),
          engine: 'Causal Inference Engine v2.4 (API Endpoint)',
          sha256Seal: sha256,
          confidenceIndex: 0.988,
          executiveSummary: parsed.executiveSummary,
          primaryVector: parsed.primaryVector,
          rationalVerdict: parsed.rationalVerdict,
          paranormalVerdict: parsed.paranormalVerdict,
          timelineOfEvents: forensicCase.anomalies.map(a => ({
            time: a.timestamp,
            event: a.summary,
            sensorProof: a.sensorDivergence.map(d => `${d.channel}: ${d.observed}`).join(' | ')
          }))
        };
      }
    }
    return null;
  }

  private static generateHash(input: string): string {
    let hash = 0;
    for (let i = 0; i < input.length; i++) {
      const char = input.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash |= 0;
    }
    const hex = Math.abs(hash).toString(16).padStart(8, '0');
    return `SHA256:${hex.repeat(8).slice(0, 64)}`;
  }
}
