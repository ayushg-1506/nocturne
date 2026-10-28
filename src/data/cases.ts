import type { ForensicCase, SensorReading, DetectedAnomaly } from '../types/telemetry';

// Helper to generate a realistic baseline night telemetry with smooth noise and injected anomaly window
function generateNightReadings(
  baseTemp: number,
  baseHum: number,
  baseDb: number,
  baseEmf: number,
  baseWatts: number,
  anomalyConfig: {
    startMinute: number; // e.g. 314 minutes from 22:00 (which is 03:14)
    durationMinutes: number;
    tempDrop: number;
    dbSpike: number;
    freqHz: number;
    emfPeak: number;
    wattagePeak: number;
    pirRoom: string;
    latchState: 'SECURE' | 'AJAR' | 'UNLATCHED' | 'CYCLING';
  }
): SensorReading[] {
  const readings: SensorReading[] = [];
  const totalMinutes = 420; // 7 hours: 22:00 (10 PM) to 05:00 (5 AM)

  for (let m = 0; m <= totalMinutes; m += 3) {
    const hours = (22 + Math.floor(m / 60)) % 24;
    const mins = m % 60;
    const timestamp = `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:00`;

    // Subtle natural diurnal drift
    const drift = Math.sin((m / totalMinutes) * Math.PI) * 0.4;
    const noise = (Math.random() - 0.5) * 0.15;

    let temp = baseTemp - drift + noise;
    let hum = baseHum + (Math.random() - 0.5) * 0.8;
    let db = baseDb + (Math.random() - 0.5) * 2.0;
    let freq = 45 + (Math.random() - 0.5) * 5; // standard electrical/room hum
    let emf = baseEmf + (Math.random() - 0.5) * 0.05;
    let watts = baseWatts + (Math.random() - 0.5) * 3;
    let pir = false;
    let pirRoom: string | null = null;
    let latch: 'SECURE' | 'AJAR' | 'UNLATCHED' | 'CYCLING' = 'SECURE';

    // Check if within anomaly window
    if (m >= anomalyConfig.startMinute && m <= anomalyConfig.startMinute + anomalyConfig.durationMinutes) {
      const progress = (m - anomalyConfig.startMinute) / anomalyConfig.durationMinutes;
      const bellCurve = Math.sin(progress * Math.PI);

      temp -= anomalyConfig.tempDrop * bellCurve;
      hum += 8.5 * bellCurve;
      db += anomalyConfig.dbSpike * bellCurve;
      freq = anomalyConfig.freqHz;
      emf += anomalyConfig.emfPeak * bellCurve;
      watts += anomalyConfig.wattagePeak * bellCurve;
      pir = true;
      pirRoom = anomalyConfig.pirRoom;
      latch = progress > 0.3 ? anomalyConfig.latchState : 'SECURE';
    }

    readings.push({
      timestamp,
      epochMinutes: m,
      temperatureC: parseFloat(temp.toFixed(2)),
      humidityPct: parseFloat(hum.toFixed(1)),
      acousticDb: parseFloat(db.toFixed(1)),
      acousticFreqHz: parseFloat(freq.toFixed(2)),
      pirMotion: pir,
      pirRoom,
      emfFluxUtd: parseFloat(emf.toFixed(2)),
      powerWattage: Math.max(0, parseFloat(watts.toFixed(1))),
      doorLatchState: latch,
      doorRoom: anomalyConfig.pirRoom
    });
  }

  return readings;
}

// -------------------------------------------------------------------------
// CASE #0317: The Nursery Cold Spot & The Unlatched Lock
// -------------------------------------------------------------------------
const case0317Readings = generateNightReadings(21.4, 46.0, 22.5, 0.28, 18.0, {
  startMinute: 314, // 03:14 AM
  durationMinutes: 18,
  tempDrop: 7.2,    // plunges down to 14.2°C
  dbSpike: 21.0,    // rises to ~43.5 dB
  freqHz: 18.98,    // 18.98Hz Vic Tandy ghost frequency
  emfPeak: 6.8,     // surges from 0.28 to ~7.0 uT
  wattagePeak: 42.0,
  pirRoom: 'Nursery',
  latchState: 'UNLATCHED'
});

