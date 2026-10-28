import React, { useState, useEffect } from 'react';
import type { ForensicCase, ForensicDossier } from '../types/telemetry';
import { GemmaForensicsEngine, type ModelProviderConfig } from '../engine/gemmaForensics';
import { 
  FileText, 
  ShieldCheck, 
  Cpu, 
  Ghost, 
  Copy, 
  Check, 
  Download, 
  RefreshCw, 
  Sparkles
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

### 1. Rational Environmental Hypothesis (${dossier.rationalVerdict.physicalPlausibilityScore}% Plausibility)
**Headline:** ${dossier.rationalVerdict.headline}
**Probable Mechanical Causes:**
${dossier.rationalVerdict.probableCauses.map((c: string) => `- ${c}`).join('\n')}
**Technical Recommendation:** ${dossier.rationalVerdict.technicalRecommendation}

### 2. "Ghost in the Machine" Hypothesis (${dossier.paranormalVerdict.spectralPlausibilityScore}% Plausibility)
**Headline:** ${dossier.paranormalVerdict.headline}
**Lore & Cultural Context:** ${dossier.paranormalVerdict.loreContext}
**Deduction:** ${dossier.paranormalVerdict.environmentalParapsychologyDeduction}

## Telemetry Evidence Log
${dossier.timelineOfEvents.map((e: { time: string; event: string; sensorProof: string }) => `* **${e.time}**: ${e.event}\n  *Proof:* \`${e.sensorProof}\``).join('\n')}
`;

    navigator.clipboard.writeText(md);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadJson = () => {
    if (!dossier) return;
    const blob = new Blob([JSON.stringify(dossier, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `nocturne-dossier-${forensicCase.id}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="glass-panel" style={{
      padding: '20px',
      display: 'flex',
      flexDirection: 'column',
      gap: '18px'
    }}>
      {/* Dossier Header Bar */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '12px',
        paddingBottom: '16px',
        borderBottom: '1px solid var(--border-subtle)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{
            width: '40px',
            height: '40px',
            borderRadius: '8px',
            background: 'rgba(56, 189, 248, 0.15)',
            border: '1px solid var(--accent-cyan)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <FileText size={20} color="var(--accent-cyan)" />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <h2 style={{ fontSize: '16px', fontWeight: 800, fontFamily: 'var(--font-mono)' }}>
                CLASSIFIED INCIDENT DOSSIER
              </h2>
              <span className="badge badge-cyan">
                {forensicCase.caseNumber}
              </span>
            </div>
            <p style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
              {forensicCase.title} — {forensicCase.location} ({forensicCase.structureType})
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <button
            onClick={loadDossier}
            disabled={isLoading}
            className="btn-secondary"
            style={{ padding: '6px 12px' }}
          >
            <RefreshCw size={13} className={isLoading ? 'animate-spin' : ''} />
            <span style={{ fontSize: '11px' }}>RE-ANALYZE</span>
          </button>

          <button
            onClick={handleCopyMarkdown}
            className="btn-secondary"
            style={{ padding: '6px 12px' }}
          >
            {copied ? <Check size={13} color="var(--accent-emerald)" /> : <Copy size={13} />}
            <span style={{ fontSize: '11px' }}>{copied ? 'COPIED MD' : 'COPY MARKDOWN'}</span>
          </button>

          <button
            onClick={handleDownloadJson}
            className="btn-primary"
            style={{ padding: '6px 14px' }}
          >
            <Download size={13} />
            <span style={{ fontSize: '11px' }}>EXPORT JSON DOSSIER</span>
          </button>
        </div>
      </div>

      {isLoading || !dossier ? (
        <div style={{ padding: '60px 20px', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px' }}>
          <RefreshCw size={32} className="animate-spin" color="var(--accent-cyan)" />
          <span style={{ fontSize: '13px', fontFamily: 'var(--font-mono)', color: 'var(--text-secondary)' }}>
            SYNTHESIZING GOOGLE GEMMA 2 &amp; TABPFN DUAL-VERDICT INVESTIGATION...
          </span>
        </div>
      ) : (
        <>
          {/* Metadata & Seal Banner */}
          <div style={{
            background: 'rgba(10, 15, 24, 0.7)',
            border: '1px solid var(--border-subtle)',
            borderRadius: '8px',
            padding: '12px 18px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '12px',
            fontSize: '11px',
            fontFamily: 'var(--font-mono)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <ShieldCheck size={16} color="var(--accent-emerald)" />
              <div>
                <span style={{ color: 'var(--text-muted)' }}>CRYPTOGRAPHIC SEAL: </span>
                <span style={{ color: 'var(--accent-cyan)' }}>{dossier.sha256Seal}</span>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Sparkles size={14} color="var(--accent-violet)" />
              <div>
                <span style={{ color: 'var(--text-muted)' }}>INFERENCE ENGINE: </span>
                <span style={{ color: '#d8b4fe' }}>{dossier.engine}</span>
              </div>
            </div>

            <div>
              <span style={{ color: 'var(--text-muted)' }}>ANOMALY CONFIDENCE: </span>
              <span style={{ color: 'var(--accent-emerald)', fontWeight: 700 }}>
                {(dossier.confidenceIndex * 100).toFixed(1)}%
              </span>
            </div>
          </div>

          {/* Executive Summary */}
          <div style={{
            background: 'rgba(56, 189, 248, 0.05)',
            borderLeft: '4px solid var(--accent-cyan)',
            padding: '14px 18px',
            borderRadius: '0 8px 8px 0'
          }}>
            <h3 style={{ fontSize: '11px', color: 'var(--accent-cyan)', fontFamily: 'var(--font-mono)', textTransform: 'uppercase', marginBottom: '4px' }}>
              Executive Summary
            </h3>
            <p style={{ fontSize: '13px', lineHeight: 1.6, color: 'var(--text-primary)' }}>
              {dossier.executiveSummary}
            </p>
          </div>

          {/* Dual-Verdict Grid */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))',
            gap: '18px'
          }}>
            {/* Left: Rational Mechanical Verdict */}
            <div style={{
              background: 'rgba(15, 23, 42, 0.5)',
              border: '1px solid rgba(56, 189, 248, 0.3)',
              borderRadius: '8px',
              padding: '18px',
              display: 'flex',
              flexDirection: 'column',
              gap: '12px'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Cpu size={16} color="var(--accent-cyan)" />
                  <h4 style={{ fontSize: '13px', fontWeight: 700, color: 'var(--accent-cyan)' }}>
                    RATIONAL PHYSICAL HYPOTHESIS
                  </h4>
                </div>
                <span className="badge badge-cyan">
                  {dossier.rationalVerdict.physicalPlausibilityScore}% PLAUSIBILITY
                </span>
              </div>

              <h5 style={{ fontSize: '14px', fontWeight: 700, color: 'var(--text-primary)' }}>
                {dossier.rationalVerdict.headline}
              </h5>

              <div>
                <span style={{ fontSize: '11px', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
                  PROBABLE MECHANICAL CAUSES:
                </span>
                <ul style={{ marginTop: '6px', paddingLeft: '18px', fontSize: '12px', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                  {dossier.rationalVerdict.probableCauses.map((cause: string, idx: number) => (
                    <li key={idx}>{cause}</li>
                  ))}
                </ul>
              </div>

              <div style={{
                marginTop: 'auto',
                background: 'rgba(0, 0, 0, 0.4)',
                padding: '10px 14px',
                borderRadius: '6px',
                fontSize: '11px',
                borderLeft: '3px solid var(--accent-cyan)'
              }}>
                <span style={{ color: 'var(--accent-cyan)', fontWeight: 600 }}>RECOMMENDATION: </span>
                <span style={{ color: 'var(--text-secondary)' }}>{dossier.rationalVerdict.technicalRecommendation}</span>
              </div>
            </div>

            {/* Right: Ghost in the Machine Verdict */}
            <div style={{
              background: 'rgba(30, 15, 45, 0.4)',
              border: '1px solid rgba(168, 85, 247, 0.4)',
              borderRadius: '8px',
              padding: '18px',
              display: 'flex',
              flexDirection: 'column',
              gap: '12px'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Ghost size={16} color="var(--accent-violet)" />
                  <h4 style={{ fontSize: '13px', fontWeight: 700, color: '#d8b4fe' }}>
                    GHOST IN THE MACHINE HYPOTHESIS
                  </h4>
                </div>
                <span className="badge badge-violet">
                  {dossier.paranormalVerdict.spectralPlausibilityScore}% PLAUSIBILITY
                </span>
              </div>

              <h5 style={{ fontSize: '14px', fontWeight: 700, color: 'var(--text-primary)' }}>
                {dossier.paranormalVerdict.headline}
              </h5>

              <div>
                <span style={{ fontSize: '11px', color: '#c084fc', fontFamily: 'var(--font-mono)' }}>
                  DÍA DE LOS MUERTOS &amp; LORE CONTEXT:
                </span>
                <p style={{ marginTop: '4px', fontSize: '12px', color: 'var(--text-secondary)', lineHeight: 1.6, fontStyle: 'italic' }}>
                  "{dossier.paranormalVerdict.loreContext}"
                </p>
              </div>

              <div style={{
                marginTop: 'auto',
                background: 'rgba(0, 0, 0, 0.4)',
                padding: '10px 14px',
                borderRadius: '6px',
                fontSize: '11px',
                borderLeft: '3px solid var(--accent-violet)'
              }}>
                <span style={{ color: 'var(--accent-violet)', fontWeight: 600 }}>PARAPSYCHOLOGY DEDUCTION: </span>
                <span style={{ color: 'var(--text-secondary)' }}>{dossier.paranormalVerdict.environmentalParapsychologyDeduction}</span>
              </div>
            </div>
          </div>

          {/* Telemetry Evidence Audit Trail */}
          <div style={{ marginTop: '8px' }}>
            <h3 style={{ fontSize: '12px', fontFamily: 'var(--font-mono)', color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '8px' }}>
              Forensic Telemetry Evidence Audit Trail
            </h3>
            <div style={{
              background: 'rgba(8, 12, 18, 0.9)',
              border: '1px solid var(--border-subtle)',
              borderRadius: '8px',
              overflow: 'hidden'
            }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px' }}>
                <thead>
                  <tr style={{ background: 'rgba(255, 255, 255, 0.03)', borderBottom: '1px solid var(--border-subtle)', textAlign: 'left' }}>
                    <th style={{ padding: '10px 14px', fontFamily: 'var(--font-mono)', color: 'var(--text-muted)' }}>TIMESTAMP</th>
                    <th style={{ padding: '10px 14px', fontFamily: 'var(--font-mono)', color: 'var(--text-muted)' }}>ANOMALOUS INCIDENT</th>
                    <th style={{ padding: '10px 14px', fontFamily: 'var(--font-mono)', color: 'var(--text-muted)' }}>DIVERGENCE PROOF</th>
                  </tr>
                </thead>
                <tbody>
                  {dossier.timelineOfEvents.map((t: { time: string; event: string; sensorProof: string }, idx: number) => (
                    <tr key={idx} style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                      <td style={{ padding: '10px 14px', fontFamily: 'var(--font-mono)', color: 'var(--accent-cyan)', whiteSpace: 'nowrap' }}>
                        {t.time}
                      </td>
                      <td style={{ padding: '10px 14px', color: 'var(--text-primary)' }}>
                        {t.event}
                      </td>
                      <td style={{ padding: '10px 14px', fontFamily: 'var(--font-mono)', fontSize: '11px', color: 'var(--text-secondary)' }}>
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
