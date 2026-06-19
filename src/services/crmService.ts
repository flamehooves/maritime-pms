import type {
  Vessel, Equipment, JobPlan, JobOrder, Defect, SparePart,
  EquipmentSpec, EquipmentSurvey, ConditionOfClass, EquipmentMemorandum, HseqRecord, CrmAttachment,
} from '../types';

const TOKEN_KEY      = 'pls_access_token';
const API_DOMAIN_KEY = 'pls_api_domain';
const DEFAULT_DOMAIN = 'https://www.zohoapis.in';

function getHeaders(): Record<string, string> {
  const token = localStorage.getItem(TOKEN_KEY);
  return { Authorization: `Zoho-oauthtoken ${token}` };
}

function getBase(): string {
  return (localStorage.getItem(API_DOMAIN_KEY) ?? DEFAULT_DOMAIN) + '/crm/v3';
}

async function safeJson(res: Response): Promise<Record<string, unknown>> {
  const text = await res.text();
  if (!text || text.trim() === '') return {};
  try { return JSON.parse(text); } catch { return {}; }
}

async function fetchAll(module: string, fields: string[]): Promise<unknown[]> {
  const url = `${getBase()}/${module}?fields=${fields.join(',')}&per_page=200`;
  const res = await fetch(url, { headers: getHeaders() });

  // 204 No Content or empty body → no records
  const text = await res.text();
  if (!text || text.trim() === '') return [];

  let json: Record<string, unknown>;
  try {
    json = JSON.parse(text);
  } catch {
    throw new Error(`CRM returned non-JSON response (status ${res.status})`);
  }

  // Zoho returns {"code":"NO_DATA","status":"error"} when module is empty
  if (json.status === 'error' || json.code === 'NO_DATA' || json.code === 'EMPTY_DATA') return [];

  if (!res.ok) throw new Error(`CRM error: ${String(json.message ?? res.status)}`);

  return (json.data as unknown[]) ?? [];
}

async function searchRecords(module: string, fields: string[], criteria: string): Promise<unknown[]> {
  const url = `${getBase()}/${module}/search?criteria=${encodeURIComponent(criteria)}&fields=${fields.join(',')}&per_page=200`;
  const res = await fetch(url, { headers: getHeaders() });
  const json = await safeJson(res);
  if (json.status === 'error' || json.code === 'NO_DATA' || json.code === 'EMPTY_DATA') return [];
  return (json.data as unknown[]) ?? [];
}

async function createRecord(module: string, data: Record<string, unknown>): Promise<string> {
  const url = `${getBase()}/${module}`;
  const res = await fetch(url, {
    method: 'POST',
    headers: { ...getHeaders(), 'Content-Type': 'application/json' },
    body: JSON.stringify({ data: [data] }),
  });
  if (!res.ok) throw new Error(`CRM create failed: ${res.status}`);
  const json = await res.json();
  return json.data?.[0]?.details?.id ?? '';
}

async function updateRecord(module: string, id: string, data: Record<string, unknown>): Promise<void> {
  const url = `${getBase()}/${module}/${id}`;
  const res = await fetch(url, {
    method: 'PUT',
    headers: { ...getHeaders(), 'Content-Type': 'application/json' },
    body: JSON.stringify({ data: [{ id, ...data }] }),
  });
  if (!res.ok) throw new Error(`CRM update failed: ${res.status}`);
}

async function deleteRecord(module: string, id: string): Promise<void> {
  const url = `${getBase()}/${module}/${id}`;
  const res = await fetch(url, { method: 'DELETE', headers: getHeaders() });
  if (!res.ok) throw new Error(`CRM delete failed: ${res.status}`);
}

// ── Vessels ────────────────────────────────────────────────────────────────

const VESSEL_FIELDS = ['Name', 'IMO_Number', 'Vessel_Type', 'Flag', 'Gross_Tonnage',
  'Build_Year', 'Classification_Society', 'Vessel_Status', 'Current_Port',
  'Vessel_Image_URL', 'Map_Position_X', 'Map_Position_Y', 'Call_Sign', 'Manager', 'DWT', 'GRT'];

