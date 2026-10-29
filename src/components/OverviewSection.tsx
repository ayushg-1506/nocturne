import React from 'react';
import type { ForensicCase, SensorReading, DetectedAnomaly } from '../types/telemetry';
import { FloorplanView } from './FloorplanView';
import { 
  Thermometer, 
  Mic, 
  Zap, 
  Lock, 
  Unlock, 
  Layers, 
  FileText, 
  ArrowRight,
  CheckCircle2,
  Radio,
  Flame
} from 'lucide-react';

interface OverviewSectionProps {
  activeCase: ForensicCase;
  currentReading: SensorReading;
  selectedRoomId: string | null;
  onSelectRoom: (roomId: string) => void;
  baselineTemp: number;
  activeAnomaly?: DetectedAnomaly;
  onNavigateToIncidents: () => void;
  onNavigateToSpectral: () => void;
}

export const OverviewSection: React.FC<OverviewSectionProps> = ({
  activeCase,
  currentReading,
  selectedRoomId,
  onSelectRoom,
  baselineTemp,
  activeAnomaly,
  onNavigateToIncidents,
  onNavigateToSpectral
}) => {
  const isColdAnomaly = currentReading.temperatureC < 16.0;
  const isInfrasonic = currentReading.acousticFreqHz >= 18.0 && currentReading.acousticFreqHz <= 20.0;
  const isEmfAnomaly = currentReading.emfFluxUtd > 3.0;
  const isUnlatched = currentReading.doorLatchState !== 'SECURE';
  const tempDelta = currentReading.temperatureC - baselineTemp;

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      gap: '10px',
      height: '100%',
      minHeight: '100%'
    }}>
      {/* 1. Compact Real-Time KPI Sensor Status Ribbon */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: '8px'
      }}>
        {/* KPI 1: Ambient Temp */}
        <div style={{
          background: 'var(--bg-panel)',
          border: `1px solid ${isColdAnomaly ? 'var(--accent-amber)' : 'var(--border-subtle)'}`,
          borderLeft: isColdAnomaly ? '3px solid var(--accent-amber)' : '3px solid var(--border-muted)',
          borderRadius: '2px',
          padding: '8px 12px',
          display: 'flex',
          alignItems: 'center',
          gap: '10px'
        }}>
          <div style={{
            width: '30px',
            height: '30px',
            background: isColdAnomaly ? 'rgba(245, 158, 11, 0.15)' : '#0d1810',
            border: `1px solid ${isColdAnomaly ? 'var(--accent-amber)' : 'var(--border-muted)'}`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            borderRadius: '2px',
            flexShrink: 0
          }}>
            <Thermometer size={16} color={isColdAnomaly ? 'var(--accent-amber-bright)' : 'var(--accent-green-bright)'} />
          </div>
          <div>
            <div style={{ fontSize: '10px', color: 'var(--text-muted)', fontWeight: 600 }}>[CH-01] AMBIENT TEMP</div>
            <div style={{ fontSize: '14px', fontWeight: 700, color: isColdAnomaly ? 'var(--accent-amber-bright)' : '#ffffff' }}>
              {currentReading.temperatureC.toFixed(1)}°C{' '}
              <span style={{ fontSize: '11px', color: isColdAnomaly ? 'var(--accent-amber)' : '#9ca3af' }}>
                ({tempDelta > 0 ? '+' : ''}{tempDelta.toFixed(1)}°)
              </span>
            </div>
          </div>
        </div>

        {/* KPI 2: Acoustic / Infrasound */}
        <div style={{
          background: 'var(--bg-panel)',
          border: `1px solid ${isInfrasonic ? 'var(--accent-amber)' : 'var(--border-subtle)'}`,
          borderLeft: isInfrasonic ? '3px solid var(--accent-amber)' : '3px solid var(--border-muted)',
          borderRadius: '2px',
          padding: '8px 12px',
          display: 'flex',
          alignItems: 'center',
          gap: '10px'
        }}>
          <div style={{
            width: '30px',
            height: '30px',
            background: isInfrasonic ? 'rgba(245, 158, 11, 0.15)' : '#0d1810',
            border: `1px solid ${isInfrasonic ? 'var(--accent-amber)' : 'var(--border-muted)'}`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            borderRadius: '2px',
            flexShrink: 0
          }}>
            <Mic size={16} color={isInfrasonic ? 'var(--accent-amber-bright)' : 'var(--accent-green-bright)'} />
          </div>
          <div>
            <div style={{ fontSize: '10px', color: 'var(--text-muted)', fontWeight: 600 }}>[CH-02] ACOUSTIC / INFRASOUND</div>
            <div style={{ fontSize: '14px', fontWeight: 700, color: isInfrasonic ? 'var(--accent-amber-bright)' : '#ffffff' }}>
              {currentReading.acousticDb.toFixed(1)} dB{' '}
              <span style={{ fontSize: '11px', color: isInfrasonic ? 'var(--accent-crimson)' : '#9ca3af' }}>
                ({currentReading.acousticFreqHz.toFixed(1)}Hz)
              </span>
            </div>
          </div>
        </div>

        {/* KPI 3: EMF Induction */}
        <div style={{
          background: 'var(--bg-panel)',
          border: `1px solid ${isEmfAnomaly ? 'var(--accent-amber)' : 'var(--border-subtle)'}`,
          borderLeft: isEmfAnomaly ? '3px solid var(--accent-amber)' : '3px solid var(--border-muted)',
          borderRadius: '2px',
          padding: '8px 12px',
          display: 'flex',
          alignItems: 'center',
          gap: '10px'
        }}>
          <div style={{
            width: '30px',
            height: '30px',
            background: isEmfAnomaly ? 'rgba(245, 158, 11, 0.15)' : '#0d1810',
            border: `1px solid ${isEmfAnomaly ? 'var(--accent-amber)' : 'var(--border-muted)'}`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            borderRadius: '2px',
            flexShrink: 0
          }}>
            <Zap size={16} color={isEmfAnomaly ? 'var(--accent-amber-bright)' : 'var(--accent-green-bright)'} />
          </div>
          <div>
            <div style={{ fontSize: '10px', color: 'var(--text-muted)', fontWeight: 600 }}>[CH-03] EMF FLUX</div>
            <div style={{ fontSize: '14px', fontWeight: 700, color: isEmfAnomaly ? 'var(--accent-amber-bright)' : '#ffffff' }}>
              {currentReading.emfFluxUtd.toFixed(2)} µT{' '}
              <span style={{ fontSize: '11px', color: isEmfAnomaly ? 'var(--accent-amber)' : '#9ca3af' }}>
                (Base &lt; 0.3)
              </span>
            </div>
          </div>
        </div>

        {/* KPI 4: Monitored Portal */}
        <div style={{
          background: 'var(--bg-panel)',
          border: `1px solid ${isUnlatched ? 'var(--accent-crimson)' : 'var(--border-subtle)'}`,
          borderLeft: isUnlatched ? '3px solid var(--accent-crimson)' : '3px solid var(--accent-green)',
          borderRadius: '2px',
          padding: '8px 12px',
          display: 'flex',
          alignItems: 'center',
          gap: '10px'
        }}>
          <div style={{
            width: '30px',
            height: '30px',
            background: isUnlatched ? 'rgba(239, 68, 68, 0.15)' : '#0d1810',
            border: `1px solid ${isUnlatched ? 'var(--accent-crimson)' : 'var(--border-muted)'}`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            borderRadius: '2px',
            flexShrink: 0
          }}>
            {isUnlatched ? <Unlock size={16} color="var(--accent-crimson-bright)" /> : <Lock size={16} color="var(--accent-green-bright)" />}
          </div>
          <div>
            <div style={{ fontSize: '10px', color: 'var(--text-muted)', fontWeight: 600 }}>[CH-04] MONITORED PORTAL</div>
            <div style={{ fontSize: '14px', fontWeight: 700, color: isUnlatched ? 'var(--accent-crimson-bright)' : 'var(--accent-green-bright)' }}>
              {currentReading.doorLatchState}{' '}
              <span style={{ fontSize: '11px', color: isUnlatched ? 'var(--accent-crimson)' : 'var(--accent-green)' }}>
                {isUnlatched ? '[BREACH]' : '[SECURE]'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Main Split Operational Workspace */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'minmax(420px, 1.25fr) minmax(360px, 0.95fr)',
        gap: '12px',
        alignItems: 'stretch',
        flex: 1
      }}>
        {/* Left: Architectural Telemetry Matrix */}
        <div style={{ height: '100%' }}>
          <FloorplanView
            rooms={activeCase.floorplan.rooms}
            currentReading={currentReading}
            selectedRoomId={selectedRoomId}
            onSelectRoom={onSelectRoom}
            buildingName={activeCase.structureType}
          />
        </div>

        {/* Right: Active Anomalous Incident & Causal Divergence Panel (Full-Height, Rich Content) */}
        <div style={{
          background: 'var(--bg-panel)',
          border: '1px solid var(--border-subtle)',
          borderLeft: activeAnomaly ? '3px solid var(--accent-amber)' : '3px solid var(--accent-green)',
          borderRadius: '2px',
          padding: '16px',
          display: 'flex',
          flexDirection: 'column',
          gap: '12px',
          justifyContent: 'space-between'
        }}>
          <div>
            {/* Header */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px', marginBottom: '10px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Layers size={16} color={activeAnomaly ? 'var(--accent-amber-bright)' : 'var(--accent-green-bright)'} />
                <span className="terminal-title">
                  {activeAnomaly ? 'ACTIVE ANOMALOUS INCIDENT' : 'NOMINAL BASELINE STATE'}
                </span>
              </div>

              {activeAnomaly && (
                <span className="badge-amber" style={{ fontSize: '10px' }}>
                  CONFIDENCE: {(activeAnomaly.confidenceScore * 100).toFixed(1)}%
                </span>
              )}
            </div>

            {activeAnomaly ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {/* Summary Box */}
                <div style={{
                  background: '#040507',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: '2px',
                  padding: '10px 12px',
                  fontSize: '12px',
                  lineHeight: 1.6,
                  color: '#ffffff'
                }}>
                  {activeAnomaly.summary}
                </div>

                {/* Multivariate Divergence Vectors */}
                <div>
                  <div style={{ fontSize: '10px', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', fontWeight: 700, marginBottom: '6px' }}>
                    MULTIVARIATE DIVERGENCE VECTORS:
                  </div>
                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))',
                    gap: '6px'
                  }}>
                    {activeAnomaly.sensorDivergence.map((div, idx) => (
                      <div key={idx} style={{
                        background: '#040507',
                        padding: '8px 10px',
                        borderRadius: '2px',
                        border: '1px solid var(--border-subtle)',
                        fontSize: '11px',
                        fontFamily: 'var(--font-mono)'
                      }}>
                        <div style={{ color: '#9ca3af', fontSize: '10px', fontWeight: 600 }}>{div.channel}</div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '4px', fontSize: '11px' }}>
                          <span style={{ color: '#d4d4d8' }}>BASE: {div.baseline}</span>
                          <span style={{ color: 'var(--accent-amber-bright)', fontWeight: 700 }}>OBS: {div.observed}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Thermodynamic & Acoustic Physics Diagnostics */}
                <div style={{
                  background: '#07090e',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: '2px',
                  padding: '10px 12px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '6px',
                  fontSize: '11px'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '5px', color: '#ffffff', fontWeight: 600 }}>
                      <Flame size={12} color="var(--accent-amber)" />
                      Thermal Decay Rate:
                    </span>
                    <span style={{ color: 'var(--accent-amber-bright)', fontWeight: 700 }}>
                      -2.40°C/min (120x baseline drift)
                    </span>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '5px', color: '#ffffff', fontWeight: 600 }}>
                      <Radio size={12} color="var(--accent-green)" />
                      Resonant Infrasonic Lock:
                    </span>
                    <span style={{ color: 'var(--accent-green-bright)', fontWeight: 700 }}>
                      18.98 Hz (Ocular Resonance)
                    </span>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '5px', color: '#ffffff', fontWeight: 600 }}>
                      <Zap size={12} color="var(--accent-crimson)" />
                      Inductive Solenoid Pulse:
                    </span>
                    <span style={{ color: 'var(--accent-crimson-bright)', fontWeight: 700 }}>
                      6.8 µT @ Door Latch
                    </span>
                  </div>
                </div>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--accent-green-bright)' }}>
                  <CheckCircle2 size={16} />
                  <span style={{ fontSize: '13px', fontWeight: 700 }}>ALL CHANNELS OPERATING NORMALLY</span>
                </div>
                <p style={{ fontSize: '12px', color: '#d4d4d8', lineHeight: 1.6 }}>
                  All sensory data streams are operating within standard parameters. Use the chronological timeline scrubber at the top to seek to anomalous timestamps.
                </p>
              </div>
            )}
          </div>

          {/* Action CTA Buttons */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '12px' }}>
            <button
              onClick={onNavigateToIncidents}
              className="btn-primary"
              style={{ width: '100%', padding: '9px 14px', fontSize: '11px', justifyContent: 'center' }}
            >
              <FileText size={14} />
              <span>[ VIEW FULL FORENSIC INVESTIGATION REPORT ]</span>
            </button>

            <button
              onClick={onNavigateToSpectral}
              className="btn-secondary"
              style={{ width: '100%', padding: '8px 14px', fontSize: '11px', justifyContent: 'center' }}
            >
              <span>[ INSPECT 18.98Hz FREQUENCY SPECTRUM ]</span>
              <ArrowRight size={14} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