const case0317Anomalies: DetectedAnomaly[] = [
  {
    id: 'ano-0317-1',
    timestamp: '03:14:00',
    epochMinutes: 314,
    type: 'THERMAL_COLLAPSE',
    severity: 'CRITICAL',
    room: 'Nursery',
    confidenceScore: 0.982,
    summary: 'Localized thermal collapse of 7.2°C within 180 seconds. HVAC dampers confirmed closed and baseboard heating active.',
    sensorDivergence: [
      { channel: 'Temperature (TH-01)', baseline: '21.4°C', observed: '14.2°C', delta: '-7.2°C' },
      { channel: 'Thermal Rate of Change', baseline: '-0.02°C/hr', observed: '-2.40°C/min', delta: '120x baseline' },
      { channel: 'Relative Humidity', baseline: '46.0%', observed: '54.5%', delta: '+8.5%' }
    ]
  },
  {
    id: 'ano-0317-2',
    timestamp: '03:16:00',
    epochMinutes: 316,
    type: 'PORTAL_CYCLING',
    severity: 'HIGH',
    room: 'Nursery Door',
    confidenceScore: 0.965,
    summary: 'Magnetic deadbolt lock cycled from SECURE to UNLATCHED without authenticated Zigbee key, NFC badge, or manual handle turn.',
    sensorDivergence: [
      { channel: 'Latch Solenoid State', baseline: 'SECURE', observed: 'UNLATCHED', delta: 'Zero-token release' },
      { channel: 'Acoustic Impulse', baseline: '22.5 dB', observed: '43.5 dB', delta: '+21.0 dB' },
      { channel: 'Resonance Frequency', baseline: '50.0 Hz', observed: '18.98 Hz', delta: 'Infrasound band' }
    ]
  },
  {
    id: 'ano-0317-3',
    timestamp: '03:20:00',
    epochMinutes: 320,
    type: 'CONVERGENCE_EVENT',
    severity: 'CRITICAL',
    room: 'Hallway Corridor',
    confidenceScore: 0.994,
    summary: 'Simultaneous triple-vector anomaly: 18.98Hz infrasound wave, 6.8 uT electromagnetic surge, and PIR trip with zero floor vibration.',
    sensorDivergence: [
      { channel: 'EMF Flux (EMF-03)', baseline: '0.28 uT', observed: '7.08 uT', delta: '+2420%' },
      { channel: 'PIR Motion Sensor', baseline: 'IDLE', observed: 'ACTIVE (Pacing)', delta: 'No accelerometer vibration' }
    ]
  }
];

// -------------------------------------------------------------------------
// CASE #0108: The Whispering Circuit & Midnight Ground Surge
// -------------------------------------------------------------------------
const case0108Readings = generateNightReadings(19.8, 52.0, 24.0, 0.15, 12.0, {
  startMinute: 164, // 00:44 AM (164 mins from 22:00)
  durationMinutes: 15,
  tempDrop: 3.4,
  dbSpike: 28.5,
  freqHz: 19.12,
  emfPeak: 14.2,
  wattagePeak: 2380.0, // 2.38 kW phantom load
  pirRoom: 'Basement Gateway',
  latchState: 'CYCLING'
});

const case0108Anomalies: DetectedAnomaly[] = [
  {
    id: 'ano-0108-1',
    timestamp: '00:44:00',
    epochMinutes: 164,
    type: 'GHOST_LOAD_SURGE',
    severity: 'CRITICAL',
    room: 'Basement Gateway',
    confidenceScore: 0.996,
    summary: 'Instantaneous 2,380W phantom wattage surge on Sub-Panel breaker B4, which was physically toggled to OFF at 21:00.',
    sensorDivergence: [
      { channel: 'Circuit Power (POW-02)', baseline: '0.0 W', observed: '2,380.0 W', delta: '+2380W (Breaker OFF)' },
      { channel: 'EMF Induction Flux', baseline: '0.15 uT', observed: '14.35 uT', delta: '+9400%' }
    ]
  },
  {
    id: 'ano-0108-2',
    timestamp: '00:48:00',
    epochMinutes: 168,
    type: 'INFRASOUND_RESONANCE',
    severity: 'HIGH',
    room: 'Basement Gateway',
    confidenceScore: 0.971,
    summary: 'Acoustic microphone captured modulated rhythmic breathing spectrum at 52.5 dB, harmonically pegged to 19.12 Hz.',
    sensorDivergence: [
      { channel: 'Acoustic SPL', baseline: '24.0 dB', observed: '52.5 dB', delta: '+28.5 dB' },
      { channel: 'Audio Peak Freq', baseline: '60.0 Hz', observed: '19.12 Hz', delta: 'Audible infrasound modulation' }
    ]
  }
];

