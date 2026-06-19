import type {
  Vessel, Equipment, JobPlan, JobOrder, Defect, SparePart,
  EquipmentSpec, EquipmentSurvey, ConditionOfClass, EquipmentMemorandum, HseqRecord, CrmAttachment,
  GuaranteeClaim, RunningHoursLog, TomForm, PostponedJob, PmsRefData,
} from '../types';

const TOKEN_KEY      = 'pls_access_token';
const API_DOMAIN_KEY = 'pls_api_domain';
const DEFAULT_DOMAIN = 'https://www.zohoapis.in';

function getHeaders(): Record<string, string> {
  const token = localStorage.getItem(TOKEN_KEY);
  return {
    'Authorization': `Zoho-oauthtoken ${token}`,
    'Content-Type': 'application/json',
  };
}

function getDomain(): string {
  return localStorage.getItem(API_DOMAIN_KEY) || DEFAULT_DOMAIN;
}

async function apiFetch(path: string, options?: RequestInit) {
  const res = await fetch(`${getDomain()}${path}`, {
    ...options,
    headers: { ...getHeaders(), ...(options?.headers ?? {}) },
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`CRM API ${res.status}: ${text}`);
  }
  return res.json();
}

async function fetchAll(module: string, fields: string[]): Promise<unknown[]> {
  const fieldParam = fields.join(',');
  let page = 1;
  const results: unknown[] = [];
  while (true) {
    const data = await apiFetch(
      `/crm/v3/${module}?fields=${fieldParam}&per_page=200&page=${page}`
    );
    const records = data?.data ?? [];
    results.push(...records);
    if (!data?.info?.more_records) break;
    page++;
  }
  return results;
}

async function searchRecords(module: string, fields: string[], criteria: string): Promise<unknown[]> {
  const fieldParam = fields.join(',');
  const url = `/crm/v3/${module}/search?criteria=${encodeURIComponent(criteria)}&fields=${fieldParam}&per_page=200`;
  const data = await apiFetch(url);
  return data?.data ?? [];
}

async function createRecord(module: string, payload: Record<string, unknown>): Promise<string> {
  const data = await apiFetch(`/crm/v3/${module}`, {
    method: 'POST',
    body: JSON.stringify({ data: [payload] }),
  });
  return data?.data?.[0]?.details?.id ?? '';
}

async function updateRecord(module: string, id: string, payload: Record<string, unknown>): Promise<void> {
  await apiFetch(`/crm/v3/${module}/${id}`, {
    method: 'PUT',
    body: JSON.stringify({ data: [payload] }),
  });
}

async function deleteRecord(module: string, id: string): Promise<void> {
  await apiFetch(`/crm/v3/${module}?ids=${id}`, { method: 'DELETE' });
}

// ── Vessels ──────────────────────────────────────────────────────────────────

const VESSEL_FIELDS = [
  'Name','IMO_Number','Vessel_Type','Flag','Build_Year','Owner','Manager',
  'Class_Society','DWT','GRT','Call_Sign','Port_of_Registry','Vessel_Status',
  'Map_Position_X','Map_Position_Y','Vessel_Image_URL','Status',
];

function mapVessel(r: Record<string, unknown>): Vessel {
  return {
    id: String(r.id),
    name: String(r.Name ?? ''),
    imo: String(r.IMO_Number ?? ''),
    type: String(r.Vessel_Type ?? ''),
    flag: String(r.Flag ?? ''),
    buildYear: Number(r.Build_Year ?? 0),
    owner: String(r.Owner ?? ''),
    manager: String(r.Manager ?? ''),
    status: (r.Status as Vessel['status']) ?? 'active',
    classSociety: String(r.Class_Society ?? ''),
    dwt: Number(r.DWT ?? 0),
    grt: Number(r.GRT ?? 0),
    callSign: String(r.Call_Sign ?? ''),
    port: String(r.Port_of_Registry ?? ''),
    vesselStatus: (r.Vessel_Status as Vessel['vesselStatus']) ?? 'at_sea',
    mapPosition: r.Map_Position_X != null
      ? { x: Number(r.Map_Position_X), y: Number(r.Map_Position_Y ?? 0) }
      : undefined,
  };
}

export async function fetchVessels(): Promise<Vessel[]> {
  const rows = await fetchAll('Vessels', VESSEL_FIELDS);
  return (rows as Record<string, unknown>[]).map(mapVessel);
}

export async function fetchVesselById(id: string): Promise<Vessel | null> {
  try {
    const data = await apiFetch(`/crm/v3/Vessels/${id}?fields=${VESSEL_FIELDS.join(',')}`);
    const r = data?.data?.[0];
    return r ? mapVessel(r as Record<string, unknown>) : null;
  } catch { return null; }
}

export async function createVessel(v: Partial<Vessel>): Promise<string> {
  return createRecord('Vessels', {
    Name: v.name, IMO_Number: v.imo, Vessel_Type: v.type, Flag: v.flag,
    Build_Year: v.buildYear, Owner: v.owner, Manager: v.manager,
    Class_Society: v.classSociety, DWT: v.dwt, GRT: v.grt,
    Call_Sign: v.callSign, Port_of_Registry: v.port, Status: v.status ?? 'active',
  });
}

export async function updateVessel(id: string, v: Partial<Vessel>): Promise<void> {
  await updateRecord('Vessels', id, {
    Name: v.name, IMO_Number: v.imo, Vessel_Type: v.type, Flag: v.flag,
    Build_Year: v.buildYear, Owner: v.owner, Manager: v.manager,
    Class_Society: v.classSociety, DWT: v.dwt, GRT: v.grt,
    Call_Sign: v.callSign, Port_of_Registry: v.port, Status: v.status,
    Vessel_Status: v.vesselStatus,
    Map_Position_X: v.mapPosition?.x, Map_Position_Y: v.mapPosition?.y,
  });
}

export async function updateVesselImageUrl(id: string, url: string): Promise<void> {
  await updateRecord('Vessels', id, { Vessel_Image_URL: url });
}

export async function deleteVessel(id: string): Promise<void> {
  return deleteRecord('Vessels', id);
}

