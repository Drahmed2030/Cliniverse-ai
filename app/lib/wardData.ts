// ── Cliniverse Ward — Types + Mock Data Engine ─────────────────
// Phase A foundation · Do not import heavy deps here

export type Department = "ed" | "im" | "cards" | "surg" | "peds" | "ob" | "lab"
export type CaseStatus = "active" | "awaiting_orders" | "awaiting_consult" | "ready_for_discharge" | "discharged"
export type Priority = "critical" | "urgent" | "stable"

export interface WardPatient {
  id: string
  name: string
  age: number
  sex: "M" | "F"
  bed: string
  department: Department
  diagnosis: string
  priority: Priority
  status: CaseStatus
  assignedToMe: boolean
  admittedAt: string
}

export interface CensusSummary {
  seen: number
  assigned: number
  discharged: number
  consultsRequested: number
}

export interface LiveEvent {
  id: string
  type: "admitted" | "discharged" | "transfer" | "critical"
  label: string
  time: string
}

// ── Departments ─────────────────────────────────────────────────
export const DEPARTMENTS: { id: Department; label: string; icon: string }[] = [
  { id: "ed",    label: "Emergency",        icon: "🚨" },
  { id: "im",    label: "Internal Med",     icon: "🩺" },
  { id: "cards", label: "Cardiology",       icon: "🫀" },
  { id: "surg",  label: "Surgery",          icon: "🔪" },
  { id: "peds",  label: "Pediatrics",       icon: "👶" },
  { id: "ob",    label: "OB/GYN",           icon: "🌸" },
  { id: "lab",   label: "Laboratory",       icon: "🧪" },
]

// ── Mock Patients ───────────────────────────────────────────────
export const MOCK_PATIENTS: WardPatient[] = [
  { id:"w1", name:"Hassan Al-Amri",   age:62, sex:"M", bed:"CCU-1", department:"cards", diagnosis:"Anterior STEMI — Post PCI Day 2",       priority:"urgent",   status:"active",            assignedToMe:true,  admittedAt:"2026-08-11T08:00:00Z" },
  { id:"w2", name:"Amira Saleh",      age:53, sex:"F", bed:"N-4B",  department:"im",    diagnosis:"Ischemic Stroke — MCA territory",         priority:"critical", status:"awaiting_consult",  assignedToMe:true,  admittedAt:"2026-08-12T02:00:00Z" },
  { id:"w3", name:"Sarah Eid",        age:49, sex:"F", bed:"M-2C",  department:"im",    diagnosis:"Diabetic Ketoacidosis",                   priority:"urgent",   status:"awaiting_orders",   assignedToMe:true,  admittedAt:"2026-08-12T04:30:00Z" },
  { id:"w4", name:"Layla Khalid",     age:41, sex:"F", bed:"R-3A",  department:"im",    diagnosis:"Community Acquired Pneumonia",             priority:"stable",   status:"active",            assignedToMe:false, admittedAt:"2026-08-11T14:00:00Z" },
  { id:"w5", name:"Yusuf Mansour",    age:34, sex:"M", bed:"ED-7",  department:"ed",    diagnosis:"Chest pain — R/O ACS",                    priority:"urgent",   status:"active",            assignedToMe:false, admittedAt:"2026-08-12T07:00:00Z" },
  { id:"w6", name:"Nora Al-Rashidi",  age:28, sex:"F", bed:"OB-2",  department:"ob",    diagnosis:"Pre-eclampsia — 34 weeks",                priority:"critical", status:"awaiting_orders",   assignedToMe:false, admittedAt:"2026-08-12T05:00:00Z" },
  { id:"w7", name:"Omar Faris",       age:71, sex:"M", bed:"S-1B",  department:"surg",  diagnosis:"Perforated peptic ulcer — Post-op Day 1", priority:"urgent",   status:"active",            assignedToMe:true,  admittedAt:"2026-08-11T20:00:00Z" },
]

// ── Census ──────────────────────────────────────────────────────
export const MOCK_CENSUS: CensusSummary = {
  seen: 7,
  assigned: 4,
  discharged: 2,
  consultsRequested: 1,
}

// ── Live Board Events ───────────────────────────────────────────
export const MOCK_LIVE_EVENTS: LiveEvent[] = [
  { id:"e1", type:"admitted",   label:"Hassan Al-Amri → CCU",         time:"08:00" },
  { id:"e2", type:"critical",   label:"Amira Saleh — NEW MRI result",  time:"09:14" },
  { id:"e3", type:"discharged", label:"Bed N-3C cleared",              time:"09:30" },
  { id:"e4", type:"admitted",   label:"Yusuf Mansour → ED-7",          time:"10:05" },
  { id:"e5", type:"transfer",   label:"ICU → Ward: Bed CCU-2",         time:"10:22" },
]
