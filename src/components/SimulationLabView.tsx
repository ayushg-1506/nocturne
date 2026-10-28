import React, { useState } from 'react';
import type { ForensicCase } from '../types/telemetry';
import type { ModelProviderConfig } from '../engine/gemmaForensics';
import { AnomalyEngine } from '../engine/anomalyDetector';
import { Terminal, Upload, Download, Sparkles, Check, Cpu, Zap, ThermometerSnowflake, Key } from 'lucide-react';

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
      const idxEmf = headers.findIndex(h => h.includes('emf') || h.includes('mag'));
      const idxWatt = headers.findIndex(h => h.includes('watt') || h.includes('power'));
      const idxLatch = headers.findIndex(h => h.includes('latch') || h.includes('door'));

      const readings = [];
      for (let i = 1; i < lines.length; i++) {
        const parts = lines[i].split(',').map(p => p.trim());
        if (parts.length < 2) continue;
        const timeStr = idxTime !== -1 ? parts[idxTime] : `03:${(i * 3).toString().padStart(2, '0')}:00`;
        const temp = idxTemp !== -1 ? parseFloat(parts[idxTemp]) || 20.0 : 20.0;
        const hum = idxHum !== -1 ? parseFloat(parts[idxHum]) || 50.0 : 50.0;
        const db = idxDb !== -1 ? parseFloat(parts[idxDb]) || 22.0 : 22.0;
        const freq = idxFreq !== -1 ? parseFloat(parts[idxFreq]) || 50.0 : 50.0;
        const pir = idxPir !== -1 ? parts[idxPir].toLowerCase() === 'true' || parts[idxPir] === '1' : false;
        const emf = idxEmf !== -1 ? parseFloat(parts[idxEmf]) || 0.25 : 0.25;
        const watts = idxWatt !== -1 ? parseFloat(parts[idxWatt]) || 15.0 : 15.0;
        const latchRaw = idxLatch !== -1 ? parts[idxLatch].toUpperCase() : 'SECURE';
        const latch = ['SECURE', 'AJAR', 'UNLATCHED', 'CYCLING'].includes(latchRaw) ? (latchRaw as any) : 'SECURE';

        readings.push({
          timestamp: timeStr,
          epochMinutes: i * 3,
          temperatureC: temp,
          humidityPct: hum,
          acousticDb: db,
          acousticFreqHz: freq,
          pirMotion: pir,
          pirRoom: pir ? 'Imported Zone' : null,
          emfFluxUtd: emf,
          powerWattage: watts,
          doorLatchState: latch,
          doorRoom: 'Imported Portal'
        });
      }

      const detected = AnomalyEngine.analyzeReadings(readings, 'Custom Zone');
      const newCase: ForensicCase = {
        id: `import-${Date.now()}`,
        caseNumber: `USER-LOG #${Math.floor(Math.random() * 8999 + 1000)}`,
        title: 'Imported Home Assistant Telemetry Session',
        subtitle: `Custom Data (${readings.length} records)`,
        location: 'Edge Gateway Ingest',
        structureType: 'Monitored Residence',
        ambientConditions: 'Imported time-series telemetry',
        incidentTimestamp: `${readings[0]?.timestamp || '00:00'} – ${readings[readings.length - 1]?.timestamp || '05:00'}`,
        description: `Custom ingested dataset with ${readings.length} multi-sensor time-series samples.`,
        investigatorNotes: `Scanned with TabPFN foundation tabular detector. Found ${detected.length} anomalous clusters.`,
        floorplan: activeCase.floorplan,
        readings,
        anomalies: detected
      };

      onImportCase(newCase);
      setImportStatus(`Successfully ingested ${readings.length} records. Detected ${detected.length} anomalies.`);
    } catch (err: any) {
      setImportStatus(`Error: ${err?.message || 'Failed to parse CSV'}`);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
      {/* Simulation Trigger Matrix */}
      <div className="glass-panel" style={{ padding: '20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px' }}>
          <Terminal size={18} color="var(--accent-amber)" />
          <h3 style={{ fontSize: '15px', fontWeight: 700, fontFamily: 'var(--font-mono)' }}>
            SYNTHETIC ANOMALY INJECTION MATRIX
          </h3>
        </div>
        <p style={{ fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '16px' }}>
          Inject real-time multi-variate environmental disturbances into the active timeline to observe how TabPFN anomaly detection and Google Gemma 2 classify and deduce verdicts in real-time.
        </p>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: '12px'
        }}>
          {/* Action 1 */}
          <button
            onClick={() => onInjectEvent('cold')}
            className="btn-secondary"
            style={{ padding: '12px 14px', justifyContent: 'flex-start', textAlign: 'left', display: 'flex', gap: '10px' }}
          >
            <ThermometerSnowflake size={20} color="var(--accent-cyan)" />
            <div>
              <div style={{ fontWeight: 700, fontSize: '12px' }}>Flash Cold Drop</div>
              <div style={{ fontSize: '10px', color: 'var(--text-muted)' }}>-7.2°C thermal collapse in 180s</div>
            </div>
          </button>

          {/* Action 2 */}
          <button
            onClick={() => onInjectEvent('infrasound')}
            className="btn-secondary"
            style={{ padding: '12px 14px', justifyContent: 'flex-start', textAlign: 'left', display: 'flex', gap: '10px' }}
          >
            <Zap size={20} color="var(--accent-violet)" />
            <div>
              <div style={{ fontWeight: 700, fontSize: '12px' }}>18.98Hz Infrasound Wave</div>
              <div style={{ fontSize: '10px', color: 'var(--text-muted)' }}>Ocular resonance + 44dB spike</div>
            </div>
          </button>

          {/* Action 3 */}
          <button
            onClick={() => onInjectEvent('surge')}
            className="btn-secondary"
            style={{ padding: '12px 14px', justifyContent: 'flex-start', textAlign: 'left', display: 'flex', gap: '10px' }}
          >
            <Cpu size={20} color="var(--accent-amber)" />
            <div>
              <div style={{ fontWeight: 700, fontSize: '12px' }}>Ghost Wattage Surge</div>
              <div style={{ fontSize: '10px', color: 'var(--text-muted)' }}>+2,380W on dead circuit breaker</div>
            </div>
          </button>

          {/* Action 4 */}
          <button
            onClick={() => onInjectEvent('latch')}
            className="btn-secondary"
            style={{ padding: '12px 14px', justifyContent: 'flex-start', textAlign: 'left', display: 'flex', gap: '10px' }}
          >
            <Key size={20} color="var(--accent-crimson)" />
            <div>
              <div style={{ fontWeight: 700, fontSize: '12px' }}>Zero-Token Latch Release</div>
              <div style={{ fontSize: '10px', color: 'var(--text-muted)' }}>Solenoid deadbolt opens unprompted</div>
            </div>
          </button>

          {/* Action 5: Full Convergence */}
          <button
            onClick={() => onInjectEvent('convergence')}
            className="btn-primary"
            style={{ padding: '12px 14px', justifyContent: 'flex-start', textAlign: 'left', display: 'flex', gap: '10px' }}
          >
            <Sparkles size={20} color="var(--accent-cyan)" />
            <div>
              <div style={{ fontWeight: 800, fontSize: '12px' }}>Full Convergence Event</div>
              <div style={{ fontSize: '10px', color: 'rgba(255,255,255,0.8)' }}>Synchronize all vectors (Critical)</div>
            </div>
          </button>
        </div>
      </div>

      {/* CSV Ingestion Panel */}
      <div className="glass-panel" style={{ padding: '20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Upload size={18} color="var(--accent-cyan)" />
            <h3 style={{ fontSize: '15px', fontWeight: 700, fontFamily: 'var(--font-mono)' }}>
              HOME ASSISTANT &amp; IOT CSV INGESTION
            </h3>
          </div>
          <button
            onClick={handleDownloadTemplate}
            style={{ background: 'transparent', border: 'none', color: 'var(--accent-cyan)', fontSize: '11px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}
          >
            <Download size={13} /> Download Sample CSV
          </button>
        </div>
        <p style={{ fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '12px' }}>
          Paste raw telemetry CSV lines from Zigbee2MQTT, ESPHome, or Home Assistant sensor histories.
        </p>

        <textarea
          rows={6}
          value={csvText}
          onChange={e => setCsvText(e.target.value)}
          placeholder="timestamp,temperatureC,humidityPct,acousticDb,acousticFreqHz,pirMotion,emfFluxUtd,powerWattage,doorLatchState&#10;03:14:00,14.2,54.0,43.5,18.98,true,6.8,1450,UNLATCHED"
          style={{
            width: '100%',
            background: 'rgba(8, 12, 18, 0.9)',
            border: '1px solid var(--border-subtle)',
            borderRadius: '6px',
            padding: '10px',
            color: 'var(--text-primary)',
            fontFamily: 'var(--font-mono)',
            fontSize: '11px',
            lineHeight: 1.5,
            marginBottom: '10px'
          }}
        />

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          {importStatus ? (
            <span style={{ fontSize: '11px', color: importStatus.startsWith('Error') ? 'var(--accent-crimson)' : 'var(--accent-emerald)', fontFamily: 'var(--font-mono)' }}>
              {importStatus}
            </span>
          ) : <span />}

          <button onClick={handleProcessCsv} className="btn-primary" style={{ padding: '6px 18px' }}>
            <Check size={14} /> <span>SCAN &amp; INGEST CSV</span>
          </button>
        </div>
      </div>

      {/* Model Engine Configuration Panel */}
      <div className="glass-panel" style={{ padding: '20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
          <Cpu size={18} color="var(--accent-violet)" />
          <h3 style={{ fontSize: '15px', fontWeight: 700, fontFamily: 'var(--font-mono)' }}>
            AI ENGINE &amp; MODEL RUNTIME SETTINGS
          </h3>
        </div>
        <p style={{ fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '16px' }}>
          Select between local air-gapped deterministic Bayesian inference, Google AI Studio Gemini API, or local Ollama.
        </p>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '14px' }}>
          {/* Option 1: Built-in */}
          <div style={{
            background: modelConfig.provider === 'built-in' ? 'rgba(56, 189, 248, 0.12)' : 'rgba(0, 0, 0, 0.3)',
            border: `1px solid ${modelConfig.provider === 'built-in' ? 'var(--accent-cyan)' : 'var(--border-subtle)'}`,
            padding: '14px',
            borderRadius: '8px',
            cursor: 'pointer'
          }} onClick={() => onUpdateModelConfig({ ...modelConfig, provider: 'built-in' })}>
            <div style={{ fontWeight: 700, fontSize: '13px', color: 'var(--text-primary)' }}>
              1. Built-in Offline Forensic Adapter (Default)
            </div>
            <p style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '4px' }}>
              100% Air-Gapped. Runs deterministically on your laptop with zero latency and zero API keys.
            </p>
          </div>

          {/* Option 2: Google AI Studio */}
          <div style={{
            background: modelConfig.provider === 'gemini' ? 'rgba(168, 85, 247, 0.12)' : 'rgba(0, 0, 0, 0.3)',
            border: `1px solid ${modelConfig.provider === 'gemini' ? 'var(--accent-violet)' : 'var(--border-subtle)'}`,
            padding: '14px',
            borderRadius: '8px',
            cursor: 'pointer'
          }} onClick={() => onUpdateModelConfig({ ...modelConfig, provider: 'gemini' })}>
            <div style={{ fontWeight: 700, fontSize: '13px', color: 'var(--text-primary)' }}>
              2. Google AI Studio (Free Gemini/Gemma)
            </div>
            <p style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '4px' }}>
              Connect directly to Google's cloud API endpoint for live LLM streaming.
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
                  style={{ width: '100%', padding: '6px 8px', fontSize: '11px', background: 'rgba(0,0,0,0.5)', border: '1px solid var(--border-subtle)', borderRadius: '4px', color: '#fff' }}
                />
              </div>
            )}
          </div>

          {/* Option 3: Local Ollama */}
          <div style={{
            background: modelConfig.provider === 'ollama' ? 'rgba(245, 158, 11, 0.12)' : 'rgba(0, 0, 0, 0.3)',
            border: `1px solid ${modelConfig.provider === 'ollama' ? 'var(--accent-amber)' : 'var(--border-subtle)'}`,
            padding: '14px',
            borderRadius: '8px',
            cursor: 'pointer'
          }} onClick={() => onUpdateModelConfig({ ...modelConfig, provider: 'ollama' })}>
            <div style={{ fontWeight: 700, fontSize: '13px', color: 'var(--text-primary)' }}>
              3. Local Ollama (`gemma2:9b`)
            </div>
            <p style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '4px' }}>
              Points to `http://localhost:11434` for open-weight offline model inference.
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
                  style={{ width: '100%', padding: '6px 8px', fontSize: '11px', background: 'rgba(0,0,0,0.5)', border: '1px solid var(--border-subtle)', borderRadius: '4px', color: '#fff' }}
                />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
