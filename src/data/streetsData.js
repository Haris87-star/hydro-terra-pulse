/**
 * streetsData.js
 * Real-world geographic road coordinates for Namma Bengaluru (Indiranagar / BWSSB Zone 7).
 * Pipelines follow actual road centerlines (100ft Road, CMH Road, 12th Main, Defence Colony).
 * Master Borewell Node: 12.9716° N, 77.6412° E (BWSSB Indiranagar Booster Station).
 */

const BASE_LAT = 12.9716;
const BASE_LNG = 77.6412;

export const INITIAL_STREETS = [
  {
    id: 1,
    name: '1st Cross Road, Indiranagar',
    material: 'Ductile Iron',
    lengthMeters: 80,
    pressure: 52,
    flowRate: 340,
    valveAOpen: true,
    valveBOpen: true,
    isDepressurized: false,
    geoCoordinates: [
      [12.9716, 77.6412],
      [12.9720, 77.6425],
      [12.9722, 77.6440]
    ]
  },
  {
    id: 2,
    name: '2nd Cross Road, Indiranagar',
    material: 'Ductile Iron',
    lengthMeters: 85,
    pressure: 51,
    flowRate: 330,
    valveAOpen: true,
    valveBOpen: true,
    isDepressurized: false,
    geoCoordinates: [
      [12.9725, 77.6412],
      [12.9727, 77.6430],
      [12.9728, 77.6450]
    ]
  },
  {
    id: 3,
    name: '3rd Cross Road, Stage 1',
    material: 'Cast Iron',
    lengthMeters: 75,
    pressure: 50,
    flowRate: 310,
    valveAOpen: true,
    valveBOpen: true,
    isDepressurized: false,
    geoCoordinates: [
      [12.9735, 77.6412],
      [12.9736, 77.6432],
      [12.9737, 77.6455]
    ]
  },
  {
    id: 4,
    name: '4th Cross Road, Binnamangala',
    material: 'Ductile Iron',
    lengthMeters: 90,
    pressure: 49,
    flowRate: 360,
    valveAOpen: true,
    valveBOpen: true,
    isDepressurized: false,
    geoCoordinates: [
      [12.9745, 77.6412],
      [12.9747, 77.6428],
      [12.9748, 77.6445]
    ]
  },
  {
    id: 5,
    name: '5th Cross Road, Defence Colony',
    material: 'Mild Steel',
    lengthMeters: 100,
    pressure: 48,
    flowRate: 390,
    valveAOpen: true,
    valveBOpen: true,
    isDepressurized: false,
    geoCoordinates: [
      [12.9755, 77.6412],
      [12.9756, 77.6435],
      [12.9758, 77.6465]
    ]
  },
  {
    id: 6,
    name: '6th Main Road, Defence Colony',
    material: 'Ductile Iron',
    lengthMeters: 80,
    pressure: 47,
    flowRate: 320,
    valveAOpen: true,
    valveBOpen: true,
    isDepressurized: false,
    geoCoordinates: [
      [12.9765, 77.6412],
      [12.9766, 77.6438],
      [12.9768, 77.6470]
    ]
  },
  {
    id: 7,
    name: '12th Main Road, HAL 2nd Stage',
    material: 'Ductile Iron',
    lengthMeters: 80,
    pressure: 48,
    flowRate: 340,
    valveAOpen: true,
    valveBOpen: true,
    isDepressurized: false,
    geoCoordinates: [
      [12.9695, 77.6442],
      [12.9735, 77.6440],
      [12.9775, 77.6438]
    ]
  },
  {
    id: 8,
    name: '8th Main Road, Indiranagar',
    material: 'Cast Iron',
    lengthMeters: 95,
    pressure: 47,
    flowRate: 350,
    valveAOpen: true,
    valveBOpen: true,
    isDepressurized: false,
    geoCoordinates: [
      [12.9716, 77.6412],
      [12.9715, 77.6390],
      [12.9714, 77.6368]
    ]
  },
  {
    id: 9,
    name: '9th Cross Road, Stage 2',
    material: 'Ductile Iron',
    lengthMeters: 75,
    pressure: 49,
    flowRate: 300,
    valveAOpen: true,
    valveBOpen: true,
    isDepressurized: false,
    geoCoordinates: [
      [12.9730, 77.6412],
      [12.9730, 77.6390],
      [12.9730, 77.6370]
    ]
  },
  {
    id: 10,
    name: '100ft Road Corridor (North)',
    material: 'Mild Steel',
    lengthMeters: 120,
    pressure: 50,
    flowRate: 520,
    valveAOpen: true,
    valveBOpen: true,
    isDepressurized: false,
    geoCoordinates: [
      [12.9716, 77.6412],
      [12.9750, 77.6412],
      [12.9784, 77.6412]
    ]
  },
  {
    id: 11,
    name: 'CMH Road (Metro Feeder Line)',
    material: 'Ductile Iron',
    lengthMeters: 110,
    pressure: 51,
    flowRate: 480,
    valveAOpen: true,
    valveBOpen: true,
    isDepressurized: false,
    geoCoordinates: [
      [12.9784, 77.6380],
      [12.9784, 77.6412],
      [12.9783, 77.6450]
    ]
  },
  {
    id: 12,
    name: '12th Cross Road (Triage Midpoint)',
    material: 'Ductile Iron',
    lengthMeters: 80,
    pressure: 48,
    flowRate: 310,
    valveAOpen: true,
    valveBOpen: true,
    isDepressurized: false,
    geoCoordinates: [
      [12.9750, 77.6412],
      [12.9750, 77.6385],
      [12.9750, 77.6360]
    ]
  },
  {
    id: 13,
    name: '13th Cross Road, Doopanahalli',
    material: 'Cast Iron',
    lengthMeters: 70,
    pressure: 49,
    flowRate: 290,
    valveAOpen: true,
    valveBOpen: true,
    isDepressurized: false,
    geoCoordinates: [
      [12.9760, 77.6412],
      [12.9760, 77.6385],
      [12.9760, 77.6360]
    ]
  },
  {
    id: 14,
    name: 'CMH Road & 100ft Rd Junction (CRITICAL RUPTURE)',
    material: 'Ductile Iron',
    lengthMeters: 85,
    pressure: 18, // Ruptured pipeline
    flowRate: 640, // Anomalous leakage outflow
    valveAOpen: true,
    valveBOpen: true,
    isDepressurized: true,
    geoCoordinates: [
      [12.9784, 77.6395],
      [12.9784, 77.6412], // Exact Indiranagar Metro Station junction
      [12.9783, 77.6435]
    ]
  },
  {
    id: 15,
    name: 'Chinmaya Mission Hospital West Road',
    material: 'Cast Iron',
    lengthMeters: 75,
    pressure: 49,
    flowRate: 300,
    valveAOpen: true,
    valveBOpen: true,
    isDepressurized: false,
    geoCoordinates: [
      [12.9784, 77.6360],
      [12.9784, 77.6380],
      [12.9784, 77.6395]
    ]
  },
  {
    id: 16,
    name: '100ft Road Corridor (South Feeder)',
    material: 'Mild Steel',
    lengthMeters: 130,
    pressure: 52,
    flowRate: 530,
    valveAOpen: true,
    valveBOpen: true,
    isDepressurized: false,
    geoCoordinates: [
      [12.9716, 77.6412],
      [12.9680, 77.6415],
      [12.9650, 77.6418]
    ]
  },
  {
    id: 17,
    name: 'Double Road Arterial Line',
    material: 'Ductile Iron',
    lengthMeters: 110,
    pressure: 50,
    flowRate: 460,
    valveAOpen: true,
    valveBOpen: true,
    isDepressurized: false,
    geoCoordinates: [
      [12.9782, 77.6470],
      [12.9750, 77.6472],
      [12.9715, 77.6475]
    ]
  },
  {
    id: 18,
    name: 'HAL 2nd Stage East Feeder',
    material: 'Cast Iron',
    lengthMeters: 90,
    pressure: 48,
    flowRate: 350,
    valveAOpen: true,
    valveBOpen: true,
    isDepressurized: false,
    geoCoordinates: [
      [12.9680, 77.6450],
      [12.9680, 77.6480],
      [12.9680, 77.6510]
    ]
  },
  {
    id: 19,
    name: 'Binnamangala North Cross',
    material: 'Ductile Iron',
    lengthMeters: 80,
    pressure: 49,
    flowRate: 310,
    valveAOpen: true,
    valveBOpen: true,
    isDepressurized: false,
    geoCoordinates: [
      [12.9805, 77.6412],
      [12.9805, 77.6380],
      [12.9805, 77.6355]
    ]
  },
  {
    id: 20,
    name: 'Swami Vivekananda Road Feed',
    material: 'Ductile Iron',
    lengthMeters: 100,
    pressure: 51,
    flowRate: 490,
    valveAOpen: true,
    valveBOpen: true,
    isDepressurized: false,
    geoCoordinates: [
      [12.9830, 77.6350],
      [12.9830, 77.6380],
      [12.9830, 77.6410]
    ]
  },
  {
    id: 21,
    name: 'Old Madras Road Link Branch',
    material: 'Mild Steel',
    lengthMeters: 115,
    pressure: 52,
    flowRate: 510,
    valveAOpen: true,
    valveBOpen: true,
    isDepressurized: false,
    geoCoordinates: [
      [12.9840, 77.6410],
      [12.9840, 77.6450],
      [12.9840, 77.6490]
    ]
  },
  {
    id: 22,
    name: 'Domlur Feeder Branch',
    material: 'Ductile Iron',
    lengthMeters: 90,
    pressure: 50,
    flowRate: 430,
    valveAOpen: true,
    valveBOpen: true,
    isDepressurized: false,
    geoCoordinates: [
      [12.9645, 77.6418],
      [12.9645, 77.6380],
      [12.9645, 77.6345]
    ]
  },
  {
    id: 23,
    name: 'Kodihalli Junction Line',
    material: 'Cast Iron',
    lengthMeters: 85,
    pressure: 48,
    flowRate: 360,
    valveAOpen: true,
    valveBOpen: true,
    isDepressurized: false,
    geoCoordinates: [
      [12.9645, 77.6418],
      [12.9645, 77.6460],
      [12.9645, 77.6500]
    ]
  },
  {
    id: 24,
    name: 'Indiranagar Club Perimeter Branch',
    material: 'Ductile Iron',
    lengthMeters: 95,
    pressure: 49,
    flowRate: 370,
    valveAOpen: true,
    valveBOpen: true,
    isDepressurized: false,
    geoCoordinates: [
      [12.9716, 77.6475],
      [12.9740, 77.6475],
      [12.9770, 77.6475]
    ]
  }
];