function mapVessel(r: Record<string, unknown>): Vessel & { imageUrl?: string; mapPosition?: { x: number; y: number } } {
  const mx = r.Map_Position_X != null ? Number(r.Map_Position_X) : null;
  const my = r.Map_Position_Y != null ? Number(r.Map_Position_Y) : null;
  return {
    id: String(r.id),
    name: String(r.Name ?? ''),
    imo: String(r.IMO_Number ?? ''),
    type: String(r.Vessel_Type ?? ''),
    flag: String(r.Flag ?? ''),
    buildYear: Number(r.Build_Year ?? 0),
    owner: '',
    manager: String(r.Manager ?? ''),
    status: 'active',
    classSociety: String(r.Classification_Society ?? ''),
    dwt: Number(r.DWT ?? r.Gross_Tonnage ?? 0),
    grt: Number(r.GRT ?? r.Gross_Tonnage ?? 0),
    callSign: String(r.Call_Sign ?? ''),
    port: String(r.Current_Port ?? ''),
    vesselStatus: (r.Vessel_Status as Vessel['vesselStatus']) ?? 'at_sea',
    imageUrl: String(r.Vessel_Image_URL ?? '') || undefined,
    mapPosition: mx != null && my != null && !isNaN(mx) && !isNaN(my) ? { x: mx, y: my } : undefined,
  };
}

export async function fetchVessels(): Promise<(Vessel & { imageUrl?: string })[]> {
  const rows = await fetchAll('Vessels', VESSEL_FIELDS);
  return (rows as Record<string, unknown>[]).map(mapVessel);
}

export async function fetchVesselById(id: string): Promise<(Vessel & { imageUrl?: string }) | null> {
  const url = `${getBase()}/Vessels/${id}?fields=${VESSEL_FIELDS.join(',')}`;
  const res = await fetch(url, { headers: getHeaders() });
  const text = await res.text();
  if (!text || !res.ok) return null;
  try {
    const json = JSON.parse(text);
    const r = json.data?.[0] ?? json;
    if (!r || !r.id) return null;
    return mapVessel(r as Record<string, unknown>);
  } catch { return null; }
}

export async function updateVesselImageUrl(id: string, imageUrl: string): Promise<void> {
  return updateRecord('Vessels', id, { Vessel_Image_URL: imageUrl });
}

export async function createVessel(v: Partial<Vessel>): Promise<string> {
  return createRecord('Vessels', {
    Name: v.name,
    IMO_Number: v.imo,
    Vessel_Type: v.type,
    Flag: v.flag,
    Build_Year: v.buildYear,
    GRT: v.grt,
    DWT: v.dwt,
    Classification_Society: v.classSociety,
    Vessel_Status: v.vesselStatus ?? 'at_sea',
    Current_Port: v.port,
    Call_Sign: v.callSign,
    Manager: v.manager,
  });
}

export async function updateVessel(id: string, v: Partial<Vessel>): Promise<void> {
  return updateRecord('Vessels', id, {
    Name: v.name,
    Vessel_Type: v.type,
    Flag: v.flag,
    Build_Year: v.buildYear,
    GRT: v.grt,
    DWT: v.dwt,
    Classification_Society: v.classSociety,
    Vessel_Status: v.vesselStatus,
    Current_Port: v.port,
    Call_Sign: v.callSign,
    Manager: v.manager,
  });
}

export async function deleteVessel(id: string): Promise<void> {
  return deleteRecord('Vessels', id);
}

// ── Equipments ─────────────────────────────────────────────────────────────

const EQ_FIELDS = [
  'Name', 'Equipment_Name', 'Vessel', 'System', 'Equipment_Type', 'Maker', 'Model',
  'Serial_Number', 'Equipment_Status', 'Criticality', 'Install_Date',
  'Last_Maintenance_Date', 'Next_Due_Date', 'Location_On_Vessel', 'Responsible_Rank',
  'Parent_Equipment',
  'Class_Reference', 'Safety_Level', 'Builder_Licence', 'Drawing_Number', 'Department',
  'Class_Name', 'Preferred_Vendor', 'Running_Hours', 'ID_Number', 'Part_Number', 'IMO_Tier',
  'Equipment_Dimension', 'Equipment_Material',
  'Is_Alarm', 'Is_Main_Engine', 'Is_Circulating', 'Mount_Allowed', 'RHRS_Separately', 'MD_Required',
];

