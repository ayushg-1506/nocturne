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
  CheckCircle2
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
      gap: '12px',
      height: '100%'
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
          borderLeft: isColdAnomaly ? '3px solid var(--accent-amber)' : '3px solid var(--border-subtle)',
          borderRadius: '2px',
          padding: '8px 12px',
          display: 'flex',
          alignItems: 'center',
          gap: '10px'
        }}>
          <div style={{
            width: '28px',
            height: '28px',
            background: isColdAnomaly ? 'rgba(245, 158, 11, 0.15)' : 'rgba(34, 197, 94, 0.1)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            borderRadius: '2px',
            flexShrink: 0
          }}>
            <Thermometer size={14} color={isColdAnomaly ? 'var(--accent-amber-bright)' : 'var(--accent-green)'} />
          </div>
          <div>
            <div style={{ fontSize: '10px', color: 'var(--text-muted)' }}>[CH-01] AMBIENT TEMP</div>
            <div style={{ fontSize: '13px', fontWeight: 700, color: isColdAnomaly ? 'var(--accent-amber-bright)' : '#ffffff' }}>
              {currentReading.temperatureC.toFixed(1)}°C{' '}
              <span style={{ fontSize: '10px', color: isColdAnomaly ? 'var(--accent-amber)' : 'var(--text-muted)' }}>
                ({tempDelta > 0 ? '+' : ''}{tempDelta.toFixed(1)}°)
              </span>
            </div>
          </div>
        </div>

        {/* KPI 2: Acoustic / Infrasound */}
        <div style={{
          background: 'var(--bg-panel)',
          border: `1px solid ${isInfrasonic ? 'var(--accent-amber)' : 'var(--border-subtle)'}`,
          borderLeft: isInfrasonic ? '3px solid var(--accent-amber)' : '3px solid var(--border-subtle)',
          borderRadius: '2px',
          padding: '8px 12px',
          display: 'flex',
          alignItems: 'center',
          gap: '10px'
        }}>
          <div style={{
            width: '28px',
            height: '28px',
            background: isInfrasonic ? 'rgba(245, 158, 11, 0.15)' : 'rgba(34, 197, 94, 0.1)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            borderRadius: '2px',
            flexShrink: 0
          }}>
            <Mic size={14} color={isInfrasonic ? 'var(--accent-amber-bright)' : 'var(--accent-green)'} />
          </div>
          <div>
            <div style={{ fontSize: '10px', color: 'var(--text-muted)' }}>[CH-02] ACOUSTIC / INFRASOUND</div>
            <div style={{ fontSize: '13px', fontWeight: 700, color: isInfrasonic ? 'var(--accent-amber-bright)' : '#ffffff' }}>
              {currentReading.acousticDb.toFixed(1)} dB{' '}
              <span style={{ fontSize: '10px', color: isInfrasonic ? 'var(--accent-crimson)' : 'var(--text-muted)' }}>
                ({currentReading.acousticFreqHz.toFixed(1)}Hz)
              </span>
            </div>
          </div>
        </div>

        {/* KPI 3: EMF Induction */}
        <div style={{
          background: 'var(--bg-panel)',
          border: `1px solid ${isEmfAnomaly ? 'var(--accent-amber)' : 'var(--border-subtle)'}`,
          borderLeft: isEmfAnomaly ? '3px solid var(--accent-amber)' : '3px solid var(--border-subtle)',
          borderRadius: '2px',
          padding: '8px 12px',
          display: 'flex',
          alignItems: 'center',
          gap: '10px'
        }}>
          <div style={{
            width: '28px',
            height: '28px',
            background: isEmfAnomaly ? 'rgba(245, 158, 11, 0.15)' : 'rgba(34, 197, 94, 0.1)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            borderRadius: '2px',
            flexShrink: 0
          }}>
            <Zap size={14} color={isEmfAnomaly ? 'var(--accent-amber-bright)' : 'var(--accent-green)'} />
          </div>
          <div>
            <div style={{ fontSize: '10px', color: 'var(--text-muted)' }}>[CH-03] EMF FLUX</div>
            <div style={{ fontSize: '13px', fontWeight: 700, color: isEmfAnomaly ? 'var(--accent-amber-bright)' : '#ffffff' }}>
              {currentReading.emfFluxUtd.toFixed(2)} µT{' '}
              <span style={{ fontSize: '10px', color: isEmfAnomaly ? 'var(--accent-amber)' : 'var(--text-muted)' }}>
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
            width: '28px',
            height: '28px',
            background: isUnlatched ? 'rgba(239, 68, 68, 0.15)' : 'rgba(34, 197, 94, 0.1)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            borderRadius: '2px',
            flexShrink: 0
          }}>
            {isUnlatched ? <Unlock size={14} color="var(--accent-crimson-bright)" /> : <Lock size={14} color="var(--accent-green-bright)" />}
          </div>
          <div>
            <div style={{ fontSize: '10px', color: 'var(--text-muted)' }}>[CH-04] MONITORED PORTAL</div>
            <div style={{ fontSize: '13px', fontWeight: 700, color: isUnlatched ? 'var(--accent-crimson-bright)' : 'var(--accent-green-bright)' }}>
              {currentReading.doorLatchState}{' '}
              <span style={{ fontSize: '10px', color: isUnlatched ? 'var(--accent-crimson)' : 'var(--accent-green)' }}>
                {isUnlatched ? '[BREACH]' : '[SECURE]'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Main Split Operational Workspace */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'minmax(360px, 1.25fr) minmax(320px, 0.85fr)',
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

        {/* Right: Active Anomalous Incident & Causal Divergence Panel */}
        <div style={{
          background: 'var(--bg-panel)',
          border: '1px solid var(--border-subtle)',
          borderLeft: activeAnomaly ? '3px solid var(--accent-amber)' : '3px solid var(--accent-green)',
          borderRadius: '2px',
          padding: '16px',
          display: 'flex',
          flexDirection: 'column',
          gap: '12px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Layers size={15} color={activeAnomaly ? 'var(--accent-amber-bright)' : 'var(--accent-green-bright)'} />
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
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', flex: 1 }}>
              <div style={{ fontSize: '12px', lineHeight: 1.6, color: 'var(--text-primary)' }}>
                {activeAnomaly.summary}
              </div>

              {/* Sensor Divergence Table */}
              <div>
                <div style={{ fontSize: '10px', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', marginBottom: '4px' }}>
                  MULTIVARIATE DIVERGENCE VECTORS:
                </div>
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
                  gap: '6px'
                }}>
                  {activeAnomaly.sensorDivergence.map((div, idx) => (
                    <div key={idx} style={{
                      background: '#040804',
                      padding: '6px 8px',
                      borderRadius: '2px',
                      border: '1px solid var(--border-subtle)',
                      fontSize: '11px',
                      fontFamily: 'var(--font-mono)'
                    }}>
                      <div style={{ color: 'var(--text-muted)', fontSize: '10px' }}>{div.channel}</div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '2px' }}>
                        <span style={{ color: 'var(--text-secondary)' }}>BASE: {div.baseline}</span>
                        <span style={{ color: 'var(--accent-amber-bright)', fontWeight: 700 }}>OBS: {div.observed}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Action Buttons */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: 'auto', paddingTop: '10px' }}>
                <button
                  onClick={onNavigateToIncidents}
                  className="btn-primary"
                  style={{ width: '100%', padding: '8px 12px', fontSize: '11px', justifyContent: 'center' }}
                >
                  <FileText size={13} />
                  <span>[ VIEW FULL FORENSIC INVESTIGATION REPORT ]</span>
                </button>

                <button
                  onClick={onNavigateToSpectral}
                  className="btn-secondary"
                  style={{ width: '100%', padding: '6px 12px', fontSize: '11px', justifyContent: 'center' }}
                >
                  <span>[ INSPECT 18.98Hz FREQUENCY SPECTRUM ]</span>
                  <ArrowRight size={13} />
                </button>
              </div>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', flex: 1, justifyContent: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--accent-green-bright)' }}>
                <CheckCircle2 size={16} />
                <span style={{ fontSize: '12px', fontWeight: 700 }}>ALL CHANNELS OPERATING NORMALLY</span>
              </div>
              <p style={{ fontSize: '11px', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                All sensor streams are operating within 1.5 standard deviations of domestic baseline. Use the timeline scrubber at the top to seek to anomalous incident windows (e.g. 03:14:00).
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
