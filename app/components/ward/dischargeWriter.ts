/**
 * Discharge Summary writer helpers
 * Educational simulation only — not a real legal medical record
 */

import type { DischargeSummary, SoapNote, MedicationItem } from "./clinicalTypes";
import { localDischargeStore } from "./soapStorage";

export interface DischargeDraftInput {
  patientName: string;
  diagnosis: string;
  procedures?: string;
  hospitalCourse?: string;
  followUp?: string;
  activeMeds?: MedicationItem[];
  recentSoap?: SoapNote[];
  homeInstructions?: string[];
}

/**
 * Build a solid first draft from journey context.
 * User can edit before finalize.
 */
export function buildDischargeDraft(input: DischargeDraftInput): DischargeSummary {
  var meds = (input.activeMeds || [])
    .filter(function (m) {
      return m.status === "active";
    })
    .map(function (m) {
      return m.name + " " + m.dose + " " + m.route + " " + m.frequency;
    });

  var course = input.hospitalCourse;
  if (!course || !course.trim()) {
    course = defaultCourse(input);
  }

  var instructions =
    input.homeInstructions && input.homeInstructions.length
      ? input.homeInstructions
      : defaultHomeInstructions(input.diagnosis);

  return {
    diagnosis: input.diagnosis,
    hospitalCourse: course,
    procedures: input.procedures || "As documented in pathway",
    dischargeMeds: meds.length ? meds : ["Reconcile medications before final discharge"],
    followUp:
      input.followUp ||
      "Clinic follow-up in 7 days, earlier if warning symptoms occur",
    homeInstructions: instructions,
  };
}

function defaultCourse(input: DischargeDraftInput) {
  var bits = [];
  bits.push(input.patientName + " was managed on the simulated ward pathway for " + input.diagnosis + ".");
  if (input.recentSoap && input.recentSoap.length) {
    var last = input.recentSoap[input.recentSoap.length - 1];
    bits.push("Latest assessment: " + last.assessment + ".");
    bits.push("Latest plan: " + last.plan + ".");
  } else {
    bits.push("Clinical course documented via journey timeline and orders.");
  }
  return bits.join(" ");
}

function defaultHomeInstructions(diagnosis: string) {
  return [
    "Return to ED for severe or worsening symptoms related to " + diagnosis,
    "Take discharge medications exactly as listed unless a clinician changes them",
    "Keep follow-up appointment",
    "This is an educational simulation summary — not real patient advice",
  ];
}

export function saveDischargeDraft(patientId: string, summary: DischargeSummary) {
  localDischargeStore.save(patientId, summary);
  return summary;
}

export function loadDischarge(patientId: string) {
  return localDischargeStore.get(patientId);
}

/**
 * Finalize gate — soft checklist for UI
 */
export function dischargeReadiness(summary: DischargeSummary | null) {
  if (!summary) {
    return {
      ready: false,
      missing: ["No discharge summary draft"],
    };
  }
  var missing = [];
  if (!summary.diagnosis.trim()) missing.push("Diagnosis");
  if (!summary.hospitalCourse.trim()) missing.push("Hospital course");
  if (!summary.followUp.trim()) missing.push("Follow-up");
  if (!summary.dischargeMeds.length) missing.push("Discharge medications");
  if (!summary.homeInstructions.length) missing.push("Home instructions");
  return {
    ready: missing.length === 0,
    missing: missing,
  };
}
