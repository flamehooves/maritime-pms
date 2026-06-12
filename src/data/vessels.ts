import type { Vessel } from '../types';

export const vessels: Vessel[] = [
  {
    id: 'v0', name: 'AURORA PRINCESS', imo: '9912345', type: 'Cruise Ship',
    flag: 'Bahamas', buildYear: 2019, owner: 'Pacific Cruise Lines Ltd',
    manager: 'Pacific Marine Management', status: 'active', classSociety: "Lloyd's Register",
    dwt: 12000, grt: 168000, callSign: 'C6AP1', port: 'Nassau',
    vesselStatus: 'at_sea', mapPosition: { x: 29, y: 38 },  // Caribbean Sea (24°W, 18°N)
  },
  {
    id: 'v1', name: 'MAHAKALI', imo: '9876543', type: 'Bulk Carrier',
    flag: 'Panama', buildYear: 2015, owner: 'Mahakali Shipping Ltd',
    manager: 'Pacific Marine Management', status: 'active', classSociety: "Lloyd's Register",
    dwt: 82000, grt: 45000, callSign: 'HPKM9', port: 'Singapore',
    vesselStatus: 'in_port', mapPosition: { x: 79, y: 49 },  // Singapore Strait (104°E, 1°N)
  },
  {
    id: 'v2', name: 'SEALION SPIRIT', imo: '9765432', type: 'Container Vessel',
    flag: 'Marshall Islands', buildYear: 2018, owner: 'Sealion Maritime Inc',
    manager: 'Pacific Marine Management', status: 'active', classSociety: 'DNV',
    dwt: 35000, grt: 28000, callSign: 'V7MR4', port: 'Hong Kong',
    vesselStatus: 'at_sea', mapPosition: { x: 82, y: 43 },  // South China Sea (115°E, 13°N)
  },
  {
    id: 'v3', name: 'PACIFIC TRADER', imo: '9654321', type: 'General Cargo',
    flag: 'Singapore', buildYear: 2012, owner: 'Pacific Traders Inc',
    manager: 'Pacific Marine Management', status: 'active', classSociety: 'Bureau Veritas',
    dwt: 18000, grt: 12000, callSign: '9VTR2', port: 'Port Klang',
    vesselStatus: 'at_sea', mapPosition: { x: 72, y: 55 },  // Indian Ocean (79°E, 9°S)
  },
  {
    id: 'v4', name: 'NORTHERN STAR', imo: '9543210', type: 'Chemical Tanker',
    flag: 'Bahamas', buildYear: 2019, owner: 'Northern Star Tankers Ltd',
    manager: 'Pacific Marine Management', status: 'active', classSociety: 'ABS',
    dwt: 25000, grt: 15000, callSign: 'C6RS7', port: 'Rotterdam',
    vesselStatus: 'in_port', mapPosition: { x: 51, y: 19 },  // North Sea (4°E, 56°N)
  },
  {
    id: 'v5', name: 'OCEAN PRIDE', imo: '9432109', type: 'Bulk Carrier',
    flag: 'Hong Kong', buildYear: 2016, owner: 'Ocean Pride Shipping Ltd',
    manager: 'Global Fleet Services', status: 'active', classSociety: 'ClassNK',
    dwt: 76000, grt: 41000, callSign: 'VRXP8', port: 'Tianjin',
    vesselStatus: 'at_sea', mapPosition: { x: 85, y: 34 },  // East China Sea (126°E, 29°N)
  },
  {
    id: 'v6', name: 'ATLAS VOYAGER', imo: '9321098', type: 'LPG Carrier',
    flag: 'Greece', buildYear: 2020, owner: 'Atlas Gas Carriers',
    manager: 'Pacific Marine Management', status: 'active', classSociety: "Lloyd's Register",
    dwt: 42000, grt: 31000, callSign: 'SVAT2', port: 'Piraeus',
    vesselStatus: 'in_maintenance', mapPosition: { x: 56, y: 30 },  // Ionian Sea (22°E, 36°N)
  },
  {
    id: 'v7', name: 'MERIDIAN QUEEN', imo: '9210987', type: 'Bulk Carrier',
    flag: 'Liberia', buildYear: 2014, owner: 'Meridian Shipping Corp',
    manager: 'Global Fleet Services', status: 'active', classSociety: 'ABS',
    dwt: 93000, grt: 51000, callSign: 'A8QM3', port: 'Mumbai',
    vesselStatus: 'in_port', mapPosition: { x: 68, y: 43 },  // Arabian Sea (65°E, 13°N)
  },
  {
    id: 'v8', name: 'CORAL WAVE', imo: '9109876', type: 'Product Tanker',
    flag: 'Cyprus', buildYear: 2017, owner: 'Coral Marine Ltd',
    manager: 'Pacific Marine Management', status: 'active', classSociety: 'DNV',
    dwt: 47000, grt: 27000, callSign: '5BCW6', port: 'Limassol',
    vesselStatus: 'at_sea', mapPosition: { x: 63, y: 43 },  // Gulf of Aden (47°E, 13°N)
  },
  {
    id: 'v9', name: 'IRONGATE PIONEER', imo: '9098765', type: 'OBO Carrier',
    flag: 'Singapore', buildYear: 2011, owner: 'Irongate Shipping Pte',
    manager: 'Pacific Marine Management', status: 'drydock', classSociety: 'Bureau Veritas',
    dwt: 68000, grt: 38000, callSign: '9VIP5', port: 'Sembawang Drydock',
    vesselStatus: 'drydock', mapPosition: { x: 78, y: 51 },  // Malacca Strait (101°E, 1°S)
  },
  {
    id: 'v10', name: 'STELLAR MARINER', imo: '8987654', type: 'Container Vessel',
    flag: 'Marshall Islands', buildYear: 2013, owner: 'Stellar Line Ltd',
    manager: 'Global Fleet Services', status: 'active', classSociety: 'ClassNK',
    dwt: 52000, grt: 44000, callSign: 'V7SM1', port: 'Shanghai',
    vesselStatus: 'at_sea', mapPosition: { x: 88, y: 43 },  // Philippine Sea (137°E, 13°N)
  },
  {
    id: 'v11', name: 'SAPPHIRE COAST', imo: '8876543', type: 'Ro-Ro Vessel',
    flag: 'Cyprus', buildYear: 2021, owner: 'Sapphire Ferries Ltd',
    manager: 'Pacific Marine Management', status: 'active', classSociety: 'RINA',
    dwt: 28000, grt: 35000, callSign: '5BSC4', port: 'Piraeus',
    vesselStatus: 'in_port', mapPosition: { x: 57, y: 29 },  // Aegean Sea (25°E, 38°N)
  },
  {
    id: 'v12', name: 'DELTA SPIRIT', imo: '8765432', type: 'General Cargo',
    flag: 'Panama', buildYear: 2009, owner: 'Delta Cargo Lines',
    manager: 'Global Fleet Services', status: 'inactive', classSociety: 'Bureau Veritas',
    dwt: 14000, grt: 9000, callSign: 'HPD57', port: 'Laid Up - Batam',
    vesselStatus: 'drydock', mapPosition: { x: 80, y: 52 },  // Java Sea (108°E, 2°S)
  },
];

export const getVesselById = (id: string) => vessels.find(v => v.id === id);
