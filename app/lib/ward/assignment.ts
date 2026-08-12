/**
 * Assignment Engine — distribute cases to subscribers
 */

import type { WardPatient } from "./types";

export const ASSIGNED_MIN = 6;
export const ASSIGNED_MAX = 15;

export function countAssigned(
  patients: WardPatient[],
  userId: string
): number {
  return patients.filter(
    (p) => p.assignedTo === userId && p.status !== "discharged"
  ).length;
}

export function underCapacity(patients: WardPatient[], userId: string): boolean {
  return countAssigned(patients, userId) < ASSIGNED_MAX;
}

export function assignPatient(
  patient: WardPatient,
  userId: string
): WardPatient {
  return {
    ...patient,
    assignedTo: userId,
    assignedToMe: true,
  };
}

export function releasePatient(patient: WardPatient): WardPatient {
  return {
    ...patient,
    assignedTo: undefined,
    assignedToMe: false,
  };
}

export function projectAssignedToMe(
  patients: WardPatient[],
  userId: string
): WardPatient[] {
  return patients.map((p) => ({
    ...p,
    assignedToMe: p.assignedTo === userId,
  }));
}

/**
 * Very simple auto-assign for new spawns:
 * assign if user under max capacity; critical first handled by caller order
 */
export function tryAutoAssign(
  patient: WardPatient,
  patients: WardPatient[],
  userId: string
): WardPatient {
  if (!underCapacity(patients, userId)) return patient;
  return assignPatient(patient, userId);
}

export function myActiveCases(
  patients: WardPatient[],
  userId: string
): WardPatient[] {
  return patients.filter(
    (p) => p.assignedTo === userId && p.status !== "discharged"
  );
}
