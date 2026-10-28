import React, { useEffect, useRef, useState } from 'react';
import type { SensorReading } from '../types/telemetry';
import { AudioSynthesizer } from '../engine/audioSynthesizer';
import { Radio, Volume2, Sparkles } from 'lucide-react';

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

  // Toggle localized infrasound test tone
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

      // Dark CRT clear
      ctx.fillStyle = 'rgba(5, 7, 10, 0.35)';
      ctx.fillRect(0, 0, w, h);

      // Grid lines
      ctx.strokeStyle = 'rgba(56, 189, 248, 0.08)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      for (let x = 0; x < w; x += 30) {
        ctx.moveTo(x, 0);
        ctx.lineTo(x, h);
      }
      for (let y = 0; y < h; y += 20) {
        ctx.moveTo(0, y);
        ctx.lineTo(w, y);
      }
      ctx.stroke();

      // Oscilloscope Waveform based on current telemetry
      ctx.beginPath();
      ctx.lineWidth = 2;
      ctx.strokeStyle = isInfrasonic 
        ? '#a855f7' 
        : isHighEmf 
        ? '#f59e0b' 
        : '#38bdf8';

      ctx.shadowBlur = isInfrasonic || isHighEmf ? 12 : 6;
      ctx.shadowColor = ctx.strokeStyle;

      const amplitude = Math.min(35, (currentReading.acousticDb / 60) * 35);
      const freq = (currentReading.acousticFreqHz / 20) * 1.5;

      for (let x = 0; x < w; x++) {
        const rad = (x / w) * Math.PI * 4 * freq + phase;
        // add slight noise for realism
        const noise = (Math.random() - 0.5) * (isHighEmf ? 10 : 2);
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
    <div className="glass-panel" style={{
      padding: '16px',
      display: 'flex',
      flexDirection: 'column',
      gap: '12px',
      height: '100%'
    }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Radio size={16} color="var(--accent-violet)" />
          <h2 style={{ fontSize: '13px', fontWeight: 700, fontFamily: 'var(--font-mono)', letterSpacing: '0.04em' }}>
            SPECTRAL OSCILLOSCOPE &amp; EVP DECODER
          </h2>
        </div>
        <span className="badge badge-violet" style={{ fontSize: '10px' }}>
          {isInfrasonic ? '18.98Hz DETECTED' : 'SPECTRAL SCAN'}
        </span>
      </div>

      {/* CRT Canvas */}
      <div className="scanlines" style={{
        position: 'relative',
        width: '100%',
        height: '140px',
        background: '#040608',
        borderRadius: '6px',
        border: '1px solid var(--border-subtle)',
        overflow: 'hidden'
      }}>
        <canvas
          ref={canvasRef}
          width={380}
          height={140}
          style={{ width: '100%', height: '100%', display: 'block' }}
        />

        {/* Oscilloscope Monospace HUD */}
        <div style={{
          position: 'absolute',
          top: '8px',
          left: '10px',
          right: '10px',
          display: 'flex',
          justifyContent: 'space-between',
          fontSize: '10px',
          fontFamily: 'var(--font-mono)',
          color: 'var(--text-secondary)',
          pointerEvents: 'none'
        }}>
          <span>FREQ: {currentReading.acousticFreqHz.toFixed(2)} Hz</span>
          <span>SPL: {currentReading.acousticDb.toFixed(1)} dB</span>
          <span>EMF: {currentReading.emfFluxUtd.toFixed(2)} µT</span>
        </div>
      </div>

      {/* Infrasound & Spectral Controls */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <span style={{ fontSize: '12px', fontWeight: 600 }}>
              The 18.98Hz "Ghost Frequency"
            </span>
            <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
              Resonates human eye globe (18.9Hz), inducing peripheral shadow illusions &amp; dread.
            </span>
          </div>

          <button
            onClick={handleToggleInfrasound}
            className={`btn-secondary ${isInfrasoundPlaying ? 'badge-violet' : ''}`}
            style={{ padding: '6px 12px', fontSize: '11px' }}
          >
            <Volume2 size={13} color="var(--accent-violet)" />
            <span>{isInfrasoundPlaying ? 'MUTE 18.98Hz' : 'TEST RESONANCE'}</span>
          </button>
        </div>

        {/* Environmental Convergence Status */}
        <div style={{
          background: 'rgba(15, 23, 42, 0.6)',
          borderRadius: '6px',
          border: '1px solid var(--border-subtle)',
          padding: '10px 12px',
          display: 'flex',
          flexDirection: 'column',
          gap: '4px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11px', fontFamily: 'var(--font-mono)', color: 'var(--text-secondary)' }}>
            <Sparkles size={12} color="var(--accent-cyan)" />
            <span>TABPFN ANOMALY CLASSIFICATION:</span>
          </div>
          <span style={{ fontSize: '12px', fontWeight: 700, color: isInfrasonic || isHighEmf ? 'var(--accent-amber)' : 'var(--accent-emerald)', fontFamily: 'var(--font-mono)' }}>
            {isInfrasonic && isHighEmf 
              ? 'CLASS: SPECTRAL_CONVERGENCE (P > 0.98)' 
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
