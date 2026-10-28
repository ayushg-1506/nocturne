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
      margin: '0 16px 12px 16px',
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
      gap: '10px'
    }}>
      {/* 1. Temperature */}
      <div className="glass-panel" style={{
        padding: '10px 14px',
        display: 'flex',
        alignItems: 'center',
        gap: '10px',
        borderLeft: isColdAnomaly ? '3px solid var(--accent-cyan)' : '1px solid var(--border-subtle)'
      }}>
        <div style={{ width: '32px', height: '32px', borderRadius: '6px', background: 'rgba(56, 189, 248, 0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Thermometer size={16} color="var(--accent-cyan)" />
        </div>
        <div>
          <div style={{ fontSize: '10px', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>AMBIENT TEMP</div>
          <div style={{ fontSize: '15px', fontWeight: 800, color: isColdAnomaly ? 'var(--accent-cyan)' : 'var(--text-primary)', fontFamily: 'var(--font-mono)' }}>
            {currentReading.temperatureC.toFixed(1)}°C <span style={{ fontSize: '10px', color: tempDelta < 0 ? 'var(--accent-cyan)' : 'var(--text-muted)' }}>({tempDelta > 0 ? '+' : ''}{tempDelta.toFixed(1)}°)</span>
          </div>
        </div>
      </div>

      {/* 2. Acoustic */}
      <div className="glass-panel" style={{
        padding: '10px 14px',
        display: 'flex',
        alignItems: 'center',
        gap: '10px',
        borderLeft: isInfrasonic ? '3px solid var(--accent-violet)' : '1px solid var(--border-subtle)'
      }}>
        <div style={{ width: '32px', height: '32px', borderRadius: '6px', background: 'rgba(168, 85, 247, 0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Mic size={16} color="var(--accent-violet)" />
        </div>
        <div>
          <div style={{ fontSize: '10px', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>ACOUSTIC SPL &amp; FREQ</div>
          <div style={{ fontSize: '15px', fontWeight: 800, color: isInfrasonic ? '#d8b4fe' : 'var(--text-primary)', fontFamily: 'var(--font-mono)' }}>
            {currentReading.acousticDb.toFixed(1)} dB <span style={{ fontSize: '10px', color: isInfrasonic ? 'var(--accent-crimson)' : 'var(--text-muted)' }}>({currentReading.acousticFreqHz.toFixed(1)}Hz)</span>
          </div>
        </div>
      </div>

      {/* 3. EMF Flux */}
      <div className="glass-panel" style={{
        padding: '10px 14px',
        display: 'flex',
        alignItems: 'center',
        gap: '10px',
        borderLeft: isEmfAnomaly ? '3px solid var(--accent-amber)' : '1px solid var(--border-subtle)'
      }}>
        <div style={{ width: '32px', height: '32px', borderRadius: '6px', background: 'rgba(245, 158, 11, 0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Zap size={16} color="var(--accent-amber)" />
        </div>
        <div>
          <div style={{ fontSize: '10px', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>EMF INDUCTION FLUX</div>
          <div style={{ fontSize: '15px', fontWeight: 800, color: isEmfAnomaly ? 'var(--accent-amber)' : 'var(--text-primary)', fontFamily: 'var(--font-mono)' }}>
            {currentReading.emfFluxUtd.toFixed(2)} µT <span style={{ fontSize: '10px', color: isEmfAnomaly ? 'var(--accent-amber)' : 'var(--text-muted)' }}>(Nom: 0.28)</span>
          </div>
        </div>
      </div>

      {/* 4. Phantom Power */}
      <div className="glass-panel" style={{
        padding: '10px 14px',
        display: 'flex',
        alignItems: 'center',
        gap: '10px',
        borderLeft: isWattSurge ? '3px solid var(--accent-crimson)' : '1px solid var(--border-subtle)'
      }}>
        <div style={{ width: '32px', height: '32px', borderRadius: '6px', background: 'rgba(244, 63, 94, 0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Cpu size={16} color="var(--accent-crimson)" />
        </div>
        <div>
          <div style={{ fontSize: '10px', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>CIRCUIT POWER</div>
          <div style={{ fontSize: '15px', fontWeight: 800, color: isWattSurge ? 'var(--accent-crimson)' : 'var(--text-primary)', fontFamily: 'var(--font-mono)' }}>
            {currentReading.powerWattage.toFixed(0)} W <span style={{ fontSize: '10px', color: isWattSurge ? 'var(--accent-crimson)' : 'var(--text-muted)' }}>{isWattSurge ? '(GHOST LOAD)' : '(IDLE)'}</span>
          </div>
        </div>
      </div>

      {/* 5. Portal Latch */}
      <div className="glass-panel" style={{
        padding: '10px 14px',
        display: 'flex',
        alignItems: 'center',
        gap: '10px',
        borderLeft: isUnlatched ? '3px solid var(--accent-crimson)' : '1px solid var(--accent-emerald)'
      }}>
        <div style={{ width: '32px', height: '32px', borderRadius: '6px', background: isUnlatched ? 'rgba(244, 63, 94, 0.15)' : 'rgba(16, 185, 129, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          {isUnlatched ? <Unlock size={16} color="var(--accent-crimson)" /> : <Lock size={16} color="var(--accent-emerald)" />}
        </div>
        <div>
          <div style={{ fontSize: '10px', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>MONITORED PORTAL</div>
          <div style={{ fontSize: '15px', fontWeight: 800, color: isUnlatched ? 'var(--accent-crimson)' : 'var(--accent-emerald)', fontFamily: 'var(--font-mono)' }}>
            {currentReading.doorLatchState} <span style={{ fontSize: '10px', color: isUnlatched ? 'var(--accent-crimson)' : 'var(--accent-emerald)' }}>{isUnlatched ? '(!)' : '(SECURE)'}</span>
          </div>
        </div>
      </div>
    </div>
  );
};
