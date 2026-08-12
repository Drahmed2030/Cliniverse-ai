export type Department = "ed" | "im" | "cards" | "surg" | "peds" | "ob" | "lab"
export type Priority = "critical" | "urgent" | "stable"
export type CaseStatus = "arrived" | "triaged" | "workup_pending" | "decision_needed" | "admitted" | "in_treatment" | "awaiting_orders" | "awaiting_consult" | "ready_for_discharge" | "discharged" | "transferred"
export type WorkupKind = "ecg" | "cxr" | "cbc" | "chem" | "troponin" | "abg" | "ct" | "mri" | "echo" | "other"

export interface WorkupItem {
  id: string
  kind: WorkupKind
  title: string
  status: "pending" | "ready" | "reviewed"
  summary?: string
  critical?: boolean
}

export interface TimelineEvent {
  id: string
  at: string
  title: string
  detail?: string
  type: "arrival" | "result" | "decision" | "order" | "consult" | "transfer" | "discharge"
}

export interface OrderItem {
  id: string
  label: string
  status: "pending" | "done" | "cancelled"
  impact?: string
}

export interface ConsultRequest {
  id: string
  fromDept: Department
  toDept: Department
  reason: string
  status: "requested" | "answered"
  answer?: string
}

export interface WardPatient {
  id: string
  templateId: string
  name: string
  age: number
  sex: "M" | "F"
  bed?: string
  department: Department
  diagnosis: string
  priority: Priority
  status: CaseStatus
  assignedTo?: string
  assignedToMe?: boolean
  admittedAt: string
  expectedStayHours: number
  timeline: TimelineEvent[]
  workup: WorkupItem[]
  orders: OrderItem[]
  consults: ConsultRequest[]
}

export interface LiveEvent {
  id: string
  type: "admitted" | "discharged" | "transfer" | "critical"
  label: string
  time: string
  at: string
  patientId?: string
}

export interface CensusSummary {
  date: string
  seen: number
  assigned: number
  discharged: number
  consultsRequested: number
  consultsGiven: number
  criticalHandled: number
  xpEarned: number
}

export interface CaseTemplate {
  id: string
  title: string
  departmentFlow: Department[]
  baseDiagnosis: string
  priority: Priority
  expectedStayHours: number
  ageRange: [number, number]
  sexBias?: "M" | "F" | "any"
  workupPack: Array<{ kind: WorkupKind; title: string; summary?: string; critical?: boolean }>
  initialOrders: Array<{ label: string; impact?: string }>
  decisionPoints: Array<{ id: string; prompt: string; options: Array<{ id: string; label: string; effect: string }> }>
  dischargeCriteria: string[]
}

export interface DepartmentMeta {
  id: Department
  label: string
  icon: string
}
