import React, { useRef } from 'react';
import type { SensorReading, DetectedAnomaly } from '../types/telemetry';
import { Activity, Thermometer, Mic, Zap } from 'lucide-react';

interface TelemetryChartsProps {
  readings: SensorReading[];
  currentMinute: number;
  totalMinutes: number;
  anomalies: DetectedAnomaly[];
  onSeek: (minute: number) => void;
}

export const TelemetryCharts: React.FC<TelemetryChartsProps> = ({
  readings,
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

  const svgWidth = 800;
  const trackHeight = 65;

  const generatePath = (getValue: (r: SensorReading) => number, minVal: number, maxVal: number) => {
    return readings.map((r, i) => {
      const x = (r.epochMinutes / totalMinutes) * svgWidth;
      const normalized = Math.max(0, Math.min(1, (getValue(r) - minVal) / (maxVal - minVal)));
      const y = trackHeight - normalized * (trackHeight - 10) - 5;
      return `${i === 0 ? 'M' : 'L'} ${x.toFixed(1)} ${y.toFixed(1)}`;
    }).join(' ');
  };

  const tempPath = generatePath(r => r.temperatureC, minTemp, maxTemp);
  const dbPath = generatePath(r => r.acousticDb, 15, maxDb);
  const emfPath = generatePath(r => r.emfFluxUtd, 0, maxEmf);

  const currentX = (currentMinute / totalMinutes) * svgWidth;

  const handleSvgClick = (e: React.MouseEvent<SVGSVGElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const ratio = Math.max(0, Math.min(1, clickX / rect.width));
    onSeek(Math.round(ratio * totalMinutes));
  };

  return (
    <div style={{
      background: 'var(--bg-panel)',
      border: '1px solid var(--border-subtle)',
      borderRadius: '2px',
      padding: '16px',
      display: 'flex',
      flexDirection: 'column',
      gap: '12px'
    }} ref={containerRef}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Activity size={15} color="var(--accent-green-bright)" />
          <span className="terminal-title">
            MULTI-SPECTRAL FORENSIC TELEMETRY CHANNELS
          </span>
        </div>
        <span style={{ fontSize: '11px', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
          SYNCHRONIZED MULTI-VARIATE SENSOR STREAM
        </span>
      </div>

      {/* SVG Multi-Track Viewport */}
      <div style={{
        position: 'relative',
        width: '100%',
        background: '#040804',
        border: '1px solid var(--border-subtle)',
        borderRadius: '2px',
        padding: '8px 0',
        overflow: 'hidden'
      }}>
        {/* Track 1: Ambient Temperature */}
        <div style={{ padding: '0 12px 6px 12px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', fontFamily: 'var(--font-mono)', marginBottom: '3px' }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: '4px', color: 'var(--accent-green-bright)' }}>
              <Thermometer size={12} /> [CH-01] AMBIENT TEMPERATURE (°C)
            </span>
            <span style={{ color: 'var(--text-muted)' }}>
              RANGE: {minTemp}°C – {maxTemp}°C (COLD DROP THRESHOLD &lt; 16°C)
            </span>
          </div>
          <svg viewBox={`0 0 ${svgWidth} ${trackHeight}`} style={{ width: '100%', height: `${trackHeight}px`, cursor: 'crosshair' }} onClick={handleSvgClick}>
            <line x1="0" y1={trackHeight - ((16 - minTemp) / (maxTemp - minTemp)) * (trackHeight - 10) - 5} x2={svgWidth} y2={trackHeight - ((16 - minTemp) / (maxTemp - minTemp)) * (trackHeight - 10) - 5} stroke="rgba(245, 158, 11, 0.3)" strokeDasharray="4 2" />
            <path d={tempPath} fill="none" stroke="var(--accent-green-bright)" strokeWidth="1.5" />
            <line x1={currentX} y1="0" x2={currentX} y2={trackHeight} stroke="rgba(255, 255, 255, 0.7)" strokeWidth="1" strokeDasharray="2 2" />
          </svg>
        </div>

        {/* Track 2: Acoustic SPL & Infrasound */}
        <div style={{ padding: '0 12px 6px 12px', borderTop: '1px solid var(--border-subtle)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', fontFamily: 'var(--font-mono)', marginBottom: '3px' }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: '4px', color: 'var(--accent-amber-bright)' }}>
              <Mic size={12} /> [CH-02] ACOUSTIC SPL (dB) &amp; 18.98Hz RESONANCE
            </span>
            <span style={{ color: 'var(--text-muted)' }}>
              PEAK: {maxDb} dB (INFRASONIC BAND)
            </span>
          </div>
          <svg viewBox={`0 0 ${svgWidth} ${trackHeight}`} style={{ width: '100%', height: `${trackHeight}px`, cursor: 'crosshair' }} onClick={handleSvgClick}>
            <path d={dbPath} fill="none" stroke="var(--accent-amber-bright)" strokeWidth="1.5" />
            <line x1={currentX} y1="0" x2={currentX} y2={trackHeight} stroke="rgba(255, 255, 255, 0.7)" strokeWidth="1" strokeDasharray="2 2" />
          </svg>
        </div>

        {/* Track 3: Electromagnetic Flux */}
        <div style={{ padding: '0 12px 6px 12px', borderTop: '1px solid var(--border-subtle)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', fontFamily: 'var(--font-mono)', marginBottom: '3px' }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: '4px', color: 'var(--accent-crimson-bright)' }}>
              <Zap size={12} /> [CH-03] ELECTROMAGNETIC INDUCTION FLUX (µT)
            </span>
            <span style={{ color: 'var(--text-muted)' }}>
              PEAK: {maxEmf} µT (NOMINAL BASELINE &lt; 0.4 µT)
            </span>
          </div>
          <svg viewBox={`0 0 ${svgWidth} ${trackHeight}`} style={{ width: '100%', height: `${trackHeight}px`, cursor: 'crosshair' }} onClick={handleSvgClick}>
            <path d={emfPath} fill="none" stroke="var(--accent-crimson-bright)" strokeWidth="1.5" />
            <line x1={currentX} y1="0" x2={currentX} y2={trackHeight} stroke="rgba(255, 255, 255, 0.7)" strokeWidth="1" strokeDasharray="2 2" />
          </svg>
        </div>

        {/* Anomaly Flag Markers */}
        <div style={{
          position: 'relative',
          height: '20px',
          margin: '0 12px',
          borderTop: '1px solid var(--border-subtle)',
          display: 'flex',
          alignItems: 'center'
        }}>
          <span style={{ fontSize: '10px', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', position: 'absolute', left: '0' }}>
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
                  top: '5px',
                  transform: 'translateX(-50%) rotate(45deg)',
                  width: '7px',
                  height: '7px',
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
  );
};