// -------------------------------------------------------------------------
// CASE #0442: The Attic Pacing Telemetry
// -------------------------------------------------------------------------
const case0442Readings = generateNightReadings(20.5, 48.0, 21.0, 0.22, 24.0, {
  startMinute: 372, // 04:12 AM
  durationMinutes: 20,
  tempDrop: 5.6,
  dbSpike: 18.0,
  freqHz: 18.85,
  emfPeak: 9.1,
  wattagePeak: 85.0,
  pirRoom: 'Study / Attic',
  latchState: 'AJAR'
});

const case0442Anomalies: DetectedAnomaly[] = [
  {
    id: 'ano-0442-1',
    timestamp: '04:12:00',
    epochMinutes: 372,
    type: 'PHANTOM_MOTION',
    severity: 'CRITICAL',
    room: 'Study / Attic',
    confidenceScore: 0.988,
    summary: 'Sequential dual-zone PIR motion cascading from East to West at 1.15 m/s human stride velocity, while structural load cells recorded zero mass deflection.',
    sensorDivergence: [
      { channel: 'PIR Motion Cascade', baseline: 'STATIC', observed: 'TRANSIT (1.15 m/s)', delta: 'Human ambulatory pattern' },
      { channel: 'Structural Floor Strain', baseline: '0.00 kN', observed: '0.00 kN', delta: 'Massless entity signature' },
      { channel: 'Thermal Plume', baseline: '20.5°C', observed: '14.9°C', delta: '-5.6°C' }
    ]
  }
];

