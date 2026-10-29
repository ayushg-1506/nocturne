import React from 'react';
import type { SensorReading } from '../types/telemetry';
import { Thermometer, Mic, Zap, Cpu, Lock, Unlock } from 'lucide-react';

interface SensorStatusStripProps {
  currentReading: SensorReading;
  baselineTemp: number;
}

export const SensorStatusStrip: React.FC<SensorStatusStripProps> = ({
  currentReading,
  baselineTemp
}) => {
  const isColdAnomaly = currentReading.temperatureC < 16.0;
  const isInfrasonic = currentReading.acousticFreqHz >= 18.0 && currentReading.acousticFreqHz <= 20.0;
  const isEmfAnomaly = currentReading.emfFluxUtd > 3.0;
  const isWattSurge = currentReading.powerWattage > 500;
  const isUnlatched = currentReading.doorLatchState !== 'SECURE';

  const tempDelta = currentReading.temperatureC - baselineTemp;

  return (
    <div style={{
      margin: '0 16px 10px 16px',
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
      gap: '8px'
    }}>
      {/* 1. Temperature */}
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
          <Thermometer size={15} color={isColdAnomaly ? 'var(--accent-amber-bright)' : 'var(--accent-green)'} />
        </div>
        <div>
          <div style={{ fontSize: '10px', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
            [CH-01] AMBIENT TEMP
          </div>
          <div style={{ fontSize: '14px', fontWeight: 700, color: isColdAnomaly ? 'var(--accent-amber-bright)' : 'var(--text-primary)', fontFamily: 'var(--font-mono)' }}>
            {currentReading.temperatureC.toFixed(1)}°C{' '}
            <span style={{ fontSize: '10px', color: isColdAnomaly ? 'var(--accent-amber)' : 'var(--text-muted)' }}>
              ({tempDelta > 0 ? '+' : ''}{tempDelta.toFixed(1)}°)
            </span>
          </div>
        </div>
      </div>

      {/* 2. Acoustic */}
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
          <Mic size={15} color={isInfrasonic ? 'var(--accent-amber-bright)' : 'var(--accent-green)'} />
        </div>
        <div>
          <div style={{ fontSize: '10px', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
            [CH-02] ACOUSTIC / INFRASOUND
          </div>
          <div style={{ fontSize: '14px', fontWeight: 700, color: isInfrasonic ? 'var(--accent-amber-bright)' : 'var(--text-primary)', fontFamily: 'var(--font-mono)' }}>
            {currentReading.acousticDb.toFixed(1)} dB{' '}
            <span style={{ fontSize: '10px', color: isInfrasonic ? 'var(--accent-crimson)' : 'var(--text-muted)' }}>
              ({currentReading.acousticFreqHz.toFixed(1)}Hz)
            </span>
          </div>
        </div>
      </div>

      {/* 3. EMF Flux */}
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
          <Zap size={15} color={isEmfAnomaly ? 'var(--accent-amber-bright)' : 'var(--accent-green)'} />
        </div>
        <div>
          <div style={{ fontSize: '10px', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
            [CH-03] EMF INDUCTION
          </div>
          <div style={{ fontSize: '14px', fontWeight: 700, color: isEmfAnomaly ? 'var(--accent-amber-bright)' : 'var(--text-primary)', fontFamily: 'var(--font-mono)' }}>
            {currentReading.emfFluxUtd.toFixed(2)} µT{' '}
            <span style={{ fontSize: '10px', color: isEmfAnomaly ? 'var(--accent-amber)' : 'var(--text-muted)' }}>
              (Nom: 0.28)
            </span>
          </div>
        </div>
      </div>

      {/* 4. Phantom Power */}
      <div style={{
        background: 'var(--bg-panel)',
        border: `1px solid ${isWattSurge ? 'var(--accent-crimson)' : 'var(--border-subtle)'}`,
        borderLeft: isWattSurge ? '3px solid var(--accent-crimson)' : '3px solid var(--border-subtle)',
        borderRadius: '2px',
        padding: '8px 12px',
        display: 'flex',
        alignItems: 'center',
        gap: '10px'
      }}>
        <div style={{
          width: '28px',
          height: '28px',
          background: isWattSurge ? 'rgba(239, 68, 68, 0.15)' : 'rgba(34, 197, 94, 0.1)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          borderRadius: '2px',
          flexShrink: 0
        }}>
          <Cpu size={15} color={isWattSurge ? 'var(--accent-crimson-bright)' : 'var(--accent-green)'} />
        </div>
        <div>
          <div style={{ fontSize: '10px', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
            [CH-04] CIRCUIT WATTAGE
          </div>
          <div style={{ fontSize: '14px', fontWeight: 700, color: isWattSurge ? 'var(--accent-crimson-bright)' : 'var(--text-primary)', fontFamily: 'var(--font-mono)' }}>
            {currentReading.powerWattage.toFixed(0)} W{' '}
            <span style={{ fontSize: '10px', color: isWattSurge ? 'var(--accent-crimson)' : 'var(--text-muted)' }}>
              {isWattSurge ? '[SURGE]' : '[IDLE]'}
            </span>
          </div>
        </div>
      </div>

      {/* 5. Portal Latch */}
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
          {isUnlatched ? <Unlock size={15} color="var(--accent-crimson-bright)" /> : <Lock size={15} color="var(--accent-green-bright)" />}
        </div>
        <div>
          <div style={{ fontSize: '10px', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
            [CH-05] MONITORED PORTAL
          </div>
          <div style={{ fontSize: '14px', fontWeight: 700, color: isUnlatched ? 'var(--accent-crimson-bright)' : 'var(--accent-green-bright)', fontFamily: 'var(--font-mono)' }}>
            {currentReading.doorLatchState}{' '}
            <span style={{ fontSize: '10px', color: isUnlatched ? 'var(--accent-crimson)' : 'var(--accent-green)' }}>
              {isUnlatched ? '[BREACH]' : '[LOCKED]'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
