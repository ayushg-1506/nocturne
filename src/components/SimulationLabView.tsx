import React, { useState } from 'react';
import type { ForensicCase } from '../types/telemetry';
import type { ModelProviderConfig } from '../engine/gemmaForensics';
import { AnomalyEngine } from '../engine/anomalyDetector';
import { Terminal, Upload, Download, Check, Cpu, Zap, ThermometerSnowflake, Key } from 'lucide-react';

interface SimulationLabViewProps {
  activeCase: ForensicCase;
  onInjectEvent: (type: 'cold' | 'infrasound' | 'surge' | 'latch' | 'convergence') => void;
  onImportCase: (newCase: ForensicCase) => void;
  modelConfig: ModelProviderConfig;
  onUpdateModelConfig: (cfg: ModelProviderConfig) => void;
}

export const SimulationLabView: React.FC<SimulationLabViewProps> = ({
  activeCase,
  onInjectEvent,
  onImportCase,
  modelConfig,
  onUpdateModelConfig
}) => {
  const [csvText, setCsvText] = useState<string>('');
  const [importStatus, setImportStatus] = useState<string | null>(null);
  const [apiKeyInput, setApiKeyInput] = useState<string>(modelConfig.apiKey || '');
  const [ollamaUrlInput, setOllamaUrlInput] = useState<string>(modelConfig.baseUrl || 'http://localhost:11434/v1');

  const handleDownloadTemplate = () => {
    const sample = `timestamp,temperatureC,humidityPct,acousticDb,acousticFreqHz,pirMotion,emfFluxUtd,powerWattage,doorLatchState
03:00:00,21.2,45.0,22.0,50.0,false,0.25,15.0,SECURE
03:03:00,21.1,45.2,22.4,51.0,false,0.26,16.0,SECURE
03:06:00,21.0,45.1,23.1,49.0,false,0.24,14.5,SECURE
03:09:00,20.8,46.0,24.0,50.0,false,0.28,15.0,SECURE
03:12:00,18.4,49.2,34.5,18.98,true,2.45,45.0,SECURE
03:15:00,14.1,54.8,44.2,18.98,true,7.85,1420.0,UNLATCHED
03:18:00,14.5,53.2,41.0,18.98,true,6.10,950.0,UNLATCHED
03:21:00,17.2,50.1,28.0,48.0,false,1.80,120.0,AJAR
03:24:00,19.5,47.2,24.0,50.0,false,0.45,20.0,SECURE
03:27:00,20.4,46.0,22.5,50.0,false,0.30,16.0,SECURE`;

    const blob = new Blob([sample], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'nocturne-sample-telemetry.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleProcessCsv = () => {
    try {
      if (!csvText.trim()) return;
      const lines = csvText.split('\n').map(l => l.trim()).filter(l => l.length > 0);
      if (lines.length < 3) throw new Error('CSV must have header + at least 2 rows.');

      const headers = lines[0].toLowerCase().split(',').map(h => h.trim());
      const idxTime = headers.findIndex(h => h.includes('time'));
      const idxTemp = headers.findIndex(h => h.includes('temp'));
      const idxHum = headers.findIndex(h => h.includes('hum'));
      const idxDb = headers.findIndex(h => h.includes('db') || h.includes('sound'));
      const idxFreq = headers.findIndex(h => h.includes('freq') || h.includes('hz'));
      const idxPir = headers.findIndex(h => h.includes('pir') || h.includes('motion'));
      const idxEmf = headers.findIndex(h => h.includes('emf') || h.includes('flux'));
      const idxWatt = headers.findIndex(h => h.includes('watt') || h.includes('power'));
      const idxLatch = headers.findIndex(h => h.includes('latch') || h.includes('door'));

      if (idxTime === -1 || idxTemp === -1) {
        throw new Error('CSV must contain at least timestamp and temperature columns.');
      }

      const parsedReadings = lines.slice(1).map((line, rowIdx) => {
        const cols = line.split(',').map(c => c.trim());
        const timeStr = cols[idxTime] || `03:${rowIdx < 10 ? '0' : ''}${rowIdx}:00`;
        const temp = parseFloat(cols[idxTemp]) || 20.0;
        const hum = idxHum !== -1 ? parseFloat(cols[idxHum]) || 45 : 45;
        const db = idxDb !== -1 ? parseFloat(cols[idxDb]) || 22 : 22;
        const freq = idxFreq !== -1 ? parseFloat(cols[idxFreq]) || 50 : 50;
        const pir = idxPir !== -1 ? cols[idxPir].toLowerCase() === 'true' || cols[idxPir] === '1' : false;
        const emf = idxEmf !== -1 ? parseFloat(cols[idxEmf]) || 0.25 : 0.25;
        const watt = idxWatt !== -1 ? parseFloat(cols[idxWatt]) || 15 : 15;
        const latch = (idxLatch !== -1 ? cols[idxLatch].toUpperCase() : 'SECURE') as 'SECURE' | 'AJAR' | 'UNLATCHED';

        const parts = timeStr.split(':').map(Number);
        const epochMinutes = ((parts[0] || 3) * 60 + (parts[1] || rowIdx)) - (22 * 60);

        return {
          timestamp: timeStr,
          epochMinutes: epochMinutes < 0 ? epochMinutes + 1440 : epochMinutes,
          temperatureC: temp,
          humidityPct: hum,
          acousticDb: db,
          acousticFreqHz: freq,
          pirMotion: pir,
          emfFluxUtd: emf,
          powerWattage: watt,
          doorLatchState: latch,
          pirRoom: null,
          doorRoom: 'Main Portal'
        };
      });

      const anomalies = AnomalyEngine.analyzeReadings(parsedReadings);

      const customCase: ForensicCase = {
        id: `custom-import-${Date.now()}`,
        caseNumber: `USER-${Math.floor(1000 + Math.random() * 9000)}`,
        title: 'Custom Telemetry Stream (User Upload)',
        subtitle: 'Ingested Time-Series Anomaly Scan',
        location: 'Local Sensor Ingestion',
        structureType: 'User Defined Structure',
        ambientConditions: 'Variable Ingested Baseline',
        incidentTimestamp: parsedReadings[0]?.timestamp || '03:00:00',
        description: `Imported telemetry session with ${parsedReadings.length} frames.`,
        investigatorNotes: 'Automated multi-variate statistical anomaly evaluation.',
        floorplan: activeCase.floorplan,
        readings: parsedReadings,
        anomalies
      };

      onImportCase(customCase);
      setImportStatus(`Success! Ingested ${parsedReadings.length} records. Identified ${anomalies.length} anomaly vectors.`);
    } catch (err: unknown) {
      setImportStatus(`Error: ${err instanceof Error ? err.message : String(err)}`);
    }
  };

  return (
    <div style={{
      
      display: 'flex',
      flexDirection: 'column',
      gap: '12px'
    }}>
      {/* Synthetic Anomaly Injection Matrix */}
      <div style={{
        background: 'var(--bg-panel)',
        border: '1px solid var(--border-subtle)',
        borderRadius: '2px',
        padding: '16px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
          <Terminal size={15} color="var(--accent-green-bright)" />
          <span className="terminal-title">
            SYNTHETIC ANOMALY INJECTION MATRIX
          </span>
        </div>
        <p style={{ fontSize: '11px', color: 'var(--text-muted)', marginBottom: '12px' }}>
          Inject real-time multi-variate environmental disturbances into the active timeline to observe real-time statistical anomaly detection and causal deduction.
        </p>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '8px'
        }}>
          {/* Inject 1: Flash Cold Drop */}
          <button
            onClick={() => onInjectEvent('cold')}
            className="btn-secondary"
            style={{
              padding: '10px 12px',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'flex-start',
              gap: '4px',
              textAlign: 'left'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--accent-amber-bright)', fontWeight: 700, fontSize: '11px' }}>
              <ThermometerSnowflake size={14} /> [ INJECT: COLD DROP ]
            </div>
            <div style={{ fontSize: '10px', color: 'var(--text-muted)' }}>
              -7.2°C thermal collapse in 180s
            </div>
          </button>

          {/* Inject 2: 18.98Hz Infrasound */}
          <button
            onClick={() => onInjectEvent('infrasound')}
            className="btn-secondary"
            style={{
              padding: '10px 12px',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'flex-start',
              gap: '4px',
              textAlign: 'left'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--accent-amber-bright)', fontWeight: 700, fontSize: '11px' }}>
              <Zap size={14} /> [ INJECT: 18.98Hz WAVE ]
            </div>
            <div style={{ fontSize: '10px', color: 'var(--text-muted)' }}>
              Ocular resonance + 44dB spike
            </div>
          </button>

          {/* Inject 3: Wattage Surge */}
          <button
            onClick={() => onInjectEvent('surge')}
            className="btn-secondary"
            style={{
              padding: '10px 12px',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'flex-start',
              gap: '4px',
              textAlign: 'left'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--accent-crimson-bright)', fontWeight: 700, fontSize: '11px' }}>
              <Cpu size={14} /> [ INJECT: WATTAGE SURGE ]
            </div>
            <div style={{ fontSize: '10px', color: 'var(--text-muted)' }}>
              +2,380W phantom load spike
            </div>
          </button>

          {/* Inject 4: Zero-Token Latch */}
          <button
            onClick={() => onInjectEvent('latch')}
            className="btn-secondary"
            style={{
              padding: '10px 12px',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'flex-start',
              gap: '4px',
              textAlign: 'left'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--accent-crimson-bright)', fontWeight: 700, fontSize: '11px' }}>
              <Key size={14} /> [ INJECT: LATCH RELEASE ]
            </div>
            <div style={{ fontSize: '10px', color: 'var(--text-muted)' }}>
              Solenoid deadbolt unlatches
            </div>
          </button>

          {/* Inject 5: Full Convergence */}
          <button
            onClick={() => onInjectEvent('convergence')}
            className="btn-primary"
            style={{
              padding: '10px 12px',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'flex-start',
              gap: '4px',
              textAlign: 'left'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 800, fontSize: '11px' }}>
              <Zap size={14} /> [ TRIGGER: CONVERGENCE ]
            </div>
            <div style={{ fontSize: '10px', opacity: 0.8 }}>
              Synchronize all vectors (Critical)
            </div>
          </button>
        </div>
      </div>

      {/* CSV Ingestion */}
      <div style={{
        background: 'var(--bg-panel)',
        border: '1px solid var(--border-subtle)',
        borderRadius: '2px',
        padding: '16px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px', flexWrap: 'wrap', gap: '8px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Upload size={15} color="var(--accent-green-bright)" />
            <span className="terminal-title">
              HOME ASSISTANT &amp; IOT CSV INGESTION
            </span>
          </div>
          <button
            onClick={handleDownloadTemplate}
            className="btn-secondary"
            style={{ padding: '3px 8px', fontSize: '10px' }}
          >
            <Download size={11} />
            <span>[ DOWNLOAD SAMPLE CSV ]</span>
          </button>
        </div>
        <p style={{ fontSize: '11px', color: 'var(--text-muted)', marginBottom: '10px' }}>
          Paste raw telemetry CSV lines from Zigbee2MQTT, ESPHome, or Home Assistant sensor histories.
        </p>

        <textarea
          rows={5}
          value={csvText}
          onChange={e => setCsvText(e.target.value)}
          placeholder="timestamp,temperatureC,humidityPct,acousticDb,acousticFreqHz,pirMotion,emfFluxUtd,powerWattage,doorLatchState&#10;03:14:00,14.2,54.0,43.5,18.98,true,6.8,1450,UNLATCHED"
          style={{
            width: '100%',
            background: '#040804',
            border: '1px solid var(--border-subtle)',
            borderRadius: '2px',
            padding: '8px',
            color: 'var(--text-primary)',
            fontFamily: 'var(--font-mono)',
            fontSize: '11px',
            lineHeight: 1.5,
            marginBottom: '8px'
          }}
        />

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
          {importStatus ? (
            <span style={{ fontSize: '11px', color: importStatus.startsWith('Error') ? 'var(--accent-crimson-bright)' : 'var(--accent-green-bright)' }}>
              {importStatus}
            </span>
          ) : <span />}

          <button onClick={handleProcessCsv} className="btn-primary" style={{ padding: '5px 14px', fontSize: '11px' }}>
            <Check size={13} /> <span>[ SCAN &amp; INGEST CSV ]</span>
          </button>
        </div>
      </div>

      {/* Model Engine Configuration Panel */}
      <div style={{
        background: 'var(--bg-panel)',
        border: '1px solid var(--border-subtle)',
        borderRadius: '2px',
        padding: '16px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
          <Cpu size={15} color="var(--accent-green-bright)" />
          <span className="terminal-title">
            AI ENGINE &amp; MODEL RUNTIME CONFIGURATION
          </span>
        </div>
        <p style={{ fontSize: '11px', color: 'var(--text-muted)', marginBottom: '12px' }}>
          Select between local air-gapped deterministic inference, Google AI Studio endpoint, or local Ollama.
        </p>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '10px' }}>
          {/* Option 1: Built-in */}
          <div style={{
            background: modelConfig.provider === 'built-in' ? 'rgba(34, 197, 94, 0.12)' : '#040804',
            border: `1px solid ${modelConfig.provider === 'built-in' ? 'var(--accent-green)' : 'var(--border-subtle)'}`,
            padding: '12px',
            borderRadius: '2px',
            cursor: 'pointer'
          }} onClick={() => onUpdateModelConfig({ ...modelConfig, provider: 'built-in' })}>
            <div style={{ fontWeight: 700, fontSize: '12px', color: 'var(--text-primary)' }}>
              [01] Built-in Offline Adapter (Default)
            </div>
            <p style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '4px' }}>
              100% Air-Gapped. Runs deterministically on edge hardware with zero latency and zero API keys.
            </p>
          </div>

          {/* Option 2: Google AI Studio */}
          <div style={{
            background: modelConfig.provider === 'gemini' ? 'rgba(245, 158, 11, 0.12)' : '#040804',
            border: `1px solid ${modelConfig.provider === 'gemini' ? 'var(--accent-amber)' : 'var(--border-subtle)'}`,
            padding: '12px',
            borderRadius: '2px',
            cursor: 'pointer'
          }} onClick={() => onUpdateModelConfig({ ...modelConfig, provider: 'gemini' })}>
            <div style={{ fontWeight: 700, fontSize: '12px', color: 'var(--text-primary)' }}>
              [02] Cloud API Inference Endpoint
            </div>
            <p style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '4px' }}>
              Connects to Google Cloud API for live model reasoning.
            </p>
            {modelConfig.provider === 'gemini' && (
              <div style={{ marginTop: '8px' }} onClick={e => e.stopPropagation()}>
                <input
                  type="password"
                  placeholder="Paste Google AI Key (AIzaSy...)"
                  value={apiKeyInput}
                  onChange={e => {
                    setApiKeyInput(e.target.value);
                    onUpdateModelConfig({ ...modelConfig, apiKey: e.target.value });
                  }}
                  style={{ width: '100%', fontSize: '11px' }}
                />
              </div>
            )}
          </div>

          {/* Option 3: Local Ollama */}
          <div style={{
            background: modelConfig.provider === 'ollama' ? 'rgba(34, 197, 94, 0.12)' : '#040804',
            border: `1px solid ${modelConfig.provider === 'ollama' ? 'var(--accent-green)' : 'var(--border-subtle)'}`,
            padding: '12px',
            borderRadius: '2px',
            cursor: 'pointer'
          }} onClick={() => onUpdateModelConfig({ ...modelConfig, provider: 'ollama' })}>
            <div style={{ fontWeight: 700, fontSize: '12px', color: 'var(--text-primary)' }}>
              [03] Local Ollama Instance (:11434)
            </div>
            <p style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '4px' }}>
              Points to local server for open-weight offline model inference.
            </p>
            {modelConfig.provider === 'ollama' && (
              <div style={{ marginTop: '8px' }} onClick={e => e.stopPropagation()}>
                <input
                  type="text"
                  placeholder="http://localhost:11434/v1"
                  value={ollamaUrlInput}
                  onChange={e => {
                    setOllamaUrlInput(e.target.value);
                    onUpdateModelConfig({ ...modelConfig, baseUrl: e.target.value });
                  }}
                  style={{ width: '100%', fontSize: '11px' }}
                />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