// ── Equipments ───────────────────────────────────────────────────────────────

const EQ_FIELDS = [
  'Name','Equipment_Code','CRM_Code','Parent_Equipment','System_Group','Equipment_Type',
  'Maker','Model','Serial_Number','Drawing_Ref','Class_Reference','Location',
  'Criticality','Equipment_Status','Installation_Date','Last_Maintenance','Next_Due',
  'Responsible_Rank','Description','Running_Hours','Next_Due_Hours','Vessel',
  'Safety_Level','Builder_Licence','Drawing_Number','Department','Class_Name',
  'Preferred_Vendor','ID_Number','Part_Number','IMO_Tier','Equipment_Dimension',
  'Equipment_Material','SD','Is_Alarm','Is_Main_Engine','Is_Circulating',
  'Mount_Allowed','RHRS_Separately','MD_Required',
];

function mapEquipment(r: Record<string, unknown>): Equipment {
  return {
    id: String(r.id),
    code: String(r.Equipment_Code ?? r.CRM_Code ?? ''),
    crmCode: String(r.CRM_Code ?? ''),
    name: String(r.Name ?? ''),
    parentId: (r.Parent_Equipment as Record<string,unknown>)?.id as string | undefined,
    parentName: (r.Parent_Equipment as Record<string,unknown>)?.name as string | undefined,
    system: String(r.System_Group ?? ''),
    type: String(r.Equipment_Type ?? ''),
    maker: String(r.Maker ?? ''),
    model: String(r.Model ?? ''),
    serial: String(r.Serial_Number ?? ''),
    drawingRef: String(r.Drawing_Ref ?? ''),
    classRef: String(r.Class_Reference ?? ''),
    location: String(r.Location ?? ''),
    criticality: (r.Criticality as Equipment['criticality']) ?? 'medium',
    status: (r.Equipment_Status as Equipment['status']) ?? 'operational',
    installDate: String(r.Installation_Date ?? ''),
    lastMaintenance: String(r.Last_Maintenance ?? ''),
    nextDue: String(r.Next_Due ?? ''),
    responsibleRank: String(r.Responsible_Rank ?? ''),
    description: String(r.Description ?? ''),
    runningHours: Number(r.Running_Hours ?? 0) || undefined,
    nextDueHours: Number(r.Next_Due_Hours ?? 0) || undefined,
    vesselId: (r.Vessel as Record<string,unknown>)?.id as string | undefined,
    safetyLevel: String(r.Safety_Level ?? ''),
    builderLicence: String(r.Builder_Licence ?? ''),
    drawingNumber: String(r.Drawing_Number ?? ''),
    department: String(r.Department ?? ''),
    className: String(r.Class_Name ?? ''),
    preferredVendor: String(r.Preferred_Vendor ?? ''),
    idNumber: String(r.ID_Number ?? ''),
    partNumber: String(r.Part_Number ?? ''),
    imoTier: String(r.IMO_Tier ?? ''),
    equipmentDimension: String(r.Equipment_Dimension ?? ''),
    equipmentMaterial: String(r.Equipment_Material ?? ''),
    sd: String(r.SD ?? ''),
    isAlarm: Boolean(r.Is_Alarm),
    isMainEngine: Boolean(r.Is_Main_Engine),
    isCirculating: Boolean(r.Is_Circulating),
    mountAllowed: Boolean(r.Mount_Allowed),
    rhrsSeparately: Boolean(r.RHRS_Separately),
    mdRequired: Boolean(r.MD_Required),
  };
}

export async function fetchEquipments(vesselId?: string): Promise<Equipment[]> {
  const rows = vesselId && vesselId !== '__all__'
    ? await searchRecords('Equipments', EQ_FIELDS, `(Vessel:equals:${vesselId})`)
    : await fetchAll('Equipments', EQ_FIELDS);
  return (rows as Record<string, unknown>[]).map(mapEquipment);
}

export async function createEquipment(e: Partial<Equipment>, vesselId?: string): Promise<string> {
  return createRecord('Equipments', {
    Name: e.name, Equipment_Code: e.code, System_Group: e.system,
    Equipment_Type: e.type, Maker: e.maker, Model: e.model,
    Serial_Number: e.serial, Location: e.location,
    Criticality: e.criticality ?? 'medium',
    Equipment_Status: e.status ?? 'operational',
    Installation_Date: e.installDate || undefined,
    Responsible_Rank: e.responsibleRank,
    Description: e.description,
    Vessel: vesselId ? { id: vesselId } : undefined,
    Parent_Equipment: e.parentId ? { id: e.parentId } : undefined,
    Department: e.department,
    Safety_Level: e.safetyLevel,
    Next_Due_Hours: e.nextDueHours || undefined,
  });
}

export async function updateEquipment(id: string, e: Partial<Equipment>): Promise<void> {
  await updateRecord('Equipments', id, {
    Equipment_Status: e.status,
    Last_Maintenance: e.lastMaintenance || undefined,
    Next_Due: e.nextDue || undefined,
    Running_Hours: e.runningHours || undefined,
    Next_Due_Hours: e.nextDueHours || undefined,
    Criticality: e.criticality,
    Location: e.location,
  });
}

export async function deleteEquipment(id: string): Promise<void> {
  return deleteRecord('Equipments', id);
}

// ── Equipment Specifications ─────────────────────────────────────────────────

const SPEC_FIELDS = ['Name','Equipment','Category','Spec_Name','Spec_Value','Unit','Sequence_No'];

export async function fetchSpecs(equipmentId: string): Promise<EquipmentSpec[]> {
  const rows = await searchRecords('Equipment_Specifications', SPEC_FIELDS, `(Equipment:equals:${equipmentId})`);
  return (rows as Record<string, unknown>[]).map(r => ({
    id: String(r.id),
    equipmentId,
    category: String(r.Category ?? ''),
    specName: String(r.Spec_Name ?? ''),
    specValue: String(r.Spec_Value ?? ''),
    unit: String(r.Unit ?? ''),
    sequenceNo: Number(r.Sequence_No ?? 0),
  }));
}