function mapEquipment(r: Record<string, unknown>): Equipment {
  const vessel = r.Vessel as Record<string, unknown> | null;
  const parent = r.Parent_Equipment as Record<string, unknown> | null;
  return {
    id: String(r.id),
    crmCode: String(r.Name ?? ''),
    code: String(r.Name ?? ''),      // will be overwritten with hierarchy code in buildEquipmentTree
    name: String((r.Equipment_Name as string) ?? r.Name ?? ''),
    system: String(r.System ?? ''),
    type: String(r.Equipment_Type ?? ''),
    maker: String(r.Maker ?? ''),
    model: String(r.Model ?? ''),
    serial: String(r.Serial_Number ?? ''),
    status: (r.Equipment_Status as Equipment['status']) ?? 'operational',
    criticality: (r.Criticality as Equipment['criticality']) ?? 'medium',
    installDate: String(r.Install_Date ?? ''),
    lastMaintenance: String(r.Last_Maintenance_Date ?? ''),
    nextDue: String(r.Next_Due_Date ?? ''),
    location: String(r.Location_On_Vessel ?? ''),
    responsibleRank: String(r.Responsible_Rank ?? ''),
    parentId: parent ? String(parent.id) : undefined,
    parentName: parent ? String(parent.name) : undefined,
    vesselId: vessel ? String(vessel.id) : undefined,
    // Extended fields
    classRef: String(r.Class_Reference ?? ''),
    safetyLevel: String(r.Safety_Level ?? ''),
    builderLicence: String(r.Builder_Licence ?? ''),
    drawingNumber: String(r.Drawing_Number ?? ''),
    department: String(r.Department ?? ''),
    className: String(r.Class_Name ?? ''),
    preferredVendor: String(r.Preferred_Vendor ?? ''),
    runningHours: r.Running_Hours != null ? Number(r.Running_Hours) : undefined,
    idNumber: String(r.ID_Number ?? ''),
    partNumber: String(r.Part_Number ?? ''),
    imoTier: String(r.IMO_Tier ?? ''),
    equipmentDimension: String(r.Equipment_Dimension ?? ''),
    equipmentMaterial: String(r.Equipment_Material ?? ''),
    isAlarm: r.Is_Alarm === true,
    isMainEngine: r.Is_Main_Engine === true,
    isCirculating: r.Is_Circulating === true,
    mountAllowed: r.Mount_Allowed === true,
    rhrsSeparately: r.RHRS_Separately === true,
    mdRequired: r.MD_Required === true,
  };
}

export async function fetchEquipments(vesselId?: string): Promise<Equipment[]> {
  const rows = await fetchAll('Equipments', EQ_FIELDS);
  const mapped = (rows as Record<string, unknown>[]).map(mapEquipment);
  if (vesselId && vesselId !== '__all__') {
    return mapped.filter(e => e.vesselId === vesselId);
  }
  return mapped;
}

export async function createEquipment(e: Partial<Equipment>, vesselId?: string): Promise<string> {
  return createRecord('Equipments', {
    Equipment_Name: e.name,
    Vessel: vesselId ? { id: vesselId } : undefined,
    System: e.system,
    Equipment_Type: e.type,
    Maker: e.maker,
    Model: e.model,
    Serial_Number: e.serial,
    Equipment_Status: e.status ?? 'operational',
    Criticality: e.criticality ?? 'medium',
    Location_On_Vessel: e.location,
    Responsible_Rank: e.responsibleRank,
  });
}

export async function updateEquipment(id: string, e: Partial<Equipment>): Promise<void> {
  return updateRecord('Equipments', id, {
    Equipment_Name: e.name,
    Equipment_Status: e.status,
    Last_Maintenance_Date: e.lastMaintenance,
    Next_Due_Date: e.nextDue,
  });
}

export async function deleteEquipment(id: string): Promise<void> {
  return deleteRecord('Equipments', id);
}

// ── Job Plans ──────────────────────────────────────────────────────────────

export const FREQ_OPTIONS = ['Daily', 'Weekly', 'Monthly', 'Quarterly', 'Half Yearly', 'Annual', '2 Years', '5 Years'] as const;
export type FreqOption = typeof FREQ_OPTIONS[number];

export const FREQ_TO_DAYS: Record<string, number> = {
  'Daily': 1, 'Weekly': 7, 'Monthly': 30, 'Quarterly': 90,
  'Half Yearly': 180, 'Annual': 365, '2 Years': 730, '5 Years': 1825,
};

function daysToFreq(days: number): string {
  const entries = Object.entries(FREQ_TO_DAYS).sort((a, b) => a[1] - b[1]);
  let best = entries[0][0];
  let bestDiff = Math.abs(days - entries[0][1]);
  for (const [label, d] of entries) {
    const diff = Math.abs(days - d);
    if (diff < bestDiff) { bestDiff = diff; best = label; }
  }
  return best;
}

const JP_FIELDS = ['Name', 'Plan_Code', 'Equipment', 'Vessel', 'Maintenance_Category',
  'Frequency', 'Estimated_Hours', 'Priority', 'Description',
  'Last_Executed', 'Next_Due_Date', 'Assigned_Rank'];

function mapJobPlan(r: Record<string, unknown>): JobPlan {
  const eq = r.Equipment as Record<string, unknown> | null;
  const freqStr = String(r.Frequency ?? '');
  return {
    id: String(r.id),
    code: String(r.Plan_Code ?? r.Name ?? ''),
    title: String(r.Name ?? ''),
    equipmentId: eq ? String(eq.id) : '',
    equipmentName: eq ? String(eq.name) : '',
    system: '',
    frequencyType: 'Calendar',
    interval: FREQ_TO_DAYS[freqStr] ?? 90,
    intervalUnit: 'days',
    responsibleRank: String(r.Assigned_Rank ?? ''),
    estimatedDuration: Number(r.Estimated_Hours ?? 0),
    lastDone: String(r.Last_Executed ?? ''),
    nextDue: String(r.Next_Due_Date ?? ''),
    status: 'Active',
  };
}