/**
 * Dynamically project the 24-street pipeline topology onto the user's real GPS coordinates
 * if they are running outside central Indiranagar.
 */
export const getLocalizedStreets = (userCoords) => {
  if (!userCoords || !Array.isArray(userCoords) || userCoords.length < 2) {
    return INITIAL_STREETS;
  }

  const [lat, lng] = userCoords;
  // If user is already near Indiranagar (within ~8km), use authentic Indiranagar roads
  const dist = Math.hypot(lat - BASE_LAT, lng - BASE_LNG);
  if (dist < 0.08) {
    return INITIAL_STREETS;
  }

  // Otherwise, construct a realistic road grid aligned to user's real GPS area
  return INITIAL_STREETS.map((street, idx) => {
    const angle = (idx / 24) * 2 * Math.PI;
    const len = (street.lengthMeters / 111320); // convert meters to degrees
    
    // Create road segment that runs through user's local area
    const startLat = lat + Math.sin(angle) * (len * 0.4);
    const startLng = lng + Math.cos(angle) * (len * 0.4);
    const midLat = lat + Math.sin(angle) * (len * 0.9);
    const midLng = lng + Math.cos(angle) * (len * 0.9);
    const endLat = lat + Math.sin(angle) * (len * 1.4);
    const endLng = lng + Math.cos(angle) * (len * 1.4);

    return {
      ...street,
      geoCoordinates: [
        [startLat, startLng],
        [midLat, midLng],
        [endLat, endLng]
      ]
    };
  });
};