export async function createSpec(spec: Omit<EquipmentSpec, 'id'>): Promise<string> {
  return createRecord('Equipment_Specifications', {
    Name: `${spec.specName} - ${spec.equipmentId}`,
    Equipment: { id: spec.equipmentId },
    Category: spec.category,
    Spec_Name: spec.specName,
    Spec_Value: spec.specValue,
    Unit: spec.unit,
    Sequence_No: spec.sequenceNo,
  });
}

export async function deleteSpec(id: string): Promise<void> {
  return deleteRecord('Equipment_Specifications', id);
}

// ── Equipment Surveys ────────────────────────────────────────────────────────

const SURVEY_FIELDS = ['Name','Equipment','Survey_Type','Survey_Date','Due_Date','Certificate_Number','Status','Surveyor','Classification_Society','Remarks'];

export async function fetchSurveys(equipmentId: string): Promise<EquipmentSurvey[]> {
  const rows = await searchRecords('Equipment_Surveys', SURVEY_FIELDS, `(Equipment:equals:${equipmentId})`);
  return (rows as Record<string, unknown>[]).map(r => ({
    id: String(r.id), equipmentId,
    surveyType: String(r.Survey_Type ?? ''),
    surveyDate: String(r.Survey_Date ?? ''),
    dueDate: String(r.Due_Date ?? ''),
    certificateNumber: String(r.Certificate_Number ?? ''),
    status: String(r.Status ?? ''),
    surveyor: String(r.Surveyor ?? ''),
    classificationSociety: String(r.Classification_Society ?? ''),
    remarks: String(r.Remarks ?? ''),
  }));
}

export async function createSurvey(s: Omit<EquipmentSurvey, 'id'>): Promise<string> {
  return createRecord('Equipment_Surveys', {
    Name: `${s.surveyType} - ${s.surveyDate}`,
    Equipment: { id: s.equipmentId },
    Survey_Type: s.surveyType, Survey_Date: s.surveyDate, Due_Date: s.dueDate,
    Certificate_Number: s.certificateNumber, Status: s.status,
    Surveyor: s.surveyor, Classification_Society: s.classificationSociety, Remarks: s.remarks,
  });
}

export async function deleteSurvey(id: string): Promise<void> {
  return deleteRecord('Equipment_Surveys', id);
}

// ── Condition of Class ───────────────────────────────────────────────────────

const COC_FIELDS = ['Name','Equipment','COC_Number','Description','Issued_Date','Due_Date','Status','Closed_Date','Remarks'];

export async function fetchCocs(equipmentId: string): Promise<ConditionOfClass[]> {
  const rows = await searchRecords('Condition_Of_Class', COC_FIELDS, `(Equipment:equals:${equipmentId})`);
  return (rows as Record<string, unknown>[]).map(r => ({
    id: String(r.id), equipmentId,
    cocNumber: String(r.COC_Number ?? ''),
    description: String(r.Description ?? ''),
    issuedDate: String(r.Issued_Date ?? ''),
    dueDate: String(r.Due_Date ?? ''),
    status: String(r.Status ?? ''),
    closedDate: String(r.Closed_Date ?? '') || undefined,
    remarks: String(r.Remarks ?? ''),
  }));
}

export async function createCoc(c: Omit<ConditionOfClass, 'id'>): Promise<string> {
  return createRecord('Condition_Of_Class', {
    Name: c.cocNumber, Equipment: { id: c.equipmentId },
    COC_Number: c.cocNumber, Description: c.description,
    Issued_Date: c.issuedDate, Due_Date: c.dueDate, Status: c.status,
    Closed_Date: c.closedDate || undefined, Remarks: c.remarks,
  });
}

export async function deleteCoc(id: string): Promise<void> {
  return deleteRecord('Condition_Of_Class', id);
}

// ── Equipment Memoranda ──────────────────────────────────────────────────────

const MEMO_FIELDS = ['Name','Equipment','Subject','Memo_Date','Content','Author','Priority'];

export async function fetchMemos(equipmentId: string): Promise<EquipmentMemorandum[]> {
  const rows = await searchRecords('Equipment_Memoranda', MEMO_FIELDS, `(Equipment:equals:${equipmentId})`);
  return (rows as Record<string, unknown>[]).map(r => ({
    id: String(r.id), equipmentId,
    subject: String(r.Subject ?? ''),
    memoDate: String(r.Memo_Date ?? ''),
    content: String(r.Content ?? ''),
    author: String(r.Author ?? ''),
    priority: String(r.Priority ?? ''),
  }));
}

export async function createMemo(m: Omit<EquipmentMemorandum, 'id'>): Promise<string> {
  return createRecord('Equipment_Memoranda', {
    Name: m.subject, Equipment: { id: m.equipmentId },
    Subject: m.subject, Memo_Date: m.memoDate, Content: m.content,
    Author: m.author, Priority: m.priority,
  });
}

export async function deleteMemo(id: string): Promise<void> {
  return deleteRecord('Equipment_Memoranda', id);
}

// ── HSEQ Records ─────────────────────────────────────────────────────────────

const HSEQ_FIELDS = ['Name','Equipment','Record_Type','Title','Date','Description','Status','Author','Action_Required'];

export async function fetchHseq(equipmentId: string): Promise<HseqRecord[]> {
  const rows = await searchRecords('HSEQ_Records', HSEQ_FIELDS, `(Equipment:equals:${equipmentId})`);
  return (rows as Record<string, unknown>[]).map(r => ({
    id: String(r.id), equipmentId,
    recordType: String(r.Record_Type ?? ''),
    title: String(r.Title ?? ''),
    date: String(r.Date ?? ''),
    description: String(r.Description ?? ''),
    status: String(r.Status ?? ''),
    author: String(r.Author ?? ''),
    actionRequired: String(r.Action_Required ?? '') || undefined,
  }));
}

export async function createHseqRecord(h: Omit<HseqRecord, 'id'>): Promise<string> {
  return createRecord('HSEQ_Records', {
    Name: h.title, Equipment: { id: h.equipmentId },
    Record_Type: h.recordType, Title: h.title, Date: h.date,
    Description: h.description, Status: h.status,
    Author: h.author, Action_Required: h.actionRequired || undefined,
  });
}