export async function fetchJobPlans(vesselId?: string): Promise<JobPlan[]> {
  const rows = await fetchAll('Job_Plans', JP_FIELDS);
  const mapped = (rows as Record<string, unknown>[]).map(mapJobPlan);
  if (vesselId && vesselId !== '__all__') {
    const vessels = (rows as Record<string, unknown>[]);
    return mapped.filter((_, i) => {
      const v = vessels[i].Vessel as Record<string, unknown> | null;
      return v ? String(v.id) === vesselId : true;
    });
  }
  return mapped;
}

export async function createJobPlan(jp: Partial<JobPlan>, vesselId?: string): Promise<string> {
  return createRecord('Job_Plans', {
    Name: jp.title,
    Plan_Code: jp.code,
    Equipment: jp.equipmentId ? { id: jp.equipmentId } : undefined,
    Vessel: vesselId ? { id: vesselId } : undefined,
    Frequency: daysToFreq(jp.interval ?? 90),
    Estimated_Hours: jp.estimatedDuration || undefined,
    Priority: 'Medium',
    Assigned_Rank: jp.responsibleRank || undefined,
    Last_Executed: jp.lastDone || undefined,
    Next_Due_Date: jp.nextDue || undefined,
  });
}

export async function updateJobPlan(id: string, jp: Partial<JobPlan>): Promise<void> {
  return updateRecord('Job_Plans', id, {
    Name: jp.title,
    Last_Executed: jp.lastDone,
    Next_Due_Date: jp.nextDue,
  });
}

export async function deleteJobPlan(id: string): Promise<void> {
  return deleteRecord('Job_Plans', id);
}

// ── Job Orders ─────────────────────────────────────────────────────────────

const JO_FIELDS = ['Name', 'Job_Title', 'Job_Plan', 'Equipment', 'Vessel', 'Job_Status',
  'Priority', 'Assigned_To_Rank', 'Start_Date', 'Due_Date', 'Completed_Date',
  'Actual_Hours', 'Work_Description', 'Work_Done'];

function mapJobOrder(r: Record<string, unknown>): JobOrder {
  const eq = r.Equipment as Record<string, unknown> | null;
  const vessel = r.Vessel as Record<string, unknown> | null;
  const jp = r.Job_Plan as Record<string, unknown> | null;
  return {
    id: String(r.id),
    joNumber: String(r.Name ?? ''),
    title: String((r.Job_Title as string) ?? r.Name ?? ''),
    equipmentId: eq ? String(eq.id) : '',
    equipmentCode: '',
    equipmentName: eq ? String(eq.name) : '',
    system: '',
    vessel: vessel ? String(vessel.name) : '',
    linkedPlanId: jp ? String(jp.id) : undefined,
    linkedPlanCode: jp ? String(jp.name) : undefined,
    assignedTo: String(r.Assigned_To_Rank ?? ''),
    priority: (r.Priority as JobOrder['priority']) ?? 'Medium',
    dueDate: String(r.Due_Date ?? ''),
    completionDate: String(r.Completed_Date ?? '') || undefined,
    status: (r.Job_Status as JobOrder['status']) ?? 'Not Started',
    estimatedHours: 0,
    actualHours: Number(r.Actual_Hours ?? 0) || undefined,
    remarks: String(r.Work_Description ?? '') || undefined,
  };
}

export async function fetchJobOrders(vesselId?: string): Promise<JobOrder[]> {
  const rows = await fetchAll('Job_Orders', JO_FIELDS);
  const mapped = (rows as Record<string, unknown>[]).map(mapJobOrder);
  if (vesselId && vesselId !== '__all__') {
    return mapped.filter((_, i) => {
      const v = (rows as Record<string, unknown>[])[i].Vessel as Record<string, unknown> | null;
      return v ? String(v.id) === vesselId : true;
    });
  }
  return mapped;
}

export async function createJobOrder(jo: Partial<JobOrder>, vesselId?: string): Promise<string> {
  return createRecord('Job_Orders', {
    Job_Title: jo.title,
    Equipment: jo.equipmentId ? { id: jo.equipmentId } : undefined,
    Vessel: vesselId ? { id: vesselId } : undefined,
    Job_Plan: jo.linkedPlanId ? { id: jo.linkedPlanId } : undefined,
    Job_Status: jo.status ?? 'Not Started',
    Priority: jo.priority ?? 'Medium',
    Assigned_To_Rank: jo.assignedTo,
    Due_Date: jo.dueDate,
    Work_Description: jo.remarks,
  });
}

