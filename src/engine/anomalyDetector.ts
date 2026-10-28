import type { SensorReading, DetectedAnomaly, AnomalyType } from '../types/telemetry';

/**
 * TabPFN-Inspired Multivariate Tabular Anomaly Engine
 * Scans multi-sensor time-series datasets to detect statistically significant
 * departures from baseline domestic physics.
 */
export class AnomalyEngine {
  /**
   * Evaluates a full session of sensor readings and identifies all anomaly clusters.
   */
  public static analyzeReadings(readings: SensorReading[], roomName = 'Monitored Zone'): DetectedAnomaly[] {
    if (readings.length < 5) return [];

    // Calculate baseline statistics from the first 20 readings (nominal calm period)
    const baselineSample = readings.slice(0, Math.min(25, readings.length));
    const baseTemp = this.mean(baselineSample.map(r => r.temperatureC));
    const tempStd = Math.max(0.2, this.stdDev(baselineSample.map(r => r.temperatureC), baseTemp));

    const baseDb = this.mean(baselineSample.map(r => r.acousticDb));
    const dbStd = Math.max(1.0, this.stdDev(baselineSample.map(r => r.acousticDb), baseDb));

    const baseEmf = this.mean(baselineSample.map(r => r.emfFluxUtd));
    const emfStd = Math.max(0.1, this.stdDev(baselineSample.map(r => r.emfFluxUtd), baseEmf));

    const baseWatts = this.mean(baselineSample.map(r => r.powerWattage));

    const anomalies: DetectedAnomaly[] = [];
    let anomalyCounter = 1;

    for (let i = 2; i < readings.length; i++) {
      const current = readings[i];
      const prev = readings[i - 1];

      // Multi-variate z-scores
      const zTemp = (baseTemp - current.temperatureC) / tempStd; // positive when colder than baseline
      const zDb = (current.acousticDb - baseDb) / dbStd;
      const zEmf = (current.emfFluxUtd - baseEmf) / emfStd;
      const wattDelta = current.powerWattage - baseWatts;

      const rateOfTempDrop = (prev.temperatureC - current.temperatureC); // drop per interval

      const flags: { type: AnomalyType; severity: 'ELEVATED' | 'HIGH' | 'CRITICAL'; score: number; desc: string }[] = [];

      // 1. Thermal Collapse Check
      if (zTemp > 3.0 || rateOfTempDrop > 1.2) {
        flags.push({
          type: 'THERMAL_COLLAPSE',
          severity: zTemp > 5.0 ? 'CRITICAL' : 'HIGH',
          score: Math.min(0.99, 0.70 + zTemp * 0.05),
          desc: `Severe thermal drop of ${(baseTemp - current.temperatureC).toFixed(1)}°C below baseline.`
        });
      }

      // 2. Infrasound & Acoustic Resonance Check
      if ((current.acousticFreqHz >= 18.0 && current.acousticFreqHz <= 20.0 && current.acousticDb > 32.0) || zDb > 4.0) {
        flags.push({
          type: 'INFRASOUND_RESONANCE',
          severity: current.acousticDb > 45 ? 'CRITICAL' : 'HIGH',
          score: 0.965,
          desc: `Infrasound acoustic resonance detected at ${current.acousticFreqHz.toFixed(2)} Hz (${current.acousticDb.toFixed(1)} dB).`
        });
      }

      // 3. Ghost Load Surge Check
      if (wattDelta > 450) {
        flags.push({
          type: 'GHOST_LOAD_SURGE',
          severity: wattDelta > 1500 ? 'CRITICAL' : 'HIGH',
          score: Math.min(0.99, 0.85 + (wattDelta / 3000) * 0.14),
          desc: `Phantom electrical load surge of +${wattDelta.toFixed(0)}W on monitored circuit.`
        });
      }

      // 4. Electromagnetic Flux Surge Check
      if (zEmf > 4.0 || current.emfFluxUtd > 3.5) {
        flags.push({
          type: 'ELECTROMAGNETIC_SURGE',
          severity: current.emfFluxUtd > 8.0 ? 'CRITICAL' : 'HIGH',
          score: Math.min(0.99, 0.80 + (current.emfFluxUtd / 15) * 0.18),
          desc: `Electromagnetic field disturbance reaching ${current.emfFluxUtd.toFixed(2)} µT.`
        });
      }

      // 5. Door Latch Cycling
      if (current.doorLatchState === 'UNLATCHED' || current.doorLatchState === 'CYCLING') {
        flags.push({
          type: 'PORTAL_CYCLING',
          severity: 'HIGH',
          score: 0.94,
          desc: `Monitored portal transitioned to ${current.doorLatchState} state without keycode event.`
        });
      }

      // 6. Phantom Motion Check
      if (current.pirMotion && (zTemp > 2.0 || current.emfFluxUtd > 2.0)) {
        flags.push({
          type: 'PHANTOM_MOTION',
          severity: 'HIGH',
          score: 0.95,
          desc: `PIR motion tripped concurrently with anomalous environmental drift in ${current.pirRoom || roomName}.`
        });
      }

      if (flags.length > 0) {
        // If 2 or more vectors triggered simultaneously, elevate to Convergence
        const isConvergence = flags.length >= 2;
        const highestScore = Math.max(...flags.map(f => f.score));
        const effectiveType: AnomalyType = isConvergence ? 'CONVERGENCE_EVENT' : flags[0].type;
        const effectiveSeverity = flags.some(f => f.severity === 'CRITICAL') || isConvergence ? 'CRITICAL' : 'HIGH';

        const summary = isConvergence
          ? `Convergence of ${flags.length} vectors (${flags.map(f => f.type.replace(/_/g, ' ')).join(', ')}).`
          : flags[0].desc;

        // Skip consecutive duplicates within 4 intervals to group into clean incidents
        const lastAno = anomalies[anomalies.length - 1];
        if (!lastAno || (current.epochMinutes - lastAno.epochMinutes > 6)) {
          anomalies.push({
            id: `ano-gen-${anomalyCounter++}`,
            timestamp: current.timestamp,
            epochMinutes: current.epochMinutes,
            type: effectiveType,
            severity: effectiveSeverity,
            room: current.pirRoom || roomName,
            confidenceScore: parseFloat((isConvergence ? Math.min(0.999, highestScore + 0.03) : highestScore).toFixed(3)),
            summary,
            sensorDivergence: [
              { channel: 'Ambient Temperature', baseline: `${baseTemp.toFixed(1)}°C`, observed: `${current.temperatureC}°C`, delta: `${(current.temperatureC - baseTemp).toFixed(1)}°C` },
              { channel: 'Acoustic SPL', baseline: `${baseDb.toFixed(1)} dB`, observed: `${current.acousticDb} dB`, delta: `+${(current.acousticDb - baseDb).toFixed(1)} dB` },
              { channel: 'EMF Flux', baseline: `${baseEmf.toFixed(2)} µT`, observed: `${current.emfFluxUtd} µT`, delta: `+${(current.emfFluxUtd - baseEmf).toFixed(2)} µT` }
            ]
          });
        }
      }
    }

    return anomalies;
  }

  private static mean(arr: number[]): number {
    if (arr.length === 0) return 0;
    return arr.reduce((a, b) => a + b, 0) / arr.length;
  }

  private static stdDev(arr: number[], mean: number): number {
    if (arr.length <= 1) return 0;
    const variance = arr.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / (arr.length - 1);
    return Math.sqrt(variance);
  }
}
