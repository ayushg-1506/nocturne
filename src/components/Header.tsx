import React from 'react';
import { 
  Radio, 
  Volume2, 
  VolumeX, 
  FileText, 
  Upload, 
  Sparkles, 
  Settings, 
  ShieldAlert,
  Terminal
} from 'lucide-react';
import type { ForensicCase } from '../types/telemetry';

interface HeaderProps {
  cases: ForensicCase[];
  selectedCaseId: string;
  onSelectCase: (caseId: string) => void;
  isAudioOn: boolean;
  onToggleAudio: () => void;
  onOpenDossier: () => void;
  onOpenImport: () => void;
  onOpenSettings: () => void;
  onInjectAnomaly: () => void;
  activeAnomalyCount: number;
  modelProviderName: string;
}

export const Header: React.FC<HeaderProps> = ({
  cases,
  selectedCaseId,
  onSelectCase,
  isAudioOn,
  onToggleAudio,
  onOpenDossier,
  onOpenImport,
  onOpenSettings,
  onInjectAnomaly,
  activeAnomalyCount,
  modelProviderName
}) => {
  return (
    <header className="glass-panel" style={{
      margin: '12px 16px',
      padding: '12px 20px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      flexWrap: 'wrap',
      gap: '16px',
      borderBottom: '1px solid var(--border-subtle)'
    }}>
      {/* Brand & Project Identity */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
        <div style={{
          position: 'relative',
          width: '36px',
          height: '36px',
          borderRadius: '8px',
          background: 'linear-gradient(135deg, rgba(56, 189, 248, 0.2) 0%, rgba(168, 85, 247, 0.2) 100%)',
          border: '1px solid rgba(56, 189, 248, 0.4)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          <Radio size={20} color="var(--accent-cyan)" />
          <span className="status-ping cyan" style={{ position: 'absolute', top: '-2px', right: '-2px' }} />
        </div>

        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <h1 style={{
              fontSize: '18px',
              fontWeight: 800,
              letterSpacing: '0.08em',
              color: 'var(--text-primary)',
              fontFamily: 'var(--font-mono)'
            }}>
              NOCTURNE
            </h1>
            <span className="badge badge-cyan" style={{ fontSize: '10px' }}>
              v2.4 AIR-GAPPED
            </span>
          </div>
          <p style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
            Nocturnal Telemetry Archaeology & Environmental Anomaly Forensics
          </p>
        </div>
      </div>

      {/* Case File Selector & Indicators */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <span style={{ fontSize: '12px', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
            DOSSIER:
          </span>
          <select
            value={selectedCaseId}
            onChange={(e) => onSelectCase(e.target.value)}
            style={{
              background: 'rgba(15, 23, 42, 0.8)',
              color: 'var(--text-primary)',
              border: '1px solid var(--border-subtle)',
              borderRadius: '6px',
              padding: '6px 10px',
              fontSize: '12px',
              fontFamily: 'var(--font-mono)',
              cursor: 'pointer',
              outline: 'none'
            }}
          >
            {cases.map((c) => (
              <option key={c.id} value={c.id}>
                {c.caseNumber} — {c.title.slice(0, 32)}...
              </option>
            ))}
          </select>
        </div>

        {/* Model Engine Tag */}
        <div 
          onClick={onOpenSettings}
          title="Click to configure AI providers (Gemma 2 / TabPFN / Groq / Ollama)"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            background: 'rgba(168, 85, 247, 0.1)',
            border: '1px solid rgba(168, 85, 247, 0.3)',
            borderRadius: '6px',
            padding: '5px 10px',
            cursor: 'pointer'
          }}
        >
          <Sparkles size={13} color="var(--accent-violet)" />
          <span style={{ fontSize: '11px', fontWeight: 600, color: '#d8b4fe', fontFamily: 'var(--font-mono)' }}>
            {modelProviderName}
          </span>
        </div>

        {/* Anomaly Counter Badge */}
        {activeAnomalyCount > 0 && (
          <div className="badge badge-crimson" style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
            <ShieldAlert size={12} />
            <span>{activeAnomalyCount} ANOMALIES</span>
          </div>
        )}
      </div>

      {/* Action Controls */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
        {/* Procedural Audio Toggle */}
        <button
          onClick={onToggleAudio}
          className={`btn-secondary ${isAudioOn ? 'badge-cyan' : ''}`}
          style={{ padding: '6px 12px' }}
          title={isAudioOn ? "Mute Nocturnal Room Sound & 18.98Hz Monitor" : "Enable Ambient Audio & Infrasound Monitor"}
        >
          {isAudioOn ? <Volume2 size={15} color="var(--accent-cyan)" /> : <VolumeX size={15} />}
          <span style={{ fontSize: '12px' }}>{isAudioOn ? "AUDIO: ON" : "AUDIO: OFF"}</span>
        </button>

        {/* Anomaly Injection Simulation */}
        <button
          onClick={onInjectAnomaly}
          className="btn-secondary"
          style={{ padding: '6px 12px' }}
          title="Inject real-time synthetic 3:00 AM environmental disturbance"
        >
          <Terminal size={14} color="var(--accent-amber)" />
          <span style={{ fontSize: '12px' }}>SUMMON ANOMALY</span>
        </button>

        {/* Import Logs */}
        <button
          onClick={onOpenImport}
          className="btn-secondary"
          style={{ padding: '6px 12px' }}
          title="Import custom CSV / JSON Home Assistant telemetry"
        >
          <Upload size={14} />
          <span style={{ fontSize: '12px' }}>IMPORT LOGS</span>
        </button>

        {/* Generate Forensic Dossier */}
        <button
          onClick={onOpenDossier}
          className="btn-primary"
          style={{ padding: '6px 14px' }}
        >
          <FileText size={15} />
          <span>INSPECT DOSSIER</span>
        </button>

        {/* Settings */}
        <button
          onClick={onOpenSettings}
          className="btn-secondary"
          style={{ padding: '6px 10px' }}
          title="Model Provider & Telemetry Settings"
        >
          <Settings size={15} />
        </button>
      </div>
    </header>
  );
};
