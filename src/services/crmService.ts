import type { Vessel, Equipment, JobPlan, JobOrder, Defect, SparePart } from '../types';

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
  'Build_Year', 'Classification_Society', 'Vessel_Status', 'Current_Port', 'Health_Score',
  'Vessel_Image_URL'];

function mapVessel(r: Record<string, unknown>): Vessel & { imageUrl?: string } {
  return {
    id: String(r.id),
    name: String(r.Name ?? ''),
    imo: String(r.IMO_Number ?? ''),
    type: String(r.Vessel_Type ?? ''),
    flag: String(r.Flag ?? ''),
    buildYear: Number(r.Build_Year ?? 0),
    owner: '',
    manager: '',
    status: 'active',
    classSociety: String(r.Classification_Society ?? ''),
    dwt: 0,
    grt: Number(r.Gross_Tonnage ?? 0),
    callSign: '',
    port: String(r.Current_Port ?? ''),
    vesselStatus: (r.Vessel_Status as Vessel['vesselStatus']) ?? 'at_sea',
    imageUrl: String(r.Vessel_Image_URL ?? '') || undefined,
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
    Gross_Tonnage: v.grt,
    Classification_Society: v.classSociety,
    Vessel_Status: v.vesselStatus ?? 'at_sea',
    Current_Port: v.port,
  });
}

export async function updateVessel(id: string, v: Partial<Vessel>): Promise<void> {
  return updateRecord('Vessels', id, {
    Name: v.name,
    Vessel_Status: v.vesselStatus,
    Current_Port: v.port,
  });
}

export async function deleteVessel(id: string): Promise<void> {
  return deleteRecord('Vessels', id);
}

// ── Equipments ─────────────────────────────────────────────────────────────

const EQ_FIELDS = ['Name', 'Equipment_Name', 'Vessel', 'System', 'Equipment_Type', 'Maker',
  'Model', 'Serial_Number', 'Equipment_Status', 'Criticality', 'Install_Date',
  'Last_Maintenance_Date', 'Next_Due_Date', 'Location_On_Vessel', 'Responsible_Rank'];

function mapEquipment(r: Record<string, unknown>): Equipment {
  const vessel = r.Vessel as Record<string, unknown> | null;
  return {
    id: String(r.id),
    code: String(r.Name ?? ''),
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
    parentId: vessel ? String(vessel.id) : undefined,
    parentName: vessel ? String(vessel.name) : undefined,
  };
}

export async function fetchEquipments(vesselId?: string): Promise<Equipment[]> {
  const rows = await fetchAll('Equipments', EQ_FIELDS);
  const mapped = (rows as Record<string, unknown>[]).map(mapEquipment);
  if (vesselId && vesselId !== '__all__') {
    return mapped.filter(e => e.parentId === vesselId);
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

const JP_FIELDS = ['Name', 'Plan_Code', 'Equipment', 'Vessel', 'Maintenance_Category',
  'Frequency', 'Estimated_Hours', 'Priority', 'Description',
  'Last_Executed', 'Next_Due_Date', 'Assigned_Rank'];

function mapJobPlan(r: Record<string, unknown>): JobPlan {
  const eq = r.Equipment as Record<string, unknown> | null;
  return {
    id: String(r.id),
    code: String(r.Plan_Code ?? r.Name ?? ''),
    title: String(r.Name ?? ''),
    equipmentId: eq ? String(eq.id) : '',
    equipmentName: eq ? String(eq.name) : '',
    system: '',
    frequencyType: 'Calendar',
    interval: Number(r.Frequency ?? 0),
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
    Frequency: jp.interval,
    Estimated_Hours: jp.estimatedDuration,
    Priority: 'Medium',
    Assigned_Rank: jp.responsibleRank,
    Last_Executed: jp.lastDone,
    Next_Due_Date: jp.nextDue,
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