export async function updateJobOrder(id: string, jo: Partial<JobOrder>): Promise<void> {
  return updateRecord('Job_Orders', id, {
    Job_Status: jo.status,
    Completed_Date: jo.completionDate,
    Actual_Hours: jo.actualHours,
    Work_Done: jo.remarks,
  });
}

export async function deleteJobOrder(id: string): Promise<void> {
  return deleteRecord('Job_Orders', id);
}

export async function fetchJobOrdersForApproval(): Promise<JobOrder[]> {
  const rows = await searchRecords(
    'Job_Orders', JO_FIELDS,
    '(Job_Status:equals:Awaiting Review)',
  );
  return (rows as Record<string, unknown>[]).map(mapJobOrder);
}

export async function fetchApprovalHistory(): Promise<JobOrder[]> {
  const [approved, reopened] = await Promise.all([
    searchRecords('Job_Orders', JO_FIELDS, '(Job_Status:equals:Approved)'),
    searchRecords('Job_Orders', JO_FIELDS, '(Job_Status:equals:Reopened)'),
  ]);
  return [
    ...(approved as Record<string, unknown>[]).map(mapJobOrder),
    ...(reopened as Record<string, unknown>[]).map(mapJobOrder),
  ];
}

export async function approveJobOrder(id: string): Promise<void> {
  return updateRecord('Job_Orders', id, { Job_Status: 'Approved' });
}

export async function rejectJobOrder(id: string, remarks: string): Promise<void> {
  return updateRecord('Job_Orders', id, { Job_Status: 'Reopened', Work_Done: remarks });
}

// ── Defects ────────────────────────────────────────────────────────────────

const DEFECT_FIELDS = ['Name', 'Defect_Title', 'Equipment', 'Vessel', 'Severity',
  'Defect_Status', 'Reported_By', 'Report_Date', 'Defect_Description',
  'Corrective_Action', 'Resolved_Date', 'Related_Job_Order'];

function mapDefect(r: Record<string, unknown>): Defect {
  const eq = r.Equipment as Record<string, unknown> | null;
  const vessel = r.Vessel as Record<string, unknown> | null;
  const jo = r.Related_Job_Order as Record<string, unknown> | null;
  return {
    id: String(r.id),
    defectId: String(r.Name ?? ''),
    equipmentId: eq ? String(eq.id) : '',
    equipmentCode: '',
    equipmentName: eq ? String(eq.name) : '',
    system: '',
    vessel: vessel ? String(vessel.name) : '',
    severity: (r.Severity as Defect['severity']) ?? 'Medium',
    description: String((r.Defect_Description as string) ?? ''),
    reportedBy: String(r.Reported_By ?? ''),
    reportedDate: String(r.Report_Date ?? ''),
    status: (r.Defect_Status as Defect['status']) ?? 'Open',
    linkedJobOrderId: jo ? String(jo.id) : undefined,
    linkedJobOrderNumber: jo ? String(jo.name) : undefined,
    resolution: String(r.Corrective_Action ?? '') || undefined,
    resolvedDate: String(r.Resolved_Date ?? '') || undefined,
  };
}

export async function fetchDefects(vesselId?: string): Promise<Defect[]> {
  const rows = await fetchAll('Defects', DEFECT_FIELDS);
  const mapped = (rows as Record<string, unknown>[]).map(mapDefect);
  if (vesselId && vesselId !== '__all__') {
    return mapped.filter((_, i) => {
      const v = (rows as Record<string, unknown>[])[i].Vessel as Record<string, unknown> | null;
      return v ? String(v.id) === vesselId : true;
    });
  }
  return mapped;
}

export async function createDefect(d: Partial<Defect>, vesselId?: string): Promise<string> {
  return createRecord('Defects', {
    Defect_Title: d.description,
    Equipment: d.equipmentId ? { id: d.equipmentId } : undefined,
    Vessel: vesselId ? { id: vesselId } : undefined,
    Severity: d.severity ?? 'Medium',
    Defect_Status: d.status ?? 'Open',
    Reported_By: d.reportedBy,
    Report_Date: d.reportedDate,
    Defect_Description: d.description,
  });
}

export async function updateDefect(id: string, d: Partial<Defect>): Promise<void> {
  return updateRecord('Defects', id, {
    Defect_Status: d.status,
    Corrective_Action: d.resolution,
    Resolved_Date: d.resolvedDate,
    Related_Job_Order: d.linkedJobOrderId ? { id: d.linkedJobOrderId } : undefined,
  });
}

export async function deleteDefect(id: string): Promise<void> {
  return deleteRecord('Defects', id);
}

// ── Spare Parts ────────────────────────────────────────────────────────────

