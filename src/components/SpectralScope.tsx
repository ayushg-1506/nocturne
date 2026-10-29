import React, { useEffect, useRef, useState } from 'react';
import type { SensorReading } from '../types/telemetry';
import { AudioSynthesizer } from '../engine/audioSynthesizer';
import { Radio, Volume2, Activity } from 'lucide-react';

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
      ctx.fillStyle = 'rgba(2, 6, 2, 0.4)';
      ctx.fillRect(0, 0, w, h);

      // Green phosphor CRT grid
      ctx.strokeStyle = 'rgba(34, 197, 94, 0.08)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      for (let x = 0; x < w; x += 25) {
        ctx.moveTo(x, 0);
        ctx.lineTo(x, h);
      }
      for (let y = 0; y < h; y += 20) {
        ctx.moveTo(0, y);
        ctx.lineTo(w, y);
      }
      ctx.stroke();

      // Oscilloscope Waveform
      ctx.beginPath();
      ctx.lineWidth = 1.8;
      ctx.strokeStyle = isInfrasonic 
        ? '#fbbf24' 
        : isHighEmf 
        ? '#f87171' 
        : '#4ade80';

      ctx.shadowBlur = isInfrasonic || isHighEmf ? 10 : 5;
      ctx.shadowColor = ctx.strokeStyle;

      const amplitude = Math.min(35, (currentReading.acousticDb / 60) * 35);
      const freq = (currentReading.acousticFreqHz / 20) * 1.5;

      for (let x = 0; x < w; x++) {
        const rad = (x / w) * Math.PI * 4 * freq + phase;
        const noise = (Math.random() - 0.5) * (isHighEmf ? 8 : 1.5);
        const y = h / 2 + Math.sin(rad) * amplitude + noise;
        if (x === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.stroke();

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
      gap: '12px',
      height: '100%'
    }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Radio size={15} color="var(--accent-green-bright)" />
          <span className="terminal-title">
            SPECTRAL OSCILLOSCOPE &amp; INFRASOUND ANALYZER
          </span>
        </div>
        <span className={isInfrasonic ? "badge-amber" : "badge-green"} style={{ fontSize: '10px' }}>
          {isInfrasonic ? '[18.98Hz DETECTED]' : '[SPECTRAL SCAN ACTIVE]'}
        </span>
      </div>

      {/* CRT Canvas */}
      <div style={{
        position: 'relative',
        width: '100%',
        height: '150px',
        background: '#020502',
        borderRadius: '2px',
        border: '1px solid var(--border-subtle)',
        overflow: 'hidden'
      }}>
        <canvas
          ref={canvasRef}
          width={400}
          height={150}
          style={{ width: '100%', height: '100%', display: 'block' }}
        />

        {/* Oscilloscope Monospace HUD */}
        <div style={{
          position: 'absolute',
          top: '6px',
          left: '8px',
          right: '8px',
          display: 'flex',
          justifyContent: 'space-between',
          fontSize: '10px',
          fontFamily: 'var(--font-mono)',
          color: 'var(--text-muted)',
          pointerEvents: 'none'
        }}>
          <span>FREQ: {currentReading.acousticFreqHz.toFixed(2)} Hz</span>
          <span>SPL: {currentReading.acousticDb.toFixed(1)} dB</span>
          <span>EMF: {currentReading.emfFluxUtd.toFixed(2)} µT</span>
        </div>
      </div>

      {/* Infrasound & Spectral Controls */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px' }}>
          <div>
            <div style={{ fontSize: '11px', fontWeight: 700, color: 'var(--accent-amber-bright)' }}>
              18.98Hz Ocular Resonant Band
            </div>
            <div style={{ fontSize: '10px', color: 'var(--text-muted)' }}>
              Vibrates cornea (18.9Hz), inducing peripheral shadow illusions &amp; chills.
            </div>
          </div>

          <button
            onClick={handleToggleInfrasound}
            className={isInfrasoundPlaying ? "btn-amber" : "btn-secondary"}
            style={{ padding: '5px 12px', fontSize: '11px' }}
          >
            <Volume2 size={12} />
            <span>{isInfrasoundPlaying ? '[ MUTE 18.98Hz ]' : '[ TEST 18.98Hz ]'}</span>
          </button>
        </div>

        {/* Environmental Convergence Status */}
        <div style={{
          background: '#040804',
          borderRadius: '2px',
          border: '1px solid var(--border-subtle)',
          padding: '8px 10px',
          display: 'flex',
          flexDirection: 'column',
          gap: '4px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '10px', fontFamily: 'var(--font-mono)', color: 'var(--text-muted)' }}>
            <Activity size={12} color="var(--accent-green-bright)" />
            <span>STATISTICAL ANOMALY CLASSIFICATION:</span>
          </div>
          <span style={{ fontSize: '11px', fontWeight: 700, color: isInfrasonic || isHighEmf ? 'var(--accent-amber-bright)' : 'var(--accent-green-bright)', fontFamily: 'var(--font-mono)' }}>
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