export const FORENSIC_CASES: ForensicCase[] = [
  {
    id: 'case-0317',
    caseNumber: 'CASE #0317-NIGHT',
    title: 'The Nursery Cold Spot & The Unlatched Deadbolt',
    subtitle: 'Victorian Brownstone (Retrofit Zigbee 3.0 / ESPHome Mesh)',
    location: 'Cambridge, MA — Built 1894, Ren. 2024',
    structureType: 'Three-story timber frame & brick masonry',
    ambientConditions: 'Exterior: -2°C, Calm wind (3 knots), Clear barometer 1018 hPa',
    incidentTimestamp: '03:14:00 AM – 03:32:00 AM',
    description: 'Home automation resident reported waking up to an icy chill and finding the nursery door wide open with the smart lock released. No pet, intruder, or network breach detected on external perimeter cameras.',
    investigatorNotes: 'Multi-sensor logs revealed an extraordinary localized thermal plunge of 7.2°C isolated exclusively to the Nursery, coupled with an 18.98Hz infrasonic acoustic resonance and sudden deadbolt disengagement.',
    floorplan: {
      rooms: [
        { id: 'master', name: 'Master Suite', x: 20, y: 30, width: 200, height: 160, sensorIds: ['TH-01', 'PIR-01'] },
        { id: 'hallway', name: 'Cold Corridor', x: 230, y: 30, width: 80, height: 330, sensorIds: ['PIR-04', 'MIC-02'] },
        { id: 'nursery', name: 'Nursery (Hot Zone)', x: 320, y: 30, width: 190, height: 160, sensorIds: ['TH-02', 'LATCH-07', 'EMF-03'] },
        { id: 'study', name: 'Study & Library', x: 20, y: 200, width: 200, height: 160, sensorIds: ['TH-03', 'PIR-02'] },
        { id: 'basement', name: 'Edge Server Closet', x: 320, y: 200, width: 190, height: 160, sensorIds: ['POW-01', 'TEMP-SRV'] }
      ]
    },
    readings: case0317Readings,
    anomalies: case0317Anomalies
  },
  {
    id: 'case-0108',
    caseNumber: 'CASE #0108-SURGE',
    title: 'The Whispering Circuit & Midnight Ground Surge',
    subtitle: 'Off-Grid Passive Solar Home (Smart Inverter Telemetry)',
    location: 'Blue Ridge Mountains, VA — Built 2021',
    structureType: 'Modern insulated concrete form & timber post',
    ambientConditions: 'Exterior: 4°C, Dense fog, Barometer 1012 hPa',
    incidentTimestamp: '00:44:00 AM – 00:59:00 AM',
    description: 'Inverter monitoring gateway alerted the owner of an anomalous 2.38kW electrical draw occurring on breaker B4, a sub-circuit designated for an unoccupied basement storage space that was switched off at the panel.',
    investigatorNotes: 'Simultaneous acoustic telemetry in the basement recorded distinct low-frequency vocalization envelopes peaking at 52.5 dB, accompanied by severe magnetic flux reaching 14.35 microTesla.',
    floorplan: {
      rooms: [
        { id: 'master', name: 'Living Room', x: 20, y: 30, width: 200, height: 160, sensorIds: ['TH-01', 'PIR-01'] },
        { id: 'hallway', name: 'Central Stairwell', x: 230, y: 30, width: 80, height: 330, sensorIds: ['PIR-04', 'MIC-01'] },
        { id: 'nursery', name: 'Battery Storage', x: 320, y: 30, width: 190, height: 160, sensorIds: ['BAT-01', 'INV-02'] },
        { id: 'study', name: 'Guest Room', x: 20, y: 200, width: 200, height: 160, sensorIds: ['TH-03'] },
        { id: 'basement', name: 'Basement Sub-Panel', x: 320, y: 200, width: 190, height: 160, sensorIds: ['POW-02', 'EMF-03', 'MIC-02'] }
      ]
    },
    readings: case0108Readings,
    anomalies: case0108Anomalies
  },
  {
    id: 'case-0442',
    caseNumber: 'CASE #0442-PACING',
    title: 'The Massless Pacing in the Attic Corridor',
    subtitle: 'Air-Gapped Architectural Residence (Zigbee & Load-Cell Array)',
    location: 'Salem, MA — Built 1912, Restored 2023',
    structureType: 'Two-and-a-half story cedar shingle colonial',
    ambientConditions: 'Exterior: 1°C, Rain squall, Barometer 998 hPa (Low Pressure)',
    incidentTimestamp: '04:12:00 AM – 04:32:00 AM',
    description: 'Sub-floor structural load cells combined with ceiling PIR motion sensors recorded continuous, repetitive pacing back and forth across the finished attic corridor at human stride pace, with zero physical weight registered.',
    investigatorNotes: 'Massless kinetic signature observed for 14 continuous cycles. Thermal imaging recorded a moving column of cold air matching human dimensions, inducing a localized 5.6°C thermal shadow.',
    floorplan: {
      rooms: [
        { id: 'master', name: 'Primary Suite', x: 20, y: 30, width: 200, height: 160, sensorIds: ['TH-01'] },
        { id: 'hallway', name: 'Attic Long Corridor', x: 230, y: 30, width: 80, height: 330, sensorIds: ['PIR-01', 'PIR-02', 'PIR-03'] },
        { id: 'nursery', name: 'West Chamber', x: 320, y: 30, width: 190, height: 160, sensorIds: ['TH-02', 'LOAD-01'] },
        { id: 'study', name: 'Observatory Study', x: 20, y: 200, width: 200, height: 160, sensorIds: ['EMF-01', 'MIC-01'] },
        { id: 'basement', name: 'HVAC Plant', x: 320, y: 200, width: 190, height: 160, sensorIds: ['HVAC-01'] }
      ]
    },
    readings: case0442Readings,
    anomalies: case0442Anomalies
  }
];
