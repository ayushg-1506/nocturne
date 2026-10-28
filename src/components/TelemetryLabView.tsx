import React, { useState } from 'react';
import type { SensorReading, DetectedAnomaly } from '../types/telemetry';
import { TelemetryCharts } from './TelemetryCharts';
import { Activity, Table, LineChart, Search, Zap, Thermometer, Mic } from 'lucide-react';

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
  const minTemp = Math.min(...temps);
  const maxTemp = Math.max(...temps);

  const emfs = readings.map(r => r.emfFluxUtd);
  const maxEmf = Math.max(...emfs);

  const dbs = readings.map(r => r.acousticDb);
  const maxDb = Math.max(...dbs);

  const watts = readings.map(r => r.powerWattage);
  const maxWatt = Math.max(...watts);

  const filteredReadings = readings.filter(r => 
    r.timestamp.includes(searchTerm) || 
    r.doorLatchState.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (r.pirMotion ? 'motion' : '').includes(searchTerm.toLowerCase())
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
      {/* KPI Stats Strip */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))',
        gap: '12px'
      }}>
        {/* KPI 1 */}
        <div className="glass-panel" style={{ padding: '12px 16px', display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ width: '36px', height: '36px', borderRadius: '8px', background: 'rgba(56, 189, 248, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Thermometer size={18} color="var(--accent-cyan)" />
          </div>
          <div>
            <div style={{ fontSize: '10px', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>THERMAL RANGE</div>
            <div style={{ fontSize: '16px', fontWeight: 800, color: 'var(--text-primary)', fontFamily: 'var(--font-mono)' }}>
              {minTemp.toFixed(1)}°C <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>to</span> {maxTemp.toFixed(1)}°C
            </div>
          </div>
        </div>

        {/* KPI 2 */}
        <div className="glass-panel" style={{ padding: '12px 16px', display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ width: '36px', height: '36px', borderRadius: '8px', background: 'rgba(168, 85, 247, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Mic size={18} color="var(--accent-violet)" />
          </div>
          <div>
            <div style={{ fontSize: '10px', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>MAX ACOUSTIC SPL</div>
            <div style={{ fontSize: '16px', fontWeight: 800, color: '#d8b4fe', fontFamily: 'var(--font-mono)' }}>
              {maxDb.toFixed(1)} dB <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>(18.98Hz Lock)</span>
            </div>
          </div>
        </div>

        {/* KPI 3 */}
        <div className="glass-panel" style={{ padding: '12px 16px', display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ width: '36px', height: '36px', borderRadius: '8px', background: 'rgba(245, 158, 11, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Zap size={18} color="var(--accent-amber)" />
          </div>
          <div>
            <div style={{ fontSize: '10px', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>MAX EMF INDUCTION</div>
            <div style={{ fontSize: '16px', fontWeight: 800, color: 'var(--accent-amber)', fontFamily: 'var(--font-mono)' }}>
              {maxEmf.toFixed(2)} µT <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>(Base: 0.25)</span>
            </div>
          </div>
        </div>

        {/* KPI 4 */}
        <div className="glass-panel" style={{ padding: '12px 16px', display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ width: '36px', height: '36px', borderRadius: '8px', background: 'rgba(244, 63, 94, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Activity size={18} color="var(--accent-crimson)" />
          </div>
          <div>
            <div style={{ fontSize: '10px', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>PEAK PHANTOM POWER</div>
            <div style={{ fontSize: '16px', fontWeight: 800, color: 'var(--accent-crimson)', fontFamily: 'var(--font-mono)' }}>
              {maxWatt.toFixed(0)} W <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>(Ghost Load)</span>
            </div>
          </div>
        </div>
      </div>

      {/* View Mode Toggle Bar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
        <div style={{ display: 'flex', gap: '8px' }}>
          <button
            onClick={() => setViewMode('charts')}
            className={`btn-secondary ${viewMode === 'charts' ? 'badge-cyan' : ''}`}
            style={{ padding: '6px 14px' }}
          >
            <LineChart size={14} />
            <span>WAVEFORM CURVES</span>
          </button>

          <button
            onClick={() => setViewMode('table')}
            className={`btn-secondary ${viewMode === 'table' ? 'badge-cyan' : ''}`}
            style={{ padding: '6px 14px' }}
          >
            <Table size={14} />
            <span>RAW SENSOR TABLE</span>
          </button>
        </div>

        {viewMode === 'table' && (
          <div style={{ position: 'relative', width: '240px' }}>
            <Search size={14} color="var(--text-muted)" style={{ position: 'absolute', left: '10px', top: '9px' }} />
            <input
              type="text"
              placeholder="Search timestamp / latch..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              style={{
                width: '100%',
                background: 'rgba(15, 23, 42, 0.8)',
                border: '1px solid var(--border-subtle)',
                borderRadius: '6px',
                padding: '6px 10px 6px 30px',
                color: 'var(--text-primary)',
                fontSize: '12px',
                fontFamily: 'var(--font-mono)'
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
        <div className="glass-panel" style={{ padding: '16px', overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '11px', fontFamily: 'var(--font-mono)' }}>
            <thead>
              <tr style={{ background: 'rgba(255, 255, 255, 0.03)', borderBottom: '1px solid var(--border-subtle)', textAlign: 'left' }}>
                <th style={{ padding: '8px 12px', color: 'var(--text-muted)' }}>TIMESTAMP</th>
                <th style={{ padding: '8px 12px', color: 'var(--accent-cyan)' }}>TEMP (°C)</th>
                <th style={{ padding: '8px 12px', color: 'var(--text-secondary)' }}>HUMIDITY (%)</th>
                <th style={{ padding: '8px 12px', color: 'var(--accent-violet)' }}>SOUND (dB)</th>
                <th style={{ padding: '8px 12px', color: '#d8b4fe' }}>FREQ (Hz)</th>
                <th style={{ padding: '8px 12px', color: 'var(--accent-amber)' }}>EMF (µT)</th>
                <th style={{ padding: '8px 12px', color: 'var(--accent-crimson)' }}>POWER (W)</th>
                <th style={{ padding: '8px 12px', color: 'var(--accent-emerald)' }}>PORTAL LATCH</th>
                <th style={{ padding: '8px 12px', color: 'var(--text-muted)' }}>ACTION</th>
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
                      background: isCurrent ? 'rgba(56, 189, 248, 0.1)' : 'transparent',
                      cursor: 'pointer'
                    }}
                  >
                    <td style={{ padding: '8px 12px', fontWeight: isCurrent ? 700 : 400, color: isCurrent ? 'var(--accent-cyan)' : 'var(--text-primary)' }}>
                      {r.timestamp}
                    </td>
                    <td style={{ padding: '8px 12px', color: r.temperatureC < 16.0 ? 'var(--accent-cyan)' : 'inherit', fontWeight: r.temperatureC < 16.0 ? 700 : 400 }}>
                      {r.temperatureC.toFixed(1)}°C
                    </td>
                    <td style={{ padding: '8px 12px', color: 'var(--text-secondary)' }}>
                      {r.humidityPct.toFixed(1)}%
                    </td>
                    <td style={{ padding: '8px 12px', color: r.acousticDb > 35 ? 'var(--accent-violet)' : 'inherit', fontWeight: r.acousticDb > 35 ? 700 : 400 }}>
                      {r.acousticDb.toFixed(1)} dB
                    </td>
                    <td style={{ padding: '8px 12px', color: r.acousticFreqHz >= 18 && r.acousticFreqHz <= 20 ? 'var(--accent-crimson)' : 'inherit' }}>
                      {r.acousticFreqHz.toFixed(2)} Hz
                    </td>
                    <td style={{ padding: '8px 12px', color: r.emfFluxUtd > 3.0 ? 'var(--accent-amber)' : 'inherit', fontWeight: r.emfFluxUtd > 3.0 ? 700 : 400 }}>
                      {r.emfFluxUtd.toFixed(2)} µT
                    </td>
                    <td style={{ padding: '8px 12px', color: r.powerWattage > 500 ? 'var(--accent-crimson)' : 'inherit', fontWeight: r.powerWattage > 500 ? 700 : 400 }}>
                      {r.powerWattage.toFixed(1)} W
                    </td>
                    <td style={{ padding: '8px 12px' }}>
                      <span className={`badge ${r.doorLatchState === 'SECURE' ? 'badge-cyan' : 'badge-crimson'}`} style={{ fontSize: '9px' }}>
                        {r.doorLatchState}
                      </span>
                    </td>
                    <td style={{ padding: '8px 12px' }}>
                      <button
                        onClick={(e) => { e.stopPropagation(); onSeek(r.epochMinutes); }}
                        style={{ background: 'transparent', border: '1px solid var(--border-subtle)', color: 'var(--text-secondary)', padding: '2px 8px', borderRadius: '4px', cursor: 'pointer', fontSize: '10px' }}
                      >
                        SEEK
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
