import React, { useState } from 'react';
import { Info, ChevronDown, ChevronUp, Shield, Cpu, Layers } from 'lucide-react';

export const ExecutiveBriefing: React.FC = () => {
  const [isExpanded, setIsExpanded] = useState<boolean>(true);

  return (
    <div className="glass-panel" style={{
      margin: '0 16px 12px 16px',
      padding: '12px 18px',
      borderLeft: '4px solid var(--accent-cyan)'
    }}>
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        cursor: 'pointer'
      }} onClick={() => setIsExpanded(!isExpanded)}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <Info size={17} color="var(--accent-cyan)" />
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <h2 style={{ fontSize: '13px', fontWeight: 800, fontFamily: 'var(--font-mono)', letterSpacing: '0.04em' }}>
                SYSTEM BRIEFING: WHAT IS NOCTURNE &amp; HOW TO OPERATE
              </h2>
              <span className="badge badge-cyan" style={{ fontSize: '9px' }}>
                HACKTOBERFEST 2026: GHOST IN THE MACHINE
              </span>
            </div>
            <p style={{ fontSize: '11px', color: 'var(--text-secondary)', marginTop: '2px' }}>
              Air-gapped environmental telemetry archaeology powered by TabPFN tabular anomaly detection &amp; Google Gemma 2 dual-verdict reasoning.
            </p>
          </div>
        </div>

        <button style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
          {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
        </button>
      </div>

      {isExpanded && (
        <div style={{
          marginTop: '12px',
          paddingTop: '12px',
          borderTop: '1px solid var(--border-subtle)',
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
          gap: '14px',
          fontSize: '11px',
          color: 'var(--text-secondary)',
          lineHeight: 1.5
        }}>
          {/* Card 1 */}
          <div style={{ background: 'rgba(0, 0, 0, 0.3)', padding: '10px 12px', borderRadius: '6px', border: '1px solid var(--border-subtle)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--accent-cyan)', fontWeight: 700, marginBottom: '4px' }}>
              <Shield size={14} /> 1. The Real Problem It Solves
            </div>
            <p>
              Smart homes record gigabytes of silent telemetry. When a 3:17 AM cold drop or unlatched deadbolt occurs, Nocturne analyzes whether it was an HVAC failure or a spectral anomaly—100% locally without sending your home data to cloud servers.
            </p>
          </div>

          {/* Card 2 */}
          <div style={{ background: 'rgba(0, 0, 0, 0.3)', padding: '10px 12px', borderRadius: '6px', border: '1px solid var(--border-subtle)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--accent-violet)', fontWeight: 700, marginBottom: '4px' }}>
              <Cpu size={14} /> 2. TabPFN &amp; Gemma 2 AI Pipeline
            </div>
            <p>
              <strong>TabPFN</strong> foundation scoring scans multi-sensor time-series for multivariate statistical divergence. <strong>Google Gemma 2</strong> then reviews the incident to produce a balanced, side-by-side Dual Verdict (Engineering vs Día de los Muertos Lore).
            </p>
          </div>

          {/* Card 3 */}
          <div style={{ background: 'rgba(0, 0, 0, 0.3)', padding: '10px 12px', borderRadius: '6px', border: '1px solid var(--border-subtle)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--accent-amber)', fontWeight: 700, marginBottom: '4px' }}>
              <Layers size={14} /> 3. Categorized Tabs
            </div>
            <p>
              Use the tabs above to explore: <strong>Spatial Radar</strong> for the floorplan; <strong>Multi-Spectral Telemetry</strong> for waveform channels; <strong>Oscilloscope</strong> for the 18.98Hz ghost frequency; and <strong>AI Dossier</strong> for the full investigation report.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};
