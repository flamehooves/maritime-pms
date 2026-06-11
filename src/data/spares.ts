import type { SparePart } from '../types';

export const spareParts: SparePart[] = [
  {
    id: 'sp1', partNumber: 'MAN-CYL-GK-001', description: 'Cylinder Head Gasket Kit (6S60MC-C)',
    equipmentId: '310.01', equipmentName: 'MAIN ENGINE', system: 'Main Engine System',
    maker: 'MAN B&W', compatibleModel: '6S60MC-C8.2', category: 'Gaskets & Seals',
    qtyOnboard: 2, minStock: 3, reorderLevel: 4, location: 'ER Store, Shelf A-12',
    unit: 'Set', isCritical: true, lastUsed: '2025-01-10', unitCost: 1850
  },
  {
    id: 'sp2', partNumber: 'MAN-PRG-001', description: 'Piston Ring Set (per cylinder)',
    equipmentId: '310.01', equipmentName: 'MAIN ENGINE', system: 'Main Engine System',
    maker: 'MAN B&W', compatibleModel: '6S60MC-C8.2', category: 'Engine Parts',
    qtyOnboard: 6, minStock: 6, reorderLevel: 8, location: 'ER Store, Shelf A-11',
    unit: 'Set', isCritical: true, lastUsed: '2024-07-15', unitCost: 4200
  },
  {
    id: 'sp3', partNumber: 'SHINKO-MS-FP-001', description: 'Mechanical Seal Assembly – Fire Pump',
    equipmentId: '520.01', equipmentName: 'FIRE PUMP NO.1', system: 'Fire & Safety',
    maker: 'Shinko Industries', compatibleModel: 'PH-200L', category: 'Seals & Bearings',
    qtyOnboard: 1, minStock: 2, reorderLevel: 3, location: 'ER Store, Shelf C-04',
    unit: 'Set', isCritical: true, lastUsed: '2025-01-09', unitCost: 680
  },
  {
    id: 'sp4', partNumber: 'MAN-EXH-VLV-001', description: 'Exhaust Valve Spindle (6S60MC-C)',
    equipmentId: '310.01', equipmentName: 'MAIN ENGINE', system: 'Main Engine System',
    maker: 'MAN B&W', compatibleModel: '6S60MC-C8.2', category: 'Engine Parts',
    qtyOnboard: 3, minStock: 6, reorderLevel: 8, location: 'ER Store, Shelf A-10',
    unit: 'PC', isCritical: true, lastUsed: '2025-01-10', unitCost: 2100
  },
  {
    id: 'sp5', partNumber: 'SHINKO-IMP-001', description: 'Centrifugal Pump Impeller – Fire Pump',
    equipmentId: '520.01', equipmentName: 'FIRE PUMP NO.1', system: 'Fire & Safety',
    maker: 'Shinko Industries', compatibleModel: 'PH-200L', category: 'Pump Parts',
    qtyOnboard: 1, minStock: 1, reorderLevel: 2, location: 'ER Store, Shelf C-05',
    unit: 'PC', isCritical: false, lastUsed: '2025-01-09', unitCost: 1200
  },
  {
    id: 'sp6', partNumber: 'ABB-BRG-001', description: 'Turbocharger Bearing Set (A100-L35)',
    equipmentId: '310.01.07', equipmentName: 'TURBOCHARGER', system: 'Main Engine System',
    maker: 'ABB Turbocharging', compatibleModel: 'A100-L35', category: 'Seals & Bearings',
    qtyOnboard: 2, minStock: 2, reorderLevel: 3, location: 'ER Store, Shelf A-15',
    unit: 'Set', isCritical: true, lastUsed: '2024-01-15', unitCost: 3400
  },
  {
    id: 'sp7', partNumber: 'DAI-FLT-001', description: 'Lube Oil Filter Element – Daihatsu 6DL-28',
    equipmentId: '320.01', equipmentName: 'AUX ENGINE NO.1', system: 'Auxiliary Engine System',
    maker: 'Daihatsu', compatibleModel: '6DL-28', category: 'Filter Elements',
    qtyOnboard: 12, minStock: 6, reorderLevel: 9, location: 'ER Store, Shelf B-02',
    unit: 'PC', isCritical: false, lastUsed: '2024-12-01', unitCost: 45
  },
  {
    id: 'sp8', partNumber: 'DAI-FFL-001', description: 'Fuel Filter Element – Daihatsu 6DL-28',
    equipmentId: '320.01', equipmentName: 'AUX ENGINE NO.1', system: 'Auxiliary Engine System',
    maker: 'Daihatsu', compatibleModel: '6DL-28', category: 'Filter Elements',
    qtyOnboard: 8, minStock: 6, reorderLevel: 9, location: 'ER Store, Shelf B-03',
    unit: 'PC', isCritical: false, lastUsed: '2024-12-01', unitCost: 38
  },
  {
    id: 'sp9', partNumber: 'AL-DISC-001', description: 'Alfa Laval Disc Stack – FOPX-610',
    equipmentId: '310.02.03', equipmentName: 'LUBE OIL PURIFIER', system: 'Main Engine System',
    maker: 'Alfa Laval', compatibleModel: 'FOPX-610', category: 'Purifier Parts',
    qtyOnboard: 1, minStock: 1, reorderLevel: 2, location: 'ER Store, Shelf D-01',
    unit: 'Set', isCritical: false, lastUsed: '2024-09-30', unitCost: 2800
  },
  {
    id: 'sp10', partNumber: 'AL-ORNG-001', description: 'O-Ring Set – Alfa Laval FOPX-610',
    equipmentId: '310.02.03', equipmentName: 'LUBE OIL PURIFIER', system: 'Main Engine System',
    maker: 'Alfa Laval', compatibleModel: 'FOPX-610', category: 'Gaskets & Seals',
    qtyOnboard: 4, minStock: 3, reorderLevel: 5, location: 'ER Store, Shelf D-02',
    unit: 'Set', isCritical: false, lastUsed: '2024-09-30', unitCost: 120
  },
  {
    id: 'sp11', partNumber: 'MAN-FIP-NZL-001', description: 'Fuel Injection Nozzle (6S60MC-C)',
    equipmentId: '310.01.08', equipmentName: 'FUEL INJECTION PUMP NO.1', system: 'Main Engine System',
    maker: 'MAN B&W', compatibleModel: '6S60MC-C8.2', category: 'Engine Parts',
    qtyOnboard: 0, minStock: 6, reorderLevel: 8, location: 'ER Store, Shelf A-09',
    unit: 'PC', isCritical: true, lastUsed: '2024-10-20', unitCost: 890
  },
  {
    id: 'sp12', partNumber: 'VPE-FLT-001', description: 'Fuel Filter Kit – Volvo Penta D4-260',
    equipmentId: '520.04', equipmentName: 'LIFEBOAT ENGINE NO.1 (PORT)', system: 'Fire & Safety',
    maker: 'Volvo Penta', compatibleModel: 'D4-260', category: 'Filter Elements',
    qtyOnboard: 4, minStock: 2, reorderLevel: 4, location: 'Safety Store, Shelf E-01',
    unit: 'Kit', isCritical: true, lastUsed: '2024-11-20', unitCost: 65
  },
  {
    id: 'sp13', partNumber: 'VPE-GLOW-001', description: 'Glow Plug Set – Volvo Penta D4-260',
    equipmentId: '520.05', equipmentName: 'LIFEBOAT ENGINE NO.2 (STBD)', system: 'Fire & Safety',
    maker: 'Volvo Penta', compatibleModel: 'D4-260', category: 'Engine Parts',
    qtyOnboard: 1, minStock: 2, reorderLevel: 3, location: 'Safety Store, Shelf E-02',
    unit: 'Set', isCritical: true, lastUsed: '2024-11-20', unitCost: 85
  },
  {
    id: 'sp14', partNumber: 'RR-HPU-SEAL-001', description: 'Hydraulic Cylinder Seal Kit – Steering Gear',
    equipmentId: '430.01', equipmentName: 'STEERING GEAR', system: 'Steering System',
    maker: 'Rolls-Royce Marine', compatibleModel: 'SV-500', category: 'Gaskets & Seals',
    qtyOnboard: 2, minStock: 2, reorderLevel: 3, location: 'ER Store, Shelf F-01',
    unit: 'Kit', isCritical: true, lastUsed: '2024-10-30', unitCost: 940
  },
  {
    id: 'sp15', partNumber: 'TAIKO-IMP-001', description: 'LO Pump Impeller – Taiko PX-200',
    equipmentId: '310.02.01', equipmentName: 'M/E LUBE OIL PUMP', system: 'Main Engine System',
    maker: 'Taiko Kikai', compatibleModel: 'PX-200', category: 'Pump Parts',
    qtyOnboard: 1, minStock: 1, reorderLevel: 2, location: 'ER Store, Shelf A-20',
    unit: 'PC', isCritical: true, lastUsed: '2023-04-10', unitCost: 1650
  },
  {
    id: 'sp16', partNumber: 'STM-BRG-DG1', description: 'Generator Bearing Set – Stamford HCI634K',
    equipmentId: '410.01', equipmentName: 'DIESEL GENERATOR NO.1', system: 'Electrical Power',
    maker: 'Stamford (Cummins)', compatibleModel: 'HCI634K', category: 'Seals & Bearings',
    qtyOnboard: 2, minStock: 2, reorderLevel: 3, location: 'Electrical Store, Shelf G-01',
    unit: 'Set', isCritical: true, lastUsed: '2024-05-10', unitCost: 520
  },
  {
    id: 'sp17', partNumber: 'MAN-CW-PUMP-SEAL', description: 'Cooling Water Pump Seal Kit – M/E',
    equipmentId: '310.01', equipmentName: 'MAIN ENGINE', system: 'Main Engine System',
    maker: 'MAN B&W', compatibleModel: '6S60MC-C8.2', category: 'Gaskets & Seals',
    qtyOnboard: 3, minStock: 2, reorderLevel: 4, location: 'ER Store, Shelf A-13',
    unit: 'Kit', isCritical: false, lastUsed: '2024-03-05', unitCost: 280
  },
  {
    id: 'sp18', partNumber: 'MACKGR-WIRE-CR1', description: 'Crane Wire Rope (25m x 22mm)',
    equipmentId: '610.06', equipmentName: 'CRANE NO.1', system: 'Deck Machinery',
    maker: 'MacGregor', compatibleModel: 'CK-25T', category: 'Deck Equipment',
    qtyOnboard: 1, minStock: 2, reorderLevel: 2, location: 'Deck Store, Fwd',
    unit: 'Coil', isCritical: false, lastUsed: '2024-03-20', unitCost: 1100
  },
  {
    id: 'sp19', partNumber: 'HOCHIKI-DET-001', description: 'Smoke Detector Head – Hochiki',
    equipmentId: '520.07', equipmentName: 'FIRE DETECTION & ALARM SYSTEM', system: 'Fire & Safety',
    maker: 'Hochiki', compatibleModel: 'FIRElink', category: 'Safety Equipment',
    qtyOnboard: 15, minStock: 10, reorderLevel: 15, location: 'Safety Store, Shelf E-10',
    unit: 'PC', isCritical: false, lastUsed: '2024-10-01', unitCost: 35
  },
  {
    id: 'sp20', partNumber: 'FURUNO-TRX-001', description: 'Radar Transceiver Module – FAR-2228',
    equipmentId: '710.01', equipmentName: 'MAIN RADAR (X-BAND)', system: 'Bridge Equipment',
    maker: 'Furuno', compatibleModel: 'FAR-2228', category: 'Navigation Parts',
    qtyOnboard: 0, minStock: 1, reorderLevel: 1, location: 'Bridge Store',
    unit: 'PC', isCritical: true, lastUsed: '2022-09-05', unitCost: 8500
  },
  {
    id: 'sp21', partNumber: 'MAN-CVJ-001', description: 'Crosshead Journal Bearing (6S60MC-C)',
    equipmentId: '310.01', equipmentName: 'MAIN ENGINE', system: 'Main Engine System',
    maker: 'MAN B&W', compatibleModel: '6S60MC-C8.2', category: 'Seals & Bearings',
    qtyOnboard: 2, minStock: 2, reorderLevel: 3, location: 'ER Store, Shelf A-08',
    unit: 'PC', isCritical: true, lastUsed: '2022-11-20', unitCost: 12500
  },
  {
    id: 'sp22', partNumber: 'DAI-INJ-001', description: 'Fuel Injector – Daihatsu 6DL-28',
    equipmentId: '320.01', equipmentName: 'AUX ENGINE NO.1', system: 'Auxiliary Engine System',
    maker: 'Daihatsu', compatibleModel: '6DL-28', category: 'Engine Parts',
    qtyOnboard: 6, minStock: 6, reorderLevel: 9, location: 'ER Store, Shelf B-06',
    unit: 'PC', isCritical: false, lastUsed: '2024-11-25', unitCost: 420
  },
  {
    id: 'sp23', partNumber: 'CATC9-SPK-001', description: 'Spark Plug – Caterpillar C9.3',
    equipmentId: '410.04', equipmentName: 'EMERGENCY GENERATOR', system: 'Electrical Power',
    maker: 'Caterpillar', compatibleModel: 'C9.3 ACERT', category: 'Engine Parts',
    qtyOnboard: 4, minStock: 4, reorderLevel: 6, location: 'Electrical Store, Shelf G-05',
    unit: 'PC', isCritical: true, lastUsed: '2024-12-15', unitCost: 28
  },
  {
    id: 'sp24', partNumber: 'AL-BOWL-SEAL-001', description: 'Purifier Bowl Seal Kit – FOPX-610',
    equipmentId: '310.03.03', equipmentName: 'FUEL OIL PURIFIER', system: 'Main Engine System',
    maker: 'Alfa Laval', compatibleModel: 'FOPX-610', category: 'Gaskets & Seals',
    qtyOnboard: 2, minStock: 2, reorderLevel: 3, location: 'ER Store, Shelf D-03',
    unit: 'Kit', isCritical: false, lastUsed: '2024-10-04', unitCost: 195
  },
  {
    id: 'sp25', partNumber: 'SAILOR-BAT-001', description: 'GMDSS Battery – Sailor 6222 (12V/100Ah)',
    equipmentId: '710.05', equipmentName: 'GMDSS CONSOLE', system: 'Bridge Equipment',
    maker: 'Sailor (Cobham)', compatibleModel: '6222 VHF', category: 'Electrical Parts',
    qtyOnboard: 2, minStock: 2, reorderLevel: 3, location: 'Bridge Store, Battery Locker',
    unit: 'PC', isCritical: true, lastUsed: '2025-01-08', unitCost: 180
  },
];

export const getSparesByEquipment = (equipmentId: string) =>
  spareParts.filter(sp => sp.equipmentId === equipmentId);

export const getLowStockSpares = () =>
  spareParts.filter(sp => sp.qtyOnboard <= sp.minStock);
