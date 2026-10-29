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
    setActiveTab('overview');
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      background: 'var(--bg-deep)',
      color: 'var(--text-primary)'
    }}>
      {/* 1. Header Command Ribbon */}
      <Header
        cases={cases}
        selectedCaseId={selectedCaseId}
        onSelectCase={setSelectedCaseId}
        isAudioOn={isAudioOn}
        onToggleAudio={handleToggleAudio}
        onOpenSettings={() => setIsSettingsOpen(true)}
        activeAnomalyCount={activeCase.anomalies.length}
        modelProviderName={
          modelConfig.provider === 'built-in' 
            ? 'GEMMA-2 (LOCAL AIR-GAPPED)' 
            : modelConfig.provider === 'ollama'
            ? 'GEMMA-2 (OLLAMA :11434)'
            : 'GEMINI FLASH (AI STUDIO)'
        }
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
        padding: '0 16px 14px 16px'
      }}>
        {/* TAB 1: SPATIAL RADAR & INCIDENT OVERVIEW */}
        {activeTab === 'overview' && (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'minmax(340px, 1.15fr) minmax(320px, 0.85fr)',
            gap: '12px',
            alignItems: 'stretch'
          }}>
            {/* Left: Architectural Blueprint */}
            <div>
              <FloorplanView
                rooms={activeCase.floorplan.rooms}
                currentReading={currentReading}
                selectedRoomId={selectedRoomId}
                onSelectRoom={setSelectedRoomId}
                buildingName={activeCase.structureType}
              />
            </div>

            {/* Right: Active Anomaly Incident Panel */}
            <div style={{
              background: 'var(--bg-panel)',
              border: '1px solid var(--border-subtle)',
              borderLeft: activeAnomaly ? '3px solid var(--accent-amber)' : '3px solid var(--accent-green)',
              borderRadius: '2px',
              padding: '16px',
              display: 'flex',
              flexDirection: 'column',
              gap: '12px'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Layers size={15} color={activeAnomaly ? 'var(--accent-amber-bright)' : 'var(--accent-green-bright)'} />
                  <span className="terminal-title">
                    {activeAnomaly ? 'ACTIVE ANOMALOUS INCIDENT' : 'CALM NOCTURNAL BASELINE MONITOR'}
                  </span>
                </div>

                {activeAnomaly && (
                  <span className="badge-amber" style={{ fontSize: '10px' }}>
                    TABPFN CONFIDENCE: {(activeAnomaly.confidenceScore * 100).toFixed(1)}%
                  </span>
                )}
              </div>

              {activeAnomaly ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  <div style={{ fontSize: '12px', lineHeight: 1.6, color: 'var(--text-primary)' }}>
                    {activeAnomaly.summary}
                  </div>

                  {/* Sensor Divergence Table */}
                  <div>
                    <div style={{ fontSize: '10px', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', marginBottom: '4px' }}>
                      MULTIVARIATE DIVERGENCE VECTORS:
                    </div>
                    <div style={{
                      display: 'grid',
                      gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
                      gap: '6px'
                    }}>
                      {activeAnomaly.sensorDivergence.map((div, idx) => (
                        <div key={idx} style={{
                          background: '#040804',
                          padding: '6px 8px',
                          borderRadius: '2px',
                          border: '1px solid var(--border-subtle)',
                          fontSize: '11px',
                          fontFamily: 'var(--font-mono)'
                        }}>
                          <div style={{ color: 'var(--text-muted)' }}>{div.channel}</div>
                          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '2px' }}>
                            <span style={{ color: 'var(--text-secondary)' }}>BASE: {div.baseline}</span>
                            <span style={{ color: 'var(--accent-amber-bright)', fontWeight: 700 }}>OBS: {div.observed}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Quick CTAs */}
                  <div style={{ display: 'flex', gap: '8px', marginTop: '6px' }}>
                    <button
                      onClick={() => setActiveTab('dossier')}
                      className="btn-primary"
                      style={{ flex: 1, padding: '6px 12px', fontSize: '11px' }}
                    >
                      <FileText size={13} />
                      <span>[ OPEN AI FORENSIC DOSSIER ]</span>
                    </button>

                    <button
                      onClick={() => setActiveTab('oscilloscope')}
                      className="btn-secondary"
                      style={{ padding: '6px 12px', fontSize: '11px' }}
                    >
                      <span>[ INSPECT 18.98Hz WAVE ]</span>
                      <ArrowRight size={13} />
                    </button>
                  </div>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  <p style={{ fontSize: '12px', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                    All sensor telemetry currently operating within 1.5 standard deviations of domestic baseline.
                  </p>
                  <div style={{
                    background: '#040804',
                    padding: '10px 12px',
                    borderRadius: '2px',
                    border: '1px solid var(--border-subtle)',
                    fontSize: '11px',
                    color: 'var(--text-secondary)',
                    fontFamily: 'var(--font-mono)'
                  }}>
                    [TIP] Navigation: Drag the timeline scrubber to <strong>03:14 (Case #0317)</strong> or <strong>00:44 (Case #0108)</strong> to enter anomalous hot zones.
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

        {/* TAB 3: SPECTRAL OSCILLOSCOPE & 18.98HZ */}
        {activeTab === 'oscilloscope' && (
          <div style={{ display: 'grid', gridTemplateColumns: 'minmax(340px, 1fr) minmax(320px, 1fr)', gap: '12px' }}>
            <div>
              <SpectralScope
                currentReading={currentReading}
                isAudioOn={isAudioOn}
                onToggleAudio={handleToggleAudio}
              />
            </div>

            <div style={{
              background: 'var(--bg-panel)',
              border: '1px solid var(--border-subtle)',
              borderRadius: '2px',
              padding: '16px',
              display: 'flex',
              flexDirection: 'column',
              gap: '12px'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Cpu size={15} color="var(--accent-amber-bright)" />
                <span className="terminal-title">
                  VIC TANDY 18.98Hz OCULAR RESONANCE ANALYSIS
                </span>
              </div>

              <div style={{ fontSize: '11px', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                <p style={{ marginBottom: '8px' }}>
                  In 1998, British engineer Vic Tandy discovered that an extractor fan in a laboratory produced an acoustic standing wave at <strong>18.98 Hz</strong>. 
                </p>
                <p style={{ marginBottom: '8px' }}>
                  The human eyeball's resonant frequency is approximately <strong>18.9 Hz</strong>. Infrasonic acoustic waves at this frequency vibrate the eyeball cornea, inducing optical displacement illusions (shadowy peripheral vision artifacts), accompanied by hyperventilation and localized chills.
                </p>
                <p>
                  Nocturne's acoustic pipeline isolates this frequency from background noise to determine whether sightings correspond to structural pipe vibration, or unclassified environmental anomalies.
                </p>
              </div>

              <div style={{
                background: '#040804',
                padding: '10px 12px',
                borderRadius: '2px',
                border: '1px solid var(--border-subtle)',
                marginTop: 'auto'
              }}>
                <div style={{ fontSize: '10px', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', marginBottom: '2px' }}>
                  CURRENT ACOUSTIC SPECTRUM READING:
                </div>
                <div style={{ fontSize: '16px', fontWeight: 800, color: 'var(--accent-amber-bright)', fontFamily: 'var(--font-mono)' }}>
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
        margin: '0 16px 12px 16px',
        padding: '10px 14px',
        borderTop: '1px solid var(--border-subtle)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '10px',
        fontSize: '11px',
        color: 'var(--text-muted)',
        fontFamily: 'var(--font-mono)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <ShieldCheck size={14} color="var(--accent-green-bright)" />
          <span>NOCTURNE // AIR-GAPPED ENVIRONMENTAL TELEMETRY FORENSICS ENGINE</span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <span>PIPELINE: TABPFN FOUNDATION ANOMALY SCORING + GOOGLE GEMMA 2</span>
          <a
            href="https://github.com/ayushg-1506/nocturne"
            target="_blank"
            rel="noreferrer"
            style={{ color: 'var(--accent-green-bright)', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '4px' }}
          >
            <GitBranch size={12} />
            <span>[ GITHUB REPO ]</span>
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
