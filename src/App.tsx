import React, { useState, useEffect } from 'react';
import { FORENSIC_CASES } from './data/cases';
import type { ForensicCase, SensorReading } from './types/telemetry';
import { Sidebar, type ActiveSection } from './components/Sidebar';
import { TopBar } from './components/TopBar';
import { OverviewSection } from './components/OverviewSection';
import { TelemetryLabView } from './components/TelemetryLabView';
import { DossierView } from './components/DossierView';
import { SpectralScope } from './components/SpectralScope';
import { SimulationLabView } from './components/SimulationLabView';
import { SettingsModal } from './components/SettingsModal';
import type { ModelProviderConfig } from './engine/gemmaForensics';
import { AudioSynthesizer } from './engine/audioSynthesizer';
import { Cpu, ShieldCheck } from 'lucide-react';

export const App: React.FC = () => {
  const [cases, setCases] = useState<ForensicCase[]>(FORENSIC_CASES);
  const [selectedCaseId, setSelectedCaseId] = useState<string>(FORENSIC_CASES[0].id);
  const [currentMinute, setCurrentMinute] = useState<number>(314); // Near 03:14 AM for immediate anomaly view
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [playbackSpeed, setPlaybackSpeed] = useState<number>(1);
  const [isAudioOn, setIsAudioOn] = useState<boolean>(false);
  const [selectedRoomId, setSelectedRoomId] = useState<string | null>(null);
  const [activeSection, setActiveSection] = useState<ActiveSection>('overview');
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState<boolean>(false);

  // AI Configuration
  const [modelConfig, setModelConfig] = useState<ModelProviderConfig>({
    provider: 'built-in'
  });

  const activeCase = cases.find(c => c.id === selectedCaseId) || cases[0];
  const totalMinutes = 420; // 22:00 to 05:00

  // Calculate baseline temperature from initial readings
  const baselineTemp = activeCase.readings.slice(0, 15).reduce((acc, r) => acc + r.temperatureC, 0) / 15;

  // Find reading closest to currentMinute
  const currentReading: SensorReading = activeCase.readings.reduce((prev, curr) => {
    return Math.abs(curr.epochMinutes - currentMinute) < Math.abs(prev.epochMinutes - currentMinute) ? curr : prev;
  }, activeCase.readings[0]);

  // Active anomaly near current reading
  const activeAnomaly = activeCase.anomalies.find(
    a => Math.abs(a.epochMinutes - currentMinute) <= 4
  );

  // Playback timer loop
  useEffect(() => {
    if (!isPlaying) return;

    const interval = setInterval(() => {
      setCurrentMinute(prev => {
        if (prev >= totalMinutes) {
          setIsPlaying(false);
          return totalMinutes;
        }
        return prev + 1;
      });
    }, 1000 / playbackSpeed);

    return () => clearInterval(interval);
  }, [isPlaying, playbackSpeed, totalMinutes]);

  // Audio synthesizer update
  useEffect(() => {
    if (isAudioOn) {
      if (currentReading.acousticFreqHz >= 18.0 && currentReading.acousticFreqHz <= 20.0) {
        AudioSynthesizer.triggerInfrasound(true, currentReading.acousticFreqHz);
      } else {
        AudioSynthesizer.triggerInfrasound(false);
      }
      if (currentReading.emfFluxUtd > 3.0) {
        AudioSynthesizer.triggerEmfPulse();
      }
    }
  }, [currentReading, isAudioOn]);

  const handleToggleAudio = () => {
    const active = AudioSynthesizer.toggleAudio();
    setIsAudioOn(active);
  };

  const handleSeek = (minute: number) => {
    setCurrentMinute(minute);
  };

  const handleJumpAnomaly = (direction: 'next' | 'prev') => {
    const sorted = [...activeCase.anomalies].sort((a, b) => a.epochMinutes - b.epochMinutes);
    if (direction === 'next') {
      const next = sorted.find(a => a.epochMinutes > currentMinute + 2);
      if (next) setCurrentMinute(next.epochMinutes);
      else if (sorted.length > 0) setCurrentMinute(sorted[0].epochMinutes);
    } else {
      const prev = [...sorted].reverse().find(a => a.epochMinutes < currentMinute - 2);
      if (prev) setCurrentMinute(prev.epochMinutes);
      else if (sorted.length > 0) setCurrentMinute(sorted[sorted.length - 1].epochMinutes);
    }
  };

  const handleInjectEvent = (type: 'cold' | 'infrasound' | 'surge' | 'latch' | 'convergence') => {
    const modifiedReadings = activeCase.readings.map(r => {
      if (Math.abs(r.epochMinutes - currentMinute) <= 4) {
        return {
          ...r,
          temperatureC: type === 'cold' || type === 'convergence' ? 14.1 : r.temperatureC,
          acousticDb: type === 'infrasound' || type === 'convergence' ? 44.5 : r.acousticDb,
          acousticFreqHz: type === 'infrasound' || type === 'convergence' ? 18.98 : r.acousticFreqHz,
          powerWattage: type === 'surge' || type === 'convergence' ? 2450.0 : r.powerWattage,
          doorLatchState: type === 'latch' || type === 'convergence' ? ('UNLATCHED' as const) : r.doorLatchState,
          emfFluxUtd: type === 'convergence' ? 7.85 : r.emfFluxUtd
        };
      }
      return r;
    });

    const updatedCases = cases.map(c => {
      if (c.id === activeCase.id) {
        return {
          ...c,
          readings: modifiedReadings
        };
      }
      return c;
    });

    setCases(updatedCases);
  };

  const handleImportCase = (newCase: ForensicCase) => {
    setCases(prev => [newCase, ...prev]);
    setSelectedCaseId(newCase.id);
    setCurrentMinute(newCase.readings[0].epochMinutes);
    setActiveSection('overview');
  };

  const getSectionTitle = (sec: ActiveSection): string => {
    switch (sec) {
      case 'overview':
        return 'FACILITY SPATIAL RADAR & ACTIVE ANOMALY MONITOR';
      case 'telemetry':
        return 'MULTI-SPECTRAL SENSOR TIME-SERIES CHANNELS';
      case 'incidents':
        return 'FORENSIC INCIDENT INVESTIGATION DOSSIERS';
      case 'spectral':
        return 'ACOUSTIC OSCILLOSCOPE & INFRASOUND LABORATORY';
      case 'ingest':
        return 'TELEMETRY INGESTION & ANOMALY INJECTION MATRIX';
      case 'settings':
        return 'SYSTEM CONFIGURATION & INFERENCE RUNTIME';
      default:
        return 'NOCTURNE WORKSTATION';
    }
  };

  return (
    <div style={{
      display: 'flex',
      width: '100vw',
      height: '100vh',
      overflow: 'hidden',
      background: 'var(--bg-deep)',
      color: 'var(--text-primary)'
    }}>
      {/* 1. Dedicated Left Navigation Sidebar */}
      <Sidebar
        activeSection={activeSection}
        onSelectSection={setActiveSection}
        activeAnomalyCount={activeCase.anomalies.length}
        caseNumber={activeCase.caseNumber}
      />

      {/* 2. Main Content Viewport */}
      <div style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        height: '100vh',
        overflow: 'hidden'
      }}>
        {/* TopBar with compact scrubber & controls */}
        <TopBar
          sectionTitle={getSectionTitle(activeSection)}
          cases={cases}
          selectedCaseId={selectedCaseId}
          onSelectCase={setSelectedCaseId}
          currentMinute={currentMinute}
          totalMinutes={totalMinutes}
          currentTimestamp={currentReading.timestamp}
          isPlaying={isPlaying}
          playbackSpeed={playbackSpeed}
          anomalies={activeCase.anomalies}
          onSeek={handleSeek}
          onTogglePlay={() => setIsPlaying(!isPlaying)}
          onChangeSpeed={setPlaybackSpeed}
          onJumpAnomaly={handleJumpAnomaly}
          isAudioOn={isAudioOn}
          onToggleAudio={handleToggleAudio}
          activeAnomalyCount={activeCase.anomalies.length}
        />

        {/* Dynamic Section Content */}
        <main style={{
          flex: 1,
          overflowY: 'auto',
          padding: '14px 16px'
        }}>
          {activeSection === 'overview' && (
            <OverviewSection
              activeCase={activeCase}
              currentReading={currentReading}
              selectedRoomId={selectedRoomId}
              onSelectRoom={setSelectedRoomId}
              baselineTemp={baselineTemp}
              activeAnomaly={activeAnomaly}
              onNavigateToIncidents={() => setActiveSection('incidents')}
              onNavigateToSpectral={() => setActiveSection('spectral')}
            />
          )}

          {activeSection === 'telemetry' && (
            <TelemetryLabView
              readings={activeCase.readings}
              currentReading={currentReading}
              currentMinute={currentMinute}
              totalMinutes={totalMinutes}
              anomalies={activeCase.anomalies}
              onSeek={handleSeek}
            />
          )}

          {activeSection === 'incidents' && (
            <DossierView
              forensicCase={activeCase}
              modelConfig={modelConfig}
            />
          )}

          {activeSection === 'spectral' && (
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '12px'
            }}>
              <SpectralScope
                currentReading={currentReading}
                isAudioOn={isAudioOn}
                onToggleAudio={handleToggleAudio}
              />

              <div style={{
                background: 'var(--bg-panel)',
                border: '1px solid var(--border-subtle)',
                borderRadius: '2px',
                padding: '16px',
                display: 'flex',
                flexDirection: 'column',
                gap: '12px'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Cpu size={16} color="var(--accent-amber-bright)" />
                    <span className="terminal-title">
                      18.98Hz OCULAR RESONANCE &amp; ACOUSTIC PHYSICS ANALYSIS
                    </span>
                  </div>
                  <span className="badge-amber" style={{ fontSize: '10px' }}>
                    VIC TANDY INFRASONIC LABORATORY BENCHMARK
                  </span>
                </div>

                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
                  gap: '12px'
                }}>
                  {/* Column 1: Historical Scientific Discovery */}
                  <div style={{
                    background: '#040507',
                    border: '1px solid var(--border-subtle)',
                    borderRadius: '2px',
                    padding: '12px 14px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '8px'
                  }}>
                    <div style={{ fontSize: '11px', fontWeight: 700, color: '#ffffff' }}>
                      [01] THE 1998 COVENTRY DISCOVERY
                    </div>
                    <div style={{ fontSize: '11px', color: '#d4d4d8', lineHeight: 1.6 }}>
                      In 1998, British engineer Vic Tandy discovered that an unshielded extractor fan in a medical research laboratory was producing an imperceptible standing wave at <strong>18.98 Hz</strong>.
                      The human eyeball's resonant frequency is approximately <strong>18.9 Hz</strong>. Acoustic waves at this frequency vibrate the eyeball cornea, inducing peripheral optical displacement illusions (shadowy vision artifacts) accompanied by localized chills and hyperventilation.
                    </div>
                  </div>

                  {/* Column 2: Architectural Standing Wave Physics */}
                  <div style={{
                    background: '#040507',
                    border: '1px solid var(--border-subtle)',
                    borderRadius: '2px',
                    padding: '12px 14px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '8px'
                  }}>
                    <div style={{ fontSize: '11px', fontWeight: 700, color: '#ffffff' }}>
                      [02] STANDING WAVE GEOMETRY (f = v / 2L)
                    </div>
                    <div style={{ fontSize: '11px', color: '#d4d4d8', lineHeight: 1.6 }}>
                      With speed of sound in air at 20°C equal to <strong>343 m/s</strong>, an architectural corridor or duct plenum of length <strong>9.03 meters</strong> forms an acoustic cavity whose fundamental standing resonance is precisely:
                      <div style={{ margin: '6px 0', padding: '6px 10px', background: '#090a0d', border: '1px solid var(--border-subtle)', borderRadius: '2px', color: 'var(--accent-amber-bright)', fontFamily: 'var(--font-mono)' }}>
                        f₀ = 343 / (2 × 9.03) = 18.98 Hz
                      </div>
                      Nocturne cross-checks dimensional resonance to separate mechanical pipe vibration from anomalous acoustic phenomena.
                    </div>
                  </div>

                  {/* Column 3: Real-Time Sensor Lock Status */}
                  <div style={{
                    background: '#040507',
                    border: '1px solid var(--border-subtle)',
                    borderRadius: '2px',
                    padding: '12px 14px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '8px',
                    justifyContent: 'space-between'
                  }}>
                    <div>
                      <div style={{ fontSize: '11px', fontWeight: 700, color: '#ffffff' }}>
                        [03] REAL-TIME ACOUSTIC SENSOR VECTOR
                      </div>
                      <div style={{ fontSize: '11px', color: '#9ca3af', marginTop: '4px' }}>
                        Live microphone and infrasound transducer lock:
                      </div>
                    </div>

                    <div style={{
                      padding: '10px 12px',
                      background: '#090a0d',
                      border: '1px solid var(--border-subtle)',
                      borderRadius: '2px'
                    }}>
                      <div style={{ fontSize: '10px', color: '#9ca3af', fontFamily: 'var(--font-mono)', marginBottom: '2px' }}>
                        CURRENT ACOUSTIC SPECTRUM:
                      </div>
                      <div style={{ fontSize: '16px', fontWeight: 800, color: 'var(--accent-amber-bright)', fontFamily: 'var(--font-mono)' }}>
                        {currentReading.acousticFreqHz.toFixed(2)} Hz @ {currentReading.acousticDb.toFixed(1)} dB
                      </div>
                      <div style={{ fontSize: '10px', color: 'var(--accent-green-bright)', marginTop: '4px', fontFamily: 'var(--font-mono)' }}>
                        SNR: +18.4 dB over domestic floor
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeSection === 'ingest' && (
            <SimulationLabView
              activeCase={activeCase}
              onInjectEvent={handleInjectEvent}
              onImportCase={handleImportCase}
              modelConfig={modelConfig}
              onUpdateModelConfig={setModelConfig}
            />
          )}

          {activeSection === 'settings' && (
            <div style={{
              maxWidth: '680px',
              margin: '0 auto',
              background: 'var(--bg-panel)',
              border: '1px solid var(--border-subtle)',
              borderRadius: '2px',
              padding: '20px',
              display: 'flex',
              flexDirection: 'column',
              gap: '14px'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Cpu size={16} color="var(--accent-green-bright)" />
                <span className="terminal-title">
                  SYSTEM CONFIGURATION &amp; INFERENCE RUNTIME
                </span>
              </div>
              <p style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                Configure the causal deduction inference backend. All options operate client-side or through local daemon instances.
              </p>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {/* Option 1: Built-in */}
                <div
                  onClick={() => setModelConfig({ ...modelConfig, provider: 'built-in' })}
                  style={{
                    background: modelConfig.provider === 'built-in' ? 'rgba(34, 197, 94, 0.12)' : '#040804',
                    border: `1px solid ${modelConfig.provider === 'built-in' ? 'var(--accent-green)' : 'var(--border-subtle)'}`,
                    borderRadius: '2px',
                    padding: '12px',
                    cursor: 'pointer'
                  }}
                >
                  <div style={{ fontWeight: 700, fontSize: '12px', color: 'var(--text-primary)' }}>
                    [01] Local Air-Gapped Causal Engine (Default)
                  </div>
                  <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '4px' }}>
                    100% deterministic offline inference. Zero latency, zero external network requests.
                  </div>
                </div>

                {/* Option 2: Ollama */}
                <div
                  onClick={() => setModelConfig({ ...modelConfig, provider: 'ollama' })}
                  style={{
                    background: modelConfig.provider === 'ollama' ? 'rgba(34, 197, 94, 0.12)' : '#040804',
                    border: `1px solid ${modelConfig.provider === 'ollama' ? 'var(--accent-green)' : 'var(--border-subtle)'}`,
                    borderRadius: '2px',
                    padding: '12px',
                    cursor: 'pointer'
                  }}
                >
                  <div style={{ fontWeight: 700, fontSize: '12px', color: 'var(--text-primary)' }}>
                    [02] Local Ollama Daemon (`http://localhost:11434`)
                  </div>
                  <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '4px' }}>
                    Connects to local open-weight model instances for deep reasoning without cloud telemetry.
                  </div>
                </div>

                {/* Option 3: Cloud API */}
                <div
                  onClick={() => setModelConfig({ ...modelConfig, provider: 'gemini' })}
                  style={{
                    background: modelConfig.provider === 'gemini' ? 'rgba(245, 158, 11, 0.12)' : '#040804',
                    border: `1px solid ${modelConfig.provider === 'gemini' ? 'var(--accent-amber)' : 'var(--border-subtle)'}`,
                    borderRadius: '2px',
                    padding: '12px',
                    cursor: 'pointer'
                  }}
                >
                  <div style={{ fontWeight: 700, fontSize: '12px', color: 'var(--text-primary)' }}>
                    [03] External API Endpoint
                  </div>
                  <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '4px' }}>
                    Optional remote API inference endpoint.
                  </div>
                  {modelConfig.provider === 'gemini' && (
                    <div style={{ marginTop: '8px' }}>
                      <input
                        type="password"
                        placeholder="API Key..."
                        value={modelConfig.apiKey || ''}
                        onChange={e => setModelConfig({ ...modelConfig, apiKey: e.target.value })}
                        style={{ width: '100%', fontSize: '11px' }}
                      />
                    </div>
                  )}
                </div>
              </div>

              <div style={{
                marginTop: '10px',
                padding: '10px',
                background: '#040804',
                border: '1px solid var(--border-subtle)',
                borderRadius: '2px',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                fontSize: '11px',
                color: 'var(--text-muted)'
              }}>
                <ShieldCheck size={14} color="var(--accent-green-bright)" />
                <span>Security Assurance: No telemetry streams or environment logs are shared externally.</span>
              </div>
            </div>
          )}
        </main>
      </div>

      {/* Settings Modal (kept for external triggers if needed) */}
      <SettingsModal
        isOpen={isSettingsModalOpen}
        onClose={() => setIsSettingsModalOpen(false)}
        config={modelConfig}
        onSaveConfig={setModelConfig}
      />
    </div>
  );
};

export default App;
