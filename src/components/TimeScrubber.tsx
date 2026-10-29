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
    <div style={{
      margin: '0 16px 10px 16px',
      padding: '10px 16px',
      background: 'var(--bg-panel)',
      border: '1px solid var(--border-subtle)',
      borderRadius: '2px',
      display: 'flex',
      flexDirection: 'column',
      gap: '8px'
    }}>
      {/* Top Readout Row */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '10px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          {/* Digital Time Readout */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Clock size={14} color="var(--accent-green-bright)" />
            <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
              LOCAL TIME:
            </span>
            <span style={{
              fontSize: '18px',
              fontWeight: 800,
              fontFamily: 'var(--font-mono)',
              letterSpacing: '0.08em',
              color: activeAnomaly ? 'var(--accent-amber-bright)' : 'var(--accent-green-bright)',
              textShadow: activeAnomaly ? '0 0 10px rgba(245, 158, 11, 0.4)' : '0 0 8px rgba(34, 197, 94, 0.3)'
            }}>
              {currentTimestamp}
            </span>
          </div>

          {/* Active Anomaly Banner */}
          {activeAnomaly && (
            <div className="badge-amber" style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '3px 8px' }}>
              <AlertTriangle size={12} />
              <span>ACTIVE ANOMALY: {activeAnomaly.type.replace(/_/g, ' ')} [{activeAnomaly.room}]</span>
            </div>
          )}
        </div>

        {/* Playback Controls & Speed */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <button
            onClick={() => onJumpAnomaly('prev')}
            className="btn-secondary"
            style={{ padding: '4px 8px' }}
            title="Jump to Previous Anomaly"
          >
            <SkipBack size={12} />
          </button>

          <button
            onClick={onTogglePlay}
            className={isPlaying ? "btn-amber" : "btn-primary"}
            style={{ padding: '4px 14px' }}
          >
            {isPlaying ? <Pause size={13} /> : <Play size={13} />}
            <span>{isPlaying ? '[ PAUSE ]' : '[ PLAY ]'}</span>
          </button>

          <button
            onClick={() => onJumpAnomaly('next')}
            className="btn-secondary"
            style={{ padding: '4px 8px' }}
            title="Jump to Next Anomaly"
          >
            <SkipForward size={12} />
          </button>

          {/* Speed Selectors */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '3px', marginLeft: '6px' }}>
            {[1, 4, 16].map((speed) => (
              <button
                key={speed}
                onClick={() => onChangeSpeed(speed)}
                style={{
                  background: playbackSpeed === speed ? 'rgba(34, 197, 94, 0.2)' : 'transparent',
                  color: playbackSpeed === speed ? 'var(--accent-green-bright)' : 'var(--text-muted)',
                  border: `1px solid ${playbackSpeed === speed ? 'var(--accent-green)' : 'var(--border-subtle)'}`,
                  borderRadius: '2px',
                  padding: '3px 6px',
                  fontSize: '10px',
                  fontFamily: 'var(--font-mono)',
                  cursor: 'pointer'
                }}
              >
                [{speed}x]
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Scrub Bar with Marker Overlay */}
      <div style={{ position: 'relative', width: '100%', height: '20px', display: 'flex', alignItems: 'center' }}>
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
                top: '2px',
                width: '4px',
                height: '16px',
                background: a.severity === 'CRITICAL' ? 'var(--accent-crimson-bright)' : 'var(--accent-amber-bright)',
                boxShadow: `0 0 6px ${a.severity === 'CRITICAL' ? 'var(--accent-crimson)' : 'var(--accent-amber)'}`,
                borderRadius: '1px',
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
            accentColor: 'var(--accent-green)',
            cursor: 'pointer',
            height: '4px',
            background: 'var(--border-subtle)',
            borderRadius: '1px',
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
        color: 'var(--text-muted)',
        fontFamily: 'var(--font-mono)',
        marginTop: '-2px'
      }}>
        <span>22:00</span>
        <span>23:00</span>
        <span>00:00 [MIDNIGHT]</span>
        <span>01:00</span>
        <span>02:00</span>
        <span style={{ color: 'var(--accent-amber-bright)', fontWeight: 700 }}>03:00 [ANOMALY WINDOW]</span>
        <span>04:00</span>
        <span>05:00 [DAWN]</span>
      </div>
    </div>
  );
};