export async function deleteHseqRecord(id: string): Promise<void> {
  return deleteRecord('HSEQ_Records', id);
}

// ── Attachments (native CRM) ─────────────────────────────────────────────────

export async function fetchAttachments(module: string, recordId: string): Promise<CrmAttachment[]> {
  try {
    const data = await apiFetch(`/crm/v3/${module}/${recordId}/Attachments`);
    return (data?.data ?? []).map((a: Record<string, unknown>) => ({
      id: String(a.id),
      fileName: String(a.File_Name ?? ''),
      size: Number(a.Size ?? 0),
      createdTime: String(a.Created_Time ?? ''),
      createdBy: (a.Created_By as Record<string, unknown>)?.name as string ?? '',
      description: String(a.Description ?? '') || undefined,
    }));
  } catch { return []; }
}

export async function uploadAttachment(
  module: string, recordId: string, file: File, description?: string
): Promise<CrmAttachment | null> {
  const formData = new FormData();
  formData.append('file', file);
  if (description) formData.append('description', description);
  const token = localStorage.getItem(TOKEN_KEY);
  const res = await fetch(`${getDomain()}/crm/v3/${module}/${recordId}/Attachments`, {
    method: 'POST',
    headers: { 'Authorization': `Zoho-oauthtoken ${token}` },
    body: formData,
  });
  if (!res.ok) throw new Error(`Upload failed: ${res.status}`);
  const data = await res.json();
  const a = data?.data?.[0]?.details;
  if (!a) return null;
  return { id: String(a.id), fileName: file.name, size: file.size, createdTime: new Date().toISOString() };
}

export async function deleteAttachment(module: string, recordId: string, attachmentId: string): Promise<void> {
  await apiFetch(`/crm/v3/${module}/${recordId}/Attachments/${attachmentId}`, { method: 'DELETE' });
}

export function getAttachmentDownloadUrl(module: string, recordId: string, attachmentId: string): string {
  const domain = getDomain();
  const token = localStorage.getItem(TOKEN_KEY);
  return `${domain}/crm/v3/${module}/${recordId}/Attachments/${attachmentId}?authorization=Zoho-oauthtoken ${token}`;
}

// ── Job Plans ────────────────────────────────────────────────────────────────

const JP_FIELDS = ['Name','Job_Code','Job_Title','Equipment','Vessel','Frequency','Last_Done','Next_Due','Responsible_Rank','Estimated_Duration','Status','Frequency_Type'];

export const FREQ_OPTIONS = ['Daily','Weekly','Monthly','Quarterly','Half Yearly','Annual','2 Years','5 Years'];
export const FREQ_TO_DAYS: Record<string, number> = {
  'Daily': 1, 'Weekly': 7, 'Monthly': 30, 'Quarterly': 91,
  'Half Yearly': 182, 'Annual': 365, '2 Years': 730, '5 Years': 1825,
};

export function daysToFreq(days: number): string {
  const sorted = Object.entries(FREQ_TO_DAYS).sort(([,a],[,b]) => a - b);
  for (const [label, d] of sorted) { if (days <= d) return label; }
  return 'Annual';
}

export async function fetchJobPlans(vesselId?: string): Promise<JobPlan[]> {
  const rows = vesselId && vesselId !== '__all__'
    ? await searchRecords('Job_Plans', JP_FIELDS, `(Vessel:equals:${vesselId})`)
    : await fetchAll('Job_Plans', JP_FIELDS);
  return (rows as Record<string, unknown>[]).map(r => {
    const freq = String(r.Frequency ?? 'Monthly');
    const days = FREQ_TO_DAYS[freq] ?? 30;
    return {
      id: String(r.id),
      code: String(r.Job_Code ?? r.Name ?? ''),
      title: String(r.Job_Title ?? r.Name ?? ''),
      equipmentId: (r.Equipment as Record<string,unknown>)?.id as string ?? '',
      equipmentName: (r.Equipment as Record<string,unknown>)?.name as string ?? '',
      system: '',
      frequencyType: (r.Frequency_Type as JobPlan['frequencyType']) ?? 'Calendar',
      interval: days,
      intervalUnit: freq,
      responsibleRank: String(r.Responsible_Rank ?? ''),
      estimatedDuration: Number(r.Estimated_Duration ?? 0),
      lastDone: String(r.Last_Done ?? '') || undefined,
      nextDue: String(r.Next_Due ?? '') || undefined,
      status: (r.Status as JobPlan['status']) ?? 'Active',
    };
  });
}

export async function createJobPlan(jp: Partial<JobPlan>, vesselId?: string): Promise<string> {
  return createRecord('Job_Plans', {
    Name: jp.code || jp.title,
    Job_Code: jp.code,
    Job_Title: jp.title,
    Equipment: jp.equipmentId ? { id: jp.equipmentId } : undefined,
    Vessel: vesselId ? { id: vesselId } : undefined,
    Frequency: jp.intervalUnit ?? 'Monthly',
    Last_Done: jp.lastDone || undefined,
    Next_Due: jp.nextDue || undefined,
    Responsible_Rank: jp.responsibleRank,
    Estimated_Duration: jp.estimatedDuration,
    Status: jp.status ?? 'Active',
  });
}

export async function updateJobPlan(id: string, jp: Partial<JobPlan>): Promise<void> {
  await updateRecord('Job_Plans', id, {
    Frequency: jp.intervalUnit,
    Last_Done: jp.lastDone || undefined,
    Next_Due: jp.nextDue || undefined,
    Status: jp.status,
  });
}

export async function deleteJobPlan(id: string): Promise<void> {
  return deleteRecord('Job_Plans', id);
}

// ── Job Orders ───────────────────────────────────────────────────────────────

const JO_FIELDS = [
  'Name','JO_Number','Job_Title','Equipment','Equipment_Code','Vessel','Linked_Job_Plan',
  'Assigned_To','Priority','Due_Date','Completion_Date','Job_Status','Approval_Status',
  'Approved_By','Remarks','Estimated_Hours','Actual_Hours','Work_Done','Job_Type',
];

