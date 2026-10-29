import React from 'react';
import { 
  Terminal, 
  Volume2, 
  VolumeX, 
  SlidersHorizontal,
  AlertTriangle,
  Cpu
} from 'lucide-react';
import type { ForensicCase } from '../types/telemetry';

interface HeaderProps {
  cases: ForensicCase[];
  selectedCaseId: string;
  onSelectCase: (caseId: string) => void;
  isAudioOn: boolean;
  onToggleAudio: () => void;
  onOpenSettings: () => void;
  activeAnomalyCount: number;
  modelProviderName: string;
}

export const Header: React.FC<HeaderProps> = ({
  cases,
  selectedCaseId,
  onSelectCase,
  isAudioOn,
  onToggleAudio,
  onOpenSettings,
  activeAnomalyCount,
  modelProviderName
}) => {
  return (
    <header style={{
      margin: '10px 16px 8px 16px',
      padding: '12px 16px',
      background: 'var(--bg-panel)',
      border: '1px solid var(--border-subtle)',
      borderRadius: '2px',
      display: 'flex',
      flexDirection: 'column',
      gap: '10px'
    }}>
      {/* Top Banner: Logo & Controls */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '12px'
      }}>
        {/* Terminal Title Identity */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{
            width: '32px',
            height: '32px',
            background: 'rgba(34, 197, 94, 0.12)',
            border: '1px solid var(--accent-green)',
            borderRadius: '2px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0
          }}>
            <Terminal size={18} color="var(--accent-green-bright)" />
          </div>

          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{
                fontSize: '18px',
                fontWeight: 800,
                letterSpacing: '0.12em',
                color: 'var(--accent-green-bright)',
                fontFamily: 'var(--font-mono)'
              }}>
                NOCTURNE
              </span>
              <span className="badge-green" style={{ fontSize: '10px', padding: '1px 6px' }}>
                v2.4 AIR-GAPPED
              </span>
            </div>
            <div style={{ fontSize: '11px', color: 'var(--text-secondary)', letterSpacing: '0.04em' }}>
              ENVIRONMENTAL TELEMETRY FORENSICS &amp; REASONING ENGINE
            </div>
          </div>
        </div>

        {/* Right Action Bar */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
          {/* Case Dropdown */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>CASE:</span>
            <select
              value={selectedCaseId}
              onChange={(e) => onSelectCase(e.target.value)}
              style={{
                maxWidth: '300px',
                background: '#040804',
                borderColor: 'var(--border-subtle)',
                color: 'var(--text-primary)',
                fontSize: '11px'
              }}
            >
              {cases.map((c) => (
                <option key={c.id} value={c.id}>
                  [{c.caseNumber}] {c.title}
                </option>
              ))}
            </select>
          </div>

          {/* AI Engine Tag */}
          <button
            onClick={onOpenSettings}
            className="btn-secondary"
            title="Configure AI Provider Runtime"
            style={{ fontSize: '11px', padding: '5px 10px' }}
          >
            <Cpu size={13} color="var(--accent-green)" />
            <span>{modelProviderName}</span>
          </button>

          {/* Anomaly Badge */}
          {activeAnomalyCount > 0 && (
            <div className="badge-crimson" style={{ fontSize: '11px', padding: '4px 8px' }}>
              <AlertTriangle size={12} />
              <span>{activeAnomalyCount} ANOMALIES</span>
            </div>
          )}

          {/* Audio Synthesizer */}
          <button
            onClick={onToggleAudio}
            className={isAudioOn ? "btn-primary" : "btn-secondary"}
            style={{ fontSize: '11px', padding: '5px 10px' }}
            title="Toggle Web Audio Procedural Synthesizer"
          >
            {isAudioOn ? <Volume2 size={13} /> : <VolumeX size={13} />}
            <span>{isAudioOn ? "[ AUDIO: ON ]" : "[ AUDIO: OFF ]"}</span>
          </button>

          {/* Settings */}
          <button
            onClick={onOpenSettings}
            className="btn-secondary"
            style={{ padding: '5px 8px' }}
            title="Settings"
          >
            <SlidersHorizontal size={13} />
          </button>
        </div>
      </div>

      {/* Terminal Status Ribbon (Inspired by CAKTUS header) */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '5px 10px',
        background: '#040804',
        border: '1px solid var(--border-subtle)',
        borderRadius: '2px',
        fontSize: '11px',
        fontFamily: 'var(--font-mono)',
        color: 'var(--text-muted)',
        flexWrap: 'wrap',
        gap: '10px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ color: 'var(--accent-green-bright)', fontWeight: 700 }} className="pulse-green">
            * SYSTEM ONLINE
          </span>
          <span>|</span>
          <span>AIR-GAPPED LOCAL: <strong style={{ color: 'var(--text-secondary)' }}>TRUE</strong></span>
          <span>|</span>
          <span>CASES LOADED: <strong style={{ color: 'var(--text-secondary)' }}>{cases.length}</strong></span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span>PIPELINE: <strong style={{ color: 'var(--accent-amber-bright)' }}>TABPFN + GEMMA-2</strong></span>
          <span>|</span>
          <span>PORT: <strong style={{ color: 'var(--text-secondary)' }}>5173</strong></span>
        </div>
      </div>
    </header>
  );
};
