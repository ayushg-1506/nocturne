import React from 'react';
import { Play, Pause, SkipBack, SkipForward, Clock, AlertTriangle } from 'lucide-react';
import type { DetectedAnomaly } from '../types/telemetry';

interface TimeScrubberProps {
  currentMinute: number;         // 0 to 420 (minutes from 22:00)
  totalMinutes: number;         // 420 (7 hours)
  isPlaying: boolean;
  playbackSpeed: number;        // 1, 4, 16
  currentTimestamp: string;     // e.g. "03:14:00"
  anomalies: DetectedAnomaly[];
  onSeek: (minute: number) => void;
  onTogglePlay: () => void;
  onChangeSpeed: (speed: number) => void;
  onJumpAnomaly: (direction: 'next' | 'prev') => void;
}

export const TimeScrubber: React.FC<TimeScrubberProps> = ({
  currentMinute,
  totalMinutes,
  isPlaying,
  playbackSpeed,
  currentTimestamp,
  anomalies,
  onSeek,
  onTogglePlay,
  onChangeSpeed,
  onJumpAnomaly
}) => {
  const activeAnomaly = anomalies.find(
    a => Math.abs(a.epochMinutes - currentMinute) <= 3
  );

  return (
    <div className="glass-panel" style={{
      margin: '0 16px 12px 16px',
      padding: '12px 20px',
      display: 'flex',
      flexDirection: 'column',
      gap: '8px'
    }}>
      {/* Top Readout Row */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '10px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          {/* Glowing Digital Time */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Clock size={16} color="var(--accent-cyan)" />
            <span style={{ fontSize: '11px', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
              LOCAL TIME:
            </span>
            <span style={{
              fontSize: '20px',
              fontWeight: 800,
              fontFamily: 'var(--font-mono)',
              letterSpacing: '0.06em',
              color: activeAnomaly ? 'var(--accent-crimson)' : 'var(--accent-cyan)',
              textShadow: activeAnomaly ? '0 0 12px rgba(244, 63, 94, 0.6)' : '0 0 10px rgba(56, 189, 248, 0.4)',
              transition: 'color 0.2s, text-shadow 0.2s'
            }}>
              {currentTimestamp}
            </span>
          </div>

          {/* Active Anomaly Banner */}
          {activeAnomaly && (
            <div className="badge badge-crimson" style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '4px 10px' }}>
              <AlertTriangle size={13} />
              <span>HOT ZONE: {activeAnomaly.type.replace(/_/g, ' ')} ({activeAnomaly.room})</span>
            </div>
          )}
        </div>

        {/* Playback Controls & Speed */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <button
            onClick={() => onJumpAnomaly('prev')}
            className="btn-secondary"
            style={{ padding: '6px 10px' }}
            title="Jump to Previous Anomaly"
          >
            <SkipBack size={14} />
          </button>

          <button
            onClick={onTogglePlay}
            className="btn-primary"
            style={{ padding: '6px 16px', borderRadius: '20px' }}
          >
            {isPlaying ? <Pause size={15} /> : <Play size={15} />}
            <span style={{ fontSize: '12px', fontWeight: 700 }}>
              {isPlaying ? 'PAUSE' : 'PLAY'}
            </span>
          </button>

          <button
            onClick={() => onJumpAnomaly('next')}
            className="btn-secondary"
            style={{ padding: '6px 10px' }}
            title="Jump to Next Anomaly"
          >
            <SkipForward size={14} />
          </button>

          {/* Speed Selectors */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginLeft: '6px' }}>
            {[1, 4, 16].map((speed) => (
              <button
                key={speed}
                onClick={() => onChangeSpeed(speed)}
                style={{
                  background: playbackSpeed === speed ? 'rgba(56, 189, 248, 0.2)' : 'rgba(255, 255, 255, 0.04)',
                  color: playbackSpeed === speed ? 'var(--accent-cyan)' : 'var(--text-muted)',
                  border: `1px solid ${playbackSpeed === speed ? 'rgba(56, 189, 248, 0.4)' : 'var(--border-subtle)'}`,
                  borderRadius: '4px',
                  padding: '3px 7px',
                  fontSize: '11px',
                  fontFamily: 'var(--font-mono)',
                  cursor: 'pointer'
                }}
              >
                {speed}x
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Scrub Bar with Marker Overlay */}
      <div style={{ position: 'relative', width: '100%', height: '24px', display: 'flex', alignItems: 'center' }}>
        {/* Anomaly Flag Markers */}
        {anomalies.map((a) => {
          const leftPct = (a.epochMinutes / totalMinutes) * 100;
          return (
            <div
              key={a.id}
              onClick={() => onSeek(a.epochMinutes)}
              title={`${a.timestamp}: ${a.summary}`}
              style={{
                position: 'absolute',
                left: `${leftPct}%`,
                top: '0px',
                width: '6px',
                height: '100%',
                background: a.severity === 'CRITICAL' ? 'var(--accent-crimson)' : 'var(--accent-amber)',
                boxShadow: `0 0 8px ${a.severity === 'CRITICAL' ? 'var(--accent-crimson)' : 'var(--accent-amber)'}`,
                borderRadius: '2px',
                cursor: 'pointer',
                zIndex: 2,
                transform: 'translateX(-50%)'
              }}
            />
          );
        })}

        {/* Range Input Slider */}
        <input
          type="range"
          min="0"
          max={totalMinutes}
          value={currentMinute}
          onChange={(e) => onSeek(parseInt(e.target.value, 10))}
          style={{
            width: '100%',
            accentColor: 'var(--accent-cyan)',
            cursor: 'pointer',
            height: '6px',
            background: 'rgba(255, 255, 255, 0.1)',
            borderRadius: '4px',
            position: 'relative',
            zIndex: 3
          }}
        />
      </div>

      {/* Hour Grid Labels */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        fontSize: '10px',
        color: 'var(--text-dim)',
        fontFamily: 'var(--font-mono)',
        marginTop: '-2px'
      }}>
        <span>22:00 (10 PM)</span>
        <span>23:00</span>
        <span>00:00 (MIDNIGHT)</span>
        <span>01:00</span>
        <span>02:00</span>
        <span style={{ color: 'var(--accent-amber)', fontWeight: 600 }}>03:00 (WITCHING HOUR)</span>
        <span>04:00</span>
        <span>05:00 (DAWN)</span>
      </div>
    </div>
  );
};
