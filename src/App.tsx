import React, { useState, useEffect } from 'react';
import { FORENSIC_CASES } from './data/cases';
import type { ForensicCase, SensorReading } from './types/telemetry';
import { Header } from './components/Header';
import { TimeScrubber } from './components/TimeScrubber';
import { FloorplanView } from './components/FloorplanView';
import { TelemetryCharts } from './components/TelemetryCharts';
import { SpectralScope } from './components/SpectralScope';
import { DossierModal } from './components/DossierModal';
import { ImportModal } from './components/ImportModal';
import { SettingsModal } from './components/SettingsModal';
import type { ModelProviderConfig } from './engine/gemmaForensics';
import { AudioSynthesizer } from './engine/audioSynthesizer';
import { 
  ShieldCheck, 
  GitBranch, 
  Layers, 
  Cpu
} from 'lucide-react';

export const App: React.FC = () => {
  const [cases, setCases] = useState<ForensicCase[]>(FORENSIC_CASES);
  const [selectedCaseId, setSelectedCaseId] = useState<string>(FORENSIC_CASES[0].id);
  const [currentMinute, setCurrentMinute] = useState<number>(306); // Near 03:06 AM for immediate excitement
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [playbackSpeed, setPlaybackSpeed] = useState<number>(1);
  const [isAudioOn, setIsAudioOn] = useState<boolean>(false);
  const [selectedRoomId, setSelectedRoomId] = useState<string | null>(null);

  // Modals
  const [isDossierOpen, setIsDossierOpen] = useState<boolean>(false);
  const [isImportOpen, setIsImportOpen] = useState<boolean>(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState<boolean>(false);

  // AI Configuration
  const [modelConfig, setModelConfig] = useState<ModelProviderConfig>({
    provider: 'built-in'
  });

  const activeCase = cases.find(c => c.id === selectedCaseId) || cases[0];
  const totalMinutes = 420; // 22:00 to 05:00

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

  // Inject a synthetic 3:00 AM environmental disturbance
  const handleInjectAnomaly = () => {
    const targetMin = currentMinute;
    const hours = (22 + Math.floor(targetMin / 60)) % 24;
    const mins = targetMin % 60;
    const timestampStr = `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:00`;

    // Mutate current case readings around this window
    const updatedReadings = activeCase.readings.map(r => {
      if (Math.abs(r.epochMinutes - targetMin) <= 8) {
        return {
          ...r,
          temperatureC: parseFloat((r.temperatureC - 6.4).toFixed(1)),
          acousticDb: parseFloat((r.acousticDb + 24.0).toFixed(1)),
          acousticFreqHz: 18.98,
          emfFluxUtd: parseFloat((r.emfFluxUtd + 8.2).toFixed(2)),
          pirMotion: true,
          pirRoom: 'Monitored Portal',
          doorLatchState: 'UNLATCHED' as const
        };
      }
      return r;
    });

    const newAnomaly = {
      id: `injected-${Date.now()}`,
      timestamp: timestampStr,
      epochMinutes: targetMin,
      type: 'CONVERGENCE_EVENT' as const,
      severity: 'CRITICAL' as const,
      room: 'Main Sensor Array',
      confidenceScore: 0.992,
      summary: `Manual Anomaly Injection: Simultaneous 18.98Hz infrasound wave, 6.4°C thermal drop, and unauthenticated latch release.`,
      sensorDivergence: [
        { channel: 'Temperature Plunge', baseline: '21.0°C', observed: '14.6°C', delta: '-6.4°C' },
        { channel: 'Acoustic SPL', baseline: '22.0 dB', observed: '46.0 dB', delta: '+24.0 dB (18.98Hz)' },
        { channel: 'EMF Induction Flux', baseline: '0.25 µT', observed: '8.45 µT', delta: '+8.20 µT' }
      ]
    };

    const updatedCase: ForensicCase = {
      ...activeCase,
      readings: updatedReadings,
      anomalies: [newAnomaly, ...activeCase.anomalies]
    };

    setCases(prev => prev.map(c => c.id === activeCase.id ? updatedCase : c));
    if (isAudioOn) {
      AudioSynthesizer.triggerEmfPulse();
      AudioSynthesizer.triggerInfrasound(true, 18.98);
    }
  };

  const handleImportCase = (newCase: ForensicCase) => {
    setCases(prev => [newCase, ...prev]);
    setSelectedCaseId(newCase.id);
    setCurrentMinute(newCase.anomalies[0]?.epochMinutes || 0);
  };

  const getProviderDisplayName = () => {
    if (modelConfig.provider === 'built-in') return 'GEMMA 2 (LOCAL AIR-GAPPED) + TABPFN';
    if (modelConfig.provider === 'gemini') return 'GEMINI / GEMMA (GOOGLE AI)';
    if (modelConfig.provider === 'ollama') return 'LOCAL OLLAMA (PORT 11434)';
    return 'CUSTOM INFERENCE';
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', background: 'var(--bg-deep)' }}>
      {/* Top Application Header */}
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
        onOpenDossier={() => setIsDossierOpen(true)}
        onOpenImport={() => setIsImportOpen(true)}
        onOpenSettings={() => setIsSettingsOpen(true)}
        onInjectAnomaly={handleInjectAnomaly}
        activeAnomalyCount={activeCase.anomalies.length}
        modelProviderName={getProviderDisplayName()}
      />

      {/* Main Scrubber Timeline */}
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

      {/* Primary 2-Column Forensic Layout */}
      <main style={{
        flex: 1,
        display: 'grid',
        gridTemplateColumns: 'minmax(340px, 1fr) minmax(420px, 1.4fr)',
        gap: '14px',
        padding: '0 16px 16px 16px',
        alignItems: 'stretch'
      }}>
        {/* Left Column: Architectural Blueprint & Acoustic Oscilloscope */}
        <section style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <div style={{ flex: '1 1 360px' }}>
            <FloorplanView
              forensicCase={activeCase}
              currentReading={currentReading}
              selectedRoomId={selectedRoomId}
              onSelectRoom={setSelectedRoomId}
            />
          </div>

          <div style={{ flex: '0 0 auto' }}>
            <SpectralScope
              currentReading={currentReading}
              isAudioOn={isAudioOn}
              onToggleAudio={handleToggleAudio}
            />
          </div>
        </section>

        {/* Right Column: Multi-Track Waveforms & Live Anomaly Dossier Card */}
        <section style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          {/* Synchronized Telemetry Charts */}
          <div>
            <TelemetryCharts
              readings={activeCase.readings}
              currentMinute={currentMinute}
              totalMinutes={totalMinutes}
              anomalies={activeCase.anomalies}
              onSeek={handleSeek}
            />
          </div>

          {/* Active Forensic Status Card */}
          <div className="glass-panel" style={{
            padding: '16px 20px',
            display: 'flex',
            flexDirection: 'column',
            gap: '12px',
            borderLeft: activeAnomaly ? '4px solid var(--accent-crimson)' : '4px solid var(--accent-cyan)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Layers size={16} color={activeAnomaly ? 'var(--accent-crimson)' : 'var(--accent-cyan)'} />
                <h3 style={{ fontSize: '13px', fontWeight: 700, fontFamily: 'var(--font-mono)' }}>
                  {activeAnomaly ? 'ACTIVE NOCTURNAL ANOMALY DETECTED' : 'CALM NOCTURNAL BASELINE MONITOR'}
                </h3>
              </div>

              {activeAnomaly && (
                <span className="badge badge-crimson">
                  SEVERITY: {activeAnomaly.severity} | TABPFN: {(activeAnomaly.confidenceScore * 100).toFixed(1)}%
                </span>
              )}
            </div>

            {activeAnomaly ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <p style={{ fontSize: '13px', lineHeight: 1.5, color: 'var(--text-primary)' }}>
                  {activeAnomaly.summary}
                </p>

                {/* Divergence Metrics */}
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
                  gap: '8px',
                  marginTop: '4px'
                }}>
                  {activeAnomaly.sensorDivergence.map((div, idx) => (
                    <div key={idx} style={{
                      background: 'rgba(0, 0, 0, 0.4)',
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
            ) : (
              <p style={{ fontSize: '12px', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                All sensor streams operating within 1.5 standard deviations of domestic baseline.
                Use the timeline scrubber above to jump to witching hour anomalies (03:00 - 04:30 AM), or click <strong>SUMMON ANOMALY</strong> to inject real-time environmental disturbances.
              </p>
            )}

            {/* Quick CTA to Full Dossier */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '4px', paddingTop: '8px', borderTop: '1px solid var(--border-subtle)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11px', color: 'var(--text-muted)' }}>
                <Cpu size={13} color="var(--accent-violet)" />
                <span>Gemma 2 Dual-Verdict Deductions Available</span>
              </div>
              <button
                onClick={() => setIsDossierOpen(true)}
                className="btn-primary"
                style={{ fontSize: '12px', padding: '6px 14px' }}
              >
                <span>READ FULL FORENSIC DOSSIER</span>
              </button>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer style={{
        margin: '0 16px 14px 16px',
        padding: '10px 16px',
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
          <ShieldCheck size={14} color="var(--accent-emerald)" />
          <span>NOCTURNE // 100% AIR-GAPPED PRIVACY-FIRST FORENSICS</span>
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

      {/* Modals */}
      <DossierModal
        isOpen={isDossierOpen}
        onClose={() => setIsDossierOpen(false)}
        forensicCase={activeCase}
        modelConfig={modelConfig}
      />

      <ImportModal
        isOpen={isImportOpen}
        onClose={() => setIsImportOpen(false)}
        onImportCase={handleImportCase}
      />

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
