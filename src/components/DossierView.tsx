import React, { useState, useEffect } from 'react';
import type { ForensicCase, ForensicDossier } from '../types/telemetry';
import { GemmaForensicsEngine, type ModelProviderConfig } from '../engine/gemmaForensics';
import { 
  FileText, 
  ShieldCheck, 
  Cpu, 
  Copy, 
  Check, 
  Download, 
  RefreshCw,
  AlertTriangle,
  Flame,
  Radio,
  Zap
} from 'lucide-react';

interface DossierViewProps {
  forensicCase: ForensicCase;
  modelConfig: ModelProviderConfig;
}

export const DossierView: React.FC<DossierViewProps> = ({
  forensicCase,
  modelConfig
}) => {
  const [dossier, setDossier] = useState<ForensicDossier | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [copied, setCopied] = useState<boolean>(false);

  const loadDossier = async () => {
    setIsLoading(true);
    try {
      const result = await GemmaForensicsEngine.generateDossier(forensicCase, modelConfig);
      setDossier(result);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadDossier();
  }, [forensicCase.id, modelConfig.provider]);

  // Comprehensive evidence audit trail covering nocturnal monitoring
  const fullAuditTrail = [
    {
      time: '23:30:00',
      event: 'Environmental baseline calibration locked across all 5 spatial nodes.',
      proof: 'TH-01: 21.4°C | Acoustic: 22.1 dB | EMF: 0.24 µT | Latch: SECURE'
    },
    {
      time: '01:15:00',
      event: 'Micro-barometric fluctuation recorded in attic plenum; ambient temp stable.',
      proof: 'Barometric delta: -1.2 hPa | TH-02: 21.2°C | PIR: INACTIVE'
    },
    {
      time: '03:14:00',
      event: 'Localized thermal collapse of 7.2°C within 180 seconds. HVAC dampers confirmed closed.',
      proof: 'Temperature (TH-01): 14.2°C (Δ -7.2°C) | Rate of Change: -2.40°C/min (120x baseline)'
    },
    {
      time: '03:16:00',
      event: 'Magnetic deadbolt lock cycled from SECURE to UNLATCHED without authenticated Zigbee key.',
      proof: 'Latch State: UNLATCHED (Δ Zero-token release) | Acoustic Impulse: 43.5 dB (18.98Hz)'
    },
    {
      time: '03:20:00',
      event: 'Simultaneous triple-vector anomaly: 18.98Hz wave, 6.8 µT EMF surge, and PIR trip.',
      proof: 'EMF Flux (EMF-03): 7.08 µT (Δ +2420%) | PIR: ACTIVE (No accelerometer floor vibration)'
    },
    {
      time: '03:45:00',
      event: 'Gradual thermal normalization initiated; infrasound resonance attenuates to noise floor.',
      proof: 'TH-01: 19.8°C | Acoustic: 24.2 dB (Broadband white noise) | Latch: PERSISTENT UNLATCHED'
    }
  ];

  const handleCopyMarkdown = () => {
    if (!dossier) return;
    const parts = [
      '# NOCTURNE FORENSIC INCIDENT DOSSIER',
      `**Case:** ${forensicCase.caseNumber} — ${forensicCase.title}`,
      `**Location:** ${forensicCase.location}`,
      `**Structure:** ${forensicCase.structureType}`,
      `**Chain-of-Custody Seal:** \`${dossier.sha256Seal}\``,
      `**Inference Engine:** ${dossier.engine}`,
      '',
      '## Executive Summary',
      dossier.executiveSummary,
      '',
      '## Dual-Verdict Forensic Matrix',
      '',
      `### 1. Rational Physical Hypothesis (${dossier.rationalVerdict.physicalPlausibilityScore}% Plausibility)`,
      `**Headline:** ${dossier.rationalVerdict.headline}`,
      '**Probable Mechanical Causes:**',
      ...dossier.rationalVerdict.probableCauses.map((c: string) => `- ${c}`),
      `**Technical Recommendation:** ${dossier.rationalVerdict.technicalRecommendation}`,
      '',
      `### 2. Anomalous Divergence Hypothesis (${dossier.paranormalVerdict.spectralPlausibilityScore}% Plausibility)`,
      `**Headline:** ${dossier.paranormalVerdict.headline}`,
      `**Phenomenon Context:** ${dossier.paranormalVerdict.loreContext}`,
      `**Forensic Anomaly Deduction:** ${dossier.paranormalVerdict.environmentalParapsychologyDeduction}`,
      '',
      '## Telemetry Evidence Audit Trail',
      '| Timestamp | Event | Divergence Proof |',
      '|-----------|-------|------------------|',
      ...fullAuditTrail.map((t) => `| ${t.time} | ${t.event} | ${t.proof} |`)
    ];
    navigator.clipboard.writeText(parts.join('\n'));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleExportJson = () => {
    if (!dossier) return;
    const exportData = {
      ...dossier,
      timelineOfEvents: fullAuditTrail
    };
    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `nocturne_${forensicCase.caseNumber.toLowerCase()}_dossier.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      gap: '12px',
      minHeight: '100%'
    }}>
      {/* Header Bar */}
      <div style={{
        background: 'var(--bg-panel)',
        border: '1px solid var(--border-subtle)',
        borderRadius: '2px',
        padding: '14px 16px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '10px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{
            width: '32px',
            height: '32px',
            background: '#09150b',
            border: '1px solid var(--accent-green)',
            borderRadius: '2px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0
          }}>
            <FileText size={17} color="var(--accent-green-bright)" />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span className="terminal-title">
                CLASSIFIED INCIDENT DOSSIER
              </span>
              <span className="badge-amber" style={{ fontSize: '10px', padding: '1px 6px' }}>
                {forensicCase.caseNumber}
              </span>
            </div>
            <div style={{ fontSize: '11px', color: '#9ca3af', marginTop: '2px' }}>
              {forensicCase.title} — {forensicCase.location} ({forensicCase.structureType})
            </div>
          </div>
        </div>

        {/* Action Controls */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <button
            onClick={loadDossier}
            disabled={isLoading}
            className="btn-secondary"
            style={{ padding: '6px 12px', fontSize: '11px' }}
          >
            <RefreshCw size={12} className={isLoading ? 'pulse-green' : ''} />
            <span>[ RE-ANALYZE ]</span>
          </button>

          <button
            onClick={handleCopyMarkdown}
            className="btn-secondary"
            style={{ padding: '6px 12px', fontSize: '11px' }}
          >
            {copied ? <Check size={12} color="var(--accent-green)" /> : <Copy size={12} />}
            <span>{copied ? '[ COPIED ]' : '[ COPY MARKDOWN ]'}</span>
          </button>

          <button
            onClick={handleExportJson}
            className="btn-primary"
            style={{ padding: '6px 14px', fontSize: '11px' }}
          >
            <Download size={12} />
            <span>[ EXPORT JSON DOSSIER ]</span>
          </button>
        </div>
      </div>

      {isLoading || !dossier ? (
        <div style={{ padding: '60px 20px', textAlign: 'center', background: 'var(--bg-panel)', border: '1px solid var(--border-subtle)', borderRadius: '2px' }}>
          <div className="pulse-green" style={{ fontSize: '14px', fontWeight: 700, color: 'var(--accent-green-bright)' }}>
            &gt; EXECUTING CAUSAL REASONING MATRIX...
          </div>
          <div style={{ fontSize: '11px', color: '#9ca3af', marginTop: '6px' }}>
            Cross-referencing multi-variate statistical residual shifts with physical thermodynamics
          </div>
        </div>
      ) : (
        <>
          {/* Metadata Row */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '8px',
            background: 'var(--bg-panel)',
            padding: '10px 14px',
            border: '1px solid var(--border-subtle)',
            borderRadius: '2px',
            fontSize: '11px',
            fontFamily: 'var(--font-mono)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <ShieldCheck size={15} color="var(--accent-green-bright)" />
              <span style={{ color: '#9ca3af' }}>CRYPTOGRAPHIC SEAL:</span>
              <span style={{ color: 'var(--accent-green-bright)', wordBreak: 'break-all', fontWeight: 600 }}>
                SHA256:{dossier.sha256Seal}
              </span>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <span style={{ color: '#9ca3af' }}>INFERENCE ENGINE:</span>
              <span style={{ color: '#ffffff', fontWeight: 600 }}>{dossier.engine}</span>
              <span style={{ color: 'var(--border-muted)' }}>|</span>
              <span style={{ color: 'var(--accent-amber-bright)', fontWeight: 700 }}>
                ANOMALY CONFIDENCE: {dossier.confidenceIndex.toFixed(1)}%
              </span>
            </div>
          </div>

          {/* Executive Summary */}
          <div style={{
            background: 'var(--bg-panel)',
            border: '1px solid var(--border-subtle)',
            borderLeft: '3px solid var(--accent-green)',
            borderRadius: '2px',
            padding: '14px 16px'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '6px' }}>
              <span style={{ color: 'var(--accent-green-bright)', fontWeight: 800 }}>&gt;</span>
              <span style={{ fontSize: '11px', color: '#ffffff', fontWeight: 700, letterSpacing: '0.05em' }}>
                EXECUTIVE SUMMARY
              </span>
            </div>
            <p style={{ fontSize: '12px', color: '#e4e4e7', lineHeight: 1.6 }}>
              {dossier.executiveSummary}
            </p>
          </div>

          {/* Dual Verdict Columns */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '12px' }}>
            {/* Left: Rational Physical Hypothesis */}
            <div style={{
              background: 'var(--bg-panel)',
              border: '1px solid var(--border-subtle)',
              borderTop: '2px solid var(--accent-green)',
              borderRadius: '2px',
              padding: '16px',
              display: 'flex',
              flexDirection: 'column',
              gap: '12px'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Cpu size={15} color="var(--accent-green-bright)" />
                  <span style={{ fontSize: '12px', fontWeight: 700, color: '#ffffff', letterSpacing: '0.04em' }}>
                    <span style={{ color: 'var(--accent-green-bright)', marginRight: '4px' }}>[01]</span>
                    RATIONAL PHYSICAL HYPOTHESIS
                  </span>
                </div>
                <span className="badge-green" style={{ fontSize: '10px' }}>
                  {dossier.rationalVerdict.physicalPlausibilityScore}% PLAUSIBILITY
                </span>
              </div>

              <div style={{ fontSize: '13px', fontWeight: 700, color: '#ffffff' }}>
                {dossier.rationalVerdict.headline}
              </div>

              <div>
                <div style={{ fontSize: '10px', color: '#9ca3af', fontWeight: 600, marginBottom: '6px' }}>
                  PROBABLE MECHANICAL CAUSES:
                </div>
                <ul style={{ paddingLeft: '18px', fontSize: '11px', color: '#d4d4d8', lineHeight: 1.6 }}>
                  {dossier.rationalVerdict.probableCauses.map((cause: string, idx: number) => (
                    <li key={idx} style={{ marginBottom: '4px' }}>{cause}</li>
                  ))}
                </ul>
              </div>

              <div style={{
                marginTop: 'auto',
                background: '#09150b',
                padding: '10px 12px',
                borderRadius: '2px',
                fontSize: '11px',
                borderLeft: '2px solid var(--accent-green)'
              }}>
                <span style={{ color: 'var(--accent-green-bright)', fontWeight: 700 }}>RECOMMENDATION: </span>
                <span style={{ color: '#d4d4d8' }}>{dossier.rationalVerdict.technicalRecommendation}</span>
              </div>
            </div>

            {/* Right: Anomalous Divergence Verdict */}
            <div style={{
              background: 'var(--bg-panel)',
              border: '1px solid var(--border-subtle)',
              borderTop: '2px solid var(--accent-amber)',
              borderRadius: '2px',
              padding: '16px',
              display: 'flex',
              flexDirection: 'column',
              gap: '12px'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <AlertTriangle size={15} color="var(--accent-amber-bright)" />
                  <span style={{ fontSize: '12px', fontWeight: 700, color: '#ffffff', letterSpacing: '0.04em' }}>
                    <span style={{ color: 'var(--accent-amber-bright)', marginRight: '4px' }}>[02]</span>
                    ANOMALOUS DIVERGENCE HYPOTHESIS
                  </span>
                </div>
                <span className="badge-amber" style={{ fontSize: '10px' }}>
                  {dossier.paranormalVerdict.spectralPlausibilityScore}% PLAUSIBILITY
                </span>
              </div>

              <div style={{ fontSize: '13px', fontWeight: 700, color: '#ffffff' }}>
                {dossier.paranormalVerdict.headline}
              </div>

              <div>
                <div style={{ fontSize: '10px', color: 'var(--accent-amber-bright)', fontWeight: 600, marginBottom: '6px' }}>
                  PHENOMENOLOGICAL &amp; ENVIRONMENTAL LORE:
                </div>
                <p style={{ fontSize: '11px', color: '#d4d4d8', lineHeight: 1.6, fontStyle: 'italic' }}>
                  "{dossier.paranormalVerdict.loreContext}"
                </p>
              </div>

              <div style={{
                marginTop: 'auto',
                background: '#181105',
                padding: '10px 12px',
                borderRadius: '2px',
                fontSize: '11px',
                borderLeft: '2px solid var(--accent-amber)'
              }}>
                <span style={{ color: 'var(--accent-amber-bright)', fontWeight: 700 }}>DEDUCTION: </span>
                <span style={{ color: '#d4d4d8' }}>{dossier.paranormalVerdict.environmentalParapsychologyDeduction}</span>
              </div>
            </div>
          </div>

          {/* Forensic Sensor Verification Signatures Deck (Fills screen with rich technical proof) */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: '12px'
          }}>
            <div style={{
              background: 'var(--bg-panel)',
              border: '1px solid var(--border-subtle)',
              borderRadius: '2px',
              padding: '12px 14px',
              display: 'flex',
              flexDirection: 'column',
              gap: '6px'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Flame size={14} color="var(--accent-amber)" />
                <span style={{ fontSize: '11px', fontWeight: 700, color: '#ffffff' }}>
                  THERMODYNAMIC HEAT EXTRACTION
                </span>
              </div>
              <p style={{ fontSize: '11px', color: '#d4d4d8', lineHeight: 1.5 }}>
                Recorded cooling gradient of -2.40°C/min exceeds maximum passive thermal dissipation through 2x4 stud walls by <strong>120x</strong> with confirmed closed dampers.
              </p>
            </div>

            <div style={{
              background: 'var(--bg-panel)',
              border: '1px solid var(--border-subtle)',
              borderRadius: '2px',
              padding: '12px 14px',
              display: 'flex',
              flexDirection: 'column',
              gap: '6px'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Radio size={14} color="var(--accent-green-bright)" />
                <span style={{ fontSize: '11px', fontWeight: 700, color: '#ffffff' }}>
                  18.98Hz STANDING WAVE COUPLING
                </span>
              </div>
              <p style={{ fontSize: '11px', color: '#d4d4d8', lineHeight: 1.5 }}>
                Acoustic impulse locks at exactly 18.98Hz (the exact resonant frequency of the human ocular globe), explaining peripheral optical displacement reports.
              </p>
            </div>

            <div style={{
              background: 'var(--bg-panel)',
              border: '1px solid var(--border-subtle)',
              borderRadius: '2px',
              padding: '12px 14px',
              display: 'flex',
              flexDirection: 'column',
              gap: '6px'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Zap size={14} color="var(--accent-crimson-bright)" />
                <span style={{ fontSize: '11px', fontWeight: 700, color: '#ffffff' }}>
                  ZERO-TOKEN DEADBOLT ACTUATION
                </span>
              </div>
              <p style={{ fontSize: '11px', color: '#d4d4d8', lineHeight: 1.5 }}>
                6.8 µT inductive flux spike coincided with magnetic solenoid unlatching without authenticated Zigbee credential transmission or handle torque.
              </p>
            </div>
          </div>

          {/* Telemetry Evidence Audit Trail */}
          <div style={{
            background: 'var(--bg-panel)',
            border: '1px solid var(--border-subtle)',
            borderRadius: '2px',
            padding: '14px 16px',
            display: 'flex',
            flexDirection: 'column',
            gap: '10px'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span style={{ color: 'var(--accent-green-bright)', fontWeight: 800 }}>&gt;</span>
                <span style={{ fontSize: '12px', color: '#ffffff', fontWeight: 700, letterSpacing: '0.05em' }}>
                  FORENSIC TELEMETRY EVIDENCE AUDIT TRAIL
                </span>
              </div>
              <span style={{ fontSize: '11px', color: '#9ca3af' }}>
                FULL NOCTURNE SURVEILLANCE WATCH (23:30 - 03:45)
              </span>
            </div>

            <div style={{
              background: '#040507',
              border: '1px solid var(--border-subtle)',
              borderRadius: '2px',
              overflowX: 'auto'
            }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '11px', fontFamily: 'var(--font-mono)' }}>
                <thead>
                  <tr style={{ background: '#080a0e', borderBottom: '1px solid var(--border-subtle)', textAlign: 'left' }}>
                    <th style={{ padding: '9px 12px', color: '#ffffff', fontWeight: 700, width: '110px' }}>TIMESTAMP</th>
                    <th style={{ padding: '9px 12px', color: '#ffffff', fontWeight: 700, width: '38%' }}>ANOMALOUS INCIDENT</th>
                    <th style={{ padding: '9px 12px', color: '#ffffff', fontWeight: 700 }}>DIVERGENCE PROOF</th>
                  </tr>
                </thead>
                <tbody>
                  {fullAuditTrail.map((t, idx) => (
                    <tr
                      key={idx}
                      style={{
                        borderBottom: '1px solid var(--border-subtle)',
                        background: idx % 2 === 0 ? 'transparent' : 'rgba(255, 255, 255, 0.02)'
                      }}
                    >
                      <td style={{ padding: '9px 12px', color: 'var(--accent-green-bright)', fontWeight: 700, whiteSpace: 'nowrap' }}>
                        {t.time}
                      </td>
                      <td style={{ padding: '9px 12px', color: '#ffffff', lineHeight: 1.5 }}>
                        {t.event}
                      </td>
                      <td style={{ padding: '9px 12px', color: '#d4d4d8', lineHeight: 1.5 }}>
                        {t.proof}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
};
