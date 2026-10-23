/**
 * streetsData.js
 * 24-Street sequential radial pipeline topology for Namma Bengaluru (Indiranagar / BWSSB Zone 7).
 * Master Borewell Node located at 12.9716° N, 77.6412° E (Indiranagar Water Supply Booster Station).
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
      [BASE_LAT, BASE_LNG],
      [BASE_LAT + 0.0012, BASE_LNG + 0.0008]
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
      [BASE_LAT, BASE_LNG],
      [BASE_LAT + 0.0016, BASE_LNG + 0.0014]
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
      [BASE_LAT, BASE_LNG],
      [BASE_LAT + 0.0021, BASE_LNG + 0.0019]
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
      [BASE_LAT, BASE_LNG],
      [BASE_LAT + 0.0026, BASE_LNG + 0.0024]
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
      [BASE_LAT, BASE_LNG],
      [BASE_LAT + 0.0030, BASE_LNG + 0.0028]
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
      [BASE_LAT, BASE_LNG],
      [BASE_LAT + 0.0034, BASE_LNG + 0.0032]
    ]
  },
  {
    id: 7,
    name: '12th Main Road, HAL 2nd Stage (CRITICAL LEAK)',
    material: 'Ductile Iron',
    lengthMeters: 80,
    pressure: 16, // Severe pressure drop due to rupture
    flowRate: 590, // Anomalous burst flow
    valveAOpen: true,
    valveBOpen: true,
    isDepressurized: true,
    geoCoordinates: [
      [BASE_LAT, BASE_LNG],
      [BASE_LAT + 0.0038, BASE_LNG + 0.0036]
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
      [BASE_LAT, BASE_LNG],
      [BASE_LAT + 0.0042, BASE_LNG + 0.0031]
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
      [BASE_LAT, BASE_LNG],
      [BASE_LAT + 0.0044, BASE_LNG + 0.0022]
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
      [BASE_LAT, BASE_LNG],
      [BASE_LAT + 0.0048, BASE_LNG + 0.0015]
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
      [BASE_LAT, BASE_LNG],
      [BASE_LAT + 0.0049, BASE_LNG + 0.0006]
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
      [BASE_LAT, BASE_LNG],
      [BASE_LAT + 0.0046, BASE_LNG - 0.0005]
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
      [BASE_LAT, BASE_LNG],
      [BASE_LAT + 0.0040, BASE_LNG - 0.0016]
    ]
  },
  {
    id: 14,
    name: '14th Main Road, HAL 3rd Stage',
    material: 'Ductile Iron',
    lengthMeters: 85,
    pressure: 50,
    flowRate: 340,
    valveAOpen: true,
    valveBOpen: true,
    isDepressurized: false,
    geoCoordinates: [
      [BASE_LAT, BASE_LNG],
      [BASE_LAT + 0.0033, BASE_LNG - 0.0025]
    ]
  },
  {
    id: 15,
    name: 'Appareddy Palya Pipeline',
    material: 'uPVC',
    lengthMeters: 65,
    pressure: 46,
    flowRate: 220,
    valveAOpen: true,
    valveBOpen: true,
    isDepressurized: false,
    geoCoordinates: [
      [BASE_LAT, BASE_LNG],
      [BASE_LAT + 0.0024, BASE_LNG - 0.0032]
    ]
  },
  {
    id: 16,
    name: 'Old Airport Road Link Line',
    material: 'Mild Steel',
    lengthMeters: 115,
    pressure: 52,
    flowRate: 510,
    valveAOpen: true,
    valveBOpen: true,
    isDepressurized: false,
    geoCoordinates: [
      [BASE_LAT, BASE_LNG],
      [BASE_LAT + 0.0014, BASE_LNG - 0.0038]
    ]
  },
  {
    id: 17,
    name: 'Domlur Flyover Feeder',
    material: 'Ductile Iron',
    lengthMeters: 90,
    pressure: 51,
    flowRate: 380,
    valveAOpen: true,
    valveBOpen: true,
    isDepressurized: false,
    geoCoordinates: [
      [BASE_LAT, BASE_LNG],
      [BASE_LAT + 0.0003, BASE_LNG - 0.0042]
    ]
  },
  {
    id: 18,
    name: 'Kodihalli Main Pipeline',
    material: 'Ductile Iron',
    lengthMeters: 80,
    pressure: 48,
    flowRate: 320,
    valveAOpen: true,
    valveBOpen: true,
    isDepressurized: false,
    geoCoordinates: [
      [BASE_LAT, BASE_LNG],
      [BASE_LAT - 0.0008, BASE_LNG - 0.0041]
    ]
  },
  {
    id: 19,
    name: 'Cambridge Layout Branch',
    material: 'Cast Iron',
    lengthMeters: 85,
    pressure: 49,
    flowRate: 330,
    valveAOpen: true,
    valveBOpen: true,
    isDepressurized: false,
    geoCoordinates: [
      [BASE_LAT, BASE_LNG],
      [BASE_LAT - 0.0019, BASE_LNG - 0.0036]
    ]
  },
  {
    id: 20,
    name: 'Ulsoor Lake Secondary Inflow',
    material: 'Mild Steel',
    lengthMeters: 105,
    pressure: 50,
    flowRate: 460,
    valveAOpen: true,
    valveBOpen: true,
    isDepressurized: false,
    geoCoordinates: [
      [BASE_LAT, BASE_LNG],
      [BASE_LAT - 0.0028, BASE_LNG - 0.0028]
    ]
  },
  {
    id: 21,
    name: 'Murphy Town Water Trunk',
    material: 'Ductile Iron',
    lengthMeters: 75,
    pressure: 48,
    flowRate: 290,
    valveAOpen: true,
    valveBOpen: true,
    isDepressurized: false,
    geoCoordinates: [
      [BASE_LAT, BASE_LNG],
      [BASE_LAT - 0.0034, BASE_LNG - 0.0018]
    ]
  },
  {
    id: 22,
    name: 'Jogupalya Pipeline',
    material: 'uPVC',
    lengthMeters: 60,
    pressure: 47,
    flowRate: 210,
    valveAOpen: true,
    valveBOpen: true,
    isDepressurized: false,
    geoCoordinates: [
      [BASE_LAT, BASE_LNG],
      [BASE_LAT - 0.0038, BASE_LNG - 0.0007]
    ]
  },
  {
    id: 23,
    name: 'Someshwarpura Link',
    material: 'Ductile Iron',
    lengthMeters: 70,
    pressure: 49,
    flowRate: 280,
    valveAOpen: true,
    valveBOpen: true,
    isDepressurized: false,
    geoCoordinates: [
      [BASE_LAT, BASE_LNG],
      [BASE_LAT - 0.0039, BASE_LNG + 0.0004]
    ]
  },
  {
    id: 24,
    name: 'Trinity Circle Peripheral Branch',
    material: 'Mild Steel',
    lengthMeters: 95,
    pressure: 50,
    flowRate: 410,
    valveAOpen: true,
    valveBOpen: true,
    isDepressurized: false,
    geoCoordinates: [
      [BASE_LAT, BASE_LNG],
      [BASE_LAT - 0.0037, BASE_LNG + 0.0016]
    ]
  }
];
