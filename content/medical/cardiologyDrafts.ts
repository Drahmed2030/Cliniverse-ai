// Historical drafts only. Regenerate with node scripts/extract-legacy-cardiology.mjs.
// No application imports: scientific revision and publication are separate steps.
import type { MedicalCaseDraft } from './caseDraft.ts'

export const cardiologyDrafts = [
  {
    "schemaVersion": 1,
    "id": "legacy-cardiology-c1",
    "version": 1,
    "specialty": "cardiology",
    "status": "draft",
    "provenance": {
      "repository": "https://github.com/Drahmed2030/Cliniverse-ai",
      "commit": "d019f5fccbe0606090a1ab5ee88944c29d268b15",
      "path": "app/components/ClinicalLibrary.tsx",
      "blob": "531a63de5a14dd310e8dad89b64431ef8ad2b3cd",
      "legacyId": "c1",
      "contentSha256": "8abdf6ad3afde40ad6a85d2b4a7592eb7b8d17d2a96da43f4115a3514bc9b008"
    },
    "legacyContent": {
      "id": "c1",
      "title": "72M — Anterior STEMI",
      "tags": [
        "STEMI",
        "Cardiology",
        "Critical"
      ],
      "difficulty": "Advanced",
      "mortality": "8-10%",
      "img": "https://images.unsplash.com/photo-1628348070889-cb656235b4eb?w=800&q=80",
      "history": "72-year-old male, smoker, hypertensive, diabetic. 2-hour history of severe crushing central chest pain radiating to left arm and jaw. Diaphoresis, nausea, vomiting.",
      "examination": "BP 90/60, HR 110 irregular, RR 22, SpO2 94% on air. Pale, diaphoretic. JVP elevated. S3 gallop. Bilateral basal crepitations.",
      "ecg": "Sinus tachycardia HR 110. ST elevation V1-V4 (3-5mm). Reciprocal ST depression II, III, aVF. New LBBB pattern.",
      "labs": {
        "troponin": "Troponin I: 8.4 ng/mL (↑↑↑ Normal <0.04)",
        "ck": "CK-MB: 180 U/L (↑↑)",
        "bnp": "BNP: 890 pg/mL (↑↑)",
        "cbc": "WBC 14.2, Hgb 13.1, Plt 220",
        "chemistry": "Na 138, K 4.1, Cr 1.4, Glucose 210",
        "coag": "PT 12s, INR 1.1"
      },
      "imaging": {
        "cxr": "Cardiomegaly. Bilateral pulmonary edema. Kerley B lines. No pneumothorax.",
        "echo": "EF 30%. Anterior wall akinesis. Mild MR. No pericardial effusion. RWMA anterior territory.",
        "ct": "Not indicated — primary PCI preferred"
      },
      "management": [
        "Dual antiplatelet: Aspirin 300mg + Ticagrelor 180mg loading",
        "Anticoagulation: UFH 60 units/kg IV bolus",
        "Primary PCI — door-to-balloon <90 minutes target",
        "O2 if SpO2 <94%. IV access x2. Continuous monitoring",
        "GTN contraindicated — hypotensive",
        "Morphine 2-4mg IV for pain if not hypotensive",
        "Beta-blocker if hemodynamically stable post-PCI",
        "ACEI/ARB within 24h post-PCI",
        "Statin: Atorvastatin 80mg",
        "ICU/CCU admission post-PCI"
      ],
      "teaching": [
        "Door-to-balloon time <90 min reduces mortality by 40%",
        "New LBBB with chest pain = treat as STEMI until proven otherwise",
        "Cardiogenic shock complicates 5-8% of STEMI — mortality 40-60%",
        "Dual antiplatelet therapy for 12 months post-DES"
      ],
      "outcome": "Post-PCI: LAD stented. Residual EF 35% at 30 days. Started on GDMT. Discharged day 5."
    },
    "learningObjectives": [],
    "prerequisites": [],
    "decisionPoints": [],
    "references": [],
    "mediaBindings": [],
    "review": {
      "status": "pending",
      "reviewer": null,
      "reviewedAt": null,
      "reviewDueAt": null,
      "licenseStatus": "unverified",
      "blockers": [
        "Verify clinical consistency, management, thresholds and quantitative claims against current primary sources.",
        "Define learning objectives, decision points and assessment rubric.",
        "Record clinical reviewer approval for the revised version.",
        "Verify content and image reuse rights; the legacy image URL is not an approved clinical media binding.",
        "Bind only reviewed media that match this scenario; do not pair unrelated ECG and Echo records."
      ]
    }
  },
  {
    "schemaVersion": 1,
    "id": "legacy-cardiology-c2",
    "version": 1,
    "specialty": "cardiology",
    "status": "draft",
    "provenance": {
      "repository": "https://github.com/Drahmed2030/Cliniverse-ai",
      "commit": "d019f5fccbe0606090a1ab5ee88944c29d268b15",
      "path": "app/components/ClinicalLibrary.tsx",
      "blob": "531a63de5a14dd310e8dad89b64431ef8ad2b3cd",
      "legacyId": "c2",
      "contentSha256": "cf236b34fe5cbf1472bc00605193571cfd47caf5f2d6605b34917c2557790513"
    },
    "legacyContent": {
      "id": "c2",
      "title": "58F — Acute Decompensated Heart Failure",
      "tags": [
        "Heart Failure",
        "Cardiology",
        "HFrEF"
      ],
      "difficulty": "Intermediate",
      "mortality": "3-5%",
      "img": "https://images.unsplash.com/photo-1559757175-5700dde675bc?w=800&q=80",
      "history": "58-year-old female with known HFrEF (EF 25%), NYHA III. 3-day worsening dyspnea, orthopnea (3 pillows), PND. Weight gain 4kg in 1 week. Recent medication non-compliance.",
      "examination": "BP 160/95, HR 95 regular, RR 28, SpO2 88% on air → 94% on 4L O2. JVP 16cm. Bibasal crepitations to mid-zones. Pitting edema to knees. S3 gallop.",
      "ecg": "Sinus rhythm. LVH voltage. LBBB (unchanged). QTc 460ms.",
      "labs": {
        "bnp": "BNP: 2,800 pg/mL (↑↑↑)",
        "troponin": "Troponin I: 0.08 ng/mL (mildly elevated)",
        "cbc": "WBC 9.2, Hgb 10.8 (mild anemia), Plt 180",
        "chemistry": "Na 132 (↓), K 3.2 (↓), Cr 1.8 (↑ baseline 1.4), eGFR 38",
        "lft": "ALT 85 (↑ — hepatic congestion)",
        "tsh": "TSH 2.1 (normal)"
      },
      "imaging": {
        "cxr": "Cardiomegaly. Bilateral pleural effusions. Pulmonary edema. Vascular redistribution.",
        "echo": "EF 22% (↓ from 25%). Dilated LV. Severe global hypokinesis. Moderate functional MR. RVSP 55mmHg."
      },
      "management": [
        "IV Furosemide 80mg bolus then 20mg/hr infusion — target UO 100-200ml/hr",
        "Supplemental O2 — consider NIV (BiPAP) if not improving",
        "Fluid restriction 1.5L/day",
        "Daily weights + strict fluid balance",
        "Hold ACEi temporarily — Cr rising",
        "KCl replacement for hypokalemia",
        "Optimize GDMT once euvolemic: Beta-blocker, ACEi, MRA, SGLT2i",
        "Cardiology + HF team review",
        "Identify precipitant: non-compliance, infection, ACS"
      ],
      "teaching": [
        "BNP >1000 indicates significant decompensation",
        "Hyponatremia in HF = poor prognostic marker",
        "SGLT2i (dapagliflozin/empagliflozin) reduce HF hospitalization by 26%",
        "IV diuresis target: 3-5L negative balance over 24-48h"
      ],
      "outcome": "Achieved euvolemia by day 3. BNP 680 at discharge. SGLT2i added. Home with HF nurse follow-up."
    },
    "learningObjectives": [],
    "prerequisites": [],
    "decisionPoints": [],
    "references": [],
    "mediaBindings": [],
    "review": {
      "status": "pending",
      "reviewer": null,
      "reviewedAt": null,
      "reviewDueAt": null,
      "licenseStatus": "unverified",
      "blockers": [
        "Verify clinical consistency, management, thresholds and quantitative claims against current primary sources.",
        "Define learning objectives, decision points and assessment rubric.",
        "Record clinical reviewer approval for the revised version.",
        "Verify content and image reuse rights; the legacy image URL is not an approved clinical media binding.",
        "Bind only reviewed media that match this scenario; do not pair unrelated ECG and Echo records."
      ]
    }
  },
  {
    "schemaVersion": 1,
    "id": "legacy-cardiology-c3",
    "version": 1,
    "specialty": "cardiology",
    "status": "draft",
    "provenance": {
      "repository": "https://github.com/Drahmed2030/Cliniverse-ai",
      "commit": "d019f5fccbe0606090a1ab5ee88944c29d268b15",
      "path": "app/components/ClinicalLibrary.tsx",
      "blob": "531a63de5a14dd310e8dad89b64431ef8ad2b3cd",
      "legacyId": "c3",
      "contentSha256": "75f9bf456f2f9453041e28771e99ad491f96d2dc9c21eac08eaf14e0ae5221cb"
    },
    "legacyContent": {
      "id": "c3",
      "title": "45M — Hypertensive Emergency",
      "tags": [
        "Hypertension",
        "Emergency",
        "End-organ damage"
      ],
      "difficulty": "Intermediate",
      "mortality": "1-2%",
      "img": "https://images.unsplash.com/photo-1551190822-a9333d879b1f?w=800&q=80",
      "history": "45-year-old male, known hypertensive, non-compliant with medications. Severe headache, blurred vision, confusion for 6 hours. No chest pain. Denies drug use.",
      "examination": "BP 240/140 (both arms equal), HR 98, RR 18, SpO2 98%. GCS 13/15 (E4V4M5). Papilledema bilateral. Grade IV hypertensive retinopathy. No focal neurology.",
      "ecg": "LVH with strain pattern. No ischemic changes.",
      "labs": {
        "chemistry": "Cr 2.8 (↑↑ — AKI), BUN 45, Na 140, K 4.8",
        "cbc": "Normal",
        "urine": "Proteinuria 3+, RBC casts (↑ — renal involvement)",
        "troponin": "Troponin 0.12 (↑ mild)",
        "bnp": "BNP 450"
      },
      "imaging": {
        "ct": "CT Brain: No hemorrhage. Posterior white matter hypodensities — PRES pattern.",
        "cxr": "Mild cardiomegaly. No pulmonary edema.",
        "echo": "EF 55%. Concentric LVH. Grade II diastolic dysfunction."
      },
      "management": [
        "ICU admission — continuous BP monitoring (arterial line)",
        "Target: reduce MAP by 20-25% in first hour ONLY",
        "IV Labetalol 20mg bolus then infusion OR Nicardipine infusion",
        "Avoid: rapid BP reduction (causes stroke/MI)",
        "Ophthalmology review — papilledema",
        "Nephrology input — AKI",
        "MRI Brain to confirm PRES",
        "Resume oral antihypertensives when stable",
        "Investigate secondary causes: renal artery stenosis, pheo"
      ],
      "teaching": [
        "Hypertensive emergency = BP >180/120 + end organ damage",
        "PRES (Posterior Reversible Encephalopathy Syndrome) — reversible if treated",
        "Never use sublingual nifedipine — uncontrolled rapid drop = stroke",
        "Target BP reduction 20-25% in 1 hour, then gradual normalization over 24-48h"
      ],
      "outcome": "MAP reduced 25% in 1h with IV nicardipine. Symptoms improved. Oral amlodipine + ramipril at discharge. PRES resolved on follow-up MRI."
    },
    "learningObjectives": [],
    "prerequisites": [],
    "decisionPoints": [],
    "references": [],
    "mediaBindings": [],
    "review": {
      "status": "pending",
      "reviewer": null,
      "reviewedAt": null,
      "reviewDueAt": null,
      "licenseStatus": "unverified",
      "blockers": [
        "Verify clinical consistency, management, thresholds and quantitative claims against current primary sources.",
        "Define learning objectives, decision points and assessment rubric.",
        "Record clinical reviewer approval for the revised version.",
        "Verify content and image reuse rights; the legacy image URL is not an approved clinical media binding.",
        "Bind only reviewed media that match this scenario; do not pair unrelated ECG and Echo records."
      ]
    }
  }
] satisfies MedicalCaseDraft[]
