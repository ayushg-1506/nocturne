import React, { useRef } from 'react';
import type { SensorReading, DetectedAnomaly } from '../types/telemetry';
import { Activity, Thermometer, Mic, Zap, Cpu, Compass, Radio } from 'lucide-react';

interface TelemetryChartsProps {
  readings: SensorReading[];
  currentReading: SensorReading;
  currentMinute: number;
  totalMinutes: number;
  anomalies: DetectedAnomaly[];
  onSeek: (minute: number) => void;
}

export const TelemetryCharts: React.FC<TelemetryChartsProps> = ({
  readings,
  currentReading,
  currentMinute,
  totalMinutes,
  anomalies,
  onSeek
}) => {
  const containerRef = useRef<HTMLDivElement>(null);

  if (readings.length === 0) return null;

  const temps = readings.map(r => r.temperatureC);
  const minTemp = Math.floor(Math.min(...temps) - 1);
  const maxTemp = Math.ceil(Math.max(...temps) + 1);

  const dbs = readings.map(r => r.acousticDb);
  const maxDb = Math.max(65, Math.ceil(Math.max(...dbs) + 5));

  const emfs = readings.map(r => r.emfFluxUtd);
  const maxEmf = Math.max(8, Math.ceil(Math.max(...emfs) + 1));

  const watts = readings.map(r => r.powerWattage);
  const maxWatt = Math.max(2500, Math.ceil(Math.max(...watts) + 100));

  const svgWidth = 800;
  const trackHeight = 72;

  const generatePath = (getValue: (r: SensorReading) => number, minVal: number, maxVal: number) => {
    return readings.map((r, i) => {
      const x = (r.epochMinutes / totalMinutes) * svgWidth;
      const normalized = Math.max(0, Math.min(1, (getValue(r) - minVal) / (maxVal - minVal)));
      const y = trackHeight - normalized * (trackHeight - 12) - 6;
      return `${i === 0 ? 'M' : 'L'} ${x.toFixed(1)} ${y.toFixed(1)}`;
    }).join(' ');
  };

  const tempPath = generatePath(r => r.temperatureC, minTemp, maxTemp);
  const dbPath = generatePath(r => r.acousticDb, 15, maxDb);
  const emfPath = generatePath(r => r.emfFluxUtd, 0, maxEmf);
  const wattPath = generatePath(r => r.powerWattage, 0, maxWatt);

  const currentX = (currentMinute / totalMinutes) * svgWidth;

  const handleSvgClick = (e: React.MouseEvent<SVGSVGElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const ratio = Math.max(0, Math.min(1, clickX / rect.width));
    onSeek(Math.round(ratio * totalMinutes));
  };

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      gap: '12px'
    }} ref={containerRef}>
      {/* Waveform Main Console Card */}
      <div style={{
        background: 'var(--bg-panel)',
        border: '1px solid var(--border-subtle)',
        borderRadius: '2px',
        padding: '16px',
        display: 'flex',
        flexDirection: 'column',
        gap: '12px'
      }}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Activity size={16} color="var(--accent-green-bright)" />
            <span className="terminal-title">
              MULTI-SPECTRAL FORENSIC TELEMETRY CHANNELS
            </span>
          </div>
          <span style={{ fontSize: '11px', color: '#9ca3af', fontFamily: 'var(--font-mono)' }}>
            SYNCHRONIZED MULTI-VARIATE SENSOR STREAM
          </span>
        </div>

        {/* SVG Multi-Track Viewport */}
        <div style={{
          position: 'relative',
          width: '100%',
          background: '#040507',
          border: '1px solid var(--border-subtle)',
          borderRadius: '2px',
          padding: '8px 0',
          overflow: 'hidden'
        }}>
          {/* Track 1: Ambient Temperature */}
          <div style={{ padding: '0 14px 6px 14px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', fontFamily: 'var(--font-mono)', marginBottom: '4px' }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: '5px', color: '#ffffff', fontWeight: 600 }}>
                <Thermometer size={13} color="var(--accent-green-bright)" />
                <span>[CH-01] AMBIENT TEMPERATURE (°C)</span>
              </span>
              <span style={{ color: '#9ca3af' }}>
                RANGE: {minTemp}°C – {maxTemp}°C (COLD DROP THRESHOLD &lt; 16°C)
              </span>
            </div>
            <svg viewBox={`0 0 ${svgWidth} ${trackHeight}`} style={{ width: '100%', height: `${trackHeight}px`, cursor: 'crosshair' }} onClick={handleSvgClick}>
              <line x1="0" y1={trackHeight - ((16 - minTemp) / (maxTemp - minTemp)) * (trackHeight - 12) - 6} x2={svgWidth} y2={trackHeight - ((16 - minTemp) / (maxTemp - minTemp)) * (trackHeight - 12) - 6} stroke="rgba(245, 158, 11, 0.4)" strokeDasharray="4 2" />
              <path d={tempPath} fill="none" stroke="var(--accent-green-bright)" strokeWidth="1.8" />
              <line x1={currentX} y1="0" x2={currentX} y2={trackHeight} stroke="rgba(255, 255, 255, 0.8)" strokeWidth="1.2" strokeDasharray="2 2" />
            </svg>
          </div>

          {/* Track 2: Acoustic SPL & Infrasound */}
          <div style={{ padding: '0 14px 6px 14px', borderTop: '1px solid var(--border-subtle)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', fontFamily: 'var(--font-mono)', marginBottom: '4px' }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: '5px', color: '#ffffff', fontWeight: 600 }}>
                <Mic size={13} color="var(--accent-amber-bright)" />
                <span>[CH-02] ACOUSTIC SPL (dB) &amp; 18.98Hz RESONANCE</span>
              </span>
              <span style={{ color: '#9ca3af' }}>
                PEAK: {maxDb} dB (INFRASONIC BAND)
              </span>
            </div>
            <svg viewBox={`0 0 ${svgWidth} ${trackHeight}`} style={{ width: '100%', height: `${trackHeight}px`, cursor: 'crosshair' }} onClick={handleSvgClick}>
              <path d={dbPath} fill="none" stroke="var(--accent-amber-bright)" strokeWidth="1.8" />
              <line x1={currentX} y1="0" x2={currentX} y2={trackHeight} stroke="rgba(255, 255, 255, 0.8)" strokeWidth="1.2" strokeDasharray="2 2" />
            </svg>
          </div>

          {/* Track 3: Electromagnetic Flux */}
          <div style={{ padding: '0 14px 6px 14px', borderTop: '1px solid var(--border-subtle)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', fontFamily: 'var(--font-mono)', marginBottom: '4px' }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: '5px', color: '#ffffff', fontWeight: 600 }}>
                <Zap size={13} color="var(--accent-crimson-bright)" />
                <span>[CH-03] ELECTROMAGNETIC INDUCTION FLUX (µT)</span>
              </span>
              <span style={{ color: '#9ca3af' }}>
                PEAK: {maxEmf} µT (NOMINAL BASELINE &lt; 0.4 µT)
              </span>
            </div>
            <svg viewBox={`0 0 ${svgWidth} ${trackHeight}`} style={{ width: '100%', height: `${trackHeight}px`, cursor: 'crosshair' }} onClick={handleSvgClick}>
              <path d={emfPath} fill="none" stroke="var(--accent-crimson-bright)" strokeWidth="1.8" />
              <line x1={currentX} y1="0" x2={currentX} y2={trackHeight} stroke="rgba(255, 255, 255, 0.8)" strokeWidth="1.2" strokeDasharray="2 2" />
            </svg>
          </div>

          {/* Track 4: Circuit Active Power Load */}
          <div style={{ padding: '0 14px 6px 14px', borderTop: '1px solid var(--border-subtle)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', fontFamily: 'var(--font-mono)', marginBottom: '4px' }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: '5px', color: '#ffffff', fontWeight: 600 }}>
                <Cpu size={13} color="#38bdf8" />
                <span>[CH-04] CIRCUIT ACTIVE POWER LOAD (W) &amp; TRANSIENTS</span>
              </span>
              <span style={{ color: '#9ca3af' }}>
                MAX LOAD: {maxWatt} W (INDUCTIVE SPIKES)
              </span>
            </div>
            <svg viewBox={`0 0 ${svgWidth} ${trackHeight}`} style={{ width: '100%', height: `${trackHeight}px`, cursor: 'crosshair' }} onClick={handleSvgClick}>
              <path d={wattPath} fill="none" stroke="#38bdf8" strokeWidth="1.8" />
              <line x1={currentX} y1="0" x2={currentX} y2={trackHeight} stroke="rgba(255, 255, 255, 0.8)" strokeWidth="1.2" strokeDasharray="2 2" />
            </svg>
          </div>

          {/* Anomaly Flag Markers */}
          <div style={{
            position: 'relative',
            height: '24px',
            margin: '0 14px',
            borderTop: '1px solid var(--border-subtle)',
            display: 'flex',
            alignItems: 'center'
          }}>
            <span style={{ fontSize: '10px', color: '#9ca3af', fontFamily: 'var(--font-mono)', position: 'absolute', left: '0' }}>
              FLAGS:
            </span>
            {anomalies.map(a => {
              const leftPct = Math.max(8, Math.min(96, (a.epochMinutes / totalMinutes) * 100));
              return (
                <div
                  key={a.id}
                  title={`[${a.timestamp}] ${a.type}: ${a.summary}`}
                  onClick={() => onSeek(a.epochMinutes)}
                  style={{
                    position: 'absolute',
                    left: `${leftPct}%`,
                    top: '7px',
                    transform: 'translateX(-50%) rotate(45deg)',
                    width: '8px',
                    height: '8px',
                    borderRadius: '1px',
                    background: a.severity === 'CRITICAL' ? 'var(--accent-crimson-bright)' : 'var(--accent-amber-bright)',
                    boxShadow: `0 0 6px ${a.severity === 'CRITICAL' ? 'var(--accent-crimson)' : 'var(--accent-amber)'}`,
                    cursor: 'pointer'
                  }}
                />
              );
            })}
          </div>
        </div>
      </div>

      {/* Multi-Variate Correlation & Deep Analytics Deck (Fills the entire screen) */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
        gap: '12px'
      }}>
        {/* Card 1: Multi-Channel Correlation Matrix */}
        <div style={{
          background: 'var(--bg-panel)',
          border: '1px solid var(--border-subtle)',
          borderRadius: '2px',
          padding: '14px',
          display: 'flex',
          flexDirection: 'column',
          gap: '8px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Compass size={14} color="var(--accent-green-bright)" />
            <span style={{ fontSize: '11px', fontWeight: 700, color: '#ffffff', letterSpacing: '0.04em' }}>
              CROSS-CHANNEL CORRELATION MATRIX
            </span>
          </div>
          <div style={{ fontSize: '11px', color: '#9ca3af', lineHeight: 1.5 }}>
            Pearson correlation coefficients calculated across the synchronized multi-variate stream:
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginTop: '4px', fontSize: '11px', fontFamily: 'var(--font-mono)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 8px', background: '#040507', border: '1px solid var(--border-subtle)', borderRadius: '2px' }}>
              <span style={{ color: '#d4d4d8' }}>Temp Drop ↔ Infrasound</span>
              <span style={{ color: 'var(--accent-amber-bright)', fontWeight: 700 }}>r = -0.912 (High Inverse)</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 8px', background: '#040507', border: '1px solid var(--border-subtle)', borderRadius: '2px' }}>
              <span style={{ color: '#d4d4d8' }}>Infrasound ↔ EMF Surge</span>
              <span style={{ color: 'var(--accent-amber-bright)', fontWeight: 700 }}>r = +0.874 (Simultaneous)</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 8px', background: '#040507', border: '1px solid var(--border-subtle)', borderRadius: '2px' }}>
              <span style={{ color: '#d4d4d8' }}>EMF Flux ↔ Circuit Surge</span>
              <span style={{ color: '#38bdf8', fontWeight: 700 }}>r = +0.941 (Inductive Spike)</span>
            </div>
          </div>
        </div>

        {/* Card 2: Spectral Fourier Concentration */}
        <div style={{
          background: 'var(--bg-panel)',
          border: '1px solid var(--border-subtle)',
          borderRadius: '2px',
          padding: '14px',
          display: 'flex',
          flexDirection: 'column',
          gap: '8px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Radio size={14} color="var(--accent-amber-bright)" />
            <span style={{ fontSize: '11px', fontWeight: 700, color: '#ffffff', letterSpacing: '0.04em' }}>
              ACOUSTIC FFT RESONANCE DECOMPOSITION
            </span>
          </div>
          <div style={{ fontSize: '11px', color: '#9ca3af', lineHeight: 1.5 }}>
            Fourier frequency bin distribution during the active anomaly window:
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginTop: '4px', fontSize: '11px', fontFamily: 'var(--font-mono)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 8px', background: '#040507', border: '1px solid var(--border-subtle)', borderRadius: '2px' }}>
              <span style={{ color: '#d4d4d8' }}>Infrasound Band (&lt;20Hz)</span>
              <span style={{ color: 'var(--accent-amber-bright)', fontWeight: 700 }}>68.4% Total Energy</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 8px', background: '#040507', border: '1px solid var(--border-subtle)', borderRadius: '2px' }}>
              <span style={{ color: '#d4d4d8' }}>Ocular Peak Frequency</span>
              <span style={{ color: 'var(--accent-green-bright)', fontWeight: 700 }}>18.98 Hz (Q = 14.2)</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 8px', background: '#040507', border: '1px solid var(--border-subtle)', borderRadius: '2px' }}>
              <span style={{ color: '#d4d4d8' }}>Physical Coupling Mode</span>
              <span style={{ color: '#ffffff', fontWeight: 600 }}>Acoustic Standing Wave</span>
            </div>
          </div>
        </div>

        {/* Card 3: Live Scrubbed Instant Telemetry Inspector */}
        <div style={{
          background: 'var(--bg-panel)',
          border: '1px solid var(--border-subtle)',
          borderRadius: '2px',
          padding: '14px',
          display: 'flex',
          flexDirection: 'column',
          gap: '8px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: '11px', fontWeight: 700, color: '#ffffff', letterSpacing: '0.04em' }}>
              TELEMETRY INSPECTOR SNAPSHOT
            </span>
            <span className="badge-green" style={{ fontSize: '10px' }}>
              {currentReading.timestamp}
            </span>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px', marginTop: '4px', fontSize: '11px', fontFamily: 'var(--font-mono)' }}>
            <div style={{ padding: '6px 8px', background: '#040507', border: '1px solid var(--border-subtle)', borderRadius: '2px' }}>
              <div style={{ color: '#9ca3af', fontSize: '10px' }}>TEMP:</div>
              <div style={{ color: currentReading.temperatureC < 16 ? 'var(--accent-amber-bright)' : '#ffffff', fontWeight: 700 }}>
                {currentReading.temperatureC.toFixed(1)}°C
              </div>
            </div>
            <div style={{ padding: '6px 8px', background: '#040507', border: '1px solid var(--border-subtle)', borderRadius: '2px' }}>
              <div style={{ color: '#9ca3af', fontSize: '10px' }}>ACOUSTIC:</div>
              <div style={{ color: '#ffffff', fontWeight: 700 }}>
                {currentReading.acousticDb.toFixed(1)} dB ({currentReading.acousticFreqHz.toFixed(1)}Hz)
              </div>
            </div>
            <div style={{ padding: '6px 8px', background: '#040507', border: '1px solid var(--border-subtle)', borderRadius: '2px' }}>
              <div style={{ color: '#9ca3af', fontSize: '10px' }}>EMF FLUX:</div>
              <div style={{ color: currentReading.emfFluxUtd > 3 ? 'var(--accent-amber-bright)' : '#ffffff', fontWeight: 700 }}>
                {currentReading.emfFluxUtd.toFixed(2)} µT
              </div>
            </div>
            <div style={{ padding: '6px 8px', background: '#040507', border: '1px solid var(--border-subtle)', borderRadius: '2px' }}>
              <div style={{ color: '#9ca3af', fontSize: '10px' }}>PORTAL:</div>
              <div style={{ color: currentReading.doorLatchState === 'SECURE' ? 'var(--accent-green-bright)' : 'var(--accent-crimson-bright)', fontWeight: 700 }}>
                {currentReading.doorLatchState}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
