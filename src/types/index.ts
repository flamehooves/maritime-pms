export type Role = 'admin' | 'chief_engineer' | 'technician';

export type EquipmentStatus = 'operational' | 'under_maintenance' | 'defect' | 'inactive';
export type Criticality = 'critical' | 'high' | 'medium' | 'low';
export type JobOrderStatus = 'Not Started' | 'In Progress' | 'On Hold' | 'Completed' | 'Awaiting Review' | 'Approved' | 'Reopened';
export type Priority = 'Critical' | 'High' | 'Medium' | 'Low';
export type DefectSeverity = 'Critical' | 'High' | 'Medium' | 'Low';
export type DefectStatus = 'Open' | 'Under Investigation' | 'Resolved' | 'Closed';

export interface Vessel {
  id: string;
  name: string;
  imo: string;
  type: string;
  flag: string;
  buildYear: number;
  owner: string;
  manager: string;
  status: 'active' | 'inactive' | 'drydock';
  classSociety: string;
  dwt: number;
  grt: number;
  callSign: string;
  port: string;
  mapPosition?: { x: number; y: number };
  vesselStatus?: 'at_sea' | 'in_port' | 'in_maintenance' | 'drydock';
}

export interface Equipment {
  id: string;
  code: string;
  name: string;
  parentId?: string;
  parentName?: string;
  system?: string;
  type?: string;
  maker?: string;
  model?: string;
  serial?: string;
  drawingRef?: string;
  classRef?: string;
  location?: string;
  criticality?: Criticality;
  status?: EquipmentStatus;
  installDate?: string;
  lastMaintenance?: string;
  nextDue?: string;
  responsibleRank?: string;
  description?: string;
  runningHours?: number;
  children?: Equipment[];
  isGroup?: boolean;
}

export interface JobPlan {
  id: string;
  code: string;
  title: string;
  equipmentId: string;
  equipmentName: string;
  system: string;
  frequencyType: 'Calendar' | 'Running Hours';
  interval: number;
  intervalUnit: string;
  responsibleRank: string;
  estimatedDuration: number;
  lastDone?: string;
  nextDue?: string;
  status: 'Active' | 'Inactive' | 'Overdue' | 'Due Soon';
  procedures?: string[];
  safetyNotes?: string;
}

export interface JobOrder {
  id: string;
  joNumber: string;
  title: string;
  equipmentId: string;
  equipmentCode: string;
  equipmentName: string;
  system: string;
  vessel: string;
  linkedPlanId?: string;
  linkedPlanCode?: string;
  assignedTo: string;
  priority: Priority;
  dueDate: string;
  completionDate?: string;
  status: JobOrderStatus;
  approvalStatus?: 'Pending' | 'Approved' | 'Rejected' | 'N/A';
  approvedBy?: string;
  remarks?: string;
  estimatedHours: number;
  actualHours?: number;
  sparesConsumed?: SpareConsumption[];
}

export interface SpareConsumption {
  partId: string;
  partNumber: string;
  description: string;
  quantityUsed: number;
  unit: string;
}

export interface SparePart {
  id: string;
  partNumber: string;
  description: string;
  equipmentId: string;
  equipmentName: string;
  system: string;
  maker: string;
  compatibleModel: string;
  category: string;
  qtyOnboard: number;
  minStock: number;
  reorderLevel: number;
  location: string;
  unit: string;
  isCritical: boolean;
  lastUsed?: string;
  unitCost?: number;
}

export interface Defect {
  id: string;
  defectId: string;
  equipmentId: string;
  equipmentCode: string;
  equipmentName: string;
  system: string;
  vessel: string;
  severity: DefectSeverity;
  description: string;
  reportedBy: string;
  reportedDate: string;
  status: DefectStatus;
  linkedJobOrderId?: string;
  linkedJobOrderNumber?: string;
  resolution?: string;
  resolvedDate?: string;
}

export interface Attachment {
  id: string;
  name: string;
  type: 'PDF' | 'Image' | 'Drawing' | 'Certificate' | 'Report' | 'Other';
  size: string;
  uploadedBy: string;
  uploadedDate: string;
  equipmentId?: string;
  jobOrderId?: string;
}

export interface TimelineEvent {
  id: string;
  eventType: 'created' | 'job_plan_added' | 'job_order_generated' | 'job_completed' | 'defect_reported' | 'spare_consumed' | 'attachment_uploaded' | 'status_changed' | 'approved' | 'comment';
  description: string;
  user: string;
  timestamp: string;
  metadata?: Record<string, string>;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
  vessel?: string;
  rank: string;
  status: 'active' | 'inactive';
  lastLogin: string;
  avatar?: string;
}