function mapJobOrder(r: Record<string, unknown>): JobOrder {
  return {
    id: String(r.id),
    joNumber: String(r.JO_Number ?? r.Name ?? ''),
    title: String(r.Job_Title ?? r.Name ?? ''),
    equipmentId: (r.Equipment as Record<string,unknown>)?.id as string ?? '',
    equipmentCode: String(r.Equipment_Code ?? ''),
    equipmentName: (r.Equipment as Record<string,unknown>)?.name as string ?? '',
    system: '',
    vessel: (r.Vessel as Record<string,unknown>)?.name as string ?? '',
    linkedPlanId: (r.Linked_Job_Plan as Record<string,unknown>)?.id as string | undefined,
    linkedPlanCode: (r.Linked_Job_Plan as Record<string,unknown>)?.name as string | undefined,
    assignedTo: String(r.Assigned_To ?? ''),
    priority: (r.Priority as JobOrder['priority']) ?? 'Medium',
    dueDate: String(r.Due_Date ?? ''),
    completionDate: String(r.Completion_Date ?? '') || undefined,
    status: (r.Job_Status as JobOrder['status']) ?? 'Not Started',
    approvalStatus: (r.Approval_Status as JobOrder['approvalStatus']) ?? 'N/A',
    approvedBy: String(r.Approved_By ?? '') || undefined,
    remarks: String(r.Remarks ?? '') || undefined,
    estimatedHours: Number(r.Estimated_Hours ?? 0),
    actualHours: Number(r.Actual_Hours ?? 0) || undefined,
    jobType: String(r.Job_Type ?? 'Planned'),
  };
}

export async function fetchJobOrders(vesselId?: string): Promise<JobOrder[]> {
  const rows = vesselId && vesselId !== '__all__'
    ? await searchRecords('Job_Orders', JO_FIELDS, `(Vessel:equals:${vesselId})`)
    : await fetchAll('Job_Orders', JO_FIELDS);
  return (rows as Record<string, unknown>[]).map(mapJobOrder);
}

export async function fetchJobOrdersForApproval(): Promise<JobOrder[]> {
  const rows = await searchRecords('Job_Orders', JO_FIELDS, '(Job_Status:equals:Awaiting Review)');
  return (rows as Record<string, unknown>[]).map(mapJobOrder);
}

export async function fetchApprovalHistory(): Promise<JobOrder[]> {
  const [approved, reopened] = await Promise.all([
    searchRecords('Job_Orders', JO_FIELDS, '(Job_Status:equals:Approved)'),
    searchRecords('Job_Orders', JO_FIELDS, '(Job_Status:equals:Reopened)'),
  ]);
  return [...(approved as Record<string, unknown>[]), ...(reopened as Record<string, unknown>[])].map(mapJobOrder);
}

export async function createJobOrder(jo: Partial<JobOrder>, vesselId?: string): Promise<string> {
  return createRecord('Job_Orders', {
    Name: jo.joNumber || jo.title,
    JO_Number: jo.joNumber,
    Job_Title: jo.title,
    Equipment: jo.equipmentId ? { id: jo.equipmentId } : undefined,
    Vessel: vesselId ? { id: vesselId } : undefined,
    Linked_Job_Plan: jo.linkedPlanId ? { id: jo.linkedPlanId } : undefined,
    Assigned_To: jo.assignedTo,
    Priority: jo.priority ?? 'Medium',
    Due_Date: jo.dueDate || undefined,
    Job_Status: jo.status ?? 'Not Started',
    Approval_Status: 'N/A',
    Remarks: jo.remarks || undefined,
    Estimated_Hours: jo.estimatedHours,
    Job_Type: jo.jobType ?? 'Planned',
  });
}

export async function updateJobOrder(id: string, jo: Partial<JobOrder>): Promise<void> {
  await updateRecord('Job_Orders', id, {
    Job_Status: jo.status,
    Approval_Status: jo.approvalStatus,
    Remarks: jo.remarks || undefined,
    Completion_Date: jo.completionDate || undefined,
    Actual_Hours: jo.actualHours || undefined,
    Assigned_To: jo.assignedTo,
    Priority: jo.priority,
    Due_Date: jo.dueDate || undefined,
  });
}

export async function deleteJobOrder(id: string): Promise<void> {
  return deleteRecord('Job_Orders', id);
}

export async function approveJobOrder(id: string): Promise<void> {
  await updateRecord('Job_Orders', id, {
    Job_Status: 'Approved',
    Approval_Status: 'Approved',
    Completion_Date: new Date().toISOString().split('T')[0],
  });
}

export async function rejectJobOrder(id: string, remarks: string): Promise<void> {
  await updateRecord('Job_Orders', id, {
    Job_Status: 'Reopened',
    Approval_Status: 'Rejected',
    Work_Done: remarks,
  });
}

// ── Defects ──────────────────────────────────────────────────────────────────

const DEF_FIELDS = ['Name','Defect_ID','Equipment','Equipment_Code','Vessel','Severity','Description','Reported_By','Reported_Date','Defect_Status','Linked_Job_Order','Resolution','Resolved_Date'];

export async function fetchDefects(vesselId?: string): Promise<Defect[]> {
  const rows = vesselId && vesselId !== '__all__'
    ? await searchRecords('Defects', DEF_FIELDS, `(Vessel:equals:${vesselId})`)
    : await fetchAll('Defects', DEF_FIELDS);
  return (rows as Record<string, unknown>[]).map(r => ({
    id: String(r.id),
    defectId: String(r.Defect_ID ?? r.Name ?? ''),
    equipmentId: (r.Equipment as Record<string,unknown>)?.id as string ?? '',
    equipmentCode: String(r.Equipment_Code ?? ''),
    equipmentName: (r.Equipment as Record<string,unknown>)?.name as string ?? '',
    system: '',
    vessel: (r.Vessel as Record<string,unknown>)?.name as string ?? '',
    severity: (r.Severity as Defect['severity']) ?? 'Medium',
    description: String(r.Description ?? ''),
    reportedBy: String(r.Reported_By ?? ''),
    reportedDate: String(r.Reported_Date ?? ''),
    status: (r.Defect_Status as Defect['status']) ?? 'Open',
    linkedJobOrderId: (r.Linked_Job_Order as Record<string,unknown>)?.id as string | undefined,
    linkedJobOrderNumber: (r.Linked_Job_Order as Record<string,unknown>)?.name as string | undefined,
    resolution: String(r.Resolution ?? '') || undefined,
    resolvedDate: String(r.Resolved_Date ?? '') || undefined,
  }));
}

