import type { Equipment } from '../types';

export const equipmentTree: Equipment[] = [
  {
    id: 'root', code: '#A', name: 'EQUIPMENT', isGroup: true,
    children: [
      {
        id: '230', code: '#230', name: 'TANKS GENERAL', isGroup: true,
        children: [
          {
            id: '230.01', code: '#230.01', name: 'WATER BALLAST TANKS', isGroup: true,
            children: [
              { id: '230.01.01', code: '230.01.01', name: 'FORE PEAK TANK', maker: 'N/A', model: 'N/A', serial: 'FPT-001', criticality: 'high', status: 'operational', location: 'Forward, Frame 180-204', lastMaintenance: '2024-11-15', nextDue: '2025-05-15', responsibleRank: 'Chief Officer', system: 'Tanks General', type: 'Ballast Tank', description: 'Fore peak ballast tank used for trimming and ballast operations. Tank capacity 1,240 m³. Fitted with level gauges and sounding pipe.', installDate: '2015-03-20', classRef: 'LR-BT-001', drawingRef: 'MKL-001-GA-230' },
              { id: '230.01.02', code: '230.01.02', name: 'NO.1 T.S.W.B.T PORT', maker: 'N/A', model: 'N/A', serial: 'WBT-P01', criticality: 'high', status: 'operational', location: 'Midship Port, Frame 120-150', lastMaintenance: '2024-10-20', nextDue: '2025-04-20', responsibleRank: 'Chief Officer', system: 'Tanks General', type: 'Ballast Tank', description: 'No.1 Topside Wing Ballast Tank Port. Capacity 850 m³.', installDate: '2015-03-20', classRef: 'LR-BT-002', drawingRef: 'MKL-001-GA-231' },
              { id: '230.01.03', code: '230.01.03', name: 'NO.1 T.S.W.B.T STARBOARD', maker: 'N/A', model: 'N/A', serial: 'WBT-S01', criticality: 'high', status: 'operational', location: 'Midship Stbd, Frame 120-150', lastMaintenance: '2024-10-20', nextDue: '2025-04-20', responsibleRank: 'Chief Officer', system: 'Tanks General', type: 'Ballast Tank', description: 'No.1 Topside Wing Ballast Tank Starboard. Capacity 850 m³.', installDate: '2015-03-20', classRef: 'LR-BT-003', drawingRef: 'MKL-001-GA-232' },
              { id: '230.01.04', code: '230.01.04', name: 'NO.2 T.S.W.B.T PORT', maker: 'N/A', model: 'N/A', serial: 'WBT-P02', criticality: 'high', status: 'operational', location: 'Midship Port, Frame 90-120', lastMaintenance: '2024-10-20', nextDue: '2025-04-20', responsibleRank: 'Chief Officer', system: 'Tanks General', type: 'Ballast Tank', installDate: '2015-03-20' },
              { id: '230.01.05', code: '230.01.05', name: 'NO.2 T.S.W.B.T STARBOARD', maker: 'N/A', model: 'N/A', serial: 'WBT-S02', criticality: 'high', status: 'operational', location: 'Midship Stbd, Frame 90-120', lastMaintenance: '2024-10-20', nextDue: '2025-04-20', responsibleRank: 'Chief Officer', system: 'Tanks General', type: 'Ballast Tank', installDate: '2015-03-20' },
              { id: '230.01.06', code: '230.01.06', name: 'AFTER PEAK TANK', maker: 'N/A', model: 'N/A', serial: 'APT-001', criticality: 'high', status: 'operational', location: 'Aft, Frame 0-18', lastMaintenance: '2024-11-15', nextDue: '2025-05-15', responsibleRank: 'Chief Officer', system: 'Tanks General', type: 'Ballast Tank', installDate: '2015-03-20' },
            ]
          }
        ]
      },
      {
        id: '310', code: '#310', name: 'MAIN ENGINE SYSTEM', isGroup: true,
        children: [
          {
            id: '310.01', code: '310.01', name: 'MAIN ENGINE', maker: 'MAN B&W', model: '6S60MC-C8.2', serial: 'ME-2015-001', criticality: 'critical', status: 'operational', location: 'Engine Room, Keel Level', lastMaintenance: '2024-12-01', nextDue: '2025-06-01', responsibleRank: 'Chief Engineer', system: 'Main Engine System', type: 'Two-Stroke Diesel Engine', description: '2-stroke slow-speed main propulsion engine. MCR: 12,240 kW at 105 RPM. Total running hours: 42,850.', installDate: '2015-03-20', classRef: 'LR-ME-001', drawingRef: 'MKL-001-ME-001', runningHours: 42850,
            children: [
              { id: '310.01.01', code: '310.01.01', name: 'CYLINDER UNIT NO.1', maker: 'MAN B&W', model: '6S60MC-C8.2', serial: 'CYL-001', criticality: 'critical', status: 'operational', location: 'Engine Room', lastMaintenance: '2024-12-01', nextDue: '2025-06-01', responsibleRank: 'Chief Engineer', system: 'Main Engine System', runningHours: 42850, installDate: '2015-03-20' },
              { id: '310.01.02', code: '310.01.02', name: 'CYLINDER UNIT NO.2', maker: 'MAN B&W', model: '6S60MC-C8.2', serial: 'CYL-002', criticality: 'critical', status: 'operational', location: 'Engine Room', lastMaintenance: '2024-12-01', nextDue: '2025-06-01', responsibleRank: 'Chief Engineer', system: 'Main Engine System', runningHours: 42850, installDate: '2015-03-20' },
              { id: '310.01.03', code: '310.01.03', name: 'CYLINDER UNIT NO.3', maker: 'MAN B&W', model: '6S60MC-C8.2', serial: 'CYL-003', criticality: 'critical', status: 'under_maintenance', location: 'Engine Room', lastMaintenance: '2025-01-05', nextDue: '2025-07-05', responsibleRank: 'Chief Engineer', system: 'Main Engine System', runningHours: 42850, installDate: '2015-03-20' },
              { id: '310.01.04', code: '310.01.04', name: 'CYLINDER UNIT NO.4', maker: 'MAN B&W', model: '6S60MC-C8.2', serial: 'CYL-004', criticality: 'critical', status: 'operational', location: 'Engine Room', lastMaintenance: '2024-12-01', nextDue: '2025-06-01', responsibleRank: 'Chief Engineer', system: 'Main Engine System', runningHours: 42850, installDate: '2015-03-20' },
              { id: '310.01.05', code: '310.01.05', name: 'CYLINDER UNIT NO.5', maker: 'MAN B&W', model: '6S60MC-C8.2', serial: 'CYL-005', criticality: 'critical', status: 'operational', location: 'Engine Room', lastMaintenance: '2024-12-01', nextDue: '2025-06-01', responsibleRank: 'Chief Engineer', system: 'Main Engine System', runningHours: 42850, installDate: '2015-03-20' },
              { id: '310.01.06', code: '310.01.06', name: 'CYLINDER UNIT NO.6', maker: 'MAN B&W', model: '6S60MC-C8.2', serial: 'CYL-006', criticality: 'critical', status: 'operational', location: 'Engine Room', lastMaintenance: '2024-12-01', nextDue: '2025-06-01', responsibleRank: 'Chief Engineer', system: 'Main Engine System', runningHours: 42850, installDate: '2015-03-20' },
              { id: '310.01.07', code: '310.01.07', name: 'TURBOCHARGER', maker: 'ABB', model: 'A100-L35', serial: 'TC-001', criticality: 'critical', status: 'operational', location: 'Engine Room, Upper Level', lastMaintenance: '2024-11-20', nextDue: '2025-05-20', responsibleRank: 'Chief Engineer', system: 'Main Engine System', type: 'Exhaust Turbocharger', installDate: '2015-03-20', runningHours: 42850 },
              { id: '310.01.08', code: '310.01.08', name: 'FUEL INJECTION PUMP NO.1', maker: 'MAN B&W', model: 'MK1 FIP', serial: 'FIP-001', criticality: 'critical', status: 'operational', location: 'Engine Room', lastMaintenance: '2024-10-12', nextDue: '2025-04-12', responsibleRank: '2nd Engineer', system: 'Main Engine System', installDate: '2015-03-20', runningHours: 42850 },
            ]
          },
          {
            id: '310.02', code: '#310.02', name: 'LUBE OIL SYSTEM', isGroup: true,
            children: [
              { id: '310.02.01', code: '310.02.01', name: 'M/E LUBE OIL PUMP', maker: 'Taiko Kikai', model: 'PX-200', serial: 'LOP-001', criticality: 'critical', status: 'operational', location: 'Engine Room, Tank Top', lastMaintenance: '2024-10-15', nextDue: '2025-04-15', responsibleRank: 'Chief Engineer', system: 'Main Engine System', type: 'Centrifugal Pump', installDate: '2015-03-20' },
              { id: '310.02.02', code: '310.02.02', name: 'M/E LO STAND-BY PUMP', maker: 'Taiko Kikai', model: 'PX-200', serial: 'LOP-002', criticality: 'critical', status: 'operational', location: 'Engine Room, Tank Top', lastMaintenance: '2024-10-15', nextDue: '2025-04-15', responsibleRank: '2nd Engineer', system: 'Main Engine System', installDate: '2015-03-20' },
              { id: '310.02.03', code: '310.02.03', name: 'LUBE OIL PURIFIER', maker: 'Alfa Laval', model: 'FOPX-610', serial: 'LPU-001', criticality: 'high', status: 'operational', location: 'Engine Room, 2nd Platform', lastMaintenance: '2024-09-30', nextDue: '2025-03-30', responsibleRank: '2nd Engineer', system: 'Main Engine System', type: 'Centrifugal Purifier', installDate: '2015-03-20' },
              { id: '310.02.04', code: '310.02.04', name: 'M/E LO SUMP TANK', maker: 'N/A', model: 'N/A', serial: 'LOST-001', criticality: 'high', status: 'operational', location: 'Engine Room, Double Bottom', lastMaintenance: '2024-08-01', nextDue: '2026-08-01', responsibleRank: 'Chief Engineer', system: 'Main Engine System', installDate: '2015-03-20' },
            ]
          },
          {
            id: '310.03', code: '#310.03', name: 'FUEL OIL SYSTEM', isGroup: true,
            children: [
              { id: '310.03.01', code: '310.03.01', name: 'HFO SUPPLY PUMP', maker: 'Taiko Kikai', model: 'FP-150', serial: 'FOP-001', criticality: 'high', status: 'operational', location: 'Engine Room, Tank Top', lastMaintenance: '2024-11-10', nextDue: '2025-05-10', responsibleRank: '2nd Engineer', system: 'Main Engine System', installDate: '2015-03-20' },
              { id: '310.03.02', code: '310.03.02', name: 'HFO BOOSTER PUMP', maker: 'Taiko Kikai', model: 'FP-100', serial: 'FOP-002', criticality: 'high', status: 'operational', location: 'Engine Room, Tank Top', lastMaintenance: '2024-11-10', nextDue: '2025-05-10', responsibleRank: '2nd Engineer', system: 'Main Engine System', installDate: '2015-03-20' },
              { id: '310.03.03', code: '310.03.03', name: 'FUEL OIL PURIFIER', maker: 'Alfa Laval', model: 'FOPX-610', serial: 'FPU-001', criticality: 'high', status: 'operational', location: 'Engine Room, 2nd Platform', lastMaintenance: '2024-10-05', nextDue: '2025-04-05', responsibleRank: '2nd Engineer', system: 'Main Engine System', type: 'Centrifugal Purifier', installDate: '2015-03-20' },
              { id: '310.03.04', code: '310.03.04', name: 'VISCOSITY CONTROLLER', maker: 'Kittiwake', model: 'VC-200', serial: 'VC-001', criticality: 'medium', status: 'operational', location: 'Engine Room', lastMaintenance: '2024-07-20', nextDue: '2025-07-20', responsibleRank: '2nd Engineer', system: 'Main Engine System', installDate: '2015-03-20' },
            ]
          },
        ]
      },
      {
        id: '320', code: '#320', name: 'AUXILIARY ENGINE SYSTEM', isGroup: true,
        children: [
          { id: '320.01', code: '320.01', name: 'AUX ENGINE NO.1', maker: 'Daihatsu', model: '6DL-28', serial: 'AE1-001', criticality: 'critical', status: 'operational', location: 'Engine Room, Upper Level', lastMaintenance: '2024-11-25', nextDue: '2025-05-25', responsibleRank: '2nd Engineer', system: 'Auxiliary Engine System', type: '4-Stroke Diesel Generator', description: 'Auxiliary diesel generator. Output: 900 kW at 720 RPM. Running hours: 18,240.', installDate: '2015-03-20', runningHours: 18240, classRef: 'LR-AE-001' },
          { id: '320.02', code: '320.02', name: 'AUX ENGINE NO.2', maker: 'Daihatsu', model: '6DL-28', serial: 'AE2-001', criticality: 'critical', status: 'under_maintenance', location: 'Engine Room, Upper Level', lastMaintenance: '2025-01-08', nextDue: '2025-07-08', responsibleRank: '2nd Engineer', system: 'Auxiliary Engine System', type: '4-Stroke Diesel Generator', description: 'Currently undergoing top overhaul. Estimated completion: 15 Jan 2025.', installDate: '2015-03-20', runningHours: 19100, classRef: 'LR-AE-002' },
          { id: '320.03', code: '320.03', name: 'AUX ENGINE NO.3', maker: 'Daihatsu', model: '6DL-28', serial: 'AE3-001', criticality: 'critical', status: 'operational', location: 'Engine Room, Upper Level', lastMaintenance: '2024-11-25', nextDue: '2025-05-25', responsibleRank: '2nd Engineer', system: 'Auxiliary Engine System', type: '4-Stroke Diesel Generator', description: 'Auxiliary diesel generator. Output: 900 kW at 720 RPM. Running hours: 17,560.', installDate: '2015-03-20', runningHours: 17560, classRef: 'LR-AE-003' },
        ]
      },
      {
        id: '410', code: '#410', name: 'ELECTRICAL POWER', isGroup: true,
        children: [
          { id: '410.01', code: '410.01', name: 'DIESEL GENERATOR NO.1', maker: 'Stamford', model: 'HCI634K', serial: 'DG1-001', criticality: 'critical', status: 'operational', location: 'Engine Room, Upper Level', lastMaintenance: '2024-11-05', nextDue: '2025-05-05', responsibleRank: 'Electrician', system: 'Electrical Power', type: 'AC Synchronous Generator', description: '440V / 60Hz alternator coupled to Daihatsu AE No.1. Output: 1,000 kVA.', installDate: '2015-03-20' },
          { id: '410.02', code: '410.02', name: 'DIESEL GENERATOR NO.2', maker: 'Stamford', model: 'HCI634K', serial: 'DG2-001', criticality: 'critical', status: 'operational', location: 'Engine Room, Upper Level', lastMaintenance: '2024-11-05', nextDue: '2025-05-05', responsibleRank: 'Electrician', system: 'Electrical Power', type: 'AC Synchronous Generator', installDate: '2015-03-20' },
          { id: '410.03', code: '410.03', name: 'DIESEL GENERATOR NO.3', maker: 'Stamford', model: 'HCI634K', serial: 'DG3-001', criticality: 'critical', status: 'operational', location: 'Engine Room, Upper Level', lastMaintenance: '2024-11-05', nextDue: '2025-05-05', responsibleRank: 'Electrician', system: 'Electrical Power', type: 'AC Synchronous Generator', installDate: '2015-03-20' },
          { id: '410.04', code: '410.04', name: 'EMERGENCY GENERATOR', maker: 'Caterpillar', model: 'C9.3 ACERT', serial: 'EG-001', criticality: 'critical', status: 'operational', location: 'Deck House, Boat Deck Level', lastMaintenance: '2024-12-15', nextDue: '2025-01-15', responsibleRank: 'Electrician', system: 'Electrical Power', type: 'Emergency Standby Generator', description: 'SOLAS emergency generator. 230V / 440V output. Must be tested monthly per class requirements.', installDate: '2015-03-20', classRef: 'LR-EG-001' },
          { id: '410.05', code: '410.05', name: 'MAIN SWITCHBOARD', maker: 'Terasaki', model: 'MSB-440V', serial: 'MSB-001', criticality: 'critical', status: 'operational', location: 'Engine Control Room', lastMaintenance: '2024-09-15', nextDue: '2025-09-15', responsibleRank: 'Electrician', system: 'Electrical Power', type: 'Main Distribution Switchboard', installDate: '2015-03-20', classRef: 'LR-MSB-001' },
          { id: '410.06', code: '410.06', name: 'EMERGENCY SWITCHBOARD', maker: 'Terasaki', model: 'ESB-440V', serial: 'ESB-001', criticality: 'critical', status: 'operational', location: 'Deck House, Boat Deck', lastMaintenance: '2024-09-15', nextDue: '2025-09-15', responsibleRank: 'Electrician', system: 'Electrical Power', installDate: '2015-03-20' },
        ]
      },
      {
        id: '430', code: '#430', name: 'STEERING SYSTEM', isGroup: true,
        children: [
          { id: '430.01', code: '430.01', name: 'STEERING GEAR', maker: 'Rolls-Royce', model: 'Hatlapa SV-500', serial: 'SG-001', criticality: 'critical', status: 'operational', location: 'Steering Gear Room, Aft', lastMaintenance: '2024-10-30', nextDue: '2025-04-30', responsibleRank: 'Chief Engineer', system: 'Steering System', type: 'Electro-Hydraulic Steering Gear', description: '4-ram steering gear. Operating torque: 500 kNm. Equipped with follow-up and non-follow-up controls.', installDate: '2015-03-20', classRef: 'LR-SG-001' },
          { id: '430.02', code: '430.02', name: 'HYDRAULIC POWER UNIT NO.1', maker: 'Bosch Rexroth', model: 'A10V-140', serial: 'HPU-001', criticality: 'high', status: 'operational', location: 'Steering Gear Room', lastMaintenance: '2024-10-30', nextDue: '2025-04-30', responsibleRank: '2nd Engineer', system: 'Steering System', type: 'Hydraulic Power Pack', installDate: '2015-03-20' },
          { id: '430.03', code: '430.03', name: 'HYDRAULIC POWER UNIT NO.2', maker: 'Bosch Rexroth', model: 'A10V-140', serial: 'HPU-002', criticality: 'high', status: 'operational', location: 'Steering Gear Room', lastMaintenance: '2024-10-30', nextDue: '2025-04-30', responsibleRank: '2nd Engineer', system: 'Steering System', type: 'Hydraulic Power Pack', installDate: '2015-03-20' },
          { id: '430.04', code: '430.04', name: 'RUDDER', maker: 'N/A', model: 'N/A', serial: 'RUD-001', criticality: 'critical', status: 'operational', location: 'Aft', lastMaintenance: '2022-06-15', nextDue: '2027-06-15', responsibleRank: 'Chief Engineer', system: 'Steering System', type: 'Semi-Balanced Rudder', installDate: '2015-03-20', classRef: 'LR-RUD-001' },
        ]
      },
      {
        id: '520', code: '#520', name: 'FIRE & SAFETY', isGroup: true,
        children: [
          { id: '520.01', code: '520.01', name: 'FIRE PUMP NO.1', maker: 'Shinko', model: 'PH-200L', serial: 'FP1-001', criticality: 'critical', status: 'operational', location: 'Engine Room, Tank Top', lastMaintenance: '2024-12-05', nextDue: '2025-01-05', responsibleRank: 'Chief Officer', system: 'Fire & Safety', type: 'Centrifugal Fire Pump', description: 'Main fire pump. Capacity: 200 m³/h at 7 bar. Motor driven.', installDate: '2015-03-20', classRef: 'LR-FP-001' },
          { id: '520.02', code: '520.02', name: 'FIRE PUMP NO.2', maker: 'Shinko', model: 'PH-200L', serial: 'FP2-001', criticality: 'critical', status: 'operational', location: 'Engine Room, Tank Top', lastMaintenance: '2024-12-05', nextDue: '2025-01-05', responsibleRank: 'Chief Officer', system: 'Fire & Safety', type: 'Centrifugal Fire Pump', installDate: '2015-03-20', classRef: 'LR-FP-002' },
          { id: '520.03', code: '520.03', name: 'EMERGENCY FIRE PUMP', maker: 'Shinko', model: 'PH-100E', serial: 'EFP-001', criticality: 'critical', status: 'operational', location: 'Forward Pump Room', lastMaintenance: '2024-12-05', nextDue: '2025-01-05', responsibleRank: 'Chief Officer', system: 'Fire & Safety', type: 'Emergency Fire Pump', description: 'SOLAS emergency fire pump. Independently powered. Capacity: 100 m³/h.', installDate: '2015-03-20', classRef: 'LR-EFP-001' },
          { id: '520.04', code: '520.04', name: 'LIFEBOAT ENGINE NO.1 (PORT)', maker: 'Volvo Penta', model: 'D4-260', serial: 'LB1-001', criticality: 'critical', status: 'operational', location: 'Port Lifeboat, Boat Deck', lastMaintenance: '2024-11-20', nextDue: '2025-01-20', responsibleRank: 'Chief Officer', system: 'Fire & Safety', type: 'Lifeboat Propulsion Engine', description: '4-cylinder diesel engine. Output: 260 hp. SOLAS LSA Code compliant.', installDate: '2015-03-20', classRef: 'LR-LB-001' },
          { id: '520.05', code: '520.05', name: 'LIFEBOAT ENGINE NO.2 (STBD)', maker: 'Volvo Penta', model: 'D4-260', serial: 'LB2-001', criticality: 'critical', status: 'defect', location: 'Starboard Lifeboat, Boat Deck', lastMaintenance: '2024-11-20', nextDue: '2025-01-20', responsibleRank: 'Chief Officer', system: 'Fire & Safety', type: 'Lifeboat Propulsion Engine', description: 'DEFECT: Engine fails to start on first attempt. Suspected fuel system issue. Under investigation.', installDate: '2015-03-20', classRef: 'LR-LB-002' },
          { id: '520.06', code: '520.06', name: 'CO2 FIRE EXTINGUISHING SYSTEM', maker: 'Kidde Fire Systems', model: 'Total Flood CO2', serial: 'CO2-001', criticality: 'critical', status: 'operational', location: 'CO2 Room, Deck A', lastMaintenance: '2024-08-10', nextDue: '2025-08-10', responsibleRank: 'Chief Officer', system: 'Fire & Safety', type: 'Fixed CO2 System', installDate: '2015-03-20', classRef: 'LR-CO2-001' },
          { id: '520.07', code: '520.07', name: 'FIRE DETECTION & ALARM SYSTEM', maker: 'Hochiki', model: 'FIRElink System', serial: 'FDA-001', criticality: 'critical', status: 'operational', location: 'Bridge / Throughout Vessel', lastMaintenance: '2024-10-01', nextDue: '2025-04-01', responsibleRank: 'Chief Officer', system: 'Fire & Safety', type: 'Addressable Fire Alarm System', installDate: '2015-03-20', classRef: 'LR-FDA-001' },
        ]
      },
      {
        id: '610', code: '#610', name: 'DECK MACHINERY', isGroup: true,
        children: [
          { id: '610.01', code: '610.01', name: 'WINDLASS', maker: 'Rolls-Royce', model: 'DP-500H', serial: 'WL-001', criticality: 'high', status: 'operational', location: 'Forecastle Deck, Centreline', lastMaintenance: '2024-10-12', nextDue: '2025-04-12', responsibleRank: 'Chief Officer', system: 'Deck Machinery', type: 'Electro-Hydraulic Windlass', installDate: '2015-03-20' },
          { id: '610.02', code: '610.02', name: 'MOORING WINCH NO.1 (FWD PORT)', maker: 'Rolls-Royce', model: 'MW-250', serial: 'MW1-001', criticality: 'high', status: 'operational', location: 'Forecastle Deck, Port', lastMaintenance: '2024-10-12', nextDue: '2025-04-12', responsibleRank: 'Chief Officer', system: 'Deck Machinery', type: 'Mooring Winch', installDate: '2015-03-20' },
          { id: '610.03', code: '610.03', name: 'MOORING WINCH NO.2 (FWD STBD)', maker: 'Rolls-Royce', model: 'MW-250', serial: 'MW2-001', criticality: 'high', status: 'operational', location: 'Forecastle Deck, Stbd', lastMaintenance: '2024-10-12', nextDue: '2025-04-12', responsibleRank: 'Chief Officer', system: 'Deck Machinery', installDate: '2015-03-20' },
          { id: '610.04', code: '610.04', name: 'MOORING WINCH NO.3 (AFT PORT)', maker: 'Rolls-Royce', model: 'MW-250', serial: 'MW3-001', criticality: 'high', status: 'operational', location: 'Poop Deck, Port', lastMaintenance: '2024-10-12', nextDue: '2025-04-12', responsibleRank: 'Chief Officer', system: 'Deck Machinery', installDate: '2015-03-20' },
          { id: '610.05', code: '610.05', name: 'MOORING WINCH NO.4 (AFT STBD)', maker: 'Rolls-Royce', model: 'MW-250', serial: 'MW4-001', criticality: 'high', status: 'operational', location: 'Poop Deck, Stbd', lastMaintenance: '2024-10-12', nextDue: '2025-04-12', responsibleRank: 'Chief Officer', system: 'Deck Machinery', installDate: '2015-03-20' },
          { id: '610.06', code: '610.06', name: 'CRANE NO.1', maker: 'MacGregor', model: 'CK-25T SWL', serial: 'CR1-001', criticality: 'medium', status: 'operational', location: 'Main Deck, Frame 88', lastMaintenance: '2024-09-20', nextDue: '2025-03-20', responsibleRank: 'Chief Officer', system: 'Deck Machinery', type: 'Deck Crane', description: 'Electro-hydraulic deck crane. SWL: 25 tonnes at 20m radius.', installDate: '2015-03-20', classRef: 'LR-CR-001' },
          { id: '610.07', code: '610.07', name: 'CRANE NO.2', maker: 'MacGregor', model: 'CK-25T SWL', serial: 'CR2-001', criticality: 'medium', status: 'operational', location: 'Main Deck, Frame 62', lastMaintenance: '2024-09-20', nextDue: '2025-03-20', responsibleRank: 'Chief Officer', system: 'Deck Machinery', type: 'Deck Crane', installDate: '2015-03-20', classRef: 'LR-CR-002' },
        ]
      },
      {
        id: '710', code: '#710', name: 'BRIDGE EQUIPMENT', isGroup: true,
        children: [
          { id: '710.01', code: '710.01', name: 'MAIN RADAR (X-BAND)', maker: 'Furuno', model: 'FAR-2228', serial: 'RAD-001', criticality: 'critical', status: 'operational', location: 'Bridge, Radar Console', lastMaintenance: '2024-09-05', nextDue: '2025-03-05', responsibleRank: '2nd Officer', system: 'Bridge Equipment', type: 'X-Band Radar / ARPA', installDate: '2015-03-20', classRef: 'LR-NAV-001' },
          { id: '710.02', code: '710.02', name: 'S-BAND RADAR', maker: 'Furuno', model: 'FAR-2838S', serial: 'RAD-002', criticality: 'critical', status: 'operational', location: 'Bridge, Radar Console', lastMaintenance: '2024-09-05', nextDue: '2025-03-05', responsibleRank: '2nd Officer', system: 'Bridge Equipment', type: 'S-Band Radar / ARPA', installDate: '2015-03-20' },
          { id: '710.03', code: '710.03', name: 'ECDIS NO.1', maker: 'Furuno', model: 'FEA-2107', serial: 'ECDIS-001', criticality: 'critical', status: 'operational', location: 'Bridge, ECDIS Console', lastMaintenance: '2024-06-15', nextDue: '2025-06-15', responsibleRank: '2nd Officer', system: 'Bridge Equipment', type: 'Electronic Chart Display', installDate: '2015-03-20', classRef: 'LR-NAV-003' },
          { id: '710.04', code: '710.04', name: 'AIS TRANSPONDER', maker: 'Furuno', model: 'FA-170', serial: 'AIS-001', criticality: 'critical', status: 'operational', location: 'Bridge', lastMaintenance: '2024-06-15', nextDue: '2025-06-15', responsibleRank: '2nd Officer', system: 'Bridge Equipment', type: 'Class A AIS', installDate: '2015-03-20', classRef: 'LR-AIS-001' },
          { id: '710.05', code: '710.05', name: 'GMDSS CONSOLE', maker: 'Sailor', model: '6222 VHF', serial: 'GMDSS-001', criticality: 'critical', status: 'operational', location: 'Bridge, Radio Room', lastMaintenance: '2024-11-10', nextDue: '2025-02-10', responsibleRank: 'GMDSS Officer', system: 'Bridge Equipment', type: 'GMDSS Communications System', installDate: '2015-03-20', classRef: 'LR-GMDSS-001' },
          { id: '710.06', code: '710.06', name: 'AUTOPILOT', maker: 'Raytheon Anschütz', model: 'NP-2025', serial: 'AP-001', criticality: 'high', status: 'operational', location: 'Bridge, Helm Console', lastMaintenance: '2024-08-20', nextDue: '2025-08-20', responsibleRank: 'Chief Officer', system: 'Bridge Equipment', type: 'Digital Autopilot', installDate: '2015-03-20' },
        ]
      },
    ]
  }
];

export function flattenEquipment(nodes: Equipment[], parent?: Equipment): Equipment[] {
  const result: Equipment[] = [];
  for (const node of nodes) {
    const flat = { ...node, parentId: parent?.id, parentName: parent?.name };
    result.push(flat);
    if (node.children) {
      result.push(...flattenEquipment(node.children, node));
    }
  }
  return result;
}

export const allEquipment = flattenEquipment(equipmentTree);

export const getEquipmentById = (id: string): Equipment | undefined =>
  allEquipment.find(e => e.id === id);
