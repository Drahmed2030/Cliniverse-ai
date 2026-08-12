/**
 * SOAP + Discharge local persistence
 * Phase A: localStorage
 * Phase B: swap adapters to Supabase without changing UI calls
 *
 * No template literals in style-related code paths.
 * Comments are intentional for Claude / future maintainers.
 */

import type { SoapNote, DischargeSummary } from "../clinicalTypes";

var STORAGE_PREFIX_SOAP = "cliniverse.ward.soap.";
var STORAGE_PREFIX_DISCHARGE = "cliniverse.ward.discharge.";

export interface SoapStoreAdapter {
  list: (patientId: string) => SoapNote[];
  append: (patientId: string, note: SoapNote) => SoapNote[];
  clear: (patientId: string) => void;
}

export interface DischargeStoreAdapter {
  get: (patientId: string) => DischargeSummary | null;
  save: (patientId: string, summary: DischargeSummary) => void;
  clear: (patientId: string) => void;
}

function canUseStorage() {
  try {
    return typeof window !== "undefined" && !!window.localStorage;
  } catch (e) {
    return false;
  }
}

function readJson(key: string, fallback: any) {
  if (!canUseStorage()) return fallback;
  try {
    var raw = window.localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw);
  } catch (e) {
    return fallback;
  }
}

function writeJson(key: string, value: any) {
  if (!canUseStorage()) return;
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch (e) {
    // Quota or private mode — fail soft so UI still works in-memory
  }
}

function soapKey(patientId: string) {
  return STORAGE_PREFIX_SOAP + patientId;
}

function dischargeKey(patientId: string) {
  return STORAGE_PREFIX_DISCHARGE + patientId;
}

/** LocalStorage adapter — default for Web now */
export var localSoapStore: SoapStoreAdapter = {
  list: function (patientId) {
    var list = readJson(soapKey(patientId), []);
    if (!Array.isArray(list)) return [];
    return list as SoapNote[];
  },
  append: function (patientId, note) {
    var current = localSoapStore.list(patientId);
    // Append-only clinical narrative (do not replace history)
    var next = current.concat([note]);
    writeJson(soapKey(patientId), next);
    return next;
  },
  clear: function (patientId) {
    if (!canUseStorage()) return;
    try {
      window.localStorage.removeItem(soapKey(patientId));
    } catch (e) {}
  },
};

export var localDischargeStore: DischargeStoreAdapter = {
  get: function (patientId) {
    var row = readJson(dischargeKey(patientId), null);
    return row as DischargeSummary | null;
  },
  save: function (patientId, summary) {
    writeJson(dischargeKey(patientId), summary);
  },
  clear: function (patientId) {
    if (!canUseStorage()) return;
    try {
      window.localStorage.removeItem(dischargeKey(patientId));
    } catch (e) {}
  },
};

/**
 * Merge seed notes with saved notes.
 * Seed first chronologically, then user notes (or by created_at sort).
 */
export function mergeSoapNotes(seed: SoapNote[], saved: SoapNote[]): SoapNote[] {
  var map: Record<string, SoapNote> = {};
  seed.forEach(function (n) {
    map[n.id] = n;
  });
  saved.forEach(function (n) {
    map[n.id] = n;
  });
  return Object.keys(map)
    .map(function (k) {
      return map[k];
    })
    .sort(function (a, b) {
      return String(a.at).localeCompare(String(b.at));
    });
}

export function createSoapNote(input: {
  subjective: string;
  objective: string;
  assessment: string;
  plan: string;
  authorName?: string;
  shift?: SoapNote["shift"];
}): SoapNote {
  var now = new Date();
  return {
    id: "soap_" + String(now.getTime()),
    at: now.toISOString(),
    author: input.authorName || "You",
    shift: input.shift || guessShift(now),
    subjective: normalizePart(input.subjective),
    objective: normalizePart(input.objective),
    assessment: normalizePart(input.assessment),
    plan: normalizePart(input.plan),
  };
}

function normalizePart(v: string) {
  var t = (v || "").trim();
  return t.length ? t : "—";
}

function guessShift(d: Date): SoapNote["shift"] {
  var h = d.getHours();
  if (h >= 6 && h < 14) return "morning";
  if (h >= 14 && h < 22) return "evening";
  return "night";
}

/** Validate before save — at least one real field */
export function isSoapMeaningful(s: string, o: string, a: string, p: string) {
  return [s, o, a, p].some(function (x) {
    return (x || "").trim().length > 0;
  });
}