export async function createDefect(d: Partial<Defect>, vesselId?: string): Promise<string> {
  return createRecord('Defects', {
    Name: d.defectId || d.description?.slice(0, 50),
    Defect_ID: d.defectId,
    Equipment: d.equipmentId ? { id: d.equipmentId } : undefined,
    Vessel: vesselId ? { id: vesselId } : undefined,
    Severity: d.severity ?? 'Medium',
    Description: d.description,
    Reported_By: d.reportedBy,
    Reported_Date: d.reportedDate || new Date().toISOString().split('T')[0],
    Defect_Status: d.status ?? 'Open',
  });
}

export async function updateDefect(id: string, d: Partial<Defect>): Promise<void> {
  await updateRecord('Defects', id, {
    Defect_Status: d.status,
    Resolution: d.resolution || undefined,
    Resolved_Date: d.resolvedDate || undefined,
    Linked_Job_Order: d.linkedJobOrderId ? { id: d.linkedJobOrderId } : undefined,
    Severity: d.severity,
  });
}

export async function deleteDefect(id: string): Promise<void> {
  return deleteRecord('Defects', id);
}

// ── Spare Parts ──────────────────────────────────────────────────────────────

const SP_FIELDS = ['Name','Part_Number','Description','Equipment','Vessel','Maker','Compatible_Model','Category','Qty_Onboard','Min_Stock','Reorder_Level','Location','Unit','Is_Critical','Last_Used','Unit_Cost'];

export async function fetchSpareParts(vesselId?: string): Promise<SparePart[]> {
  const rows = vesselId && vesselId !== '__all__'
    ? await searchRecords('Spare_Parts', SP_FIELDS, `(Vessel:equals:${vesselId})`)
    : await fetchAll('Spare_Parts', SP_FIELDS);
  return (rows as Record<string, unknown>[]).map(r => ({
    id: String(r.id),
    partNumber: String(r.Part_Number ?? ''),
    description: String(r.Description ?? r.Name ?? ''),
    equipmentId: (r.Equipment as Record<string,unknown>)?.id as string ?? '',
    equipmentName: (r.Equipment as Record<string,unknown>)?.name as string ?? '',
    system: '',
    maker: String(r.Maker ?? ''),
    compatibleModel: String(r.Compatible_Model ?? ''),
    category: String(r.Category ?? ''),
    qtyOnboard: Number(r.Qty_Onboard ?? 0),
    minStock: Number(r.Min_Stock ?? 0),
    reorderLevel: Number(r.Reorder_Level ?? 0),
    location: String(r.Location ?? ''),
    unit: String(r.Unit ?? 'Pcs'),
    isCritical: Boolean(r.Is_Critical),
    lastUsed: String(r.Last_Used ?? '') || undefined,
    unitCost: Number(r.Unit_Cost ?? 0) || undefined,
  }));
}

export async function createSparePart(sp: Partial<SparePart>, vesselId?: string): Promise<string> {
  return createRecord('Spare_Parts', {
    Name: sp.description?.slice(0, 100) || sp.partNumber,
    Part_Number: sp.partNumber,
    Description: sp.description,
    Equipment: sp.equipmentId ? { id: sp.equipmentId } : undefined,
    Vessel: vesselId ? { id: vesselId } : undefined,
    Maker: sp.maker,
    Compatible_Model: sp.compatibleModel,
    Category: sp.category,
    Qty_Onboard: sp.qtyOnboard ?? 0,
    Min_Stock: sp.minStock ?? 0,
    Reorder_Level: sp.reorderLevel ?? 0,
    Location: sp.location,
    Unit: sp.unit ?? 'Pcs',
    Is_Critical: sp.isCritical ?? false,
    Unit_Cost: sp.unitCost || undefined,
  });
}

export async function updateSparePart(id: string, sp: Partial<SparePart>): Promise<void> {
  await updateRecord('Spare_Parts', id, {
    Qty_Onboard: sp.qtyOnboard,
    Location: sp.location,
    Min_Stock: sp.minStock,
    Reorder_Level: sp.reorderLevel,
    Unit_Cost: sp.unitCost || undefined,
  });
}

export async function deleteSparePart(id: string): Promise<void> {
  return deleteRecord('Spare_Parts', id);
}

// ── Guarantee Claims ─────────────────────────────────────────────────────────

const GC_FIELDS = ['Name','Equipment','Vessel','Vendor_Ref_Number','Claim_Date','Vendor_Name',
  'Defect_Description','Claim_Amount','Linked_Defect_JO','Status','Resolution','Resolved_Date'];

export async function fetchGuaranteeClaims(vesselId?: string): Promise<GuaranteeClaim[]> {
  const rows = vesselId && vesselId !== '__all__'
    ? await searchRecords('Guarantee_Claims', GC_FIELDS, `(Vessel:equals:${vesselId})`)
    : await fetchAll('Guarantee_Claims', GC_FIELDS);
  return (rows as Record<string, unknown>[]).map(r => ({
    id: String(r.id),
    name: String(r.Name ?? ''),
    equipmentId: (r.Equipment as Record<string,unknown>)?.id as string,
    equipmentName: (r.Equipment as Record<string,unknown>)?.name as string,
    vesselId: (r.Vessel as Record<string,unknown>)?.id as string,
    vesselName: (r.Vessel as Record<string,unknown>)?.name as string,
    vendorRefNumber: String(r.Vendor_Ref_Number ?? ''),
    claimDate: String(r.Claim_Date ?? ''),
    vendorName: String(r.Vendor_Name ?? ''),
    defectDescription: String(r.Defect_Description ?? ''),
    claimAmount: Number(r.Claim_Amount ?? 0) || undefined,
    linkedDefectJo: String(r.Linked_Defect_JO ?? ''),
    status: String(r.Status ?? 'Open'),
    resolution: String(r.Resolution ?? '') || undefined,
    resolvedDate: String(r.Resolved_Date ?? '') || undefined,
  }));
}

