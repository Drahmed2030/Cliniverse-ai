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
        prompt: "CURB-65 = 1. Patient is stable. Where do you manage?",
        options: [
          { id: "a", label: "Outpatient oral antibiotics", effect: "Reasonable. CURB-65 0–1 supports outpatient care if social factors and comorbidities allow. Verify follow-up and adherence." },
          { id: "b", label: "Admit to medical ward", effect: "Reasonable if oxygen requirement, comorbidity, or social factors present. CURB-65 alone does not decide disposition — clinical judgment matters." },
          { id: "c", label: "Admit to ICU", effect: "Not indicated. ICU is reserved for respiratory failure, septic shock, or multi-organ dysfunction requiring support." },
        ],
      },
      {
        id: "d2",
        prompt: "Blood cultures pending. When do you start antibiotics?",
        options: [
          { id: "a", label: "Within 1 hour of diagnosis", effect: "Correct. Early antibiotic administration within 1h of recognition improves survival in severe CAP. Do not wait for cultures." },
          { id: "b", label: "After blood cultures return", effect: "Dangerous delay. Cultures take 24–48h — delaying antibiotics increases mortality. Draw cultures, then give antibiotics immediately." },
          { id: "c", label: "After chest X-ray confirms infiltrate", effect: "Unnecessary delay. Clinical suspicion with compatible findings is sufficient. CXR supports but does not gate antibiotic initiation." },
        ],
      },
      {
        id: "d3",
        prompt: "Day 3. Fever resolved, O₂ saturation stable on room air, tolerating oral intake. Next step?",
        options: [
          { id: "a", label: "Switch IV to oral antibiotics and plan discharge", effect: "Correct. Clinical stability for 24h + tolerating oral intake + stable oxygenation = criteria for oral switch and discharge planning." },
          { id: "b", label: "Continue IV antibiotics for full 7 days", effect: "Unnecessary. IV-to-oral switch is safe once stable and reduces length of stay, cost, and line complications." },
          { id: "c", label: "Repeat chest X-ray before any change", effect: "Not required. Radiographic improvement lags clinical recovery by weeks. Repeat CXR is for non-resolving or worsening cases." },
        ],
      },
    ],
    dischargeCriteria: ["Afebrile", "Stable O₂ on room air or baseline", "Oral abx tolerated"],
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
    {
    id: "acs_ruleout",
    title: "Chest Pain — Rule Out ACS",
    departmentFlow: ["ed"],
    baseDiagnosis: "Chest pain — R/O ACS",
    priority: "urgent",
    expectedStayHours: 24,
    ageRange: [30, 70],
    sexBias: "any",
    workupPack: [],
    initialOrders: [],
    decisionPoints: [],
    dischargeCriteria: [],
  },
    {
    id:"dka",
    title: "Diabetic Ketoacidosis — Refined",
    departmentFlow: ["ed", "im"],
    baseDiagnosis: "Diabetic Ketoacidosis",
    priority: "critical",
    expectedStayHours: 36,
    ageRange: [16, 60],
    sexBias: "any",
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
        prompt: "DKA confirmed on labs. What is your first priority?",
        options: [
          { id: "a", label: "IV fluid resuscitation first", effect: "Correct. Volume resuscitation precedes insulin — starting insulin in a volume-depleted patient risks cardiovascular collapse." },
          { id: "b", label: "Insulin bolus immediately", effect: "Risky. Insulin before fluids shifts glucose and potassium intracellularly in a hypovolemic patient — cardiovascular collapse risk." },
          { id: "c", label: "Sodium bicarbonate push", effect: "Not indicated at this stage. Bicarbonate is reserved for pH < 6.9; routine use worsens hypokalemia and cerebral edema risk." },
        ],
      },
      {
        id: "d2",
        prompt: "Potassium is 3.1 mmol/L. Insulin infusion is next. What now?",
        options: [
          { id: "a", label: "Replace potassium before or with insulin", effect: "Correct. Insulin drives K+ into cells — starting insulin with K+ 3.1 risks severe hypokalemia and arrhythmia." },
          { id: "b", label: "Start insulin, replace potassium later", effect: "Dangerous. Insulin will drop K+ further. Severe hypokalemia can cause fatal arrhythmias within minutes." },
          { id: "c", label: "No action — potassium normalises with fluids", effect: "Incorrect. Fluids alone do not correct hypokalemia; insulin worsens it. Active replacement is required." },
        ],
      },
      {
        id: "d3",
        prompt: "Anion gap closed. Patient tolerating oral intake. Next step?",
        options: [
          { id: "a", label: "Overlap IV insulin with subcutaneous for 1–2 hours", effect: "Correct. Overlap prevents rebound hyperglycemia and ketosis while subcutaneous insulin reaches steady state." },
          { id: "b", label: "Stop IV insulin immediately", effect: "Risky. Abrupt discontinuation before subcutaneous absorption causes rebound DKA within hours." },
          { id: "c", label: "Continue IV insulin until discharge", effect: "Unnecessary. Once gap is closed and patient eats, transition is safe — prolonging IV delays discharge." },
        ],
      },
    ],
    dischargeCriteria: ["Gap closed", "Tolerating oral intake", "Education completed"],
  },
];

export function getTemplate(id: string): CaseTemplate | undefined {
  return CASE_TEMPLATES.find((t) => t.id === id);
}