const SP_FIELDS = ['Name', 'Part_Number', 'Equipment', 'Vessel', 'Quantity_On_Board',
  'Minimum_Quantity', 'Unit', 'Maker', 'Storage_Location', 'Part_Description',
  'Last_Ordered_Date', 'Unit_Price'];

function mapSparePart(r: Record<string, unknown>): SparePart {
  const eq = r.Equipment as Record<string, unknown> | null;
  return {
    id: String(r.id),
    partNumber: String(r.Part_Number ?? ''),
    description: String((r.Part_Description as string) ?? r.Name ?? ''),
    equipmentId: eq ? String(eq.id) : '',
    equipmentName: eq ? String(eq.name) : '',
    system: '',
    maker: String(r.Maker ?? ''),
    compatibleModel: '',
    category: '',
    qtyOnboard: Number(r.Quantity_On_Board ?? 0),
    minStock: Number(r.Minimum_Quantity ?? 0),
    reorderLevel: Number(r.Minimum_Quantity ?? 0),
    location: String(r.Storage_Location ?? ''),
    unit: String(r.Unit ?? 'pcs'),
    isCritical: false,
    lastUsed: String(r.Last_Ordered_Date ?? '') || undefined,
    unitCost: Number(r.Unit_Price ?? 0) || undefined,
  };
}

export async function fetchSpareParts(vesselId?: string): Promise<SparePart[]> {
  const rows = await fetchAll('Spare_Parts', SP_FIELDS);
  const mapped = (rows as Record<string, unknown>[]).map(mapSparePart);
  if (vesselId && vesselId !== '__all__') {
    return mapped.filter((_, i) => {
      const v = (rows as Record<string, unknown>[])[i].Vessel as Record<string, unknown> | null;
      return v ? String(v.id) === vesselId : true;
    });
  }
  return mapped;
}

export async function createSparePart(sp: Partial<SparePart>, vesselId?: string): Promise<string> {
  return createRecord('Spare_Parts', {
    Name: sp.description,
    Part_Number: sp.partNumber,
    Equipment: sp.equipmentId ? { id: sp.equipmentId } : undefined,
    Vessel: vesselId ? { id: vesselId } : undefined,
    Quantity_On_Board: sp.qtyOnboard,
    Minimum_Quantity: sp.minStock,
    Unit: sp.unit,
    Maker: sp.maker,
    Storage_Location: sp.location,
    Part_Description: sp.description,
  });
}

export async function updateSparePart(id: string, sp: Partial<SparePart>): Promise<void> {
  return updateRecord('Spare_Parts', id, {
    Quantity_On_Board: sp.qtyOnboard,
    Storage_Location: sp.location,
  });
}

export async function deleteSparePart(id: string): Promise<void> {
  return deleteRecord('Spare_Parts', id);
}

// ── Equipment Specifications ────────────────────────────────────────────────

const SPEC_FIELDS = ['Name', 'Equipment', 'Spec_Category', 'Spec_Name', 'Spec_Value', 'Unit', 'Sequence_No'];

function mapSpec(r: Record<string, unknown>): EquipmentSpec {
  const eq = r.Equipment as Record<string, unknown> | null;
  return {
    id: String(r.id),
    equipmentId: eq ? String(eq.id) : '',
    category: String(r.Spec_Category ?? ''),
    specName: String(r.Spec_Name ?? r.Name ?? ''),
    specValue: String(r.Spec_Value ?? ''),
    unit: String(r.Unit ?? ''),
    sequenceNo: r.Sequence_No != null ? Number(r.Sequence_No) : undefined,
  };
}

export async function fetchSpecs(equipmentId: string): Promise<EquipmentSpec[]> {
  const rows = await searchRecords('Equipment_Specifications', SPEC_FIELDS,
    `(Equipment:equals:${equipmentId})`);
  return (rows as Record<string, unknown>[]).map(mapSpec);
}

export async function createSpec(spec: Partial<EquipmentSpec>): Promise<string> {
  return createRecord('Equipment_Specifications', {
    Name: spec.specName,
    Equipment: spec.equipmentId ? { id: spec.equipmentId } : undefined,
    Spec_Category: spec.category,
    Spec_Name: spec.specName,
    Spec_Value: spec.specValue,
    Unit: spec.unit || undefined,
    Sequence_No: spec.sequenceNo || undefined,
  });
}

export async function deleteSpec(id: string): Promise<void> {
  return deleteRecord('Equipment_Specifications', id);
}

// ── Equipment Surveys ───────────────────────────────────────────────────────

const SURVEY_FIELDS = ['Name', 'Equipment', 'Survey_Type', 'Survey_Date', 'Due_Date',
  'Certificate_Number', 'Survey_Status', 'Surveyor', 'Classification_Society', 'Survey_Remarks'];

