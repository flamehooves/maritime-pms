// MDM & Admin CRM service functions

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

async function fetchAll(module: string, fields: string[]): Promise<Record<string, unknown>[]> {
  const fieldParam = fields.join(',');
  let page = 1;
  const results: Record<string, unknown>[] = [];
  while (true) {
    const data = await apiFetch(`/crm/v3/${module}?fields=${fieldParam}&per_page=200&page=${page}`);
    const records = (data?.data ?? []) as Record<string, unknown>[];
    results.push(...records);
    if (!data?.info?.more_records) break;
    page++;
  }
  return results;
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
    body: JSON.stringify({ data: [{ id, ...payload }] }),
  });
}

async function deleteRecord(module: string, id: string): Promise<void> {
  await apiFetch(`/crm/v3/${module}/${id}`, { method: 'DELETE' });
}

// ── MDM Company Types ──────────────────────────────────────────────
const CT_FIELDS = ['Name', 'Code', 'Group', 'Status'];
export const fetchCompanyTypes       = () => fetchAll('MDM_Company_Types', CT_FIELDS);
export const createCompanyType       = (p: Record<string, unknown>) => createRecord('MDM_Company_Types', p);
export const updateCompanyType       = (id: string, p: Record<string, unknown>) => updateRecord('MDM_Company_Types', id, p);
export const deleteCompanyType       = (id: string) => deleteRecord('MDM_Company_Types', id);

// ── MDM Companies ─────────────────────────────────────────────────
const CO_FIELDS = ['Name', 'Code', 'Type', 'Country', 'Address', 'Email', 'Phone', 'Status'];
export const fetchCompanies          = () => fetchAll('MDM_Companies', CO_FIELDS);
export const createCompany           = (p: Record<string, unknown>) => createRecord('MDM_Companies', p);
export const updateCompany           = (id: string, p: Record<string, unknown>) => updateRecord('MDM_Companies', id, p);
export const deleteCompany           = (id: string) => deleteRecord('MDM_Companies', id);

// ── MDM Fleet ─────────────────────────────────────────────────────
const FL_FIELDS = ['Name', 'Code', 'Description', 'Status'];
export const fetchMdmFleet           = () => fetchAll('MDM_Fleet', FL_FIELDS);
export const createMdmFleet          = (p: Record<string, unknown>) => createRecord('MDM_Fleet', p);
export const updateMdmFleet          = (id: string, p: Record<string, unknown>) => updateRecord('MDM_Fleet', id, p);
export const deleteMdmFleet          = (id: string) => deleteRecord('MDM_Fleet', id);

// ── MDM Vessel Types ──────────────────────────────────────────────
const VT_FIELDS = ['Name', 'Code', 'Category', 'Status'];
export const fetchVesselTypes        = () => fetchAll('MDM_Vessel_Types', VT_FIELDS);
export const createVesselType        = (p: Record<string, unknown>) => createRecord('MDM_Vessel_Types', p);
export const updateVesselType        = (id: string, p: Record<string, unknown>) => updateRecord('MDM_Vessel_Types', id, p);
export const deleteVesselType        = (id: string) => deleteRecord('MDM_Vessel_Types', id);

// ── MDM Flags ────────────────────────────────────────────────────
const FG_FIELDS = ['Name', 'Code', 'Country', 'Status'];
export const fetchFlags              = () => fetchAll('MDM_Flags', FG_FIELDS);
export const createFlag              = (p: Record<string, unknown>) => createRecord('MDM_Flags', p);
export const updateFlag              = (id: string, p: Record<string, unknown>) => updateRecord('MDM_Flags', id, p);
export const deleteFlag              = (id: string) => deleteRecord('MDM_Flags', id);

// ── MDM Vessel Owners ─────────────────────────────────────────────
const VO_FIELDS = ['Name', 'Owner_Type', 'Country', 'IMO_Number', 'Address', 'Email', 'Status'];
export const fetchVesselOwners       = () => fetchAll('MDM_Vessel_Owners', VO_FIELDS);
export const createVesselOwner       = (p: Record<string, unknown>) => createRecord('MDM_Vessel_Owners', p);
export const updateVesselOwner       = (id: string, p: Record<string, unknown>) => updateRecord('MDM_Vessel_Owners', id, p);
export const deleteVesselOwner       = (id: string) => deleteRecord('MDM_Vessel_Owners', id);

