/**
 * Hospital Simulation Engine — Phase E2+ foundations
 * Session-tick friendly for Web
 */

import { getTemplate } from "./templates";
import type {
  CaseTemplate,
  LiveEvent,
  WardPatient,
  CaseStatus,
  Department,
} from "./types";

const FIRST_NAMES_M = ["Hassan", "Omar", "Yusuf", "Faisal", "Karim", "Nader"];
const FIRST_NAMES_F = ["Amira", "Layla", "Sarah", "Nora", "Huda", "Maha"];
const LAST_NAMES = ["Al-Amri", "Saleh", "Eid", "Mansour", "Faris", "Habib", "Nasser"];

function uid(prefix: string) {
  return `${prefix}_${Math.random().toString(36).slice(2, 9)}`;
}

function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)]!;
}

function randInt(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function displayTime(d = new Date()) {
  return d.toISOString().slice(11, 16);
}

export function spawnFromTemplate(
  template: CaseTemplate,
  opts?: { assignedTo?: string; at?: Date; bed?: string }
): WardPatient {
  const at = opts?.at ?? new Date();
  const sex: "M" | "F" =
    template.sexBias === "F"
      ? "F"
      : template.sexBias === "M"
      ? "M"
      : Math.random() > 0.5
      ? "M"
      : "F";
  const name = `${pick(sex === "M" ? FIRST_NAMES_M : FIRST_NAMES_F)} ${pick(LAST_NAMES)}`;
  const age = randInt(template.ageRange[0], template.ageRange[1]);
  const department = template.departmentFlow[0] ?? "ed";

  return {
    id: uid("pt"),
    templateId: template.id,
    name,
    age,
    sex,
    bed: opts?.bed ?? `${department.toUpperCase()}-${randInt(1, 12)}`,
    department,
    diagnosis: template.baseDiagnosis,
    priority: template.priority,
    status: department === "ed" ? "workup_pending" : "admitted",
    assignedTo: opts?.assignedTo,
    assignedToMe: Boolean(opts?.assignedTo),
    admittedAt: at.toISOString(),
    expectedStayHours: template.expectedStayHours,
    timeline: [
      {
        id: uid("tl"),
        at: at.toISOString(),
        title: "Case opened",
        detail: `${template.title} pathway`,
        type: "arrival",
      },
    ],
    workup: template.workupPack.map((w) => ({
      id: uid("wu"),
      kind: w.kind,
      title: w.title,
      status: "pending" as const,
      summary: w.summary,
      critical: w.critical,
    })),
    orders: template.initialOrders.map((o) => ({
      id: uid("or"),
      label: o.label,
      status: "pending" as const,
      impact: o.impact,
    })),
    consults: [],
  };
}

export function spawnByTemplateId(
  templateId: string,
  opts?: { assignedTo?: string; at?: Date }
): WardPatient | null {
  const t = getTemplate(templateId);
  if (!t) return null;
  return spawnFromTemplate(t, opts);
}

export function dischargePatient(
  patient: WardPatient,
  reason = "Discharge criteria met"
): { patient: WardPatient; event: LiveEvent } {
  const at = new Date();
  const next: WardPatient = {
    ...patient,
    status: "discharged",
    bed: undefined,
    timeline: [
      ...patient.timeline,
      {
        id: uid("tl"),
        at: at.toISOString(),
        title: "Discharged",
        detail: reason,
        type: "discharge",
      },
    ],
  };
  const event: LiveEvent = {
    id: uid("ev"),
    type: "discharged",
    label: `${patient.name} discharged · bed cleared`,
    time: displayTime(at),
    at: at.toISOString(),
    patientId: patient.id,
  };
  return { patient: next, event };
}

export function admitToDepartment(
  patient: WardPatient,
  department: Department,
  bed?: string
): { patient: WardPatient; event: LiveEvent } {
  const at = new Date();
  const next: WardPatient = {
    ...patient,
    department,
    bed: bed ?? `${department.toUpperCase()}-${randInt(1, 12)}`,
    status: "admitted",
    timeline: [
      ...patient.timeline,
      {
        id: uid("tl"),
        at: at.toISOString(),
        title: `Admitted to ${department}`,
        type: "decision",
      },
    ],
  };
  const event: LiveEvent = {
    id: uid("ev"),
    type: "admitted",
    label: `${patient.name} → ${next.bed}`,
    time: displayTime(at),
    at: at.toISOString(),
    patientId: patient.id,
  };
  return { patient: next, event };
}

export function advanceStatus(
  patient: WardPatient,
  status: CaseStatus
): WardPatient {
  return { ...patient, status };
}

/** Soft tick: randomly ready one pending workup; optional minor event */
export function tickPatient(patient: WardPatient): {
  patient: WardPatient;
  event?: LiveEvent;
} {
  const pending = patient.workup.filter((w) => w.status === "pending");
  if (!pending.length) return { patient };

  const target = pick(pending);
  const workup = patient.workup.map((w) =>
    w.id === target.id ? { ...w, status: "ready" as const } : w
  );
  const at = new Date();
  const next: WardPatient = {
    ...patient,
    workup,
    status:
      patient.status === "workup_pending" ? "decision_needed" : patient.status,
    timeline: [
      ...patient.timeline,
      {
        id: uid("tl"),
        at: at.toISOString(),
        title: `${target.title} ready`,
        type: "result",
      },
    ],
  };

  const event: LiveEvent | undefined = target.critical
    ? {
        id: uid("ev"),
        type: "critical",
        label: `${patient.name} — ${target.title} result`,
        time: displayTime(at),
        at: at.toISOString(),
        patientId: patient.id,
      }
    : undefined;

  return { patient: next, event };
}

export function tickHospital(
  patients: WardPatient[]
): { patients: WardPatient[]; events: LiveEvent[] } {
  const events: LiveEvent[] = [];
  const nextPatients = patients.map((p) => {
    if (p.status === "discharged") return p;
    // ~35% chance to advance a patient each tick
    if (Math.random() > 0.35) return p;
    const result = tickPatient(p);
    if (result.event) events.push(result.event);
    return result.patient;
  });
  return { patients: nextPatients, events };
}
