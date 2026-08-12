/**
 * Clinical documentation extensions for Patient Journey
 * SOAP · Meds · Tracking · Discharge
 */

export interface SoapNote {
  id: string;
  at: string;
  author: string;
  shift: "morning" | "evening" | "night";
  subjective: string;
  objective: string;
  assessment: string;
  plan: string;
}

export interface MedicationItem {
  id: string;
  name: string;
  dose: string;
  route: string;
  frequency: string;
  status: "active" | "stopped" | "held";
  indication?: string;
}

export interface ClinicalAlert {
  id: string;
  level: "info" | "watch" | "critical";
  label: string;
  detail?: string;
  at: string;
}

export interface TrackingMetric {
  id: string;
  label: string;
  value: string;
  unit?: string;
  trend?: "up" | "down" | "stable";
  abnormal?: boolean;
}

export interface DischargeSummary {
  diagnosis: string;
  hospitalCourse: string;
  procedures: string;
  dischargeMeds: string[];
  followUp: string;
  homeInstructions: string[];
}

export interface ClinicalBundle {
  metrics: TrackingMetric[];
  medications: MedicationItem[];
  soapNotes: SoapNote[];
  alerts: ClinicalAlert[];
  report?: string;
  discharge?: DischargeSummary;
}