export async function createGuaranteeClaim(c: Partial<GuaranteeClaim>, vesselId?: string): Promise<string> {
  return createRecord('Guarantee_Claims', {
    Name: c.name || c.vendorRefNumber || 'GC-NEW',
    Equipment: c.equipmentId ? { id: c.equipmentId } : undefined,
    Vessel: vesselId ? { id: vesselId } : undefined,
    Vendor_Ref_Number: c.vendorRefNumber || undefined,
    Claim_Date: c.claimDate || undefined,
    Vendor_Name: c.vendorName || undefined,
    Defect_Description: c.defectDescription || undefined,
    Claim_Amount: c.claimAmount || undefined,
    Linked_Defect_JO: c.linkedDefectJo || undefined,
    Status: c.status ?? 'Open',
    Resolution: c.resolution || undefined,
    Resolved_Date: c.resolvedDate || undefined,
  });
}

export async function updateGuaranteeClaim(id: string, patch: Partial<GuaranteeClaim>): Promise<void> {
  await updateRecord('Guarantee_Claims', id, {
    Status: patch.status,
    Resolution: patch.resolution || undefined,
    Resolved_Date: patch.resolvedDate || undefined,
    Vendor_Ref_Number: patch.vendorRefNumber || undefined,
    Claim_Amount: patch.claimAmount || undefined,
  });
}

export async function deleteGuaranteeClaim(id: string): Promise<void> {
  return deleteRecord('Guarantee_Claims', id);
}

// ── Running Hours Log ────────────────────────────────────────────────────────

const RHL_FIELDS = ['Name','Equipment','Vessel','Running_Hours_Reading','Log_Date',
  'Reported_By','Hours_Since_Last','Log_Notes'];

export async function fetchRunningHoursLog(vesselId?: string): Promise<RunningHoursLog[]> {
  const rows = vesselId && vesselId !== '__all__'
    ? await searchRecords('Running_Hours_Log', RHL_FIELDS, `(Vessel:equals:${vesselId})`)
    : await fetchAll('Running_Hours_Log', RHL_FIELDS);
  return (rows as Record<string, unknown>[]).map(r => ({
    id: String(r.id),
    name: String(r.Name ?? ''),
    equipmentId: (r.Equipment as Record<string,unknown>)?.id as string,
    equipmentName: (r.Equipment as Record<string,unknown>)?.name as string,
    vesselId: (r.Vessel as Record<string,unknown>)?.id as string,
    runningHoursReading: Number(r.Running_Hours_Reading ?? 0),
    logDate: String(r.Log_Date ?? ''),
    reportedBy: String(r.Reported_By ?? ''),
    hoursSinceLast: Number(r.Hours_Since_Last ?? 0) || undefined,
    notes: String(r.Log_Notes ?? '') || undefined,
  }));
}

export async function createRunningHoursEntry(entry: Partial<RunningHoursLog>, vesselId?: string): Promise<string> {
  return createRecord('Running_Hours_Log', {
    Name: entry.name || `RHL-${Date.now()}`,
    Equipment: entry.equipmentId ? { id: entry.equipmentId } : undefined,
    Vessel: vesselId ? { id: vesselId } : undefined,
    Running_Hours_Reading: entry.runningHoursReading,
    Log_Date: entry.logDate || new Date().toISOString().split('T')[0],
    Reported_By: entry.reportedBy || undefined,
    Hours_Since_Last: entry.hoursSinceLast || undefined,
    Log_Notes: entry.notes || undefined,
  });
}

export async function deleteRunningHoursEntry(id: string): Promise<void> {
  return deleteRecord('Running_Hours_Log', id);
}

// ── TOM Forms ────────────────────────────────────────────────────────────────

const TOM_FIELDS = ['Name','Vessel','Month','Year','Week_Number','Category',
  'W1_Completed','W2_Completed','W3_Completed','W4_Completed',
  'W1_Date','W2_Date','W3_Date','W4_Date','Responsible_Rank','Remarks'];

export async function fetchTomForms(vesselId?: string, month?: number, year?: number): Promise<TomForm[]> {
  let criteria = '';
  if (vesselId && vesselId !== '__all__') criteria = `(Vessel:equals:${vesselId})`;
  const rows = criteria
    ? await searchRecords('TOM_Forms', TOM_FIELDS, criteria)
    : await fetchAll('TOM_Forms', TOM_FIELDS);
  return (rows as Record<string, unknown>[])
    .filter(r => (!month || Number(r.Month) === month) && (!year || Number(r.Year) === year))
    .map(r => ({
      id: String(r.id),
      name: String(r.Name ?? ''),
      vesselId: (r.Vessel as Record<string,unknown>)?.id as string,
      vesselName: (r.Vessel as Record<string,unknown>)?.name as string,
      month: Number(r.Month ?? 0),
      year: Number(r.Year ?? 0),
      weekNumber: Number(r.Week_Number ?? 1),
      category: String(r.Category ?? ''),
      w1Completed: Boolean(r.W1_Completed),
      w2Completed: Boolean(r.W2_Completed),
      w3Completed: Boolean(r.W3_Completed),
      w4Completed: Boolean(r.W4_Completed),
      w1Date: String(r.W1_Date ?? '') || undefined,
      w2Date: String(r.W2_Date ?? '') || undefined,
      w3Date: String(r.W3_Date ?? '') || undefined,
      w4Date: String(r.W4_Date ?? '') || undefined,
      responsibleRank: String(r.Responsible_Rank ?? ''),
      remarks: String(r.Remarks ?? '') || undefined,
    }));
}

