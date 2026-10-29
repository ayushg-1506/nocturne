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
  AlertTriangle
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

  const handleCopyMarkdown = () => {
    if (!dossier) return;
    const md = `# NOCTURNE FORENSIC INCIDENT DOSSIER
**Case:** ${forensicCase.caseNumber} — ${forensicCase.title}
**Location:** ${forensicCase.location}
**Structure:** ${forensicCase.structureType}
**Chain-of-Custody Seal:** \`${dossier.sha256Seal}\`
**Inference Engine:** ${dossier.engine}

## Executive Summary
${dossier.executiveSummary}

## Dual-Verdict Forensic Matrix

### 1. Rational Physical Hypothesis (${dossier.rationalVerdict.physicalPlausibilityScore}% Plausibility)
**Headline:** ${dossier.rationalVerdict.headline}
**Probable Mechanical Causes:**
${dossier.rationalVerdict.probableCauses.map((c: string) => `- ${c}`).join('\n')}
**Technical Recommendation:** ${dossier.rationalVerdict.technicalRecommendation}

### 2. Anomalous Divergence Hypothesis (${dossier.paranormalVerdict.spectralPlausibilityScore}% Plausibility)
**Headline:** ${dossier.paranormalVerdict.headline}
**Phenomenon Context:** ${dossier.paranormalVerdict.loreContext}
**Forensic Anomaly Deduction:** ${dossier.paranormalVerdict.environmentalParapsychologyDeduction}

## Telemetry Evidence Audit Trail
| Timestamp | Event | Divergence Proof |
|-----------|-------|------------------|
${dossier.timelineOfEvents.map((t: { time: string; event: string; sensorProof: string }) => `| ${t.time} | ${t.event} | ${t.sensorProof} |`).join('\n')}
`;

    navigator.clipboard.writeText(md);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleExportJson = () => {
    if (!dossier) return;
    const blob = new Blob([JSON.stringify(dossier, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `nocturne_${forensicCase.caseNumber.toLowerCase()}_dossier.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div style={{
      margin: '0 16px 14px 16px',
      background: 'var(--bg-panel)',
      border: '1px solid var(--border-subtle)',
      borderRadius: '2px',
      padding: '16px',
      display: 'flex',
      flexDirection: 'column',
      gap: '12px'
    }}>
      {/* Header Bar */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '10px',
        borderBottom: '1px solid var(--border-subtle)',
        paddingBottom: '12px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <FileText size={18} color="var(--accent-green-bright)" />
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span className="terminal-title">
                CLASSIFIED INCIDENT DOSSIER
              </span>
              <span className="badge-amber" style={{ fontSize: '10px', padding: '1px 6px' }}>
                {forensicCase.caseNumber}
              </span>
            </div>
            <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '2px' }}>
              {forensicCase.title} — {forensicCase.location} ({forensicCase.structureType})
            </div>
          </div>
        </div>

        {/* Action Controls */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <button
            onClick={loadDossier}
            disabled={isLoading}
            className="btn-secondary"
            style={{ padding: '5px 10px', fontSize: '11px' }}
          >
            <RefreshCw size={12} className={isLoading ? 'pulse-green' : ''} />
            <span>[ RE-ANALYZE ]</span>
          </button>

          <button
            onClick={handleCopyMarkdown}
            className="btn-secondary"
            style={{ padding: '5px 10px', fontSize: '11px' }}
          >
            {copied ? <Check size={12} color="var(--accent-green)" /> : <Copy size={12} />}
            <span>{copied ? '[ COPIED ]' : '[ COPY MARKDOWN ]'}</span>
          </button>

          <button
            onClick={handleExportJson}
            className="btn-primary"
            style={{ padding: '5px 12px', fontSize: '11px' }}
          >
            <Download size={12} />
            <span>[ EXPORT JSON DOSSIER ]</span>
          </button>
        </div>
      </div>

      {isLoading || !dossier ? (
        <div style={{ padding: '40px 20px', textAlign: 'center', color: 'var(--text-muted)' }}>
          <div className="pulse-green" style={{ fontSize: '13px', fontWeight: 700, color: 'var(--accent-green-bright)' }}>
            &gt; EXECUTING GEMMA 2 DUAL-VERDICT REASONING MATRIX...
          </div>
          <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '6px' }}>
            Cross-referencing TabPFN multivariate residual shifts with physical thermodynamics
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
            background: '#040804',
            padding: '8px 12px',
            border: '1px solid var(--border-subtle)',
            borderRadius: '2px',
            fontSize: '11px',
            fontFamily: 'var(--font-mono)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <ShieldCheck size={14} color="var(--accent-green-bright)" />
              <span style={{ color: 'var(--text-muted)' }}>CRYPTOGRAPHIC SEAL:</span>
              <span style={{ color: 'var(--accent-green-bright)', wordBreak: 'break-all' }}>
                SHA256:{dossier.sha256Seal}
              </span>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ color: 'var(--text-muted)' }}>INFERENCE ENGINE:</span>
              <span style={{ color: 'var(--text-primary)', fontWeight: 600 }}>{dossier.engine}</span>
              <span>|</span>
              <span style={{ color: 'var(--accent-amber-bright)', fontWeight: 700 }}>
                ANOMALY CONFIDENCE: {dossier.confidenceIndex.toFixed(1)}%
              </span>
            </div>
          </div>

          {/* Executive Summary */}
          <div style={{
            background: '#040804',
            border: '1px solid var(--border-subtle)',
            borderLeft: '3px solid var(--accent-green)',
            borderRadius: '2px',
            padding: '10px 14px'
          }}>
            <div style={{ fontSize: '10px', color: 'var(--accent-green-bright)', fontWeight: 700, letterSpacing: '0.05em', marginBottom: '4px' }}>
              &gt; EXECUTIVE SUMMARY
            </div>
            <p style={{ fontSize: '12px', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
              {dossier.executiveSummary}
            </p>
          </div>

          {/* Dual Verdict Columns */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '10px' }}>
            {/* Left: Rational Physical Hypothesis */}
            <div style={{
              background: '#040804',
              border: '1px solid var(--border-subtle)',
              borderTop: '2px solid var(--accent-green)',
              borderRadius: '2px',
              padding: '14px',
              display: 'flex',
              flexDirection: 'column',
              gap: '10px'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Cpu size={14} color="var(--accent-green-bright)" />
                  <span style={{ fontSize: '11px', fontWeight: 700, color: 'var(--accent-green-bright)', letterSpacing: '0.04em' }}>
                    [01] RATIONAL PHYSICAL HYPOTHESIS
                  </span>
                </div>
                <span className="badge-green" style={{ fontSize: '10px' }}>
                  {dossier.rationalVerdict.physicalPlausibilityScore}% PLAUSIBILITY
                </span>
              </div>

              <div style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-primary)' }}>
                {dossier.rationalVerdict.headline}
              </div>

              <div>
                <div style={{ fontSize: '10px', color: 'var(--text-muted)', marginBottom: '4px' }}>
                  PROBABLE MECHANICAL CAUSES:
                </div>
                <ul style={{ paddingLeft: '16px', fontSize: '11px', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                  {dossier.rationalVerdict.probableCauses.map((cause: string, idx: number) => (
                    <li key={idx}>{cause}</li>
                  ))}
                </ul>
              </div>

              <div style={{
                marginTop: 'auto',
                background: 'rgba(34, 197, 94, 0.05)',
                padding: '8px 10px',
                borderRadius: '2px',
                fontSize: '11px',
                borderLeft: '2px solid var(--accent-green)'
              }}>
                <span style={{ color: 'var(--accent-green-bright)', fontWeight: 700 }}>RECOMMENDATION: </span>
                <span style={{ color: 'var(--text-secondary)' }}>{dossier.rationalVerdict.technicalRecommendation}</span>
              </div>
            </div>

            {/* Right: Anomalous Divergence Verdict */}
            <div style={{
              background: '#040804',
              border: '1px solid var(--border-subtle)',
              borderTop: '2px solid var(--accent-amber)',
              borderRadius: '2px',
              padding: '14px',
              display: 'flex',
              flexDirection: 'column',
              gap: '10px'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <AlertTriangle size={14} color="var(--accent-amber-bright)" />
                  <span style={{ fontSize: '11px', fontWeight: 700, color: 'var(--accent-amber-bright)', letterSpacing: '0.04em' }}>
                    [02] ANOMALOUS DIVERGENCE HYPOTHESIS
                  </span>
                </div>
                <span className="badge-amber" style={{ fontSize: '10px' }}>
                  {dossier.paranormalVerdict.spectralPlausibilityScore}% PLAUSIBILITY
                </span>
              </div>

              <div style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-primary)' }}>
                {dossier.paranormalVerdict.headline}
              </div>

              <div>
                <div style={{ fontSize: '10px', color: 'var(--accent-amber)', marginBottom: '4px' }}>
                  PHENOMENOLOGICAL &amp; ENVIRONMENTAL LORE:
                </div>
                <p style={{ fontSize: '11px', color: 'var(--text-secondary)', lineHeight: 1.6, fontStyle: 'italic' }}>
                  "{dossier.paranormalVerdict.loreContext}"
                </p>
              </div>

              <div style={{
                marginTop: 'auto',
                background: 'rgba(245, 158, 11, 0.05)',
                padding: '8px 10px',
                borderRadius: '2px',
                fontSize: '11px',
                borderLeft: '2px solid var(--accent-amber)'
              }}>
                <span style={{ color: 'var(--accent-amber-bright)', fontWeight: 700 }}>DEDUCTION: </span>
                <span style={{ color: 'var(--text-secondary)' }}>{dossier.paranormalVerdict.environmentalParapsychologyDeduction}</span>
              </div>
            </div>
          </div>

          {/* Telemetry Evidence Audit Trail */}
          <div style={{ marginTop: '4px' }}>
            <div style={{ fontSize: '11px', color: 'var(--accent-amber-bright)', fontWeight: 700, marginBottom: '6px' }}>
              &gt; FORENSIC TELEMETRY EVIDENCE AUDIT TRAIL
            </div>
            <div style={{
              background: '#040804',
              border: '1px solid var(--border-subtle)',
              borderRadius: '2px',
              overflowX: 'auto'
            }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '11px', fontFamily: 'var(--font-mono)' }}>
                <thead>
                  <tr style={{ background: '#081208', borderBottom: '1px solid var(--border-subtle)', textAlign: 'left' }}>
                    <th style={{ padding: '8px 12px', color: 'var(--accent-green-bright)' }}>TIMESTAMP</th>
                    <th style={{ padding: '8px 12px', color: 'var(--text-muted)' }}>ANOMALOUS INCIDENT</th>
                    <th style={{ padding: '8px 12px', color: 'var(--accent-amber-bright)' }}>DIVERGENCE PROOF</th>
                  </tr>
                </thead>
                <tbody>
                  {dossier.timelineOfEvents.map((t: { time: string; event: string; sensorProof: string }, idx: number) => (
                    <tr key={idx} style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                      <td style={{ padding: '8px 12px', color: 'var(--accent-green-bright)', whiteSpace: 'nowrap' }}>
                        {t.time}
                      </td>
                      <td style={{ padding: '8px 12px', color: 'var(--text-primary)' }}>
                        {t.event}
                      </td>
                      <td style={{ padding: '8px 12px', color: 'var(--text-secondary)' }}>
                        {t.sensorProof}
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
