import type { ClinicalBundle } from "./clinicalTypes";

/** Seed clinical bundle for Hassan / Anterior STEMI pilot */
export const STEMI_CLINICAL_BUNDLE: ClinicalBundle = {
  metrics: [
    { id: "m1", label: "HR", value: "78", unit: "bpm", trend: "stable" },
    { id: "m2", label: "BP", value: "118/72", unit: "mmHg", trend: "stable" },
    { id: "m3", label: "SpO₂", value: "97", unit: "%", trend: "stable" },
    {
      id: "m4",
      label: "Troponin",
      value: "Elevated",
      trend: "down",
      abnormal: true,
    },
  ],
  alerts: [
    {
      id: "a1",
      level: "watch",
      label: "Post-PCI monitoring",
      detail: "Watch access site · recurrent chest pain · arrhythmia",
      at: "2026-08-12T08:30:00Z",
    },
  ],
  medications: [
    {
      id: "med1",
      name: "Aspirin",
      dose: "81 mg",
      route: "PO",
      frequency: "Daily",
      status: "active",
      indication: "DAPT component",
    },
    {
      id: "med2",
      name: "Ticagrelor",
      dose: "90 mg",
      route: "PO",
      frequency: "BID",
      status: "active",
      indication: "DAPT component",
    },
    {
      id: "med3",
      name: "Atorvastatin",
      dose: "80 mg",
      route: "PO",
      frequency: "Nightly",
      status: "active",
      indication: "High-intensity statin",
    },
  ],
  soapNotes: [
    {
      id: "soap1",
      at: "2026-08-12T07:40:00Z",
      author: "Ward team",
      shift: "morning",
      subjective: "Mild residual chest discomfort, improving",
      objective: "HR 78 · BP 118/72 · access site dry",
      assessment: "Post-PCI day 2 · stable trajectory",
      plan: "Continue DAPT · monitor · plan education for discharge readiness",
    },
  ],
  report:
    "62M with anterior STEMI, reperfused, now day 2 post-PCI. Vitals stable. On DAPT and high-intensity statin. No recurrent ischemic symptoms overnight. Continue monitoring and discharge planning if course remains uncomplicated.",
  discharge: {
    diagnosis: "Anterior STEMI s/p PCI",
    hospitalCourse:
      "Presented with chest pain, ECG confirmed anterior STEMI, urgent reperfusion performed. Stable post-procedure course.",
    procedures: "PCI to culprit lesion",
    dischargeMeds: [
      "Aspirin 81 mg daily",
      "Ticagrelor 90 mg BID",
      "Atorvastatin 80 mg nightly",
    ],
    followUp: "Cardiology clinic in 7 days · earlier if chest pain recurs",
    homeInstructions: [
      "Seek emergency care for recurrent chest pain, severe shortness of breath, or syncope",
      "Do not stop antiplatelet therapy unless instructed by cardiology",
      "Activity as tolerated; avoid heavy lifting until advised",
      "Medication adherence and risk-factor counseling completed",
    ],
  },
};
