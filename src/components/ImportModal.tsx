import React, { useState } from 'react';
import { Upload, FileSpreadsheet, Check, AlertCircle, X, Download } from 'lucide-react';
import type { ForensicCase, SensorReading } from '../types/telemetry';
import { AnomalyEngine } from '../engine/anomalyDetector';

interface ImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImportCase: (newCase: ForensicCase) => void;
}

export const ImportModal: React.FC<ImportModalProps> = ({
  isOpen,
  onClose,
  onImportCase
}) => {
  const [csvContent, setCsvContent] = useState('');
  const [caseTitle, setCaseTitle] = useState('Custom Telemetry Log');
  const [locationName, setLocationName] = useState('Local Edge Gateway');
  const [error, setError] = useState<string | null>(null);
  const [previewRows, setPreviewRows] = useState<number | null>(null);

  if (!isOpen) return null;

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      setCsvContent(content);
      const lines = content.split('\n').filter(l => l.trim().length > 0);
      setPreviewRows(Math.max(0, lines.length - 1));
      setError(null);
    };
    reader.readAsText(file);
  };

  const handleDownloadSampleCsv = () => {
    const sample = `timestamp,temperatureC,humidityPct,acousticDb,acousticFreqHz,pirMotion,emfFluxUtd,powerWattage,doorLatchState
03:00:00,21.2,45.0,22.0,50.0,false,0.25,15.0,SECURE
03:03:00,21.1,45.2,22.4,51.0,false,0.26,16.0,SECURE
03:06:00,21.0,45.1,23.1,49.0,false,0.24,14.5,SECURE
03:09:00,20.8,46.0,24.0,50.0,false,0.28,15.0,SECURE
03:12:00,18.4,49.2,34.5,18.98,true,2.45,45.0,SECURE
03:15:00,14.1,54.8,44.2,18.98,true,7.85,1420.0,UNLATCHED
03:18:00,14.5,53.2,41.0,18.98,true,6.10,950.0,UNLATCHED
03:21:00,17.2,50.1,28.0,48.0,false,1.80,120.0,AJAR
03:24:00,19.5,47.2,24.0,50.0,false,0.45,20.0,SECURE
03:27:00,20.4,46.0,22.5,50.0,false,0.30,16.0,SECURE`;

    const blob = new Blob([sample], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'nocturne-sample-telemetry.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleProcessImport = () => {
    try {
      if (!csvContent.trim()) {
        setError('Please paste CSV text or select a valid file.');
        return;
      }

      const lines = csvContent.split('\n').map(l => l.trim()).filter(l => l.length > 0);
      if (lines.length < 3) {
        setError('CSV must contain a header and at least 2 rows of data.');
        return;
      }

      const headers = lines[0].toLowerCase().split(',').map(h => h.trim().replace(/['"]/g, ''));
      
      const idxTime = headers.findIndex(h => h.includes('time'));
      const idxTemp = headers.findIndex(h => h.includes('temp'));
      const idxHum = headers.findIndex(h => h.includes('hum'));
      const idxDb = headers.findIndex(h => h.includes('db') || h.includes('sound') || h.includes('mic'));
      const idxFreq = headers.findIndex(h => h.includes('freq') || h.includes('hz'));
      const idxPir = headers.findIndex(h => h.includes('pir') || h.includes('motion'));
      const idxEmf = headers.findIndex(h => h.includes('emf') || h.includes('mag'));
      const idxWatt = headers.findIndex(h => h.includes('watt') || h.includes('power'));
      const idxLatch = headers.findIndex(h => h.includes('latch') || h.includes('door') || h.includes('lock'));

      const readings: SensorReading[] = [];

      for (let i = 1; i < lines.length; i++) {
        const parts = lines[i].split(',').map(p => p.trim());
        if (parts.length < 2) continue;

        const timeStr = idxTime !== -1 ? parts[idxTime] : `03:${(i * 3).toString().padStart(2, '0')}:00`;
        const temp = idxTemp !== -1 ? parseFloat(parts[idxTemp]) || 20.0 : 20.0;
        const hum = idxHum !== -1 ? parseFloat(parts[idxHum]) || 50.0 : 50.0;
        const db = idxDb !== -1 ? parseFloat(parts[idxDb]) || 22.0 : 22.0;
        const freq = idxFreq !== -1 ? parseFloat(parts[idxFreq]) || 50.0 : 50.0;
        const pir = idxPir !== -1 ? parts[idxPir].toLowerCase() === 'true' || parts[idxPir] === '1' : false;
        const emf = idxEmf !== -1 ? parseFloat(parts[idxEmf]) || 0.25 : 0.25;
        const watts = idxWatt !== -1 ? parseFloat(parts[idxWatt]) || 15.0 : 15.0;
        const latchRaw = idxLatch !== -1 ? parts[idxLatch].toUpperCase() : 'SECURE';
        const latch: 'SECURE' | 'AJAR' | 'UNLATCHED' | 'CYCLING' = 
          ['SECURE', 'AJAR', 'UNLATCHED', 'CYCLING'].includes(latchRaw) ? (latchRaw as any) : 'SECURE';

        readings.push({
          timestamp: timeStr,
          epochMinutes: i * 3,
          temperatureC: temp,
          humidityPct: hum,
          acousticDb: db,
          acousticFreqHz: freq,
          pirMotion: pir,
          pirRoom: pir ? 'Monitored Room' : null,
          emfFluxUtd: emf,
          powerWattage: watts,
          doorLatchState: latch,
          doorRoom: 'Main Portal'
        });
      }

      // Automatically run TabPFN Anomaly Detection on imported readings!
      const detectedAnomalies = AnomalyEngine.analyzeReadings(readings, 'Custom Zone');

      const customCase: ForensicCase = {
        id: `custom-${Date.now()}`,
        caseNumber: `USER-LOG #${Math.floor(Math.random() * 8999 + 1000)}`,
        title: caseTitle,
        subtitle: `Imported Telemetry (${readings.length} datapoints)`,
        location: locationName,
        structureType: 'Custom IoT Telemetry Array',
        ambientConditions: 'User-provided environmental time-series dataset',
        incidentTimestamp: `${readings[0]?.timestamp || '00:00'} – ${readings[readings.length - 1]?.timestamp || '05:00'}`,
        description: `Imported telemetry session containing ${readings.length} multi-variate observations. Scanned with TabPFN tabular anomaly engine.`,
        investigatorNotes: `Automated baseline established from initial samples. Found ${detectedAnomalies.length} statistically anomalous environmental clusters.`,
        floorplan: {
          rooms: [
            { id: 'master', name: 'Primary Zone', x: 20, y: 30, width: 220, height: 160, sensorIds: ['TH-USR', 'PIR-USR'] },
            { id: 'hallway', name: 'Access Corridor', x: 250, y: 30, width: 70, height: 330, sensorIds: ['MIC-USR'] },
            { id: 'nursery', name: 'Monitored Portal', x: 330, y: 30, width: 180, height: 160, sensorIds: ['LATCH-USR', 'EMF-USR'] },
            { id: 'study', name: 'Secondary Zone', x: 20, y: 200, width: 220, height: 160, sensorIds: ['POW-USR'] },
            { id: 'basement', name: 'Gateway Hub', x: 330, y: 200, width: 180, height: 160, sensorIds: ['HUB-01'] }
          ]
        },
        readings,
        anomalies: detectedAnomalies
      };

      onImportCase(customCase);
      onClose();
    } catch (err: any) {
      setError(err?.message || 'Failed to parse telemetry CSV format.');
    }
  };

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      background: 'rgba(0, 0, 0, 0.85)',
      backdropFilter: 'blur(12px)',
      zIndex: 100,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px'
    }}>
      <div className="glass-panel" style={{
        width: '100%',
        maxWidth: '680px',
        maxHeight: '90vh',
        display: 'flex',
        flexDirection: 'column',
        borderRadius: '12px',
        border: '1px solid var(--border-highlight)',
        overflow: 'hidden'
      }}>
        {/* Header */}
        <div style={{
          padding: '16px 20px',
          borderBottom: '1px solid var(--border-subtle)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <FileSpreadsheet size={18} color="var(--accent-cyan)" />
            <div>
              <h3 style={{ fontSize: '15px', fontWeight: 800, fontFamily: 'var(--font-mono)' }}>
                IMPORT ENVIRONMENTAL TELEMETRY (CSV/JSON)
              </h3>
              <p style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
                Load Home Assistant, Zigbee, or ESP32 nocturnal logs for TabPFN &amp; Gemma analysis
              </p>
            </div>
          </div>
          <button onClick={onClose} style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div style={{ padding: '20px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {/* Metadata Inputs */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div>
              <label style={{ fontSize: '11px', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
                INCIDENT / SESSION TITLE:
              </label>
              <input
                type="text"
                value={caseTitle}
                onChange={e => setCaseTitle(e.target.value)}
                style={{
                  width: '100%',
                  marginTop: '4px',
                  background: 'rgba(15, 23, 42, 0.8)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: '6px',
                  padding: '8px 10px',
                  color: 'var(--text-primary)',
                  fontSize: '13px'
                }}
              />
            </div>

            <div>
              <label style={{ fontSize: '11px', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
                LOCATION / HARDWARE TAG:
              </label>
              <input
                type="text"
                value={locationName}
                onChange={e => setLocationName(e.target.value)}
                style={{
                  width: '100%',
                  marginTop: '4px',
                  background: 'rgba(15, 23, 42, 0.8)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: '6px',
                  padding: '8px 10px',
                  color: 'var(--text-primary)',
                  fontSize: '13px'
                }}
              />
            </div>
          </div>

          {/* File Picker or Paste Area */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
              <label style={{ fontSize: '11px', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
                PASTE RAW CSV OR DROP LOG FILE:
              </label>
              <button
                onClick={handleDownloadSampleCsv}
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: 'var(--accent-cyan)',
                  fontSize: '11px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px'
                }}
              >
                <Download size={12} /> Download Sample CSV
              </button>
            </div>

            <textarea
              rows={8}
              value={csvContent}
              onChange={e => {
                setCsvContent(e.target.value);
                const lines = e.target.value.split('\n').filter(l => l.trim().length > 0);
                setPreviewRows(Math.max(0, lines.length - 1));
              }}
              placeholder="timestamp,temperatureC,humidityPct,acousticDb,acousticFreqHz,pirMotion,emfFluxUtd,powerWattage,doorLatchState&#10;03:14:00,14.2,54.0,43.5,18.98,true,6.8,1450,UNLATCHED"
              style={{
                width: '100%',
                background: 'rgba(8, 12, 18, 0.9)',
                border: '1px solid var(--border-subtle)',
                borderRadius: '6px',
                padding: '10px',
                color: 'var(--text-primary)',
                fontFamily: 'var(--font-mono)',
                fontSize: '11px',
                lineHeight: 1.5,
                resize: 'vertical'
              }}
            />
          </div>

          {/* File Upload Button */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px' }}>
            <label className="btn-secondary" style={{ cursor: 'pointer', fontSize: '12px' }}>
              <Upload size={14} />
              <span>Choose .CSV / .LOG File</span>
              <input type="file" accept=".csv,.txt,.log" onChange={handleFileUpload} style={{ display: 'none' }} />
            </label>

            {previewRows !== null && previewRows > 0 && (
              <span className="badge badge-cyan">
                {previewRows} Telemetry Datapoints Detected
              </span>
            )}
          </div>

          {/* Error Message */}
          {error && (
            <div style={{
              background: 'rgba(244, 63, 94, 0.1)',
              border: '1px solid var(--accent-crimson)',
              borderRadius: '6px',
              padding: '10px 12px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              color: '#fda4af',
              fontSize: '12px'
            }}>
              <AlertCircle size={15} />
              <span>{error}</span>
            </div>
          )}

          {/* Submit */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '8px' }}>
            <button onClick={onClose} className="btn-secondary">
              Cancel
            </button>
            <button onClick={handleProcessImport} className="btn-primary" style={{ padding: '8px 20px' }}>
              <Check size={14} />
              <span>SCAN &amp; LOAD TELEMETRY</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
