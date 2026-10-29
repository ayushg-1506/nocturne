import React, { useState } from 'react';
import type { SensorReading, DetectedAnomaly } from '../types/telemetry';
import { TelemetryCharts } from './TelemetryCharts';
import { Thermometer, Mic, Zap, Cpu, Search, Table, LineChart } from 'lucide-react';

interface TelemetryLabViewProps {
  readings: SensorReading[];
  currentMinute: number;
  totalMinutes: number;
  anomalies: DetectedAnomaly[];
  onSeek: (minute: number) => void;
}

export const TelemetryLabView: React.FC<TelemetryLabViewProps> = ({
  readings,
  currentMinute,
  totalMinutes,
  anomalies,
  onSeek
}) => {
  const [viewMode, setViewMode] = useState<'charts' | 'table'>('charts');
  const [searchTerm, setSearchTerm] = useState<string>('');

  const temps = readings.map(r => r.temperatureC);
  const minTemp = temps.length ? Math.min(...temps) : 0;
  const maxTemp = temps.length ? Math.max(...temps) : 0;
  const maxDb = readings.length ? Math.max(...readings.map(r => r.acousticDb)) : 0;
  const maxEmf = readings.length ? Math.max(...readings.map(r => r.emfFluxUtd)) : 0;
  const maxWatt = readings.length ? Math.max(...readings.map(r => r.powerWattage)) : 0;

  const filteredReadings = readings.filter(r => {
    if (!searchTerm) return true;
    const term = searchTerm.toLowerCase();
    return (
      r.timestamp.toLowerCase().includes(term) ||
      r.doorLatchState.toLowerCase().includes(term) ||
      r.temperatureC.toString().includes(term)
    );
  });

  return (
    <div style={{
      margin: '0 16px 14px 16px',
      display: 'flex',
      flexDirection: 'column',
      gap: '10px'
    }}>
      {/* Sensor Statistics Cards */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: '8px'
      }}>
        {/* KPI 1 */}
        <div style={{
          background: 'var(--bg-panel)',
          border: '1px solid var(--border-subtle)',
          borderRadius: '2px',
          padding: '10px 14px',
          display: 'flex',
          alignItems: 'center',
          gap: '10px'
        }}>
          <div style={{ width: '30px', height: '30px', borderRadius: '2px', background: 'rgba(34, 197, 94, 0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Thermometer size={16} color="var(--accent-green-bright)" />
          </div>
          <div>
            <div style={{ fontSize: '10px', color: 'var(--text-muted)' }}>THERMAL ENVELOPE</div>
            <div style={{ fontSize: '14px', fontWeight: 700, color: 'var(--text-primary)' }}>
              {minTemp.toFixed(1)}°C <span style={{ fontSize: '10px', color: 'var(--text-muted)' }}>to</span> {maxTemp.toFixed(1)}°C
            </div>
          </div>
        </div>

        {/* KPI 2 */}
        <div style={{
          background: 'var(--bg-panel)',
          border: '1px solid var(--border-subtle)',
          borderRadius: '2px',
          padding: '10px 14px',
          display: 'flex',
          alignItems: 'center',
          gap: '10px'
        }}>
          <div style={{ width: '30px', height: '30px', borderRadius: '2px', background: 'rgba(245, 158, 11, 0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Mic size={16} color="var(--accent-amber-bright)" />
          </div>
          <div>
            <div style={{ fontSize: '10px', color: 'var(--text-muted)' }}>PEAK INFRASOUND SPL</div>
            <div style={{ fontSize: '14px', fontWeight: 700, color: 'var(--accent-amber-bright)' }}>
              {maxDb.toFixed(1)} dB <span style={{ fontSize: '10px', color: 'var(--text-muted)' }}>(18.98Hz Lock)</span>
            </div>
          </div>
        </div>

        {/* KPI 3 */}
        <div style={{
          background: 'var(--bg-panel)',
          border: '1px solid var(--border-subtle)',
          borderRadius: '2px',
          padding: '10px 14px',
          display: 'flex',
          alignItems: 'center',
          gap: '10px'
        }}>
          <div style={{ width: '30px', height: '30px', borderRadius: '2px', background: 'rgba(245, 158, 11, 0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Zap size={16} color="var(--accent-amber-bright)" />
          </div>
          <div>
            <div style={{ fontSize: '10px', color: 'var(--text-muted)' }}>MAX EMF INDUCTION</div>
            <div style={{ fontSize: '14px', fontWeight: 700, color: 'var(--accent-amber-bright)' }}>
              {maxEmf.toFixed(2)} µT <span style={{ fontSize: '10px', color: 'var(--text-muted)' }}>(Base: 0.25)</span>
            </div>
          </div>
        </div>

        {/* KPI 4 */}
        <div style={{
          background: 'var(--bg-panel)',
          border: '1px solid var(--border-subtle)',
          borderRadius: '2px',
          padding: '10px 14px',
          display: 'flex',
          alignItems: 'center',
          gap: '10px'
        }}>
          <div style={{ width: '30px', height: '30px', borderRadius: '2px', background: 'rgba(239, 68, 68, 0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Cpu size={16} color="var(--accent-crimson-bright)" />
          </div>
          <div>
            <div style={{ fontSize: '10px', color: 'var(--text-muted)' }}>PEAK CIRCUIT POWER</div>
            <div style={{ fontSize: '14px', fontWeight: 700, color: 'var(--accent-crimson-bright)' }}>
              {maxWatt.toFixed(0)} W <span style={{ fontSize: '10px', color: 'var(--text-muted)' }}>[SURGE]</span>
            </div>
          </div>
        </div>
      </div>

      {/* View Mode Toggle Bar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
        <div style={{ display: 'flex', gap: '6px' }}>
          <button
            onClick={() => setViewMode('charts')}
            className={viewMode === 'charts' ? 'btn-primary' : 'btn-secondary'}
            style={{ padding: '5px 12px', fontSize: '11px' }}
          >
            <LineChart size={13} />
            <span>[ WAVEFORM CURVES ]</span>
          </button>

          <button
            onClick={() => setViewMode('table')}
            className={viewMode === 'table' ? 'btn-primary' : 'btn-secondary'}
            style={{ padding: '5px 12px', fontSize: '11px' }}
          >
            <Table size={13} />
            <span>[ RAW SENSOR TABLE ]</span>
          </button>
        </div>

        {viewMode === 'table' && (
          <div style={{ position: 'relative', width: '240px' }}>
            <Search size={13} color="var(--text-muted)" style={{ position: 'absolute', left: '8px', top: '7px' }} />
            <input
              type="text"
              placeholder="Search timestamp / latch..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              style={{
                width: '100%',
                paddingLeft: '26px',
                fontSize: '11px'
              }}
            />
          </div>
        )}
      </div>

      {/* Main Content Area */}
      {viewMode === 'charts' ? (
        <TelemetryCharts
          readings={readings}
          currentMinute={currentMinute}
          totalMinutes={totalMinutes}
          anomalies={anomalies}
          onSeek={onSeek}
        />
      ) : (
        <div style={{
          background: 'var(--bg-panel)',
          border: '1px solid var(--border-subtle)',
          borderRadius: '2px',
          padding: '12px',
          overflowX: 'auto'
        }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '11px', fontFamily: 'var(--font-mono)' }}>
            <thead>
              <tr style={{ background: '#040804', borderBottom: '1px solid var(--border-subtle)', textAlign: 'left' }}>
                <th style={{ padding: '6px 10px', color: 'var(--text-muted)' }}>TIMESTAMP</th>
                <th style={{ padding: '6px 10px', color: 'var(--accent-green-bright)' }}>TEMP (°C)</th>
                <th style={{ padding: '6px 10px', color: 'var(--text-secondary)' }}>HUMIDITY (%)</th>
                <th style={{ padding: '6px 10px', color: 'var(--accent-amber-bright)' }}>SOUND (dB)</th>
                <th style={{ padding: '6px 10px', color: 'var(--accent-amber-bright)' }}>FREQ (Hz)</th>
                <th style={{ padding: '6px 10px', color: 'var(--accent-crimson-bright)' }}>EMF (µT)</th>
                <th style={{ padding: '6px 10px', color: 'var(--accent-crimson-bright)' }}>POWER (W)</th>
                <th style={{ padding: '6px 10px', color: 'var(--accent-green-bright)' }}>PORTAL</th>
                <th style={{ padding: '6px 10px', color: 'var(--text-muted)' }}>ACTION</th>
              </tr>
            </thead>
            <tbody>
              {filteredReadings.slice(0, 100).map((r, idx) => {
                const isCurrent = Math.abs(r.epochMinutes - currentMinute) <= 2;
                return (
                  <tr
                    key={idx}
                    onClick={() => onSeek(r.epochMinutes)}
                    style={{
                      borderBottom: '1px solid var(--border-subtle)',
                      background: isCurrent ? 'rgba(34, 197, 94, 0.12)' : 'transparent',
                      cursor: 'pointer'
                    }}
                  >
                    <td style={{ padding: '6px 10px', fontWeight: isCurrent ? 700 : 400, color: isCurrent ? 'var(--accent-green-bright)' : 'var(--text-primary)' }}>
                      {r.timestamp}
                    </td>
                    <td style={{ padding: '6px 10px', color: r.temperatureC < 16.0 ? 'var(--accent-amber-bright)' : 'inherit', fontWeight: r.temperatureC < 16.0 ? 700 : 400 }}>
                      {r.temperatureC.toFixed(1)}°C
                    </td>
                    <td style={{ padding: '6px 10px', color: 'var(--text-secondary)' }}>
                      {r.humidityPct.toFixed(1)}%
                    </td>
                    <td style={{ padding: '6px 10px', color: r.acousticDb > 35 ? 'var(--accent-amber-bright)' : 'inherit', fontWeight: r.acousticDb > 35 ? 700 : 400 }}>
                      {r.acousticDb.toFixed(1)} dB
                    </td>
                    <td style={{ padding: '6px 10px', color: r.acousticFreqHz >= 18 && r.acousticFreqHz <= 20 ? 'var(--accent-crimson-bright)' : 'inherit' }}>
                      {r.acousticFreqHz.toFixed(2)} Hz
                    </td>
                    <td style={{ padding: '6px 10px', color: r.emfFluxUtd > 3.0 ? 'var(--accent-crimson-bright)' : 'inherit', fontWeight: r.emfFluxUtd > 3.0 ? 700 : 400 }}>
                      {r.emfFluxUtd.toFixed(2)} µT
                    </td>
                    <td style={{ padding: '6px 10px', color: r.powerWattage > 500 ? 'var(--accent-crimson-bright)' : 'inherit', fontWeight: r.powerWattage > 500 ? 700 : 400 }}>
                      {r.powerWattage.toFixed(1)} W
                    </td>
                    <td style={{ padding: '6px 10px' }}>
                      <span className={r.doorLatchState === 'SECURE' ? 'badge-green' : 'badge-crimson'} style={{ fontSize: '9px', padding: '1px 5px' }}>
                        {r.doorLatchState}
                      </span>
                    </td>
                    <td style={{ padding: '6px 10px' }}>
                      <button
                        onClick={(e) => { e.stopPropagation(); onSeek(r.epochMinutes); }}
                        className="btn-secondary"
                        style={{ padding: '2px 6px', fontSize: '10px' }}
                      >
                        [ SEEK ]
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};
