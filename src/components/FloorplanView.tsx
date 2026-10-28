import React from 'react';
import type { ForensicCase, SensorReading } from '../types/telemetry';
import { Thermometer, Zap, Mic, Lock, Unlock } from 'lucide-react';

interface FloorplanViewProps {
  forensicCase: ForensicCase;
  currentReading: SensorReading;
  selectedRoomId: string | null;
  onSelectRoom: (roomId: string) => void;
}

export const FloorplanView: React.FC<FloorplanViewProps> = ({
  forensicCase,
  currentReading,
  selectedRoomId,
  onSelectRoom
}) => {
  const rooms = forensicCase.floorplan.rooms;

  // Determine room thermal status based on current reading
  const isColdAnomaly = currentReading.temperatureC < 16.0;
  const isEmfAnomaly = currentReading.emfFluxUtd > 3.0;

  return (
    <div className="glass-panel" style={{
      padding: '16px',
      display: 'flex',
      flexDirection: 'column',
      gap: '12px',
      height: '100%'
    }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <h2 style={{ fontSize: '14px', fontWeight: 700, fontFamily: 'var(--font-mono)', letterSpacing: '0.05em' }}>
              ARCHITECTURAL TELEMETRY MATRIX
            </h2>
            <span className="badge badge-cyan" style={{ fontSize: '10px' }}>
              LIVE SPATIAL GRID
            </span>
          </div>
          <p style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
            {forensicCase.structureType} — {forensicCase.location}
          </p>
        </div>

        {/* Live Legend */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', fontSize: '11px', fontFamily: 'var(--font-mono)' }}>
          <span style={{ display: 'flex', alignItems: 'center', gap: '4px', color: 'var(--accent-cyan)' }}>
            <span className="status-ping cyan" /> NOMINAL
          </span>
          <span style={{ display: 'flex', alignItems: 'center', gap: '4px', color: 'var(--accent-amber)' }}>
            <span className="status-ping amber" /> THERMAL DRIFT
          </span>
          <span style={{ display: 'flex', alignItems: 'center', gap: '4px', color: 'var(--accent-crimson)' }}>
            <span className="status-ping crimson" /> BREACH / HOT ZONE
          </span>
        </div>
      </div>

      {/* SVG Blueprint Canvas */}
      <div style={{
        position: 'relative',
        width: '100%',
        minHeight: '340px',
        background: 'rgba(5, 8, 12, 0.85)',
        border: '1px solid var(--border-subtle)',
        borderRadius: '8px',
        overflow: 'hidden',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        {/* Subtle grid pattern background */}
        <div style={{
          position: 'absolute',
          inset: 0,
          backgroundImage: 'radial-gradient(circle, rgba(56, 189, 248, 0.08) 1px, transparent 1px)',
          backgroundSize: '20px 20px',
          pointerEvents: 'none'
        }} />

        <svg
          viewBox="0 0 540 400"
          style={{ width: '100%', height: '100%', maxHeight: '380px' }}
        >
          {/* Defs for gradients & patterns */}
          <defs>
            <linearGradient id="coldDropGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="rgba(56, 189, 248, 0.35)" />
              <stop offset="100%" stopColor="rgba(168, 85, 247, 0.25)" />
            </linearGradient>
            <linearGradient id="nominalGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="rgba(15, 23, 42, 0.7)" />
              <stop offset="100%" stopColor="rgba(10, 15, 25, 0.8)" />
            </linearGradient>
            <linearGradient id="alertGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="rgba(244, 63, 94, 0.35)" />
              <stop offset="100%" stopColor="rgba(245, 158, 11, 0.25)" />
            </linearGradient>
          </defs>

          {/* Render Architectural Rooms */}
          {rooms.map((room) => {
            const isSelected = selectedRoomId === room.id;
            const isMotionHere = currentReading.pirMotion && (currentReading.pirRoom === room.name || currentReading.pirRoom?.includes(room.id));
            const isHotZone = room.name.toLowerCase().includes('hot zone') || room.name.toLowerCase().includes('nursery') || room.name.toLowerCase().includes('basement');

            let fillStyle = 'url(#nominalGrad)';
            let strokeColor = 'rgba(255, 255, 255, 0.12)';

            if (isColdAnomaly && isHotZone) {
              fillStyle = 'url(#coldDropGrad)';
              strokeColor = 'var(--accent-cyan)';
            } else if (isMotionHere) {
              fillStyle = 'url(#alertGrad)';
              strokeColor = 'var(--accent-crimson)';
            }

            if (isSelected) {
              strokeColor = 'var(--accent-cyan)';
            }

            return (
              <g
                key={room.id}
                onClick={() => onSelectRoom(room.id)}
                style={{ cursor: 'pointer', transition: 'all 0.3s ease' }}
              >
                {/* Room Boundary Rect */}
                <rect
                  x={room.x}
                  y={room.y}
                  width={room.width}
                  height={room.height}
                  rx="6"
                  fill={fillStyle}
                  stroke={strokeColor}
                  strokeWidth={isSelected ? '2' : '1'}
                  strokeDasharray={isSelected ? '4 2' : 'none'}
                />

                {/* Room Name Label */}
                <text
                  x={room.x + 8}
                  y={room.y + 20}
                  fill={isHotZone && isColdAnomaly ? 'var(--accent-cyan)' : 'var(--text-secondary)'}
                  fontSize={room.width < 100 ? "9" : "11"}
                  fontWeight="600"
                  fontFamily="var(--font-mono)"
                  letterSpacing="0.04em"
                >
                  {(room.width < 100 ? (room.name.includes(' ') ? room.name.split(' ')[1] : room.name) : room.name).toUpperCase()}
                </text>

                {/* Sensor Indicators within room */}
                <g transform={`translate(${room.x + 8}, ${room.y + 34})`}>
                  {room.sensorIds.map((sid, idx) => (
                    <text
                      key={sid}
                      x={room.width < 100 ? 0 : idx * 56}
                      y={room.width < 100 ? idx * 14 : 0}
                      fill="var(--text-dim)"
                      fontSize="8"
                      fontFamily="var(--font-mono)"
                    >
                      [{sid}]
                    </text>
                  ))}
                </g>

                {/* Visual Cold Spot / Spectral Plume Ring */}
                {isColdAnomaly && isHotZone && (
                  <circle
                    cx={room.x + room.width / 2}
                    cy={room.y + room.height / 2}
                    r={Math.min(room.width, room.height) * 0.35}
                    fill="rgba(56, 189, 248, 0.15)"
                    stroke="var(--accent-cyan)"
                    strokeWidth="1.5"
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
                      values="0.4;0.8;0.4"
                      dur="3s"
                      repeatCount="indefinite"
                    />
                  </circle>
                )}

                {/* Motion Ripple Animation when PIR active */}
                {isMotionHere && (
                  <circle
                    cx={room.x + room.width / 2}
                    cy={room.y + room.height / 2}
                    r="15"
                    fill="rgba(244, 63, 94, 0.2)"
                    stroke="var(--accent-crimson)"
                    strokeWidth="2"
                  >
                    <animate attributeName="r" values="10;45" dur="1.2s" repeatCount="indefinite" />
                    <animate attributeName="opacity" values="1;0" dur="1.2s" repeatCount="indefinite" />
                  </circle>
                )}
              </g>
            );
          })}

          {/* Door Latch Sensor Icon between rooms */}
          <g transform="translate(310, 110)">
            <circle
              cx="0"
              cy="0"
              r="12"
              fill={currentReading.doorLatchState === 'SECURE' ? 'rgba(16, 185, 129, 0.2)' : 'rgba(244, 63, 94, 0.3)'}
              stroke={currentReading.doorLatchState === 'SECURE' ? 'var(--accent-emerald)' : 'var(--accent-crimson)'}
              strokeWidth="1.5"
            />
            <text
              x="16"
              y="4"
              fill={currentReading.doorLatchState === 'SECURE' ? 'var(--accent-emerald)' : 'var(--accent-crimson)'}
              fontSize="9"
              fontFamily="var(--font-mono)"
              fontWeight="700"
            >
              LATCH: {currentReading.doorLatchState}
            </text>
          </g>
        </svg>

        {/* Ambient telemetry HUD Overlay */}
        <div style={{
          position: 'absolute',
          bottom: '12px',
          left: '12px',
          right: '12px',
          display: 'flex',
          justifyContent: 'space-between',
          background: 'rgba(10, 15, 22, 0.85)',
          backdropFilter: 'blur(8px)',
          padding: '8px 14px',
          borderRadius: '6px',
          border: '1px solid var(--border-subtle)',
          fontSize: '11px',
          fontFamily: 'var(--font-mono)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Thermometer size={14} color={isColdAnomaly ? 'var(--accent-cyan)' : 'var(--text-secondary)'} />
            <span style={{ color: 'var(--text-muted)' }}>AMB TEMP:</span>
            <span style={{ fontWeight: 700, color: isColdAnomaly ? 'var(--accent-cyan)' : 'var(--text-primary)' }}>
              {currentReading.temperatureC.toFixed(1)}°C
            </span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Mic size={14} color={currentReading.acousticDb > 35 ? 'var(--accent-crimson)' : 'var(--text-secondary)'} />
            <span style={{ color: 'var(--text-muted)' }}>ACOUSTIC:</span>
            <span style={{ fontWeight: 700, color: currentReading.acousticDb > 35 ? 'var(--accent-crimson)' : 'var(--text-primary)' }}>
              {currentReading.acousticDb.toFixed(1)} dB ({currentReading.acousticFreqHz.toFixed(1)}Hz)
            </span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Zap size={14} color={isEmfAnomaly ? 'var(--accent-amber)' : 'var(--text-secondary)'} />
            <span style={{ color: 'var(--text-muted)' }}>EMF FLUX:</span>
            <span style={{ fontWeight: 700, color: isEmfAnomaly ? 'var(--accent-amber)' : 'var(--text-primary)' }}>
              {currentReading.emfFluxUtd.toFixed(2)} µT
            </span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            {currentReading.doorLatchState === 'SECURE' ? (
              <Lock size={14} color="var(--accent-emerald)" />
            ) : (
              <Unlock size={14} color="var(--accent-crimson)" />
            )}
            <span style={{ color: 'var(--text-muted)' }}>PORTAL:</span>
            <span style={{ fontWeight: 700, color: currentReading.doorLatchState === 'SECURE' ? 'var(--accent-emerald)' : 'var(--accent-crimson)' }}>
              {currentReading.doorLatchState}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
