export interface SensorReading {
  timestamp: string;      // e.g. "03:14:20"
  epochMinutes: number;   // minutes from start (0 to 420 for 7-hour span: 22:00 to 05:00)
  temperatureC: number;   // Ambient temperature in Celsius (e.g. 21.4 -> drops to 14.2)
  humidityPct: number;    // Relative humidity %
  acousticDb: number;     // Sound pressure level dB (baseline 22dB, whispers 35dB, bangs 68dB)
  acousticFreqHz: number; // Dominant frequency detected (e.g. 18.98 Hz infrasound)
  pirMotion: boolean;     // Passive Infrared movement state
  pirRoom: string | null; // Which room detected motion
  emfFluxUtd: number;     // Electromagnetic microTesla (nominal 0.2 - 0.4 uT, anomalous > 8.0 uT)
  powerWattage: number;   // Phantom wattage surge on idle circuit (e.g. 12W -> 1850W)
  doorLatchState: 'SECURE' | 'AJAR' | 'UNLATCHED' | 'CYCLING';
  doorRoom: string;
}

export type AnomalyType = 
  | 'THERMAL_COLLAPSE'       // Sudden sharp temperature drop (> 4°C within 3 mins)
  | 'INFRASOUND_RESONANCE'   // 18.98 Hz resonance / EVP frequency spike
  | 'PHANTOM_MOTION'         // PIR activation without structural vibration
  | 'ELECTROMAGNETIC_SURGE'  // Extreme EMF field disturbance
  | 'GHOST_LOAD_SURGE'       // Sudden kilowatt draw on disconnected or dead circuit
  | 'PORTAL_CYCLING'         // Smart lock or contact cycling without credential
  | 'CONVERGENCE_EVENT';     // Multiple synchronized anomalous vectors

export interface DetectedAnomaly {
  id: string;
  timestamp: string;
  epochMinutes: number;
  type: AnomalyType;
  severity: 'ELEVATED' | 'HIGH' | 'CRITICAL';
  room: string;
  confidenceScore: number;   // TabPFN-style anomaly probability 0.00 - 0.99
  summary: string;
  sensorDivergence: {
    channel: string;
    baseline: string;
    observed: string;
    delta: string;
  }[];
}

export interface RoomCoordinate {
  id: string;
  name: string;
  x: number;
  y: number;
  width: number;
  height: number;
  sensorIds: string[];
}

export interface ForensicCase {
  id: string;
  caseNumber: string;
  title: string;
  subtitle: string;
  location: string;
  structureType: string;
  ambientConditions: string;
  incidentTimestamp: string;
  description: string;
  investigatorNotes: string;
  floorplan: {
    rooms: RoomCoordinate[];
  };
  readings: SensorReading[];
  anomalies: DetectedAnomaly[];
}

export interface ForensicDossier {
  caseId: string;
  generatedAt: string;
  engine: string;
  sha256Seal: string;
  executiveSummary: string;
  primaryVector: string;
  confidenceIndex: number;
  rationalVerdict: {
    headline: string;
    probableCauses: string[];
    physicalPlausibilityScore: number; // 0-100%
    technicalRecommendation: string;
  };
  paranormalVerdict: {
    headline: string;
    loreContext: string;
    spectralPlausibilityScore: number; // 0-100%
    environmentalParapsychologyDeduction: string;
  };
  timelineOfEvents: {
    time: string;
    event: string;
    sensorProof: string;
  }[];
}
