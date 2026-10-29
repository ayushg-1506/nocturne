import React from 'react';
import type { RoomCoordinate, SensorReading } from '../types/telemetry';
import { Thermometer, Mic, Zap, Lock, Unlock } from 'lucide-react';

interface FloorplanViewProps {
  rooms: RoomCoordinate[];
  currentReading: SensorReading;
  selectedRoomId: string | null;
  onSelectRoom: (roomId: string) => void;
  buildingName: string;
}

export const FloorplanView: React.FC<FloorplanViewProps> = ({
  rooms,
  currentReading,
  selectedRoomId,
  onSelectRoom,
  buildingName
}) => {
  const isColdAnomaly = currentReading.temperatureC < 16.0;
  const isEmfAnomaly = currentReading.emfFluxUtd > 3.0;

  return (
    <div style={{
      background: 'var(--bg-panel)',
      border: '1px solid var(--border-subtle)',
      borderRadius: '2px',
      padding: '16px',
      display: 'flex',
      flexDirection: 'column',
      gap: '12px',
      height: '100%'
    }}>
      {/* Blueprint Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span className="terminal-title">
              ARCHITECTURAL TELEMETRY MATRIX
            </span>
            <span className="badge-green" style={{ fontSize: '9px', padding: '1px 6px' }}>
              SPATIAL GRID
            </span>
          </div>
          <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '2px' }}>
            {buildingName}
          </div>
        </div>

        {/* Legend */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', fontSize: '10px', color: 'var(--text-muted)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
            <span style={{ width: '8px', height: '8px', background: 'var(--accent-green)', borderRadius: '1px' }} />
            <span style={{ color: '#ffffff' }}>NOMINAL</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
            <span style={{ width: '8px', height: '8px', background: 'var(--accent-amber)', borderRadius: '1px' }} />
            <span style={{ color: '#ffffff' }}>THERMAL DRIFT</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
            <span style={{ width: '8px', height: '8px', background: 'var(--accent-crimson)', borderRadius: '1px' }} />
            <span style={{ color: '#ffffff' }}>BREACH / HOT ZONE</span>
          </div>
        </div>
      </div>

      {/* SVG Interactive Architectural Canvas */}
      <div style={{
        position: 'relative',
        width: '100%',
        flex: 1,
        minHeight: '340px',
        background: '#020402',
        border: '1px solid var(--border-subtle)',
        borderRadius: '2px',
        overflow: 'hidden'
      }}>
        <svg
          viewBox="0 0 560 340"
          style={{ width: '100%', height: '100%', display: 'block' }}
        >
          {/* Subtle Terminal Grid Pattern */}
          <defs>
            <pattern id="termGrid" width="20" height="20" patternUnits="userSpaceOnUse">
              <path d="M 20 0 L 0 0 0 20" fill="none" stroke="rgba(34, 197, 94, 0.04)" strokeWidth="0.8" />
            </pattern>
            <linearGradient id="termNominal" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#060c07" stopOpacity="0.95" />
              <stop offset="100%" stopColor="#030704" stopOpacity="0.95" />
            </linearGradient>
            <linearGradient id="termCold" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="rgba(245, 158, 11, 0.16)" />
              <stop offset="100%" stopColor="#050905" stopOpacity="0.95" />
            </linearGradient>
            <linearGradient id="termAlert" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="rgba(239, 68, 68, 0.20)" />
              <stop offset="100%" stopColor="#050905" stopOpacity="0.95" />
            </linearGradient>
          </defs>

          <rect width="100%" height="100%" fill="url(#termGrid)" />

          {/* Rooms */}
          {rooms.map((room) => {
            const isSelected = selectedRoomId === room.id;
            const isMotionHere = currentReading.pirMotion && (currentReading.pirRoom === room.name || currentReading.pirRoom?.includes(room.id));
            const isHotZone = room.name.toLowerCase().includes('hot zone') || room.name.toLowerCase().includes('nursery') || room.name.toLowerCase().includes('basement');

            let fillStyle = 'url(#termNominal)';
            let strokeColor = 'var(--border-subtle)';

            if (isColdAnomaly && isHotZone) {
              fillStyle = 'url(#termCold)';
              strokeColor = 'var(--accent-amber)';
            } else if (isMotionHere) {
              fillStyle = 'url(#termAlert)';
              strokeColor = 'var(--accent-crimson)';
            }

            if (isSelected) {
              strokeColor = 'var(--accent-green)';
            }

            return (
              <g
                key={room.id}
                onClick={() => onSelectRoom(room.id)}
                style={{ cursor: 'pointer', transition: 'all 0.2s ease' }}
              >
                {/* Room Boundary */}
                <rect
                  x={room.x}
                  y={room.y}
                  width={room.width}
                  height={room.height}
                  rx="2"
                  fill={fillStyle}
                  stroke={strokeColor}
                  strokeWidth={isSelected ? '2' : '1'}
                  strokeDasharray={isSelected ? '4 2' : 'none'}
                />

                {/* Room Label: Pure White for clean readability, Amber if cold anomaly in hot zone */}
                <text
                  x={room.x + 10}
                  y={room.y + 20}
                  fill={isHotZone && isColdAnomaly ? 'var(--accent-amber-bright)' : '#ffffff'}
                  fontSize={room.width < 100 ? "9" : "11"}
                  fontWeight="700"
                  fontFamily="var(--font-mono)"
                  letterSpacing="0.04em"
                >
                  {room.name.toUpperCase()}
                </text>

                {/* Sensor tags within room */}
                <g transform={`translate(${room.x + room.width - 24}, ${room.y + 12})`}>
                  {room.sensorIds.map((sid: string, idx: number) => (
                    <text
                      key={sid}
                      x={room.width < 100 ? 0 : idx * 56}
                      y={room.width < 100 ? idx * 16 : 0}
                      fill="var(--text-muted)"
                      fontSize="9"
                      fontFamily="var(--font-mono)"
                    >
                      [{sid}]
                    </text>
                  ))}
                </g>

                {/* Anomaly Plume Ring */}
                {isColdAnomaly && isHotZone && (
                  <circle
                    cx={room.x + room.width / 2}
                    cy={room.y + room.height / 2}
                    r={Math.min(room.width, room.height) * 0.35}
                    fill="rgba(245, 158, 11, 0.12)"
                    stroke="var(--accent-amber)"
                    strokeWidth="1.2"
                    strokeDasharray="3 3"
                  >
                    <animate
                      attributeName="r"
                      values={`${Math.min(room.width, room.height) * 0.3};${Math.min(room.width, room.height) * 0.42};${Math.min(room.width, room.height) * 0.3}`}
                      dur="3s"
                      repeatCount="indefinite"
                    />
                    <animate
                      attributeName="opacity"
                      values="0.3;0.7;0.3"
                      dur="3s"
                      repeatCount="indefinite"
                    />
                  </circle>
                )}

                {/* Motion Detection Beacon */}
                {isMotionHere && (
                  <g transform={`translate(${room.x + room.width - 24}, ${room.y + 12})`}>
                    <circle cx="6" cy="6" r="5" fill="var(--accent-crimson)" className="pulse-crimson" />
                    <circle cx="6" cy="6" r="10" fill="none" stroke="var(--accent-crimson)" strokeWidth="1" opacity="0.5">
                      <animate attributeName="r" values="6;16;6" dur="1s" repeatCount="indefinite" />
                      <animate attributeName="opacity" values="0.8;0;0.8" dur="1s" repeatCount="indefinite" />
                    </circle>
                  </g>
                )}
              </g>
            );
          })}

          {/* Door Latch Sensor Graphic */}
          <g transform="translate(245, 125)">
            <circle
              cx="0"
              cy="0"
              r="8"
              fill={currentReading.doorLatchState === 'SECURE' ? '#061208' : 'rgba(239, 68, 68, 0.2)'}
              stroke={currentReading.doorLatchState === 'SECURE' ? 'var(--accent-green)' : 'var(--accent-crimson)'}
              strokeWidth="1.5"
            />
            <text
              x="14"
              y="4"
              fill={currentReading.doorLatchState === 'SECURE' ? '#d4d4d8' : 'var(--accent-crimson-bright)'}
              fontSize="9"
              fontFamily="var(--font-mono)"
              fontWeight="600"
            >
              LATCH: <tspan fill={currentReading.doorLatchState === 'SECURE' ? 'var(--accent-green-bright)' : 'var(--accent-crimson-bright)'}>{currentReading.doorLatchState}</tspan>
            </text>
          </g>
        </svg>
      </div>

      {/* Blueprint Sub-Strip Telemetry */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '10px',
        padding: '8px 12px',
        background: '#040804',
        border: '1px solid var(--border-subtle)',
        borderRadius: '2px',
        fontSize: '11px',
        fontFamily: 'var(--font-mono)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <Thermometer size={12} color="var(--accent-green)" />
          <span style={{ color: 'var(--text-muted)' }}>AMB TEMP:</span>
          <span style={{ color: isColdAnomaly ? 'var(--accent-amber-bright)' : '#ffffff', fontWeight: 700 }}>
            {currentReading.temperatureC.toFixed(1)}°C
          </span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <Mic size={12} color="var(--accent-green)" />
          <span style={{ color: 'var(--text-muted)' }}>ACOUSTIC:</span>
          <span style={{ color: '#ffffff', fontWeight: 700 }}>
            {currentReading.acousticDb.toFixed(1)} dB{' '}
            <span style={{ color: currentReading.acousticFreqHz >= 18.0 && currentReading.acousticFreqHz <= 20.0 ? 'var(--accent-amber-bright)' : 'var(--text-muted)' }}>
              ({currentReading.acousticFreqHz.toFixed(1)}Hz)
            </span>
          </span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <Zap size={12} color="var(--accent-green)" />
          <span style={{ color: 'var(--text-muted)' }}>EMF FLUX:</span>
          <span style={{ color: isEmfAnomaly ? 'var(--accent-amber-bright)' : '#ffffff', fontWeight: 700 }}>
            {currentReading.emfFluxUtd.toFixed(2)} µT
          </span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          {currentReading.doorLatchState === 'SECURE' ? (
            <Lock size={12} color="var(--accent-green)" />
          ) : (
            <Unlock size={12} color="var(--accent-crimson)" />
          )}
          <span style={{ color: 'var(--text-muted)' }}>PORTAL:</span>
          <span style={{ color: currentReading.doorLatchState === 'SECURE' ? 'var(--accent-green-bright)' : 'var(--accent-crimson-bright)', fontWeight: 700 }}>
            [{currentReading.doorLatchState}]
          </span>
        </div>
      </div>
    </div>
  );
};