function mapSurvey(r: Record<string, unknown>): EquipmentSurvey {
  const eq = r.Equipment as Record<string, unknown> | null;
  return {
    id: String(r.id),
    equipmentId: eq ? String(eq.id) : '',
    surveyType: String(r.Survey_Type ?? ''),
    surveyDate: String(r.Survey_Date ?? ''),
    dueDate: String(r.Due_Date ?? ''),
    certificateNumber: String(r.Certificate_Number ?? r.Name ?? ''),
    status: String(r.Survey_Status ?? ''),
    surveyor: String(r.Surveyor ?? ''),
    classificationSociety: String(r.Classification_Society ?? ''),
    remarks: String(r.Survey_Remarks ?? '') || undefined,
  };
}

export async function fetchSurveys(equipmentId: string): Promise<EquipmentSurvey[]> {
  const rows = await searchRecords('Equipment_Surveys', SURVEY_FIELDS,
    `(Equipment:equals:${equipmentId})`);
  return (rows as Record<string, unknown>[]).map(mapSurvey);
}

export async function createSurvey(s: Partial<EquipmentSurvey>): Promise<string> {
  return createRecord('Equipment_Surveys', {
    Name: s.certificateNumber || s.surveyType,
    Equipment: s.equipmentId ? { id: s.equipmentId } : undefined,
    Survey_Type: s.surveyType,
    Survey_Date: s.surveyDate || undefined,
    Due_Date: s.dueDate || undefined,
    Certificate_Number: s.certificateNumber,
    Survey_Status: s.status ?? 'Valid',
    Surveyor: s.surveyor,
    Classification_Society: s.classificationSociety,
    Survey_Remarks: s.remarks || undefined,
  });
}

export async function deleteSurvey(id: string): Promise<void> {
  return deleteRecord('Equipment_Surveys', id);
}

// ── Condition Of Class ──────────────────────────────────────────────────────

const COC_FIELDS = ['Name', 'Equipment', 'COC_Number', 'COC_Description', 'Issued_Date',
  'Due_Date', 'COC_Status', 'Closed_Date', 'COC_Remarks'];

function mapCoc(r: Record<string, unknown>): ConditionOfClass {
  const eq = r.Equipment as Record<string, unknown> | null;
  return {
    id: String(r.id),
    equipmentId: eq ? String(eq.id) : '',
    cocNumber: String(r.COC_Number ?? r.Name ?? ''),
    description: String(r.COC_Description ?? ''),
    issuedDate: String(r.Issued_Date ?? ''),
    dueDate: String(r.Due_Date ?? ''),
    status: String(r.COC_Status ?? ''),
    closedDate: String(r.Closed_Date ?? '') || undefined,
    remarks: String(r.COC_Remarks ?? '') || undefined,
  };
}

export async function fetchCocs(equipmentId: string): Promise<ConditionOfClass[]> {
  const rows = await searchRecords('Condition_Of_Class', COC_FIELDS,
    `(Equipment:equals:${equipmentId})`);
  return (rows as Record<string, unknown>[]).map(mapCoc);
}

export async function createCoc(c: Partial<ConditionOfClass>): Promise<string> {
  return createRecord('Condition_Of_Class', {
    Name: c.cocNumber,
    Equipment: c.equipmentId ? { id: c.equipmentId } : undefined,
    COC_Number: c.cocNumber,
    COC_Description: c.description,
    Issued_Date: c.issuedDate || undefined,
    Due_Date: c.dueDate || undefined,
    COC_Status: c.status ?? 'Open',
    Closed_Date: c.closedDate || undefined,
    COC_Remarks: c.remarks || undefined,
  });
}

export async function deleteCoc(id: string): Promise<void> {
  return deleteRecord('Condition_Of_Class', id);
}

// ── Equipment Memoranda ─────────────────────────────────────────────────────

const MEMO_FIELDS = ['Name', 'Equipment', 'Subject', 'Memo_Date', 'Memo_Content', 'Memo_Author', 'Memo_Priority'];

function mapMemo(r: Record<string, unknown>): EquipmentMemorandum {
  const eq = r.Equipment as Record<string, unknown> | null;
  return {
    id: String(r.id),
    equipmentId: eq ? String(eq.id) : '',
    subject: String(r.Subject ?? r.Name ?? ''),
    memoDate: String(r.Memo_Date ?? ''),
    content: String(r.Memo_Content ?? ''),
    author: String(r.Memo_Author ?? ''),
    priority: String(r.Memo_Priority ?? 'Info'),
  };
}

export async function fetchMemos(equipmentId: string): Promise<EquipmentMemorandum[]> {
  const rows = await searchRecords('Equipment_Memoranda', MEMO_FIELDS,
    `(Equipment:equals:${equipmentId})`);
  return (rows as Record<string, unknown>[]).map(mapMemo);
}

