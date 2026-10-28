import React, { useState, useEffect } from 'react';
import type { ForensicCase, ForensicDossier } from '../types/telemetry';
import { GemmaForensicsEngine, type ModelProviderConfig } from '../engine/gemmaForensics';
import { 
  X, 
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

interface DossierModalProps {
  isOpen: boolean;
  onClose: () => void;
  forensicCase: ForensicCase;
  modelConfig: ModelProviderConfig;
}

export const DossierModal: React.FC<DossierModalProps> = ({
  isOpen,
  onClose,
  forensicCase,
  modelConfig
}) => {
  const [dossier, setDossier] = useState<ForensicDossier | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  // Generate dossier on open or refresh
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
    if (isOpen) {
      loadDossier();
    }
  }, [isOpen, forensicCase.id]);

  if (!isOpen) return null;

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
    <div style={{
      position: 'fixed',
      inset: 0,
      background: 'rgba(0, 0, 0, 0.85)',
      backdropFilter: 'blur(12px)',
      zIndex: 100,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px'
    }}>
      <div className="glass-panel" style={{
        width: '100%',
        maxWidth: '920px',
        maxHeight: '90vh',
        display: 'flex',
        flexDirection: 'column',
        borderRadius: '12px',
        border: '1px solid var(--border-highlight)',
        overflow: 'hidden',
        boxShadow: '0 20px 40px rgba(0,0,0,0.8)'
      }}>
        {/* Modal Header */}
        <div style={{
          padding: '16px 20px',
          borderBottom: '1px solid var(--border-subtle)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          background: 'rgba(15, 23, 42, 0.7)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <FileText size={18} color="var(--accent-cyan)" />
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <h3 style={{ fontSize: '15px', fontWeight: 800, fontFamily: 'var(--font-mono)' }}>
                  CLASSIFIED INCIDENT DOSSIER
                </h3>
                <span className="badge badge-cyan" style={{ fontSize: '10px' }}>
                  {forensicCase.caseNumber}
                </span>
              </div>
              <p style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
                {forensicCase.title} — {forensicCase.location}
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <button
              onClick={loadDossier}
              disabled={isLoading}
              className="btn-secondary"
              style={{ padding: '6px 12px' }}
              title="Re-run Forensic Deduction"
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
              className="btn-secondary"
              style={{ padding: '6px 12px' }}
            >
              <Download size={13} />
              <span style={{ fontSize: '11px' }}>JSON</span>
            </button>

            <button
              onClick={onClose}
              style={{
                background: 'transparent',
                border: 'none',
                color: 'var(--text-muted)',
                cursor: 'pointer',
                padding: '4px',
                marginLeft: '8px'
              }}
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Modal Scrollable Body */}
        <div style={{
          padding: '20px',
          overflowY: 'auto',
          display: 'flex',
          flexDirection: 'column',
          gap: '20px'
        }}>
          {isLoading || !dossier ? (
            <div style={{ padding: '60px 20px', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px' }}>
              <RefreshCw size={28} className="animate-spin" color="var(--accent-cyan)" />
              <span style={{ fontSize: '13px', fontFamily: 'var(--font-mono)', color: 'var(--text-secondary)' }}>
                RUNNING GOOGLE GEMMA 2 &amp; TABPFN MULTI-VARIATE FORENSIC DEDUCTION...
              </span>
            </div>
          ) : (
            <>
              {/* Seal & Metadata Banner */}
              <div style={{
                background: 'rgba(10, 15, 24, 0.7)',
                border: '1px solid var(--border-subtle)',
                borderRadius: '8px',
                padding: '12px 16px',
                display: 'flex',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: '12px',
                fontSize: '11px',
                fontFamily: 'var(--font-mono)'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <ShieldCheck size={16} color="var(--accent-emerald)" />
                  <div>
                    <span style={{ color: 'var(--text-muted)' }}>CRYPTOGRAPHIC SEAL: </span>
                    <span style={{ color: 'var(--accent-cyan)' }}>{dossier.sha256Seal.slice(0, 32)}...</span>
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
                  <span style={{ color: 'var(--text-muted)' }}>CONFIDENCE INDEX: </span>
                  <span style={{ color: 'var(--accent-emerald)', fontWeight: 700 }}>
                    {(dossier.confidenceIndex * 100).toFixed(1)}%
                  </span>
                </div>
              </div>

              {/* Executive Summary */}
              <div style={{
                background: 'rgba(56, 189, 248, 0.05)',
                borderLeft: '4px solid var(--accent-cyan)',
                padding: '12px 16px',
                borderRadius: '0 8px 8px 0'
              }}>
                <h4 style={{ fontSize: '11px', color: 'var(--accent-cyan)', fontFamily: 'var(--font-mono)', textTransform: 'uppercase', marginBottom: '4px' }}>
                  Executive Forensic Summary
                </h4>
                <p style={{ fontSize: '13px', lineHeight: 1.6, color: 'var(--text-primary)' }}>
                  {dossier.executiveSummary}
                </p>
              </div>

              {/* Dual-Verdict Comparison Grid */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(380px, 1fr))',
                gap: '16px'
              }}>
                {/* Left: Rational Environmental Verdict */}
                <div style={{
                  background: 'rgba(15, 23, 42, 0.5)',
                  border: '1px solid rgba(56, 189, 248, 0.25)',
                  borderRadius: '8px',
                  padding: '16px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '12px'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <Cpu size={16} color="var(--accent-cyan)" />
                      <h4 style={{ fontSize: '13px', fontWeight: 700, color: 'var(--accent-cyan)' }}>
                        RATIONAL HYPOTHESIS
                      </h4>
                    </div>
                    <span className="badge badge-cyan">
                      {dossier.rationalVerdict.physicalPlausibilityScore}% PLAUSIBILITY
                    </span>
                  </div>

                  <h5 style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-primary)' }}>
                    {dossier.rationalVerdict.headline}
                  </h5>

                  <div>
                    <span style={{ fontSize: '11px', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
                      PROBABLE PHYSICAL CAUSES:
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
                    padding: '8px 12px',
                    borderRadius: '6px',
                    fontSize: '11px',
                    borderLeft: '3px solid var(--accent-cyan)'
                  }}>
                    <span style={{ color: 'var(--accent-cyan)', fontWeight: 600 }}>RECOMMENDATION: </span>
                    <span style={{ color: 'var(--text-secondary)' }}>{dossier.rationalVerdict.technicalRecommendation}</span>
                  </div>
                </div>

                {/* Right: Paranormal "Ghost in the Machine" Verdict */}
                <div style={{
                  background: 'rgba(30, 15, 45, 0.4)',
                  border: '1px solid rgba(168, 85, 247, 0.35)',
                  borderRadius: '8px',
                  padding: '16px',
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

                  <h5 style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-primary)' }}>
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
                    padding: '8px 12px',
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
              <div>
                <h4 style={{ fontSize: '12px', fontFamily: 'var(--font-mono)', color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '8px' }}>
                  Forensic Telemetry Evidence Audit Trail
                </h4>
                <div style={{
                  background: 'rgba(8, 12, 18, 0.9)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: '8px',
                  overflow: 'hidden'
                }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px' }}>
                    <thead>
                      <tr style={{ background: 'rgba(255, 255, 255, 0.03)', borderBottom: '1px solid var(--border-subtle)', textAlign: 'left' }}>
                        <th style={{ padding: '8px 12px', fontFamily: 'var(--font-mono)', color: 'var(--text-muted)' }}>TIMESTAMP</th>
                        <th style={{ padding: '8px 12px', fontFamily: 'var(--font-mono)', color: 'var(--text-muted)' }}>ANOMALOUS INCIDENT</th>
                        <th style={{ padding: '8px 12px', fontFamily: 'var(--font-mono)', color: 'var(--text-muted)' }}>DIVERGENCE PROOF</th>
                      </tr>
                    </thead>
                    <tbody>
                      {dossier.timelineOfEvents.map((t: { time: string; event: string; sensorProof: string }, idx: number) => (
                        <tr key={idx} style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                          <td style={{ padding: '8px 12px', fontFamily: 'var(--font-mono)', color: 'var(--accent-cyan)', whiteSpace: 'nowrap' }}>
                            {t.time}
                          </td>
                          <td style={{ padding: '8px 12px', color: 'var(--text-primary)' }}>
                            {t.event}
                          </td>
                          <td style={{ padding: '8px 12px', fontFamily: 'var(--font-mono)', fontSize: '11px', color: 'var(--text-secondary)' }}>
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
      </div>
    </div>
  );
};