// ── MDM Vessel Groups ─────────────────────────────────────────────
const VG_FIELDS = ['Name', 'Code', 'Group_Type', 'Status'];
export const fetchVesselGroups       = () => fetchAll('MDM_Vessel_Groups', VG_FIELDS);
export const createVesselGroup       = (p: Record<string, unknown>) => createRecord('MDM_Vessel_Groups', p);
export const updateVesselGroup       = (id: string, p: Record<string, unknown>) => updateRecord('MDM_Vessel_Groups', id, p);
export const deleteVesselGroup       = (id: string) => deleteRecord('MDM_Vessel_Groups', id);

// ── MDM Yards ─────────────────────────────────────────────────────
const YD_FIELDS = ['Name', 'Code', 'Country', 'City', 'Status'];
export const fetchYards              = () => fetchAll('MDM_Yards', YD_FIELDS);
export const createYard              = (p: Record<string, unknown>) => createRecord('MDM_Yards', p);
export const updateYard              = (id: string, p: Record<string, unknown>) => updateRecord('MDM_Yards', id, p);
export const deleteYard              = (id: string) => deleteRecord('MDM_Yards', id);

// ── MDM Cargo ─────────────────────────────────────────────────────
const CG_FIELDS = ['Name', 'Code', 'Cargo_Type', 'Description', 'Status'];
export const fetchCargo              = () => fetchAll('MDM_Cargo', CG_FIELDS);
export const createCargo             = (p: Record<string, unknown>) => createRecord('MDM_Cargo', p);
export const updateCargo             = (id: string, p: Record<string, unknown>) => updateRecord('MDM_Cargo', id, p);
export const deleteCargo             = (id: string) => deleteRecord('MDM_Cargo', id);

// ── MDM Countries ─────────────────────────────────────────────────
const CY_FIELDS = ['Name', 'Code', 'Region', 'Nationality', 'Currency', 'Status'];
export const fetchMdmCountries       = () => fetchAll('MDM_Countries', CY_FIELDS);
export const createMdmCountry        = (p: Record<string, unknown>) => createRecord('MDM_Countries', p);
export const updateMdmCountry        = (id: string, p: Record<string, unknown>) => updateRecord('MDM_Countries', id, p);
export const deleteMdmCountry        = (id: string) => deleteRecord('MDM_Countries', id);

// ── MDM Ports ─────────────────────────────────────────────────────
const PT_FIELDS = ['Name', 'Code', 'Country', 'UN_LOCODE', 'Port_Type', 'Latitude', 'Longitude', 'Status'];
export const fetchMdmPorts           = () => fetchAll('MDM_Ports', PT_FIELDS);
export const createMdmPort           = (p: Record<string, unknown>) => createRecord('MDM_Ports', p);
export const updateMdmPort           = (id: string, p: Record<string, unknown>) => updateRecord('MDM_Ports', id, p);
export const deleteMdmPort           = (id: string) => deleteRecord('MDM_Ports', id);

// ── MDM Currencies ────────────────────────────────────────────────
const CR_FIELDS = ['Name', 'Code', 'Symbol', 'Exchange_Rate', 'Status'];
export const fetchMdmCurrencies      = () => fetchAll('MDM_Currencies', CR_FIELDS);
export const createMdmCurrency       = (p: Record<string, unknown>) => createRecord('MDM_Currencies', p);
export const updateMdmCurrency       = (id: string, p: Record<string, unknown>) => updateRecord('MDM_Currencies', id, p);
export const deleteMdmCurrency       = (id: string) => deleteRecord('MDM_Currencies', id);

// ── MDM General Ref ───────────────────────────────────────────────
const GR_FIELDS = ['Name', 'Category', 'Code', 'Description', 'Status'];
export const fetchGeneralRef         = (category?: string) => {
  if (category) {
    return apiFetch(`/crm/v3/MDM_General_Ref/search?criteria=(Category:equals:${encodeURIComponent(category)})&fields=${GR_FIELDS.join(',')}&per_page=200`)
      .then((d: Record<string, unknown>) => (d?.data ?? []) as Record<string, unknown>[]);
  }
  return fetchAll('MDM_General_Ref', GR_FIELDS);
};
export const createGeneralRef        = (p: Record<string, unknown>) => createRecord('MDM_General_Ref', p);
export const updateGeneralRef        = (id: string, p: Record<string, unknown>) => updateRecord('MDM_General_Ref', id, p);
export const deleteGeneralRef        = (id: string) => deleteRecord('MDM_General_Ref', id);

