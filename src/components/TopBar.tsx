import React from 'react';
import type { ForensicCase, DetectedAnomaly } from '../types/telemetry';
import { 
  Play, 
  Pause, 
  SkipBack, 
  SkipForward, 
  Volume2, 
  VolumeX, 
  Clock,
  AlertTriangle
} from 'lucide-react';

interface TopBarProps {
  sectionTitle: string;
  cases: ForensicCase[];
  selectedCaseId: string;
  onSelectCase: (caseId: string) => void;
  currentMinute: number;
  totalMinutes: number;
  currentTimestamp: string;
  isPlaying: boolean;
  playbackSpeed: number;
  anomalies: DetectedAnomaly[];
  onSeek: (minute: number) => void;
  onTogglePlay: () => void;
  onChangeSpeed: (speed: number) => void;
  onJumpAnomaly: (direction: 'next' | 'prev') => void;
  isAudioOn: boolean;
  onToggleAudio: () => void;
  activeAnomalyCount: number;
}

export const TopBar: React.FC<TopBarProps> = ({
  sectionTitle,
  cases,
  selectedCaseId,
  onSelectCase,
  currentMinute,
  totalMinutes,
  currentTimestamp,
  isPlaying,
  playbackSpeed,
  anomalies,
  onSeek,
  onTogglePlay,
  onChangeSpeed,
  onJumpAnomaly,
  isAudioOn,
  onToggleAudio,
  activeAnomalyCount
}) => {
  const activeAnomaly = anomalies.find(
    a => Math.abs(a.epochMinutes - currentMinute) <= 3
  );

  return (
    <header style={{
      height: '52px',
      minHeight: '52px',
      background: '#000000',
      borderBottom: '1px solid var(--border-subtle)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '0 16px',
      gap: '14px',
      userSelect: 'none'
    }}>
      {/* Left: View Section Title */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', minWidth: '220px' }}>
        <span className="terminal-title" style={{ fontSize: '12px' }}>
          {sectionTitle}
        </span>
      </div>

      {/* Center: Compact Chronological Scrubber & Playback */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '10px',
        background: '#040804',
        border: '1px solid var(--border-subtle)',
        borderRadius: '2px',
        padding: '4px 10px',
        flex: 1,
        maxWidth: '540px'
      }}>
        {/* Digital Time Readout */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <Clock size={12} color="var(--accent-green-bright)" />
          <span style={{
            fontSize: '13px',
            fontWeight: 800,
            fontFamily: 'var(--font-mono)',
            color: activeAnomaly ? 'var(--accent-amber-bright)' : 'var(--accent-green-bright)',
            letterSpacing: '0.05em'
          }}>
            {currentTimestamp}
          </span>
        </div>

        {/* Compact Scrubber Bar with Anomaly Markers */}
        <div style={{ position: 'relative', flex: 1, height: '14px', display: 'flex', alignItems: 'center' }}>
          {anomalies.map(a => {
            const leftPct = (a.epochMinutes / totalMinutes) * 100;
            return (
              <div
                key={a.id}
                onClick={() => onSeek(a.epochMinutes)}
                title={`${a.timestamp}: ${a.summary}`}
                style={{
                  position: 'absolute',
                  left: `${leftPct}%`,
                  top: '1px',
                  width: '3px',
                  height: '12px',
                  background: a.severity === 'CRITICAL' ? 'var(--accent-crimson-bright)' : 'var(--accent-amber-bright)',
                  cursor: 'pointer',
                  zIndex: 2,
                  transform: 'translateX(-50%)'
                }}
              />
            );
          })}

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
              height: '3px',
              background: 'var(--border-subtle)',
              position: 'relative',
              zIndex: 3
            }}
          />
        </div>

        {/* Playback Buttons */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '3px' }}>
          <button
            onClick={() => onJumpAnomaly('prev')}
            className="btn-secondary"
            style={{ padding: '2px 5px' }}
            title="Jump to Previous Incident"
          >
            <SkipBack size={10} />
          </button>

          <button
            onClick={onTogglePlay}
            className={isPlaying ? "btn-amber" : "btn-primary"}
            style={{ padding: '2px 8px', fontSize: '10px' }}
          >
            {isPlaying ? <Pause size={10} /> : <Play size={10} />}
            <span>{isPlaying ? 'PAUSE' : 'PLAY'}</span>
          </button>

          <button
            onClick={() => onJumpAnomaly('next')}
            className="btn-secondary"
            style={{ padding: '2px 5px' }}
            title="Jump to Next Incident"
          >
            <SkipForward size={10} />
          </button>

          {/* Speed Indicator */}
          <button
            onClick={() => {
              const speeds = [1, 4, 16];
              const nextIdx = (speeds.indexOf(playbackSpeed) + 1) % speeds.length;
              onChangeSpeed(speeds[nextIdx]);
            }}
            className="btn-secondary"
            style={{ padding: '2px 6px', fontSize: '10px' }}
            title="Cycle Playback Speed"
          >
            [{playbackSpeed}x]
          </button>
        </div>
      </div>

      {/* Right Controls: Case Selector & Audio */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        {/* Case Dropdown */}
        <select
          value={selectedCaseId}
          onChange={(e) => onSelectCase(e.target.value)}
          style={{
            background: '#040804',
            borderColor: 'var(--border-subtle)',
            color: 'var(--text-primary)',
            fontSize: '11px',
            maxWidth: '220px',
            padding: '4px 8px'
          }}
        >
          {cases.map((c) => (
            <option key={c.id} value={c.id}>
              [{c.caseNumber}] {c.title}
            </option>
          ))}
        </select>

        {/* Audio Toggle */}
        <button
          onClick={onToggleAudio}
          className={isAudioOn ? "btn-primary" : "btn-secondary"}
          style={{ padding: '4px 8px', fontSize: '10px' }}
          title="Toggle Procedural Web Audio"
        >
          {isAudioOn ? <Volume2 size={12} /> : <VolumeX size={12} />}
          <span>{isAudioOn ? 'AUDIO: ON' : 'AUDIO: OFF'}</span>
        </button>

        {/* Active Anomalies Count */}
        {activeAnomalyCount > 0 && (
          <div className="badge-crimson" style={{ padding: '3px 6px', fontSize: '10px' }}>
            <AlertTriangle size={11} />
            <span>{activeAnomalyCount} ANOMALIES</span>
          </div>
        )}
      </div>
    </header>
  );
};