export async function createTomForm(f: Partial<TomForm>, vesselId?: string): Promise<string> {
  return createRecord('TOM_Forms', {
    Name: f.name || f.name,
    Vessel: vesselId ? { id: vesselId } : undefined,
    Month: f.month, Year: f.year, Week_Number: f.weekNumber,
    Category: f.category,
    W1_Completed: f.w1Completed ?? false,
    W2_Completed: f.w2Completed ?? false,
    W3_Completed: f.w3Completed ?? false,
    W4_Completed: f.w4Completed ?? false,
    W1_Date: f.w1Date || undefined, W2_Date: f.w2Date || undefined,
    W3_Date: f.w3Date || undefined, W4_Date: f.w4Date || undefined,
    Responsible_Rank: f.responsibleRank, Remarks: f.remarks || undefined,
  });
}

export async function updateTomForm(id: string, patch: Partial<TomForm>): Promise<void> {
  await updateRecord('TOM_Forms', id, {
    W1_Completed: patch.w1Completed,
    W2_Completed: patch.w2Completed,
    W3_Completed: patch.w3Completed,
    W4_Completed: patch.w4Completed,
    W1_Date: patch.w1Date || undefined,
    W2_Date: patch.w2Date || undefined,
    W3_Date: patch.w3Date || undefined,
    W4_Date: patch.w4Date || undefined,
    Remarks: patch.remarks || undefined,
  });
}

export async function deleteTomForm(id: string): Promise<void> {
  return deleteRecord('TOM_Forms', id);
}

// ── Postponed Jobs ───────────────────────────────────────────────────────────

const PJ_FIELDS = ['Name','Job_Order','Equipment','Vessel','Job_Title','Safety_Level',
  'Original_Due_Date','Postponed_To_Date','Postponement_Count','Reason',
  'Requested_By','Approval_Status','Approved_By','Approved_Date','Rejection_Remarks'];

export async function fetchPostponedJobs(vesselId?: string): Promise<PostponedJob[]> {
  const rows = vesselId && vesselId !== '__all__'
    ? await searchRecords('Postponed_Jobs', PJ_FIELDS, `(Vessel:equals:${vesselId})`)
    : await fetchAll('Postponed_Jobs', PJ_FIELDS);
  return (rows as Record<string, unknown>[]).map(r => ({
    id: String(r.id),
    name: String(r.Name ?? ''),
    jobOrderId: (r.Job_Order as Record<string,unknown>)?.id as string,
    jobOrderName: (r.Job_Order as Record<string,unknown>)?.name as string,
    equipmentId: (r.Equipment as Record<string,unknown>)?.id as string,
    equipmentName: (r.Equipment as Record<string,unknown>)?.name as string,
    vesselId: (r.Vessel as Record<string,unknown>)?.id as string,
    jobTitle: String(r.Job_Title ?? ''),
    safetyLevel: String(r.Safety_Level ?? 'Standard'),
    originalDueDate: String(r.Original_Due_Date ?? ''),
    postponedToDate: String(r.Postponed_To_Date ?? ''),
    postponementCount: Number(r.Postponement_Count ?? 1),
    reason: String(r.Reason ?? ''),
    requestedBy: String(r.Requested_By ?? ''),
    approvalStatus: String(r.Approval_Status ?? 'Pending'),
    approvedBy: String(r.Approved_By ?? '') || undefined,
    approvedDate: String(r.Approved_Date ?? '') || undefined,
    rejectionRemarks: String(r.Rejection_Remarks ?? '') || undefined,
  }));
}

export async function createPostponedJob(pj: Partial<PostponedJob>, vesselId?: string): Promise<string> {
  return createRecord('Postponed_Jobs', {
    Name: pj.name || `PJ-${Date.now()}`,
    Job_Order: pj.jobOrderId ? { id: pj.jobOrderId } : undefined,
    Equipment: pj.equipmentId ? { id: pj.equipmentId } : undefined,
    Vessel: vesselId ? { id: vesselId } : undefined,
    Job_Title: pj.jobTitle,
    Safety_Level: pj.safetyLevel ?? 'Standard',
    Original_Due_Date: pj.originalDueDate || undefined,
    Postponed_To_Date: pj.postponedToDate || undefined,
    Postponement_Count: pj.postponementCount ?? 1,
    Reason: pj.reason,
    Requested_By: pj.requestedBy,
    Approval_Status: 'Pending',
  });
}

export async function approvePostponedJob(id: string, approvedBy: string): Promise<void> {
  await updateRecord('Postponed_Jobs', id, {
    Approval_Status: 'Approved',
    Approved_By: approvedBy,
    Approved_Date: new Date().toISOString().split('T')[0],
  });
}

export async function rejectPostponedJob(id: string, remarks: string): Promise<void> {
  await updateRecord('Postponed_Jobs', id, {
    Approval_Status: 'Rejected',
    Rejection_Remarks: remarks,
  });
}

export async function deletePostponedJob(id: string): Promise<void> {
  return deleteRecord('Postponed_Jobs', id);
}

// ── PMS Reference Data ───────────────────────────────────────────────────────

const REF_FIELDS = ['Name','Value','Category','Code','Description','Sort_Order','Is_Active','Parent_Value'];

export async function fetchPmsRefData(category?: string): Promise<PmsRefData[]> {
  const rows = category
    ? await searchRecords('PMS_Reference_Data', REF_FIELDS, `(Category:equals:${category})`)
    : await fetchAll('PMS_Reference_Data', REF_FIELDS);
  return (rows as Record<string, unknown>[])
    .filter(r => r.Is_Active !== false)
    .sort((a, b) => Number((a as Record<string,unknown>).Sort_Order ?? 99) - Number((b as Record<string,unknown>).Sort_Order ?? 99))
    .map(r => ({
      id: String(r.id),
      name: String(r.Name ?? ''),
      value: String(r.Value ?? r.Name ?? ''),
      category: String(r.Category ?? ''),
      code: String(r.Code ?? ''),
      description: String(r.Description ?? ''),
      sortOrder: Number(r.Sort_Order ?? 0),
      isActive: Boolean(r.Is_Active !== false),
      parentValue: String(r.Parent_Value ?? '') || undefined,
    }));
}