// ── Admin Roles ───────────────────────────────────────────────────
const AR_FIELDS = ['Name', 'Role_Type', 'Description', 'Permissions', 'Status'];
export const fetchAdminRoles         = () => fetchAll('Admin_Roles', AR_FIELDS);
export const createAdminRole         = (p: Record<string, unknown>) => createRecord('Admin_Roles', p);
export const updateAdminRole         = (id: string, p: Record<string, unknown>) => updateRecord('Admin_Roles', id, p);
export const deleteAdminRole         = (id: string) => deleteRecord('Admin_Roles', id);

// ── Admin User Designations ───────────────────────────────────────
const AD_FIELDS = ['Name', 'Code', 'Role', 'Department', 'Designation_Type', 'Rank', 'Status'];
export const fetchAdminDesignations  = () => fetchAll('Admin_User_Designations', AD_FIELDS);
export const createAdminDesignation  = (p: Record<string, unknown>) => createRecord('Admin_User_Designations', p);
export const updateAdminDesignation  = (id: string, p: Record<string, unknown>) => updateRecord('Admin_User_Designations', id, p);
export const deleteAdminDesignation  = (id: string) => deleteRecord('Admin_User_Designations', id);

// ── Admin Email Config ────────────────────────────────────────────
const EC_FIELDS = ['Name', 'Host', 'Port_Number', 'Config_Type', 'From_Address', 'Use_SSL', 'Status'];
export const fetchEmailConfigs       = () => fetchAll('Admin_Email_Config', EC_FIELDS);
export const createEmailConfig       = (p: Record<string, unknown>) => createRecord('Admin_Email_Config', p);
export const updateEmailConfig       = (id: string, p: Record<string, unknown>) => updateRecord('Admin_Email_Config', id, p);
export const deleteEmailConfig       = (id: string) => deleteRecord('Admin_Email_Config', id);

// ── Admin Email Templates ─────────────────────────────────────────
const ET_FIELDS = ['Name', 'Subject', 'Template_Type', 'Body_HTML', 'Status'];
export const fetchEmailTemplates     = () => fetchAll('Admin_Email_Templates', ET_FIELDS);
export const createEmailTemplate     = (p: Record<string, unknown>) => createRecord('Admin_Email_Templates', p);
export const updateEmailTemplate     = (id: string, p: Record<string, unknown>) => updateRecord('Admin_Email_Templates', id, p);
export const deleteEmailTemplate     = (id: string) => deleteRecord('Admin_Email_Templates', id);

// ── Admin Audit Log ───────────────────────────────────────────────
const AL_FIELDS = ['Name', 'User_Name', 'Action', 'Module', 'Record_ID', 'IP_Address', 'Action_Time'];
export const fetchAuditLogs          = () => fetchAll('Admin_Audit_Log', AL_FIELDS);
export const createAuditLog          = (p: Record<string, unknown>) => createRecord('Admin_Audit_Log', p);

// ── Admin Dashboard Tiles ─────────────────────────────────────────
const DT_FIELDS = ['Name', 'Icon', 'Route', 'Color', 'Sort_Order', 'Role', 'Visible'];
export const fetchDashboardTiles     = () => fetchAll('Admin_Dashboard_Tiles', DT_FIELDS);
export const createDashboardTile     = (p: Record<string, unknown>) => createRecord('Admin_Dashboard_Tiles', p);
export const updateDashboardTile     = (id: string, p: Record<string, unknown>) => updateRecord('Admin_Dashboard_Tiles', id, p);
export const deleteDashboardTile     = (id: string) => deleteRecord('Admin_Dashboard_Tiles', id);

// ── Zoho CRM Users (Admin) ────────────────────────────────────────
export async function fetchCrmUsers(): Promise<Record<string, unknown>[]> {
  const data = await apiFetch('/crm/v3/users?type=ActiveUsers&per_page=200');
  return (data?.users ?? []) as Record<string, unknown>[];
}
export async function inviteCrmUser(email: string, role: string, profile: string): Promise<void> {
  await apiFetch('/crm/v3/users', {
    method: 'POST',
    body: JSON.stringify({
      users: [{ email, role: { name: role }, profile: { name: profile } }],
    }),
  });
}
