import React, { useState, useEffect } from 'react';
import { FORENSIC_CASES } from './data/cases';
import type { ForensicCase, SensorReading } from './types/telemetry';
import { Header } from './components/Header';
import { ExecutiveBriefing } from './components/ExecutiveBriefing';
import { SensorStatusStrip } from './components/SensorStatusStrip';
import { TimeScrubber } from './components/TimeScrubber';
import { NavigationTabs, type ActiveTab } from './components/NavigationTabs';
import { FloorplanView } from './components/FloorplanView';
import { TelemetryLabView } from './components/TelemetryLabView';
import { SpectralScope } from './components/SpectralScope';
import { DossierView } from './components/DossierView';
import { SimulationLabView } from './components/SimulationLabView';
import { SettingsModal } from './components/SettingsModal';
import type { ModelProviderConfig } from './engine/gemmaForensics';
import { AudioSynthesizer } from './engine/audioSynthesizer';
import { 
  ShieldCheck, 
  GitBranch, 
  Layers, 
  Cpu,
  FileText,
  ArrowRight
} from 'lucide-react';

export const App: React.FC = () => {
  const [cases, setCases] = useState<ForensicCase[]>(FORENSIC_CASES);
  const [selectedCaseId, setSelectedCaseId] = useState<string>(FORENSIC_CASES[0].id);
  const [currentMinute, setCurrentMinute] = useState<number>(314); // Near 03:14 AM for immediate anomaly view
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [playbackSpeed, setPlaybackSpeed] = useState<number>(1);
  const [isAudioOn, setIsAudioOn] = useState<boolean>(false);
  const [selectedRoomId, setSelectedRoomId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<ActiveTab>('overview');
  const [isSettingsOpen, setIsSettingsOpen] = useState<boolean>(false);

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

    const intervalMs = Math.max(50, 400 / playbackSpeed);
    const timer = setInterval(() => {
      setCurrentMinute(prev => {
        if (prev >= totalMinutes) {
          setIsPlaying(false);
          return 0;
        }
        return prev + 1;
      });
    }, intervalMs);

    return () => clearInterval(timer);
  }, [isPlaying, playbackSpeed, totalMinutes]);

  // Audio effect triggers when entering anomaly window
  useEffect(() => {
    if (isAudioOn && activeAnomaly) {
      if (activeAnomaly.type === 'INFRASOUND_RESONANCE' || currentReading.acousticFreqHz < 20.0) {
        AudioSynthesizer.triggerInfrasound(true, currentReading.acousticFreqHz);
      }
      if (activeAnomaly.type === 'ELECTROMAGNETIC_SURGE' || currentReading.emfFluxUtd > 4.0) {
        AudioSynthesizer.triggerEmfPulse();
      }
    } else if (isAudioOn && !activeAnomaly) {
      AudioSynthesizer.triggerInfrasound(false);
    }
  }, [isAudioOn, activeAnomaly, currentReading]);

  const handleToggleAudio = () => {
    const active = AudioSynthesizer.toggleAudio();
    setIsAudioOn(active);
  };

  const handleSeek = (min: number) => {
    setCurrentMinute(Math.max(0, Math.min(totalMinutes, min)));
  };

  const handleJumpAnomaly = (direction: 'next' | 'prev') => {
    const sorted = [...activeCase.anomalies].sort((a, b) => a.epochMinutes - b.epochMinutes);
    if (direction === 'next') {
      const next = sorted.find(a => a.epochMinutes > currentMinute + 2);
      if (next) setCurrentMinute(next.epochMinutes);
      else if (sorted.length > 0) setCurrentMinute(sorted[0].epochMinutes);
    } else {
      const prevList = sorted.filter(a => a.epochMinutes < currentMinute - 2);
      if (prevList.length > 0) setCurrentMinute(prevList[prevList.length - 1].epochMinutes);
      else if (sorted.length > 0) setCurrentMinute(sorted[sorted.length - 1].epochMinutes);
    }
  };

  // Synthetic anomaly injection
  const handleInjectEvent = (type: 'cold' | 'infrasound' | 'surge' | 'latch' | 'convergence') => {
    const targetMin = currentMinute;
    const hours = (22 + Math.floor(targetMin / 60)) % 24;
    const mins = targetMin % 60;
    const tsStr = `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:00`;

    const updatedReadings = activeCase.readings.map(r => {
      if (Math.abs(r.epochMinutes - targetMin) <= 6) {
        return {
          ...r,
          temperatureC: type === 'cold' || type === 'convergence' ? parseFloat((r.temperatureC - 7.0).toFixed(1)) : r.temperatureC,
          acousticDb: type === 'infrasound' || type === 'convergence' ? parseFloat((r.acousticDb + 26.0).toFixed(1)) : r.acousticDb,
          acousticFreqHz: type === 'infrasound' || type === 'convergence' ? 18.98 : r.acousticFreqHz,
          emfFluxUtd: type === 'surge' || type === 'convergence' ? parseFloat((r.emfFluxUtd + 9.5).toFixed(2)) : r.emfFluxUtd,
          powerWattage: type === 'surge' || type === 'convergence' ? parseFloat((r.powerWattage + 1850).toFixed(1)) : r.powerWattage,
          pirMotion: true,
          pirRoom: 'Monitored Zone',
          doorLatchState: (type === 'latch' || type === 'convergence' ? 'UNLATCHED' : r.doorLatchState) as any
        };
      }
      return r;
    });

    const newAnomaly = {
      id: `injected-${Date.now()}`,
      timestamp: tsStr,
      epochMinutes: targetMin,
      type: (type === 'convergence' ? 'CONVERGENCE_EVENT' : type === 'cold' ? 'THERMAL_COLLAPSE' : type === 'infrasound' ? 'INFRASOUND_RESONANCE' : type === 'surge' ? 'GHOST_LOAD_SURGE' : 'PORTAL_CYCLING') as any,
      severity: 'CRITICAL' as const,
      room: 'Monitored Sensor Array',
      confidenceScore: 0.994,
      summary: `Manual Injected Disturbance (${type.toUpperCase()}): Simulated 3:00 AM environmental departure.`,
      sensorDivergence: [
        { channel: 'Temperature Vector', baseline: `${baselineTemp.toFixed(1)}°C`, observed: `${(baselineTemp - 7.0).toFixed(1)}°C`, delta: '-7.0°C' },
        { channel: 'Acoustic SPL', baseline: '22.0 dB', observed: '48.0 dB (18.98Hz)', delta: '+26.0 dB' },
        { channel: 'EMF Induction', baseline: '0.25 µT', observed: '9.75 µT', delta: '+9.50 µT' }
      ]
    };

    const updatedCase = {
      ...activeCase,
      readings: updatedReadings,
      anomalies: [newAnomaly, ...activeCase.anomalies]
    };

    setCases(prev => prev.map(c => c.id === activeCase.id ? updatedCase : c));
    setActiveTab('overview');
    if (isAudioOn) {
      AudioSynthesizer.triggerEmfPulse();
      AudioSynthesizer.triggerInfrasound(true, 18.98);
    }
  };

  const handleImportCase = (newCase: ForensicCase) => {
    setCases(prev => [newCase, ...prev]);
    setSelectedCaseId(newCase.id);
    setCurrentMinute(newCase.anomalies[0]?.epochMinutes || 0);
    setActiveTab('overview');
  };

  const getProviderDisplayName = () => {
    if (modelConfig.provider === 'built-in') return 'GEMMA 2 (LOCAL) + TABPFN';
    if (modelConfig.provider === 'gemini') return 'GEMINI / GEMMA (GOOGLE AI)';
    if (modelConfig.provider === 'ollama') return 'LOCAL OLLAMA (PORT 11434)';
    return 'CUSTOM INFERENCE';
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', background: 'var(--bg-deep)' }}>
      {/* 1. Header Navigation Bar */}
      <Header
        cases={cases}
        selectedCaseId={selectedCaseId}
        onSelectCase={(id) => {
          setSelectedCaseId(id);
          const found = cases.find(c => c.id === id);
          if (found && found.anomalies.length > 0) {
            setCurrentMinute(found.anomalies[0].epochMinutes - 4);
          }
        }}
        isAudioOn={isAudioOn}
        onToggleAudio={handleToggleAudio}
        onOpenSettings={() => setIsSettingsOpen(true)}
        activeAnomalyCount={activeCase.anomalies.length}
        modelProviderName={getProviderDisplayName()}
      />

      {/* 2. Executive System Briefing Banner */}
      <ExecutiveBriefing />

      {/* 3. Real-Time Multi-Sensor KPI Status Strip */}
      <SensorStatusStrip
        currentReading={currentReading}
        baselineTemp={baselineTemp}
      />

      {/* 4. Nocturnal Chronological Time Scrubber */}
      <TimeScrubber
        currentMinute={currentMinute}
        totalMinutes={totalMinutes}
        isPlaying={isPlaying}
        playbackSpeed={playbackSpeed}
        currentTimestamp={currentReading.timestamp}
        anomalies={activeCase.anomalies}
        onSeek={handleSeek}
        onTogglePlay={() => setIsPlaying(!isPlaying)}
        onChangeSpeed={setPlaybackSpeed}
        onJumpAnomaly={handleJumpAnomaly}
      />

      {/* 5. Categorized Navigation Tabs */}
      <NavigationTabs
        activeTab={activeTab}
        onSelectTab={setActiveTab}
        anomalyCount={activeCase.anomalies.length}
      />

      {/* 6. Active Tab Content Viewport */}
      <main style={{
        flex: 1,
        padding: '0 16px 16px 16px'
      }}>
        {/* TAB 1: SPATIAL RADAR & INCIDENT OVERVIEW */}
        {activeTab === 'overview' && (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'minmax(340px, 1.15fr) minmax(320px, 0.85fr)',
            gap: '16px',
            alignItems: 'stretch'
          }}>
            {/* Left: 2.5D Architectural Blueprint */}
            <div>
              <FloorplanView
                forensicCase={activeCase}
                currentReading={currentReading}
                selectedRoomId={selectedRoomId}
                onSelectRoom={setSelectedRoomId}
              />
            </div>

            {/* Right: Active Anomaly Incident Panel */}
            <div className="glass-panel" style={{
              padding: '20px',
              display: 'flex',
              flexDirection: 'column',
              gap: '14px',
              borderLeft: activeAnomaly ? '4px solid var(--accent-crimson)' : '4px solid var(--accent-cyan)'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Layers size={17} color={activeAnomaly ? 'var(--accent-crimson)' : 'var(--accent-cyan)'} />
                  <h3 style={{ fontSize: '14px', fontWeight: 700, fontFamily: 'var(--font-mono)' }}>
                    {activeAnomaly ? 'ACTIVE ANOMALOUS INCIDENT' : 'CALM NOCTURNAL BASELINE MONITOR'}
                  </h3>
                </div>

                {activeAnomaly && (
                  <span className="badge badge-crimson">
                    TABPFN CONFIDENCE: {(activeAnomaly.confidenceScore * 100).toFixed(1)}%
                  </span>
                )}
              </div>

              {activeAnomaly ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  <div style={{ fontSize: '13px', lineHeight: 1.6, color: 'var(--text-primary)' }}>
                    {activeAnomaly.summary}
                  </div>

                  {/* Sensor Divergence Table */}
                  <div>
                    <span style={{ fontSize: '11px', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
                      MULTIVARIATE DIVERGENCE VECTORS:
                    </span>
                    <div style={{
                      display: 'grid',
                      gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
                      gap: '8px',
                      marginTop: '6px'
                    }}>
                      {activeAnomaly.sensorDivergence.map((div, idx) => (
                        <div key={idx} style={{
                          background: 'rgba(0, 0, 0, 0.45)',
                          padding: '8px 10px',
                          borderRadius: '6px',
                          border: '1px solid var(--border-subtle)',
                          fontSize: '11px',
                          fontFamily: 'var(--font-mono)'
                        }}>
                          <div style={{ color: 'var(--text-muted)' }}>{div.channel}</div>
                          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '2px' }}>
                            <span style={{ color: 'var(--text-secondary)' }}>BASE: {div.baseline}</span>
                            <span style={{ color: 'var(--accent-crimson)', fontWeight: 700 }}>OBS: {div.observed}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Quick CTAs */}
                  <div style={{ display: 'flex', gap: '10px', marginTop: '8px' }}>
                    <button
                      onClick={() => setActiveTab('dossier')}
                      className="btn-primary"
                      style={{ flex: 1, padding: '8px 16px', justifyContent: 'center' }}
                    >
                      <FileText size={15} />
                      <span>OPEN AI FORENSIC DOSSIER</span>
                    </button>

                    <button
                      onClick={() => setActiveTab('oscilloscope')}
                      className="btn-secondary"
                      style={{ padding: '8px 14px' }}
                    >
                      <span>INSPECT 18.98Hz WAVE</span>
                      <ArrowRight size={14} />
                    </button>
                  </div>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  <p style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                    All sensor telemetry currently operating within 1.5 standard deviations of domestic baseline.
                  </p>
                  <div style={{ background: 'rgba(0, 0, 0, 0.3)', padding: '12px', borderRadius: '6px', border: '1px solid var(--border-subtle)', fontSize: '12px', color: 'var(--text-secondary)' }}>
                    💡 <strong>Quick Navigation Tip:</strong> Drag the time scrubber to <strong>03:14 AM (Case #0317)</strong> or <strong>00:44 AM (Case #0108)</strong> to enter the anomalous hot zones, or switch tabs above for waveform curves, sound synthesis, and full AI dossiers.
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB 2: MULTI-SPECTRAL TELEMETRY LAB */}
        {activeTab === 'telemetry' && (
          <TelemetryLabView
            readings={activeCase.readings}
            currentMinute={currentMinute}
            totalMinutes={totalMinutes}
            anomalies={activeCase.anomalies}
            onSeek={handleSeek}
          />
        )}

        {/* TAB 3: SPECTRAL OSCILLOSCOPE & 18.98HZ EVP */}
        {activeTab === 'oscilloscope' && (
          <div style={{ display: 'grid', gridTemplateColumns: 'minmax(340px, 1fr) minmax(320px, 1fr)', gap: '16px' }}>
            <div>
              <SpectralScope
                currentReading={currentReading}
                isAudioOn={isAudioOn}
                onToggleAudio={handleToggleAudio}
              />
            </div>

            <div className="glass-panel" style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <Cpu size={18} color="var(--accent-violet)" />
                <h3 style={{ fontSize: '14px', fontWeight: 700, fontFamily: 'var(--font-mono)' }}>
                  THE 18.98Hz "GHOST FREQUENCY" SCIENTIFIC DOSSIER
                </h3>
              </div>

              <div style={{ fontSize: '12px', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                <p style={{ marginBottom: '10px' }}>
                  In 1998, British engineer Vic Tandy discovered that an extractor fan in his medical laboratory was producing an imperceptible acoustic resonance at <strong>18.98 Hz</strong>. 
                </p>
                <p style={{ marginBottom: '10px' }}>
                  The human eyeball's natural resonant frequency is approximately <strong>18.9 Hz</strong>. Exposure to sound waves at this specific frequency vibrates the eyeball cornea, creating optical displacement illusions (shadowy gray figures appearing in peripheral vision), accompanied by autonomic dread, hyperventilation, and localized chills.
                </p>
                <p>
                  Nocturne's acoustic module isolates this band from ambient noise to determine whether "sightings" correspond to structural pipe vibration, or anomalous environmental manifestations.
                </p>
              </div>

              <div style={{ background: 'rgba(0, 0, 0, 0.4)', padding: '12px', borderRadius: '6px', border: '1px solid var(--border-subtle)', marginTop: 'auto' }}>
                <div style={{ fontSize: '11px', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', marginBottom: '4px' }}>
                  CURRENT ACOUSTIC SPECTRUM READING:
                </div>
                <div style={{ fontSize: '18px', fontWeight: 800, color: '#d8b4fe', fontFamily: 'var(--font-mono)' }}>
                  {currentReading.acousticFreqHz.toFixed(2)} Hz @ {currentReading.acousticDb.toFixed(1)} dB
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 4: CLASSIFIED AI FORENSIC DOSSIER */}
        {activeTab === 'dossier' && (
          <DossierView
            forensicCase={activeCase}
            modelConfig={modelConfig}
          />
        )}

        {/* TAB 5: SIMULATOR & CSV INGESTION */}
        {activeTab === 'simulation' && (
          <SimulationLabView
            activeCase={activeCase}
            onInjectEvent={handleInjectEvent}
            onImportCase={handleImportCase}
            modelConfig={modelConfig}
            onUpdateModelConfig={setModelConfig}
          />
        )}
      </main>

      {/* Footer */}
      <footer style={{
        margin: '0 16px 14px 16px',
        padding: '12px 18px',
        borderTop: '1px solid var(--border-subtle)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '12px',
        fontSize: '11px',
        color: 'var(--text-muted)',
        fontFamily: 'var(--font-mono)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <ShieldCheck size={14} color="var(--accent-emerald)" />
          <span>NOCTURNE // 100% AIR-GAPPED PRIVACY-FIRST TELEMETRY ARCHAEOLOGY</span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <span>HACKTOBERFEST 2026: GHOST IN THE MACHINE</span>
          <a
            href="https://github.com/ayushg-1506/nocturne"
            target="_blank"
            rel="noreferrer"
            style={{ color: 'var(--accent-cyan)', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '4px' }}
          >
            <GitBranch size={13} />
            <span>GitHub Repository</span>
          </a>
        </div>
      </footer>

      {/* Settings Modal */}
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        config={modelConfig}
        onSaveConfig={setModelConfig}
      />
    </div>
  );
};

export default App;
