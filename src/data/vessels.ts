import type { Vessel } from '../types';

export const vessels: Vessel[] = [
  {
    id: 'v1', name: 'MAHAKALI', imo: '9876543', type: 'Bulk Carrier',
    flag: 'Panama', buildYear: 2015, owner: 'Mahakali Shipping Ltd',
    manager: 'Pacific Marine Management', status: 'active', classSociety: "Lloyd's Register",
    dwt: 82000, grt: 45000, callSign: 'HPKM9', port: 'Singapore'
  },
  {
    id: 'v2', name: 'SEALION SPIRIT', imo: '9765432', type: 'Container Vessel',
    flag: 'Marshall Islands', buildYear: 2018, owner: 'Sealion Maritime Inc',
    manager: 'Pacific Marine Management', status: 'active', classSociety: 'DNV',
    dwt: 35000, grt: 28000, callSign: 'V7MR4', port: 'Hong Kong'
  },
  {
    id: 'v3', name: 'PACIFIC TRADER', imo: '9654321', type: 'General Cargo',
    flag: 'Singapore', buildYear: 2012, owner: 'Pacific Traders Inc',
    manager: 'Pacific Marine Management', status: 'active', classSociety: 'Bureau Veritas',
    dwt: 18000, grt: 12000, callSign: '9VTR2', port: 'Port Klang'
  },
  {
    id: 'v4', name: 'NORTHERN STAR', imo: '9543210', type: 'Chemical Tanker',
    flag: 'Bahamas', buildYear: 2019, owner: 'Northern Star Tankers Ltd',
    manager: 'Pacific Marine Management', status: 'active', classSociety: 'ABS',
    dwt: 25000, grt: 15000, callSign: 'C6RS7', port: 'Rotterdam'
  },
  {
    id: 'v5', name: 'OCEAN PRIDE', imo: '9432109', type: 'Bulk Carrier',
    flag: 'Hong Kong', buildYear: 2016, owner: 'Ocean Pride Shipping Ltd',
    manager: 'Global Fleet Services', status: 'active', classSociety: 'ClassNK',
    dwt: 76000, grt: 41000, callSign: 'VRXP8', port: 'Tianjin'
  },
  {
    id: 'v6', name: 'ATLAS VOYAGER', imo: '9321098', type: 'LPG Carrier',
    flag: 'Greece', buildYear: 2020, owner: 'Atlas Gas Carriers',
    manager: 'Pacific Marine Management', status: 'active', classSociety: "Lloyd's Register",
    dwt: 42000, grt: 31000, callSign: 'SVAT2', port: 'Piraeus'
  },
  {
    id: 'v7', name: 'MERIDIAN QUEEN', imo: '9210987', type: 'Bulk Carrier',
    flag: 'Liberia', buildYear: 2014, owner: 'Meridian Shipping Corp',
    manager: 'Global Fleet Services', status: 'active', classSociety: 'ABS',
    dwt: 93000, grt: 51000, callSign: 'A8QM3', port: 'Mumbai'
  },
  {
    id: 'v8', name: 'CORAL WAVE', imo: '9109876', type: 'Product Tanker',
    flag: 'Cyprus', buildYear: 2017, owner: 'Coral Marine Ltd',
    manager: 'Pacific Marine Management', status: 'active', classSociety: 'DNV',
    dwt: 47000, grt: 27000, callSign: '5BCW6', port: 'Limassol'
  },
  {
    id: 'v9', name: 'IRONGATE PIONEER', imo: '9098765', type: 'OBO Carrier',
    flag: 'Singapore', buildYear: 2011, owner: 'Irongate Shipping Pte',
    manager: 'Pacific Marine Management', status: 'drydock', classSociety: 'Bureau Veritas',
    dwt: 68000, grt: 38000, callSign: '9VIP5', port: 'Sembawang Drydock'
  },
  {
    id: 'v10', name: 'STELLAR MARINER', imo: '8987654', type: 'Container Vessel',
    flag: 'Marshall Islands', buildYear: 2013, owner: 'Stellar Line Ltd',
    manager: 'Global Fleet Services', status: 'active', classSociety: 'ClassNK',
    dwt: 52000, grt: 44000, callSign: 'V7SM1', port: 'Shanghai'
  },
  {
    id: 'v11', name: 'SAPPHIRE COAST', imo: '8876543', type: 'Ro-Ro Vessel',
    flag: 'Cyprus', buildYear: 2021, owner: 'Sapphire Ferries Ltd',
    manager: 'Pacific Marine Management', status: 'active', classSociety: 'RINA',
    dwt: 28000, grt: 35000, callSign: '5BSC4', port: 'Piraeus'
  },
  {
    id: 'v12', name: 'DELTA SPIRIT', imo: '8765432', type: 'General Cargo',
    flag: 'Panama', buildYear: 2009, owner: 'Delta Cargo Lines',
    manager: 'Global Fleet Services', status: 'inactive', classSociety: 'Bureau Veritas',
    dwt: 14000, grt: 9000, callSign: 'HPD57', port: 'Laid Up - Batam'
  },
];

export const getVesselById = (id: string) => vessels.find(v => v.id === id);
