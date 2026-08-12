/**
 * Case template library — quality source for daily volume
 */

import type { CaseTemplate } from "./types";

export const CASE_TEMPLATES: CaseTemplate[] = [
  {
    id: "stemi_anterior",
    title: "Anterior STEMI",
    departmentFlow: ["ed", "cards"],
    baseDiagnosis: "Anterior STEMI — Post PCI",
    priority: "critical",
    expectedStayHours: 72,
    ageRange: [45, 78],
    sexBias: "any",
    workupPack: [
      { kind: "ecg", title: "12-lead ECG", summary: "ST elevation V1–V4", critical: true },
      { kind: "troponin", title: "High-sensitivity Troponin", summary: "Elevated", critical: true },
      { kind: "cbc", title: "CBC", summary: "Mild leukocytosis" },
      { kind: "chem", title: "Chemistry panel", summary: "Creatinine at baseline" },
      { kind: "cxr", title: "Chest X-ray", summary: "No acute pulmonary edema" },
    ],
    initialOrders: [
      { label: "Dual antiplatelet therapy", impact: "Standard ACS pathway" },
      { label: "Anticoagulation per protocol", impact: "Bridge to PCI care" },
      { label: "Serial troponin", impact: "Track myocardial injury" },
    ],
    decisionPoints: [
      {
        id: "d1",
        prompt: "ED: next best immediate action?",
        options: [
          { id: "a", label: "Activate cath lab pathway", effect: "Faster reperfusion" },
          { id: "b", label: "Wait for full labs only", effect: "Delay risk" },
        ],
      },
    ],
    dischargeCriteria: [
      "Hemodynamically stable 24h",
      "No recurrent ischemic symptoms",
      "Discharge meds reconciled",
    ],
  },
  {
    id: "cap_severe",
    title: "Community Acquired Pneumonia",
    departmentFlow: ["ed", "im"],
    baseDiagnosis: "Community Acquired Pneumonia",
    priority: "urgent",
    expectedStayHours: 48,
    ageRange: [30, 80],
    workupPack: [
      { kind: "cxr", title: "Chest X-ray", summary: "Right lower lobe infiltrate", critical: true },
      { kind: "cbc", title: "CBC", summary: "WBC elevated" },
      { kind: "chem", title: "Chemistry panel", summary: "Urea mildly elevated" },
      { kind: "abg", title: "ABG / gases", summary: "Borderline oxygenation" },
    ],
    initialOrders: [
      { label: "Empiric IV antibiotics", impact: "Cover likely CAP organisms" },
      { label: "Oxygen target SpO₂ 94–98%", impact: "Support gas exchange" },
      { label: "Blood cultures before abx if possible", impact: "Micro guidance" },
    ],
    decisionPoints: [
      {
        id: "d1",
        prompt: "Disposition after ED workup?",
        options: [
          { id: "a", label: "Admit medical ward", effect: "Monitored treatment" },
          { id: "b", label: "Discharge on oral therapy", effect: "Risk if hypoxic" },
        ],
      },
    ],
    dischargeCriteria: ["Afebrile", "Stable O₂ on room air or baseline", "Oral abx tolerated"],
  },
  {
    id: "dka",
    title: "Diabetic Ketoacidosis",
    departmentFlow: ["ed", "im"],
    baseDiagnosis: "Diabetic Ketoacidosis",
    priority: "critical",
    expectedStayHours: 36,
    ageRange: [16, 60],
    workupPack: [
      { kind: "chem", title: "Chemistry + glucose", summary: "High glucose · anion gap acidosis", critical: true },
      { kind: "cbc", title: "CBC", summary: "Hemoconcentration possible" },
      { kind: "abg", title: "ABG", summary: "Metabolic acidosis", critical: true },
    ],
    initialOrders: [
      { label: "IV fluid resuscitation", impact: "Restore volume" },
      { label: "Insulin infusion protocol", impact: "Close anion gap" },
      { label: "Electrolyte replacement", impact: "Prevent arrhythmia" },
    ],
    decisionPoints: [
      {
        id: "d1",
        prompt: "First priority in ED?",
        options: [
          { id: "a", label: "Fluids then insulin protocol", effect: "Safer DKA pathway" },
          { id: "b", label: "Insulin before fluids", effect: "Higher risk" },
        ],
      },
    ],
    dischargeCriteria: ["Gap closed", "Tolerating oral intake", "Education completed"],
  },
  {
    id: "stroke_ischemic",
    title: "Ischemic Stroke",
    departmentFlow: ["ed", "im"],
    baseDiagnosis: "Ischemic Stroke — MCA territory",
    priority: "critical",
    expectedStayHours: 96,
    ageRange: [50, 85],
    workupPack: [
      { kind: "ct", title: "Non-contrast CT head", summary: "No hemorrhage", critical: true },
      { kind: "cbc", title: "CBC", summary: "Baseline" },
      { kind: "chem", title: "Chemistry panel", summary: "Baseline renal function" },
    ],
    initialOrders: [
      { label: "Stroke pathway activation", impact: "Time-critical care" },
      { label: "Swallow assessment", impact: "Aspiration prevention" },
      { label: "Neuro checks", impact: "Detect deterioration" },
    ],
    decisionPoints: [
      {
        id: "d1",
        prompt: "After CT rules out bleed, next focus?",
        options: [
          { id: "a", label: "Perfusion / stroke team pathway", effect: "Best outcome window" },
          { id: "b", label: "Routine ward admit only", effect: "May miss intervention window" },
        ],
      },
    ],
    dischargeCriteria: ["Stable neuro status", "Rehab plan set", "Secondary prevention started"],
  },
  {
    id: "preeclampsia",
    title: "Pre-eclampsia",
    departmentFlow: ["ed", "ob"],
    baseDiagnosis: "Pre-eclampsia",
    priority: "critical",
    expectedStayHours: 48,
    ageRange: [20, 42],
    sexBias: "F",
    workupPack: [
      { kind: "cbc", title: "CBC", summary: "Platelets monitor" },
      { kind: "chem", title: "LFTs / creatinine", summary: "Watch end-organ markers", critical: true },
      { kind: "other", title: "Urine protein", summary: "Significant proteinuria" },
    ],
    initialOrders: [
      { label: "BP control per OB protocol", impact: "Reduce maternal risk" },
      { label: "Fetal monitoring", impact: "Assess fetal status" },
      { label: "OB senior review", impact: "Delivery planning" },
    ],
    decisionPoints: [
      {
        id: "d1",
        prompt: "Severe features present — next step?",
        options: [
          { id: "a", label: "Urgent OB escalation", effect: "Safer maternal-fetal plan" },
          { id: "b", label: "Observe without escalation", effect: "High risk" },
        ],
      },
    ],
    dischargeCriteria: ["OB clearance", "Stable BP", "Follow-up arranged"],
  },
  {
    id: "postop_ulcer",
    title: "Perforated Ulcer Post-op",
    departmentFlow: ["surg"],
    baseDiagnosis: "Perforated peptic ulcer — Post-op",
    priority: "urgent",
    expectedStayHours: 72,
    ageRange: [35, 75],
    workupPack: [
      { kind: "cbc", title: "CBC", summary: "Post-op trend" },
      { kind: "chem", title: "Chemistry panel", summary: "Electrolytes / renal" },
      { kind: "cxr", title: "CXR if respiratory symptoms", summary: "As indicated" },
    ],
    initialOrders: [
      { label: "IV antibiotics", impact: "Source control support" },
      { label: "NGT / NPO as ordered", impact: "Protect anastomosis/repair" },
      { label: "Pain and VTE plan", impact: "Recovery basics" },
    ],
    decisionPoints: [
      {
        id: "d1",
        prompt: "Fever day 1 post-op — first action?",
        options: [
          { id: "a", label: "Examine · vitals · targeted workup", effect: "Avoid missed complication" },
          { id: "b", label: "Ignore as normal", effect: "Risk delay" },
        ],
      },
    ],
    dischargeCriteria: ["Tolerating diet progression", "Pain controlled", "Wound acceptable"],
  },
];

export function getTemplate(id: string): CaseTemplate | undefined {
  return CASE_TEMPLATES.find((t) => t.id === id);
}
