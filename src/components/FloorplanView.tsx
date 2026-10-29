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
  const isInfrasonic = currentReading.acousticFreqHz >= 18.0 && currentReading.acousticFreqHz <= 20.0;
  const isUnlatched = currentReading.doorLatchState !== 'SECURE';

  // Room status definitions
  const getRoomTelemetry = (roomId: string) => {
    switch (roomId) {
      case 'master':
        return { temp: 20.4, status: 'NOMINAL', note: 'TH-01 Stable' };
      case 'hallway':
        return { 
          temp: 19.8, 
          status: isUnlatched ? 'PORTAL BREACH' : 'SECURE', 
          note: isUnlatched ? 'Deadbolt Unlatched' : 'Access Restricted' 
        };
      case 'nursery':
        return { 
          temp: currentReading.temperatureC, 
          status: isColdAnomaly ? 'THERMAL COLLAPSE' : 'NOMINAL', 
          note: isColdAnomaly ? `Δ ${(currentReading.temperatureC - 21.4).toFixed(1)}°C (Cold Spot)` : 'Baseline Stable' 
        };
      case 'study':
        return { temp: 20.8, status: 'NOMINAL', note: 'TH-03 Baseline' };
      case 'basement':
        return { 
          temp: 23.5, 
          status: isEmfAnomaly ? 'EMF SURGE' : 'NOMINAL', 
          note: isEmfAnomaly ? `${currentReading.emfFluxUtd.toFixed(2)} µT (Transient Spike)` : 'Power Stable' 
        };
      default:
        return { temp: 20.0, status: 'NOMINAL', note: 'Active' };
    }
  };

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
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px', fontSize: '10px' }}>
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

      {/* SVG Interactive Architectural Canvas with Generous 600x365 ViewBox */}
      <div style={{
        position: 'relative',
        width: '100%',
        minHeight: '320px',
        background: '#040507',
        border: '1px solid var(--border-subtle)',
        borderRadius: '2px',
        overflow: 'hidden'
      }}>
        <svg
          viewBox="0 0 600 365"
          style={{ width: '100%', height: '100%', display: 'block' }}
        >
          {/* Subtle Terminal Grid Pattern */}
          <defs>
            <pattern id="termGrid" width="20" height="20" patternUnits="userSpaceOnUse">
              <path d="M 20 0 L 0 0 0 20" fill="none" stroke="rgba(255, 255, 255, 0.03)" strokeWidth="0.8" />
            </pattern>
            <linearGradient id="termNominal" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#0a0c10" stopOpacity="0.95" />
              <stop offset="100%" stopColor="#060709" stopOpacity="0.95" />
            </linearGradient>
            <linearGradient id="termCold" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="rgba(245, 158, 11, 0.18)" />
              <stop offset="100%" stopColor="#0a0c10" stopOpacity="0.95" />
            </linearGradient>
            <linearGradient id="termAlert" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="rgba(239, 68, 68, 0.22)" />
              <stop offset="100%" stopColor="#0a0c10" stopOpacity="0.95" />
            </linearGradient>
          </defs>

          <rect width="100%" height="100%" fill="url(#termGrid)" />

          {/* Rooms */}
          {rooms.map((room) => {
            const isSelected = selectedRoomId === room.id;
            const isMotionHere = currentReading.pirMotion && (currentReading.pirRoom === room.name || currentReading.pirRoom?.includes(room.id));
            const isHotZone = room.name.toLowerCase().includes('hot zone') || room.name.toLowerCase().includes('nursery') || room.name.toLowerCase().includes('basement');

            let fillStyle = 'url(#termNominal)';
            let strokeColor = 'var(--border-muted)';

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

            const isNarrow = room.width < 110;

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

                {/* Room Label: Crisp White */}
                <text
                  x={room.x + 12}
                  y={room.y + 22}
                  fill={isHotZone && isColdAnomaly ? 'var(--accent-amber-bright)' : '#ffffff'}
                  fontSize={isNarrow ? "10" : "11"}
                  fontWeight="700"
                  fontFamily="var(--font-mono)"
                  letterSpacing="0.04em"
                >
                  {room.name.toUpperCase()}
                </text>

                {/* Sensor tags within room (Rendered as clean mini badge chips that never overflow) */}
                <g transform={`translate(${room.x + 12}, ${room.y + 36})`}>
                  {room.sensorIds.map((sid: string, idx: number) => {
                    const tagX = isNarrow ? 0 : idx * 62;
                    const tagY = isNarrow ? idx * 20 : 0;
                    return (
                      <g key={sid} transform={`translate(${tagX}, ${tagY})`}>
                        <rect
                          width="54"
                          height="15"
                          rx="2"
                          fill="#101217"
                          stroke="#242833"
                          strokeWidth="0.8"
                        />
                        <text
                          x="27"
                          y="11"
                          textAnchor="middle"
                          fill="#9ca3af"
                          fontSize="9"
                          fontFamily="var(--font-mono)"
                          fontWeight="600"
                        >
                          {sid}
                        </text>
                      </g>
                    );
                  })}
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
                      values={`${Math.min(room.width, room.height) * 0.28};${Math.min(room.width, room.height) * 0.40};${Math.min(room.width, room.height) * 0.28}`}
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

          {/* Door Latch Sensor Graphic: Positioned cleanly between Master Suite and Corridor */}
          <g transform="translate(245, 105)">
            <rect
              x="-6"
              y="-10"
              width="95"
              height="20"
              rx="2"
              fill="#0d0f14"
              stroke={currentReading.doorLatchState === 'SECURE' ? 'var(--accent-green)' : 'var(--accent-crimson)'}
              strokeWidth="1"
            />
            <circle
              cx="4"
              cy="0"
              r="4"
              fill={currentReading.doorLatchState === 'SECURE' ? 'var(--accent-green-bright)' : 'var(--accent-crimson-bright)'}
            />
            <text
              x="14"
              y="3.5"
              fill={currentReading.doorLatchState === 'SECURE' ? 'var(--accent-green-bright)' : 'var(--accent-crimson-bright)'}
              fontSize="9"
              fontFamily="var(--font-mono)"
              fontWeight="700"
            >
              LATCH: {currentReading.doorLatchState}
            </text>
          </g>
        </svg>
      </div>

      {/* Real-Time Room Telemetry Matrix Grid (Fills vertical void with high-density data) */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(135px, 1fr))',
        gap: '6px'
      }}>
        {rooms.map(room => {
          const telem = getRoomTelemetry(room.id);
          const isSelected = selectedRoomId === room.id;
          const isAnom = telem.status !== 'NOMINAL' && telem.status !== 'SECURE';
          return (
            <div
              key={room.id}
              onClick={() => onSelectRoom(room.id)}
              style={{
                background: isSelected ? '#121620' : '#06070a',
                border: `1px solid ${isSelected ? 'var(--accent-green)' : isAnom ? 'var(--accent-amber)' : 'var(--border-subtle)'}`,
                borderRadius: '2px',
                padding: '6px 8px',
                cursor: 'pointer',
                transition: 'all 0.15s ease'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '10px', fontWeight: 700, color: '#ffffff' }}>
                  {room.name.split(' ')[0].toUpperCase()}
                </span>
                <span style={{ 
                  fontSize: '9px', 
                  fontWeight: 700,
                  color: isAnom ? 'var(--accent-amber-bright)' : 'var(--accent-green-bright)' 
                }}>
                  {telem.temp.toFixed(1)}°C
                </span>
              </div>
              <div style={{ 
                fontSize: '9px', 
                color: isAnom ? 'var(--accent-amber)' : '#9ca3af',
                marginTop: '2px',
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis'
              }}>
                {telem.note}
              </div>
            </div>
          );
        })}
      </div>

      {/* Blueprint Sub-Strip Telemetry */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '10px',
        padding: '8px 12px',
        background: '#06070a',
        border: '1px solid var(--border-subtle)',
        borderRadius: '2px',
        fontSize: '11px',
        fontFamily: 'var(--font-mono)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <Thermometer size={13} color="var(--accent-green)" />
          <span style={{ color: 'var(--text-muted)' }}>AMB TEMP:</span>
          <span style={{ color: isColdAnomaly ? 'var(--accent-amber-bright)' : '#ffffff', fontWeight: 700 }}>
            {currentReading.temperatureC.toFixed(1)}°C
          </span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <Mic size={13} color="var(--accent-green)" />
          <span style={{ color: 'var(--text-muted)' }}>ACOUSTIC:</span>
          <span style={{ color: '#ffffff', fontWeight: 700 }}>
            {currentReading.acousticDb.toFixed(1)} dB{' '}
            <span style={{ color: isInfrasonic ? 'var(--accent-amber-bright)' : 'var(--text-muted)' }}>
              ({currentReading.acousticFreqHz.toFixed(1)}Hz)
            </span>
          </span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <Zap size={13} color="var(--accent-green)" />
          <span style={{ color: 'var(--text-muted)' }}>EMF FLUX:</span>
          <span style={{ color: isEmfAnomaly ? 'var(--accent-amber-bright)' : '#ffffff', fontWeight: 700 }}>
            {currentReading.emfFluxUtd.toFixed(2)} µT
          </span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          {currentReading.doorLatchState === 'SECURE' ? (
            <Lock size={13} color="var(--accent-green)" />
          ) : (
            <Unlock size={13} color="var(--accent-crimson-bright)" />
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
