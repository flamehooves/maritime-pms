import type { Defect } from '../types';

export const defects: Defect[] = [
  {
    id: 'd1', defectId: 'DEF-2025-001',
    equipmentId: '520.05', equipmentCode: '520.05', equipmentName: 'LIFEBOAT ENGINE NO.2 (STBD)',
    system: 'Fire & Safety', vessel: 'MAHAKALI',
    severity: 'Critical',
    description: 'Lifeboat starboard engine fails to start on first attempt during weekly test. Requires 3-4 cranking cycles before firing. Suspected fuel system blockage or injector fouling. SOLAS compliance at risk.',
    reportedBy: 'Chief Officer', reportedDate: '2025-01-06',
    status: 'Under Investigation', linkedJobOrderId: 'jo4', linkedJobOrderNumber: 'JO-2025-0038'
  },
  {
    id: 'd2', defectId: 'DEF-2025-002',
    equipmentId: '310.01.03', equipmentCode: '310.01.03', equipmentName: 'CYLINDER UNIT NO.3',
    system: 'Main Engine System', vessel: 'MAHAKALI',
    severity: 'Critical',
    description: 'Exhaust temperature on No.3 cylinder consistently 45°C above average of other units. Possible exhaust valve burning or fuel injector malfunction. Engine operating at reduced load pending investigation.',
    reportedBy: 'Chief Engineer', reportedDate: '2025-01-05',
    status: 'Under Investigation', linkedJobOrderId: 'jo1', linkedJobOrderNumber: 'JO-2025-0042'
  },
  {
    id: 'd3', defectId: 'DEF-2025-003',
    equipmentId: '610.04', equipmentCode: '610.04', equipmentName: 'MOORING WINCH NO.3 (AFT PORT)',
    system: 'Deck Machinery', vessel: 'MAHAKALI',
    severity: 'High',
    description: 'Mooring winch brake observed slipping during last port call (Singapore, 04 Jan 2025). Brake band showing signs of wear. Winch removed from service pending inspection and brake lining replacement.',
    reportedBy: 'Chief Officer', reportedDate: '2025-01-04',
    status: 'Open', linkedJobOrderId: 'jo22', linkedJobOrderNumber: 'JO-2025-0045'
  },
  {
    id: 'd4', defectId: 'DEF-2025-004',
    equipmentId: '320.02', equipmentCode: '320.02', equipmentName: 'AUX ENGINE NO.2',
    system: 'Auxiliary Engine System', vessel: 'MAHAKALI',
    severity: 'High',
    description: 'AE No.2 cylinder liner Nos. 2 and 4 found worn beyond acceptable limits during top overhaul. Blow-by evident. Engine taken offline. Replacement liners required.',
    reportedBy: '2nd Engineer', reportedDate: '2025-01-08',
    status: 'Under Investigation', linkedJobOrderId: 'jo2', linkedJobOrderNumber: 'JO-2025-0041'
  },
  {
    id: 'd5', defectId: 'DEF-2024-048',
    equipmentId: '310.03.01', equipmentCode: '310.03.01', equipmentName: 'HFO SUPPLY PUMP',
    system: 'Main Engine System', vessel: 'MAHAKALI',
    severity: 'High',
    description: 'HFO supply pump shaft seal weeping approximately 2-3 drops per minute. Monitored and contained. Seal replacement planned for next port. Not affecting fuel supply pressure.',
    reportedBy: '2nd Engineer', reportedDate: '2024-12-28',
    status: 'Open',
  },
  {
    id: 'd6', defectId: 'DEF-2024-047',
    equipmentId: '230.01.02', equipmentCode: '230.01.02', equipmentName: 'NO.1 T.S.W.B.T PORT',
    system: 'Tanks General', vessel: 'MAHAKALI',
    severity: 'Medium',
    description: 'Sounding pipe non-return valve on No.1 Port Ballast Tank found corroded and difficult to operate. Risk of incorrect sounding readings. Temporary workaround in place – valve to be replaced at next opportunity.',
    reportedBy: 'Chief Officer', reportedDate: '2024-12-20',
    status: 'Open',
  },
  {
    id: 'd7', defectId: 'DEF-2024-046',
    equipmentId: '410.03', equipmentCode: '410.03', equipmentName: 'DIESEL GENERATOR NO.3',
    system: 'Electrical Power', vessel: 'MAHAKALI',
    severity: 'Medium',
    description: 'DG No.3 automatic voltage regulator (AVR) showing unstable voltage during load changes. Voltage fluctuating ±8V which is within acceptable limits but trending towards alarm threshold. AVR adjustment required.',
    reportedBy: 'Electrician', reportedDate: '2024-12-15',
    status: 'Open',
  },
  {
    id: 'd8', defectId: 'DEF-2024-040',
    equipmentId: '610.06', equipmentCode: '610.06', equipmentName: 'CRANE NO.1',
    system: 'Deck Machinery', vessel: 'MAHAKALI',
    severity: 'Medium',
    description: 'Slew ring grease nipple No.4 found blocked and unable to accept grease. Removed and cleaned. Nipple replaced. Slew ring lubrication confirmed restored.',
    reportedBy: 'Chief Officer', reportedDate: '2024-11-18',
    status: 'Resolved', resolvedDate: '2024-11-18',
    resolution: 'Blocked grease nipple removed and replaced. Slew ring greasing confirmed.'
  },
  {
    id: 'd9', defectId: 'DEF-2024-035',
    equipmentId: '710.01', equipmentCode: '710.01', equipmentName: 'MAIN RADAR (X-BAND)',
    system: 'Bridge Equipment', vessel: 'MAHAKALI',
    severity: 'Low',
    description: 'X-Band radar scanner motor producing intermittent squeaking noise. Performance not affected. Lubrication applied – noise reduced but not eliminated. To be monitored.',
    reportedBy: '2nd Officer', reportedDate: '2024-11-05',
    status: 'Open',
  },
  {
    id: 'd10', defectId: 'DEF-2024-028',
    equipmentId: '430.01', equipmentCode: '430.01', equipmentName: 'STEERING GEAR',
    system: 'Steering System', vessel: 'MAHAKALI',
    severity: 'Low',
    description: 'Minor hydraulic oil seepage on HP hose union at Ram No.2. Tightened union – seepage stopped. Hose to be replaced during next scheduled overhaul.',
    reportedBy: '2nd Engineer', reportedDate: '2024-10-25',
    status: 'Resolved', resolvedDate: '2024-10-25',
    resolution: 'Union tightened. Seepage stopped. Hose scheduled for replacement at next overhaul.'
  },
];

export const getDefectsByEquipment = (equipmentId: string) =>
  defects.filter(d => d.equipmentId === equipmentId);

export const getOpenDefects = () =>
  defects.filter(d => d.status === 'Open' || d.status === 'Under Investigation');

export const getCriticalDefects = () =>
  defects.filter(d => d.severity === 'Critical' && d.status !== 'Resolved' && d.status !== 'Closed');
