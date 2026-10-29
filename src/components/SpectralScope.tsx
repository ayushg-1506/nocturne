import React, { useEffect, useRef, useState } from 'react';
import type { SensorReading } from '../types/telemetry';
import { AudioSynthesizer } from '../engine/audioSynthesizer';
import { Radio, Volume2, Waves } from 'lucide-react';

interface SpectralScopeProps {
  currentReading: SensorReading;
  isAudioOn: boolean;
  onToggleAudio: () => void;
}

export const SpectralScope: React.FC<SpectralScopeProps> = ({
  currentReading,
  isAudioOn,
  onToggleAudio
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isInfrasoundPlaying, setIsInfrasoundPlaying] = useState(false);

  const isInfrasonic = currentReading.acousticFreqHz >= 18.0 && currentReading.acousticFreqHz <= 20.0;
  const isHighEmf = currentReading.emfFluxUtd > 3.0;

  const handleToggleInfrasound = () => {
    if (!isAudioOn) {
      onToggleAudio();
    }
    const nextState = !isInfrasoundPlaying;
    setIsInfrasoundPlaying(nextState);
    AudioSynthesizer.triggerInfrasound(nextState, currentReading.acousticFreqHz);
  };

  useEffect(() => {
    let animId: number;
    let phase = 0;

    const render = () => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      const w = canvas.width;
      const h = canvas.height;

      // Dark Terminal CRT Clear
      ctx.fillStyle = '#030507';
      ctx.fillRect(0, 0, w, h);

      // Subtle CRT grid
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.04)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      for (let x = 0; x < w; x += 30) {
        ctx.moveTo(x, 0);
        ctx.lineTo(x, h);
      }
      for (let y = 0; y < h; y += 24) {
        ctx.moveTo(0, y);
        ctx.lineTo(w, y);
      }
      ctx.stroke();

      // Zero-crossing center axis line
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.12)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(0, h / 2);
      ctx.lineTo(w, h / 2);
      ctx.stroke();

      // Oscilloscope Main Phosphor Waveform
      ctx.beginPath();
      ctx.lineWidth = 2.2;
      ctx.strokeStyle = isInfrasonic 
        ? '#fbbf24' 
        : isHighEmf 
        ? '#f87171' 
        : '#4ade80';

      ctx.shadowBlur = isInfrasonic || isHighEmf ? 14 : 8;
      ctx.shadowColor = ctx.strokeStyle;

      const amplitude = Math.min(55, (currentReading.acousticDb / 60) * 55);
      const freq = (currentReading.acousticFreqHz / 20) * 1.8;

      for (let x = 0; x < w; x++) {
        const rad = (x / w) * Math.PI * 6 * freq + phase;
        const noise = (Math.random() - 0.5) * (isHighEmf ? 6 : 1.2);
        const y = h / 2 + Math.sin(rad) * amplitude + noise;
        if (x === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.stroke();

      // Ghosting scanline sweep effect
      ctx.shadowBlur = 0;
      phase += 0.08;
      animId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animId);
    };
  }, [currentReading, isInfrasonic, isHighEmf]);

  return (
    <div style={{
      background: 'var(--bg-panel)',
      border: '1px solid var(--border-subtle)',
      borderRadius: '2px',
      padding: '16px',
      display: 'flex',
      flexDirection: 'column',
      gap: '12px'
    }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Radio size={16} color="var(--accent-green-bright)" />
          <span className="terminal-title">
            SPECTRAL OSCILLOSCOPE &amp; INFRASOUND ANALYZER
          </span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span className={isInfrasonic ? "badge-amber" : "badge-green"} style={{ fontSize: '10px' }}>
            {isInfrasonic ? '[18.98Hz OCULAR LOCK DETECTED]' : '[SPECTRAL SCAN NOMINAL]'}
          </span>
          <span style={{ fontSize: '11px', color: '#9ca3af', fontFamily: 'var(--font-mono)' }}>
            SWEEP: 0.1Hz – 120Hz
          </span>
        </div>
      </div>

      {/* CRT Canvas: Full Width, 240px tall for commanding visual presence */}
      <div style={{
        position: 'relative',
        width: '100%',
        height: '240px',
        background: '#030507',
        borderRadius: '2px',
        border: '1px solid var(--border-subtle)',
        overflow: 'hidden'
      }}>
        <canvas
          ref={canvasRef}
          width={900}
          height={240}
          style={{ width: '100%', height: '100%', display: 'block' }}
        />

        {/* Oscilloscope Monospace HUD */}
        <div style={{
          position: 'absolute',
          top: '8px',
          left: '12px',
          right: '12px',
          display: 'flex',
          justifyContent: 'space-between',
          fontSize: '11px',
          fontFamily: 'var(--font-mono)',
          color: '#ffffff',
          fontWeight: 600,
          pointerEvents: 'none'
        }}>
          <span style={{ background: 'rgba(0, 0, 0, 0.7)', padding: '2px 6px', borderRadius: '2px' }}>
            FREQ: <strong style={{ color: isInfrasonic ? 'var(--accent-amber-bright)' : 'var(--accent-green-bright)' }}>{currentReading.acousticFreqHz.toFixed(2)} Hz</strong>
          </span>
          <span style={{ background: 'rgba(0, 0, 0, 0.7)', padding: '2px 6px', borderRadius: '2px' }}>
            SPL: <strong style={{ color: '#ffffff' }}>{currentReading.acousticDb.toFixed(1)} dB</strong>
          </span>
          <span style={{ background: 'rgba(0, 0, 0, 0.7)', padding: '2px 6px', borderRadius: '2px' }}>
            EMF: <strong style={{ color: isHighEmf ? 'var(--accent-crimson-bright)' : '#ffffff' }}>{currentReading.emfFluxUtd.toFixed(2)} µT</strong>
          </span>
        </div>
      </div>

      {/* Infrasound & Spectral Controls */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '10px',
        background: '#040507',
        border: '1px solid var(--border-subtle)',
        borderRadius: '2px',
        padding: '10px 14px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Waves size={16} color="var(--accent-amber-bright)" />
          <div>
            <div style={{ fontSize: '11px', fontWeight: 700, color: '#ffffff' }}>
              18.98Hz Infrasound Laboratory Synthesizer
            </div>
            <div style={{ fontSize: '10px', color: '#9ca3af' }}>
              Generates sub-audible 18.98Hz sine tone via Web Audio API to reproduce corneal vibration experiment.
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <button
            onClick={handleToggleInfrasound}
            className={isInfrasoundPlaying ? "btn-amber" : "btn-secondary"}
            style={{ padding: '6px 14px', fontSize: '11px' }}
          >
            <Volume2 size={13} />
            <span>{isInfrasoundPlaying ? '[ MUTE 18.98Hz TONE ]' : '[ EMIT 18.98Hz TONE ]'}</span>
          </button>

          <span className="badge-green" style={{ fontSize: '10px', padding: '4px 8px' }}>
            {isInfrasonic && isHighEmf 
              ? 'CLASS: MULTI_SPECTRAL_CONVERGENCE (P > 0.98)' 
              : isInfrasonic 
              ? 'CLASS: INFRASONIC_ACOUSTIC_RESONANCE (P = 0.965)'
              : isHighEmf 
              ? 'CLASS: PHANTOM_EMF_SURGE (P = 0.941)'
              : 'CLASS: NOMINAL_BACKGROUND_NOISE (P = 0.04)'}
          </span>
        </div>
      </div>
    </div>
  );
};