export async function createMemo(m: Partial<EquipmentMemorandum>): Promise<string> {
  return createRecord('Equipment_Memoranda', {
    Name: m.subject,
    Equipment: m.equipmentId ? { id: m.equipmentId } : undefined,
    Subject: m.subject,
    Memo_Date: m.memoDate || undefined,
    Memo_Content: m.content,
    Memo_Author: m.author,
    Memo_Priority: m.priority ?? 'Info',
  });
}

export async function deleteMemo(id: string): Promise<void> {
  return deleteRecord('Equipment_Memoranda', id);
}

// ── HSEQ Records ────────────────────────────────────────────────────────────

const HSEQ_FIELDS = ['Name', 'Equipment', 'Record_Type', 'HSEQ_Title', 'HSEQ_Date',
  'HSEQ_Description', 'HSEQ_Status', 'HSEQ_Author', 'Action_Required'];

function mapHseq(r: Record<string, unknown>): HseqRecord {
  const eq = r.Equipment as Record<string, unknown> | null;
  return {
    id: String(r.id),
    equipmentId: eq ? String(eq.id) : '',
    recordType: String(r.Record_Type ?? ''),
    title: String(r.HSEQ_Title ?? r.Name ?? ''),
    date: String(r.HSEQ_Date ?? ''),
    description: String(r.HSEQ_Description ?? ''),
    status: String(r.HSEQ_Status ?? ''),
    author: String(r.HSEQ_Author ?? ''),
    actionRequired: String(r.Action_Required ?? '') || undefined,
  };
}

export async function fetchHseq(equipmentId: string): Promise<HseqRecord[]> {
  const rows = await searchRecords('HSEQ_Records', HSEQ_FIELDS,
    `(Equipment:equals:${equipmentId})`);
  return (rows as Record<string, unknown>[]).map(mapHseq);
}

export async function createHseqRecord(h: Partial<HseqRecord>): Promise<string> {
  return createRecord('HSEQ_Records', {
    Name: h.title,
    Equipment: h.equipmentId ? { id: h.equipmentId } : undefined,
    Record_Type: h.recordType,
    HSEQ_Title: h.title,
    HSEQ_Date: h.date || undefined,
    HSEQ_Description: h.description,
    HSEQ_Status: h.status ?? 'Open',
    HSEQ_Author: h.author,
    Action_Required: h.actionRequired || undefined,
  });
}

export async function deleteHseqRecord(id: string): Promise<void> {
  return deleteRecord('HSEQ_Records', id);
}

// ── Equipment Attachments (CRM native) ──────────────────────────────────────

export async function fetchAttachments(module: string, recordId: string): Promise<CrmAttachment[]> {
  const url = `${getBase()}/${module}/${recordId}/Attachments`;
  const res = await fetch(url, { headers: getHeaders() });
  const text = await res.text();
  if (!text || text.trim() === '') return [];
  try {
    const json = JSON.parse(text);
    if (json.status === 'error' || json.code === 'NO_DATA') return [];
    return ((json.data ?? []) as Record<string, unknown>[]).map(r => ({
      id: String(r.id),
      fileName: String(r.File_Name ?? ''),
      size: Number(r.Size ?? 0),
      createdTime: String(r.Created_Time ?? ''),
      createdBy: (r.$owner as Record<string, unknown>)?.name as string ?? '',
      description: String(r.Description ?? ''),
    }));
  } catch { return []; }
}

export async function uploadAttachment(module: string, recordId: string, file: File, description?: string): Promise<void> {
  const url = `${getBase()}/${module}/${recordId}/Attachments`;
  const form = new FormData();
  form.append('file', file);
  if (description) form.append('description', description);
  const headers: Record<string, string> = { ...getHeaders() };
  const res = await fetch(url, { method: 'POST', headers, body: form });
  if (!res.ok) throw new Error(`Upload failed: ${res.status}`);
}

export async function deleteAttachment(module: string, recordId: string, attachmentId: string): Promise<void> {
  const url = `${getBase()}/${module}/${recordId}/Attachments/${attachmentId}`;
  const res = await fetch(url, { method: 'DELETE', headers: getHeaders() });
  if (!res.ok) throw new Error(`Delete attachment failed: ${res.status}`);
}

export function getAttachmentDownloadUrl(module: string, recordId: string, attachmentId: string): string {
  const base = (localStorage.getItem('pls_api_domain') ?? 'https://www.zohoapis.in') + '/crm/v3';
  const token = localStorage.getItem('pls_access_token');
  return `${base}/${module}/${recordId}/Attachments/${attachmentId}?access_token=${token}`;
}
