import React, { useRef } from 'react';
import type { SensorReading, DetectedAnomaly } from '../types/telemetry';
import { Thermometer, Mic, Zap, Activity } from 'lucide-react';

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

  // Compute min/max for scaling
  const temps = readings.map(r => r.temperatureC);
  const minTemp = Math.floor(Math.min(...temps) - 1);
  const maxTemp = Math.ceil(Math.max(...temps) + 1);

  const dbs = readings.map(r => r.acousticDb);
  const maxDb = Math.max(65, Math.ceil(Math.max(...dbs) + 5));

  const emfs = readings.map(r => r.emfFluxUtd);
  const maxEmf = Math.max(8, Math.ceil(Math.max(...emfs) + 1));

  // Width & Height for SVG tracks
  const svgWidth = 800;
  const trackHeight = 65;

  // Path generator
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
    <div className="glass-panel" ref={containerRef} style={{
      padding: '16px',
      display: 'flex',
      flexDirection: 'column',
      gap: '12px'
    }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Activity size={16} color="var(--accent-cyan)" />
          <h2 style={{ fontSize: '13px', fontWeight: 700, fontFamily: 'var(--font-mono)', letterSpacing: '0.04em' }}>
            MULTI-SPECTRAL FORENSIC TELEMETRY CHANNELS
          </h2>
        </div>
        <span style={{ fontSize: '11px', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
          SYNCHRONIZED MULTI-VARIATE SENSORS (CSV/JSON STREAM)
        </span>
      </div>

      {/* SVG Multi-Track Viewport */}
      <div style={{
        position: 'relative',
        width: '100%',
        background: 'rgba(7, 10, 15, 0.9)',
        border: '1px solid var(--border-subtle)',
        borderRadius: '8px',
        padding: '10px 0',
        overflow: 'hidden'
      }}>
        {/* Track 1: Ambient Temperature */}
        <div style={{ padding: '0 14px 6px 14px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', fontFamily: 'var(--font-mono)', marginBottom: '4px' }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: '4px', color: 'var(--accent-cyan)' }}>
              <Thermometer size={13} /> CHANNEL 01: AMBIENT TEMPERATURE (°C)
            </span>
            <span style={{ color: 'var(--text-muted)' }}>
              RANGE: {minTemp}°C – {maxTemp}°C (COLD DROP THRESHOLD &lt; 16°C)
            </span>
          </div>
          <svg viewBox={`0 0 ${svgWidth} ${trackHeight}`} style={{ width: '100%', height: `${trackHeight}px`, cursor: 'crosshair' }} onClick={handleSvgClick}>
            {/* Grid line at 16C cold anomaly threshold */}
            <line x1="0" y1={trackHeight - ((16 - minTemp) / (maxTemp - minTemp)) * (trackHeight - 10) - 5} x2={svgWidth} y2={trackHeight - ((16 - minTemp) / (maxTemp - minTemp)) * (trackHeight - 10) - 5} stroke="rgba(244, 63, 94, 0.3)" strokeDasharray="4 2" />
            {/* Path */}
            <path d={tempPath} fill="none" stroke="var(--accent-cyan)" strokeWidth="1.8" />
            {/* Current Cursor */}
            <line x1={currentX} y1="0" x2={currentX} y2={trackHeight} stroke="rgba(255, 255, 255, 0.8)" strokeWidth="1" strokeDasharray="2 2" />
          </svg>
        </div>

        {/* Track 2: Acoustic SPL & Infrasound */}
        <div style={{ padding: '0 14px 6px 14px', borderTop: '1px solid var(--border-subtle)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', fontFamily: 'var(--font-mono)', marginBottom: '4px' }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: '4px', color: 'var(--accent-violet)' }}>
              <Mic size={13} /> CHANNEL 02: ACOUSTIC SPL (dB) &amp; 18.98Hz RESONANCE
            </span>
            <span style={{ color: 'var(--text-muted)' }}>
              PEAK: {maxDb} dB (INFRASONIC BAND)
            </span>
          </div>
          <svg viewBox={`0 0 ${svgWidth} ${trackHeight}`} style={{ width: '100%', height: `${trackHeight}px`, cursor: 'crosshair' }} onClick={handleSvgClick}>
            <path d={dbPath} fill="none" stroke="var(--accent-violet)" strokeWidth="1.8" />
            <line x1={currentX} y1="0" x2={currentX} y2={trackHeight} stroke="rgba(255, 255, 255, 0.8)" strokeWidth="1" strokeDasharray="2 2" />
          </svg>
        </div>

        {/* Track 3: Electromagnetic Flux & Phantom Wattage */}
        <div style={{ padding: '0 14px 6px 14px', borderTop: '1px solid var(--border-subtle)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', fontFamily: 'var(--font-mono)', marginBottom: '4px' }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: '4px', color: 'var(--accent-amber)' }}>
              <Zap size={13} /> CHANNEL 03: ELECTROMAGNETIC INDUCTION FLUX (µT)
            </span>
            <span style={{ color: 'var(--text-muted)' }}>
              PEAK: {maxEmf} µT (NOMINAL BASELINE &lt; 0.4 µT)
            </span>
          </div>
          <svg viewBox={`0 0 ${svgWidth} ${trackHeight}`} style={{ width: '100%', height: `${trackHeight}px`, cursor: 'crosshair' }} onClick={handleSvgClick}>
            <path d={emfPath} fill="none" stroke="var(--accent-amber)" strokeWidth="1.8" />
            <line x1={currentX} y1="0" x2={currentX} y2={trackHeight} stroke="rgba(255, 255, 255, 0.8)" strokeWidth="1" strokeDasharray="2 2" />
          </svg>
        </div>

        {/* Anomaly Flag Markers across bottom */}
        <div style={{
          position: 'relative',
          height: '16px',
          margin: '0 14px',
          borderTop: '1px solid var(--border-subtle)'
        }}>
          {anomalies.map(a => {
            const leftPct = (a.epochMinutes / totalMinutes) * 100;
            return (
              <span
                key={a.id}
                title={`${a.timestamp}: ${a.summary}`}
                onClick={() => onSeek(a.epochMinutes)}
                style={{
                  position: 'absolute',
                  left: `${leftPct}%`,
                  top: '2px',
                  transform: 'translateX(-50%)',
                  fontSize: '9px',
                  fontWeight: 700,
                  fontFamily: 'var(--font-mono)',
                  color: a.severity === 'CRITICAL' ? 'var(--accent-crimson)' : 'var(--accent-amber)',
                  cursor: 'pointer'
                }}
              >
                ▲ [{a.type.split('_')[0]}]
              </span>
            );
          })}
        </div>
      </div>
    </div>
  );
};
