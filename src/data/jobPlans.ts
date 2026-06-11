import type { JobPlan } from '../types';

export const jobPlans: JobPlan[] = [
  {
    id: 'jp1', code: 'JP-ME-001', title: 'M/E Cylinder Head Inspection & Overhaul',
    equipmentId: '310.01', equipmentName: 'MAIN ENGINE', system: 'Main Engine System',
    frequencyType: 'Running Hours', interval: 6000, intervalUnit: 'RH',
    responsibleRank: 'Chief Engineer', estimatedDuration: 16,
    lastDone: '2024-07-15', nextDue: '2025-01-15', status: 'Overdue',
    procedures: [
      'Isolate fuel and cooling water supplies to cylinder',
      'Release indicator cocks and allow engine to cool',
      'Remove cylinder head securing nuts and lift head using chain block',
      'Inspect combustion face for cracks, erosion, and valve seat condition',
      'Measure valve stem clearances and record readings',
      'Check exhaust and inlet valve condition – replace if worn beyond limits',
      'Inspect cylinder head O-rings and sealing faces',
      'Clean water passages and inspect for corrosion',
      'Replace all O-rings and sealing rings as per maker recommendations',
      'Refit cylinder head and torque securing nuts to specified values',
      'Pressure test cooling water circuit',
      'Record all measurements in the maintenance log'
    ],
    safetyNotes: 'Isolate main engine starting air before any work. Ensure LOTO procedure is followed. Minimum two persons required for cylinder head lifting operations.'
  },
  {
    id: 'jp2', code: 'JP-ME-002', title: 'M/E Piston & Piston Rod Overhaul',
    equipmentId: '310.01', equipmentName: 'MAIN ENGINE', system: 'Main Engine System',
    frequencyType: 'Running Hours', interval: 12000, intervalUnit: 'RH',
    responsibleRank: 'Chief Engineer', estimatedDuration: 24,
    lastDone: '2022-11-20', nextDue: '2025-03-15', status: 'Due Soon',
    procedures: [
      'Prepare piston overhaul tools and workspace',
      'Remove cylinder head per JP-ME-001 procedure',
      'Attach piston lifting tool and extract piston and rod assembly',
      'Disassemble piston from rod and clean all components',
      'Measure piston ring clearances and record',
      'Inspect piston crown for burning and erosion',
      'Check piston rod for straightness and surface condition',
      'Replace piston rings, pins, and seals as required',
      'Reassemble and reinstall'
    ],
    safetyNotes: 'Heavy lift operation – use certified lifting equipment only. Ensure crankcase inspection window is closed during engine operation.'
  },
  {
    id: 'jp3', code: 'JP-TC-001', title: 'Turbocharger Overhaul (ABB A100-L35)',
    equipmentId: '310.01.07', equipmentName: 'TURBOCHARGER', system: 'Main Engine System',
    frequencyType: 'Calendar', interval: 12, intervalUnit: 'Months',
    responsibleRank: 'Chief Engineer', estimatedDuration: 8,
    lastDone: '2024-01-15', nextDue: '2025-01-15', status: 'Overdue',
    procedures: [
      'Allow turbocharger to cool completely before opening',
      'Remove compressor casing and inspect blades for damage',
      'Check rotor for fouling and balance condition',
      'Inspect bearings and measure bearing clearances',
      'Clean turbine blades using ABB approved cleaning method',
      'Inspect nozzle ring for cracking and erosion',
      'Replace bearings and seals per maker schedule',
      'Reassemble and perform water washing after start-up'
    ],
    safetyNotes: 'Do not work on turbocharger while engine is running. Ensure exhaust gas temperatures have normalised before opening.'
  },
  {
    id: 'jp4', code: 'JP-FIP-001', title: 'M/E Fuel Injection Valve Overhaul',
    equipmentId: '310.01.08', equipmentName: 'FUEL INJECTION PUMP NO.1', system: 'Main Engine System',
    frequencyType: 'Running Hours', interval: 2000, intervalUnit: 'RH',
    responsibleRank: '2nd Engineer', estimatedDuration: 4,
    lastDone: '2024-10-20', nextDue: '2025-04-15', status: 'Active',
    procedures: [
      'Shut off fuel supply to injector',
      'Remove injector and place in cleaning bath',
      'Disassemble nozzle and check needle lift',
      'Test atomisation and opening pressure on test rig',
      'Replace nozzle assembly if worn beyond limits',
      'Reset opening pressure to 350 bar per maker spec',
      'Reinstall with new O-rings and sealing washers'
    ],
    safetyNotes: 'High pressure fuel – ensure system is depressurised before removal. Use approved fuel recovery containers.'
  },
  {
    id: 'jp5', code: 'JP-AE-001', title: 'Aux Engine Lube Oil Change',
    equipmentId: '320.01', equipmentName: 'AUX ENGINE NO.1', system: 'Auxiliary Engine System',
    frequencyType: 'Running Hours', interval: 250, intervalUnit: 'RH',
    responsibleRank: '2nd Engineer', estimatedDuration: 2,
    lastDone: '2024-12-01', nextDue: '2025-01-20', status: 'Due Soon',
    procedures: [
      'Stop engine and allow oil to cool for 30 minutes',
      'Drain sump oil to waste oil tank',
      'Replace lube oil filter element',
      'Refill with SAE 40 marine diesel engine oil',
      'Check oil level and take oil sample for analysis',
      'Record oil change hours and sample reference'
    ],
    safetyNotes: 'Allow engine to cool before draining. Dispose of used oil in designated waste oil tank only.'
  },
  {
    id: 'jp6', code: 'JP-AE-002', title: 'Aux Engine Top Overhaul',
    equipmentId: '320.01', equipmentName: 'AUX ENGINE NO.1', system: 'Auxiliary Engine System',
    frequencyType: 'Running Hours', interval: 4000, intervalUnit: 'RH',
    responsibleRank: 'Chief Engineer', estimatedDuration: 20,
    lastDone: '2022-08-10', nextDue: '2025-02-10', status: 'Overdue',
  },
  {
    id: 'jp7', code: 'JP-EG-001', title: 'Emergency Generator Monthly Test Run',
    equipmentId: '410.04', equipmentName: 'EMERGENCY GENERATOR', system: 'Electrical Power',
    frequencyType: 'Calendar', interval: 1, intervalUnit: 'Months',
    responsibleRank: 'Electrician', estimatedDuration: 1,
    lastDone: '2024-12-15', nextDue: '2025-01-15', status: 'Due Soon',
    procedures: [
      'Perform pre-start checks: fuel, oil, coolant levels',
      'Test automatic start-up from battery',
      'Run under load for minimum 30 minutes',
      'Check voltage, frequency, and load sharing parameters',
      'Record all readings in the engine log',
      'Test black-out start simulation',
      'Check all alarm functions'
    ],
    safetyNotes: 'Inform bridge before simulating blackout. Ensure all critical systems are on UPS backup before test.'
  },
  {
    id: 'jp8', code: 'JP-EG-002', title: 'Emergency Generator Annual Load Test (Class)',
    equipmentId: '410.04', equipmentName: 'EMERGENCY GENERATOR', system: 'Electrical Power',
    frequencyType: 'Calendar', interval: 12, intervalUnit: 'Months',
    responsibleRank: 'Electrician', estimatedDuration: 4,
    lastDone: '2024-03-20', nextDue: '2025-03-20', status: 'Active',
    safetyNotes: 'Class surveyor attendance required. Minimum 3 hours under full load.'
  },
  {
    id: 'jp9', code: 'JP-FP-001', title: 'Fire Pump Weekly Test Run',
    equipmentId: '520.01', equipmentName: 'FIRE PUMP NO.1', system: 'Fire & Safety',
    frequencyType: 'Calendar', interval: 1, intervalUnit: 'Weeks',
    responsibleRank: 'Chief Officer', estimatedDuration: 0.5,
    lastDone: '2025-01-05', nextDue: '2025-01-12', status: 'Due Soon',
    procedures: [
      'Open sea water suction valve',
      'Start fire pump and check discharge pressure (minimum 3.5 bar)',
      'Test fire line pressure throughout vessel',
      'Check packing gland for leaks',
      'Record pressure readings and running time'
    ],
    safetyNotes: 'Coordinate with deck watch before pressurising fire main.'
  },
  {
    id: 'jp10', code: 'JP-FP-002', title: 'Fire Pump Annual Overhaul',
    equipmentId: '520.01', equipmentName: 'FIRE PUMP NO.1', system: 'Fire & Safety',
    frequencyType: 'Calendar', interval: 12, intervalUnit: 'Months',
    responsibleRank: 'Chief Officer', estimatedDuration: 6,
    lastDone: '2024-01-10', nextDue: '2025-01-10', status: 'Overdue',
  },
  {
    id: 'jp11', code: 'JP-LB-001', title: 'Lifeboat Engine Monthly Test',
    equipmentId: '520.04', equipmentName: 'LIFEBOAT ENGINE NO.1 (PORT)', system: 'Fire & Safety',
    frequencyType: 'Calendar', interval: 1, intervalUnit: 'Months',
    responsibleRank: 'Chief Officer', estimatedDuration: 1,
    lastDone: '2024-12-20', nextDue: '2025-01-20', status: 'Due Soon',
    procedures: [
      'Inspect fuel tank level and top up if necessary',
      'Check engine oil level',
      'Check cooling water system',
      'Start engine and run for minimum 3 minutes',
      'Check all alarm indicators',
      'Record test results in Lifeboat Register'
    ],
    safetyNotes: 'Only run lifeboat engine in lifeboat or with approved test setup. Ensure exhaust ventilation.'
  },
  {
    id: 'jp12', code: 'JP-LB-002', title: 'Lifeboat Annual Survey & Overhaul',
    equipmentId: '520.04', equipmentName: 'LIFEBOAT ENGINE NO.1 (PORT)', system: 'Fire & Safety',
    frequencyType: 'Calendar', interval: 12, intervalUnit: 'Months',
    responsibleRank: 'Chief Officer', estimatedDuration: 8,
    lastDone: '2024-01-25', nextDue: '2025-01-25', status: 'Overdue',
    safetyNotes: 'Class surveyor attendance required. Lifeboat lowering drill to be conducted.'
  },
  {
    id: 'jp13', code: 'JP-SG-001', title: 'Steering Gear Quarterly Inspection',
    equipmentId: '430.01', equipmentName: 'STEERING GEAR', system: 'Steering System',
    frequencyType: 'Calendar', interval: 3, intervalUnit: 'Months',
    responsibleRank: 'Chief Engineer', estimatedDuration: 2,
    lastDone: '2024-10-30', nextDue: '2025-01-30', status: 'Due Soon',
    procedures: [
      'Check hydraulic oil level in tanks',
      'Inspect all hydraulic pipes and hoses for leaks',
      'Test steering gear operation from bridge and emergency steering position',
      'Check ram seals and cylinder for hydraulic leaks',
      'Test rudder angle indicator calibration',
      'Test auto-change to second power unit',
      'Record all observations'
    ]
  },
  {
    id: 'jp14', code: 'JP-BT-001', title: 'Ballast Tank Internal Inspection',
    equipmentId: '230.01.01', equipmentName: 'FORE PEAK TANK', system: 'Tanks General',
    frequencyType: 'Calendar', interval: 30, intervalUnit: 'Months',
    responsibleRank: 'Chief Officer', estimatedDuration: 8,
    lastDone: '2023-06-15', nextDue: '2025-12-15', status: 'Active',
    procedures: [
      'Gas free and ventilate tank – obtain Entry Permit',
      'Inspect coating condition and record areas of breakdown',
      'Check anode condition and record consumption rate',
      'Inspect all structural members for cracking or deformation',
      'Inspect manholes, closing appliances and seals',
      'Photograph all defects and report',
      'Update structural inspection records'
    ],
    safetyNotes: 'Confined space entry – PTW required. Minimum O2: 20.5%. Maximum LEL: 0%. Attendant must remain outside at all times.'
  },
  {
    id: 'jp15', code: 'JP-LOP-001', title: 'M/E Lube Oil Pump Overhaul',
    equipmentId: '310.02.01', equipmentName: 'M/E LUBE OIL PUMP', system: 'Main Engine System',
    frequencyType: 'Running Hours', interval: 8000, intervalUnit: 'RH',
    responsibleRank: '2nd Engineer', estimatedDuration: 6,
    lastDone: '2023-04-10', nextDue: '2025-08-15', status: 'Active',
  },
  {
    id: 'jp16', code: 'JP-PU-001', title: 'LO Purifier Service & Overhaul',
    equipmentId: '310.02.03', equipmentName: 'LUBE OIL PURIFIER', system: 'Main Engine System',
    frequencyType: 'Calendar', interval: 6, intervalUnit: 'Months',
    responsibleRank: '2nd Engineer', estimatedDuration: 6,
    lastDone: '2024-09-30', nextDue: '2025-03-30', status: 'Active',
  },
  {
    id: 'jp17', code: 'JP-RAD-001', title: 'Radar Performance Check',
    equipmentId: '710.01', equipmentName: 'MAIN RADAR (X-BAND)', system: 'Bridge Equipment',
    frequencyType: 'Calendar', interval: 3, intervalUnit: 'Months',
    responsibleRank: '2nd Officer', estimatedDuration: 1,
    lastDone: '2024-12-05', nextDue: '2025-03-05', status: 'Active',
  },
  {
    id: 'jp18', code: 'JP-GMDSS-001', title: 'GMDSS Equipment Battery Test',
    equipmentId: '710.05', equipmentName: 'GMDSS CONSOLE', system: 'Bridge Equipment',
    frequencyType: 'Calendar', interval: 1, intervalUnit: 'Months',
    responsibleRank: 'GMDSS Officer', estimatedDuration: 1,
    lastDone: '2024-12-10', nextDue: '2025-01-10', status: 'Due Soon',
  },
  {
    id: 'jp19', code: 'JP-WL-001', title: 'Windlass & Mooring Winch Monthly Greasing',
    equipmentId: '610.01', equipmentName: 'WINDLASS', system: 'Deck Machinery',
    frequencyType: 'Calendar', interval: 1, intervalUnit: 'Months',
    responsibleRank: 'Chief Officer', estimatedDuration: 2,
    lastDone: '2025-01-02', nextDue: '2025-02-02', status: 'Active',
  },
  {
    id: 'jp20', code: 'JP-CR-001', title: 'Deck Crane Annual Inspection (Class)',
    equipmentId: '610.06', equipmentName: 'CRANE NO.1', system: 'Deck Machinery',
    frequencyType: 'Calendar', interval: 12, intervalUnit: 'Months',
    responsibleRank: 'Chief Officer', estimatedDuration: 8,
    lastDone: '2024-02-20', nextDue: '2025-02-20', status: 'Active',
    safetyNotes: 'Class-approved load test required. Minimum SWL test: 1.25 × working load.'
  },
];

export const getJobPlansByEquipment = (equipmentId: string) =>
  jobPlans.filter(jp => jp.equipmentId === equipmentId);
