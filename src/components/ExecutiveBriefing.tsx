import React, { useState } from 'react';
import { ChevronDown, ChevronUp, Terminal, ShieldCheck, Cpu, Database } from 'lucide-react';

export const ExecutiveBriefing: React.FC = () => {
  const [isExpanded, setIsExpanded] = useState<boolean>(true);

  return (
    <div style={{
      margin: '0 16px 10px 16px',
      padding: '10px 14px',
      background: 'var(--bg-panel)',
      border: '1px solid var(--border-subtle)',
      borderLeft: '3px solid var(--accent-green)',
      borderRadius: '2px'
    }}>
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        cursor: 'pointer'
      }} onClick={() => setIsExpanded(!isExpanded)}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Terminal size={15} color="var(--accent-green-bright)" />
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
            <span className="terminal-title" style={{ fontSize: '12px' }}>
              SYSTEM OVERVIEW &amp; ANOMALY REASONING SPECIFICATION
            </span>
            <span className="badge-green" style={{ fontSize: '9px', padding: '1px 6px' }}>
              LOCAL-FIRST AIR-GAPPED
            </span>
          </div>
        </div>

        <button style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
          {isExpanded ? <ChevronUp size={15} /> : <ChevronDown size={15} />}
        </button>
      </div>

      {isExpanded && (
        <div style={{
          marginTop: '10px',
          paddingTop: '10px',
          borderTop: '1px solid var(--border-subtle)',
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
          gap: '10px',
          fontSize: '11px',
          color: 'var(--text-secondary)',
          lineHeight: 1.5
        }}>
          {/* Card 1 */}
          <div className="terminal-box" style={{ padding: '8px 10px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--accent-green-bright)', fontWeight: 700, marginBottom: '3px' }}>
              <ShieldCheck size={13} /> [01] CAUSALITY &amp; PRIVACY
            </div>
            <p style={{ color: 'var(--text-secondary)' }}>
              IoT microclimate sensors generate continuous nocturnal time-series. When overnight anomalies occur (unprompted 7.2°C temperature drops, deadbolt cycles, phantom wattage spikes), Nocturne isolates causality locally without streaming sensor telemetry to cloud servers.
            </p>
          </div>

          {/* Card 2 */}
          <div className="terminal-box" style={{ padding: '8px 10px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--accent-amber-bright)', fontWeight: 700, marginBottom: '3px' }}>
              <Cpu size={13} /> [02] DUAL-TIER INFERENCE ENGINE
            </div>
            <p style={{ color: 'var(--text-secondary)' }}>
              Multi-variate telemetry streams are scored through <strong>TabPFN</strong> tabular foundation models for statistical divergence, then evaluated by <strong>Google Gemma 2</strong> (running locally or offline) to produce dual-verdict hypotheses (Mechanical Failure vs Environmental Phenomenon).
            </p>
          </div>

          {/* Card 3 */}
          <div className="terminal-box" style={{ padding: '8px 10px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--accent-green-bright)', fontWeight: 700, marginBottom: '3px' }}>
              <Database size={13} /> [03] CRYPTOGRAPHIC EVIDENCE SEAL
            </div>
            <p style={{ color: 'var(--text-secondary)' }}>
              All captured anomalous events are timestamped, audited across acoustic, electromagnetic, and spatial sensor axes, and sealed with a tamper-evident <strong>SHA-256</strong> chain-of-custody checksum for verifiable forensic export.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};
