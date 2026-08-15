/**
 * wardTemplatesExtra.ts
 * Save to: app/lib/ward/wardTemplatesExtra.ts
 *
 * 8 additional clinical templates for Ward Daily Case Engine
 * Standards: ESC · AHA · NICE · WHO · KDIGO · EASL 2024-2025
 * Educational only. Synthetic patients. No real PHI.
 *
 * Add to CLINICAL_TEMPLATES array in wardEngine.ts
 */

import type { ClinicalTemplate } from './wardEngine'

export const EXTRA_TEMPLATES: ClinicalTemplate[] = [

  // ── 13. Acute Kidney Injury ────────────────────────────────────────────────
  {
    id: 'aki_severe',
    title: 'Acute Kidney Injury — Stage 3',
    department: 'internal',
    acuity: 'urgent',
    stemTemplate:
      '{{age}}{{sex}} with T2DM and CKD stage 3 (baseline Cr 140 µmol/L) admitted with 3 days of vomiting, poor oral intake, and reduced urine output. Now oliguric (<200ml/24h). On metformin, ramipril, and ibuprofen.',
    vitals: { bp: '168/98', hr: '96', temp: '37.2', o2: '97%', rr: '18' },
    diagnosis: 'AKI Stage 3 (KDIGO) — pre-renal + nephrotoxic on CKD',
    labSummary:
      'Cr: 486 µmol/L (↑↑ from 140). Urea: 28.4 mmol/L. K+: 6.2 mmol/L (↑). pH: 7.28. HCO3: 14. eGFR: 9 ml/min/1.73m². Urine Na+: 8 mmol/L (pre-renal pattern).',
    journeyMilestones: [
      { time: 'Admission', event: 'Stop nephrotoxins: HOLD metformin, ramipril, ibuprofen. IV 0.9% NaCl 500ml over 2h. Urgent K+ management: calcium gluconate + insulin/dextrose.', done: false },
      { time: 'Hour 2', event: 'Renal USS: no obstruction. ECG: peaked T waves (hyperkalaemia). Continuous cardiac monitoring.', done: false },
      { time: 'Day 1', event: 'Nephrology review. Fluid balance strict (hourly urine output). Dietary K+ restriction. RRT discussion if no improvement.', done: false },
      { time: 'Day 2', event: 'Creatinine trending: improvement to 320 µmol/L. K+ 5.4 after treatment. Continue cautious fluid resuscitation.', done: false },
      { time: 'Day 4', event: 'Cr improving (210 µmol/L). Discuss safe restart of medications. Nephrology follow-up 2 weeks.', done: false },
    ],
    teachingPoints: [
      {
        title: 'KDIGO AKI Staging',
        body: 'Stage 1: Cr ×1.5-1.9 baseline OR rise ≥26.5 µmol/L in 48h OR UO <0.5ml/kg/h for 6-12h. Stage 2: Cr ×2-2.9. Stage 3: Cr ×3 baseline OR Cr ≥354 µmol/L OR UO <0.3ml/kg/h ≥24h OR anuria ≥12h. Stage 3 = urgent nephrology.',
        source: 'KDIGO AKI Guidelines 2012 (updated 2024)',
      },
      {
        title: 'STOP nephrotoxins immediately',
        body: 'NSAIDs reduce renal prostaglandin synthesis → afferent arteriole constriction → reduced GFR. ACEi/ARB reduce efferent arteriole tone → reduced filtration pressure in AKI. Metformin accumulates in AKI → lactic acidosis. The triple whammy (diuretic + ACEi + NSAID) is a classic cause of AKI. HOLD all three on admission.',
        source: 'NICE AKI Guidelines (NG148) · KDIGO 2024',
      },
      {
        title: 'Hyperkalaemia: treat before dialysis',
        body: 'K+ >6.0 with ECG changes: (1) Calcium gluconate 10ml 10% IV — membrane stabilisation in 3 min. (2) Insulin 10u + dextrose 50g IV — K+ shift in 20-30 min. (3) Salbutamol 10-20mg nebulised — additional shift. (4) Calcium resonium/patiromer — GI removal. (5) Dialysis if refractory. Do NOT give calcium and bicarbonate in same line (precipitates).',
        source: 'UK Renal Association Hyperkalaemia Guidelines 2020',
      },
    ],
    dischargeNotes:
      'Restart ramipril cautiously at lower dose when Cr stable (eGFR >30). AVOID NSAIDs permanently. Metformin restart when eGFR >45. Nephrology OPD 2 weeks. Repeat U&E in 1 week via GP. AKI care bundle education.',
    bedPrefix: 'M',
  },

  // ── 14. COPD Exacerbation ──────────────────────────────────────────────────
  {
    id: 'copd_exacerbation',
    title: 'Severe COPD Exacerbation',
    department: 'internal',
    acuity: 'urgent',
    stemTemplate:
      '{{age}}{{sex}} with severe COPD (FEV1 28% predicted, on home O2 2L) presenting with 4 days of worsening dyspnoea, increased purulent sputum, and confusion. SpO2 82% on room air. Accessory muscle use.',
    vitals: { bp: '142/88', hr: '114', temp: '38.2', o2: '82%', rr: '32' },
    diagnosis: 'Severe AECOPD — type 2 respiratory failure (pH 7.28, pCO2 9.2 kPa)',
    labSummary:
      'ABG (room air): pH 7.28, pO2 5.4 kPa, pCO2 9.2 kPa, HCO3 32 (chronic retention). CXR: hyperinflation, no pneumothorax, possible RLL infiltrate. WBC: 14.2. CRP: 112 mg/L.',
    journeyMilestones: [
      { time: 'Arrival', event: 'Controlled O2: target SpO2 88-92%. Nebulised salbutamol 2.5mg + ipratropium 500mcg. IV hydrocortisone 100mg. Consider NIV if pH <7.35.', done: false },
      { time: 'Hour 1', event: 'Repeat ABG on controlled O2 (28% Venturi). If pH <7.35 + pCO2 rising → NIV (BiPAP IPAP 14-16, EPAP 4-6).', done: false },
      { time: 'Hour 4', event: 'Antibiotics: co-amoxiclav + doxycycline (or amoxicillin + clarithromycin if allergic). Prednisolone 30mg OD × 5 days.', done: false },
      { time: 'Day 1-2', event: 'NIV response assessed. If improving: wean NIV. If worsening: ITU/intubation discussion.', done: false },
      { time: 'Day 3-5', event: 'Step-down to nebulisers. Pulmonology review. Optimise maintenance inhalers. Smoking cessation.', done: false },
    ],
    teachingPoints: [
      {
        title: 'Controlled oxygen — not "high flow"',
        body: 'COPD patients with chronic CO2 retention rely partly on hypoxic drive. High-flow O2 can suppress respiratory drive AND cause V/Q mismatch → worsening hypercapnia. Target SpO2 88-92% (not 94-98%). Use 24-28% Venturi masks. Recheck ABG 30-60 min after O2 adjustment. This is one of the most important COPD pitfalls.',
        source: 'BTS COPD Guidelines 2023 · GOLD 2024',
      },
      {
        title: 'NIV indications in AECOPD',
        body: 'Start NIV if ANY: pH <7.35 with pCO2 >6 kPa after initial treatment. Contraindications: cardiac arrest, vomiting, facial trauma, inability to protect airway, haemodynamic instability. BiPAP settings: IPAP 12-20 cmH2O, EPAP 4-6 cmH2O, back-up rate 12-16. Target pH >7.35 within 1-2h. If no response in 1h — ITU consult.',
        source: 'BTS/ICS NIV Guidelines 2016 (updated) · GOLD 2024',
      },
      {
        title: 'Antibiotic choice in AECOPD',
        body: 'Antibiotics indicated if: increased sputum purulence + increased volume + increased dyspnoea (Anthonisen criteria — ≥2 of 3). First-line: amoxicillin 500mg TDS or doxycycline 200mg loading then 100mg OD. Co-amoxiclav if hospitalised. Reserve ciprofloxacin for Pseudomonas risk (frequent exacerbations, recent antibiotics, bronchiectasis). Duration: 5 days.',
        source: 'NICE NG115 · GOLD 2024',
      },
    ],
    dischargeNotes:
      'Complete prednisolone 30mg × 5 days total. Continue antibiotics 5 days. Optimise inhalers: LAMA + LABA + ICS if FEV1 <50%. Pulmonology OPD 4-6 weeks. Pneumococcal + influenza vaccine. Smoking cessation referral. Pulmonary rehabilitation referral. Self-management plan.',
    bedPrefix: 'M',
  },

  // ── 15. Acute Liver Failure ────────────────────────────────────────────────
  {
    id: 'liver_failure_acute',
    title: 'Acute Liver Failure — Paracetamol Overdose',
    department: 'internal',
    acuity: 'urgent',
    stemTemplate:
      '{{age}}{{sex}} brought by partner after deliberate ingestion of 24g paracetamol 14 hours ago. Jaundiced, confused (GCS 13), RUQ tender. Denies alcohol use.',
    vitals: { bp: '108/66', hr: '104', temp: '37.6', o2: '96%', rr: '22' },
    diagnosis: 'Acute liver failure — paracetamol overdose (Kings College criteria met)',
    labSummary:
      'ALT: 8,420 U/L (↑↑↑). Bilirubin: 142 µmol/L. INR: 4.8 (↑↑). Creatinine: 248 µmol/L (↑). Glucose: 3.1 mmol/L (↓). Paracetamol level: 180 mg/L at 14h (above treatment line). pH: 7.28. Lactate: 4.2.',
    journeyMilestones: [
      { time: 'Admission', event: 'IV N-acetylcysteine (NAC) immediately — even beyond 8h is beneficial. 150mg/kg over 1h → 50mg/kg over 4h → 100mg/kg over 16h. Correct hypoglycaemia: 10% dextrose infusion.', done: false },
      { time: 'Hour 2', event: 'Urgent transplant centre contact — Kings College Criteria met. Avoid sedatives/opioids. Monitor for encephalopathy hourly. IV Vit K 10mg.', done: false },
      { time: 'Hour 6', event: 'ITU/HDU level care. Lactulose for hepatic encephalopathy. Monitor: glucose hourly, INR 6-hourly, Cr, electrolytes, urine output.', done: false },
      { time: 'Day 1', event: 'Repeat Kings College Criteria assessment. If progressive: urgent transplant listing. Avoid FFP unless active bleeding (masks INR trajectory).', done: false },
      { time: 'Day 2-3', event: 'If NAC response: INR improving, pH improving. Continue monitoring. Psychiatry review before discharge.', done: false },
    ],
    teachingPoints: [
      {
        title: 'N-Acetylcysteine: give regardless of time',
        body: 'NAC replenishes hepatic glutathione, neutralising the toxic paracetamol metabolite NAPQI. Historically limited to <24h, but current evidence supports benefit up to and beyond 24h post-ingestion in severe cases. In ALF (regardless of cause), NAC also improves transplant-free survival. Give even if "too late" — the downside is minimal.',
        source: 'MHRA Guidelines · EASL ALF Guidelines 2023',
      },
      {
        title: 'Kings College Criteria — transplant listing',
        body: 'Paracetamol ALF — list for transplant if: pH <7.30 after resuscitation (most predictive single criterion). OR all three: INR >6.5 + Cr >300 µmol/L + Grade III-IV encephalopathy. Non-paracetamol ALF: INR >6.5 OR any 3 of: age <10 or >40, aetiology (non-A/non-B hepatitis or drug), jaundice-to-encephalopathy >7 days, INR >3.5, bilirubin >300. Contact transplant centre early — do not wait for all criteria.',
        source: 'EASL ALF Guidelines 2023 · Kings College Hospital Criteria',
      },
      {
        title: 'Avoid FFP in ALF unless active bleeding',
        body: 'INR in ALF reflects synthetic function — it is the most important prognostic marker. Giving FFP "corrects" INR and masks clinical trajectory, removing the signal used for transplant listing decisions. Only give FFP if: active bleeding, invasive procedure planned, or INR correction needed for safety of a procedure. Vitamin K 10mg IV is appropriate once — if no response, FFP is unlikely to help.',
        source: 'EASL ALF Guidelines 2023 · BSH 2022',
      },
    ],
    dischargeNotes:
      'Complete NAC infusion. Psychiatry inpatient review before discharge. Safe messaging approach. Outpatient hepatology follow-up 2 weeks. LFTs at 2 weeks. Paracetamol counselling. GP letter with overdose documentation.',
    bedPrefix: 'M',
  },

  // ── 16. Hypertensive Emergency ─────────────────────────────────────────────
  {
    id: 'hypertensive_emergency',
    title: 'Hypertensive Emergency — Acute Aortic Dissection',
    department: 'emergency',
    acuity: 'urgent',
    stemTemplate:
      '{{age}}{{sex}} with sudden-onset tearing chest pain radiating to the back. BP 218/124 right arm, 176/98 left arm. HR 108. Aortic regurgitation murmur audible.',
    vitals: { bp: '218/124', hr: '108', temp: '36.9', o2: '96%', rr: '22' },
    diagnosis: 'Type A Aortic Dissection — hypertensive emergency',
    labSummary:
      'D-dimer: 8,240 ng/mL (↑↑). Troponin: 0.12 (mildly ↑ — coronary involvement?). CXR: widened mediastinum. CT aortogram: Type A dissection — ascending aorta involvement. Pericardial effusion noted.',
    journeyMilestones: [
      { time: 'Arrival', event: 'Immediate BP control: IV labetalol (target SBP 100-120 mmHg). Two large-bore IVs. Type and crossmatch 6 units. Urgent CT aortogram.', done: false },
      { time: 'Hour 1', event: 'CT confirms Type A dissection. Cardiothoracic surgery urgent consult. Transfer to theatre preparation. Morphine for pain.', done: false },
      { time: 'Hour 2', event: 'Emergency surgical repair: ascending aorta replacement under cardiopulmonary bypass.', done: false },
      { time: 'Post-op Day 1', event: 'ITU: haemodynamic monitoring, BP control (target SBP <120), neurological assessment.', done: false },
      { time: 'Day 3-7', event: 'Transition to oral antihypertensives. Aortic surveillance planning. Genetic counselling if Marfan/connective tissue disorder suspected.', done: false },
    ],
    teachingPoints: [
      {
        title: 'Type A vs Type B Dissection — management differs completely',
        body: 'Stanford Type A: involves ascending aorta — SURGICAL EMERGENCY. 1-2% mortality per hour without surgery. Type B: descending aorta only — medical management first (IV beta-blocker + vasodilator to SBP 100-120). TEVAR (endovascular repair) for complicated Type B (malperfusion, rupture, rapid expansion). Never give thrombolytics for suspected aortic dissection — catastrophic haemorrhage.',
        source: 'ESC Aortic Diseases Guidelines 2014 (updated 2024)',
      },
      {
        title: 'BP control in dissection: heart rate first',
        body: 'Reduce HR first (target HR <60 bpm) — this reduces aortic wall stress (dP/dt). IV labetalol (alpha + beta blockade) or esmolol infusion. Then add vasodilator if SBP still high: IV nitroprusside or nicardipine. NEVER give vasodilator alone without beta-blocker first — reflex tachycardia increases aortic wall shear stress. Target: SBP 100-120 mmHg, HR <60.',
        source: 'ESC 2014 (updated) · AHA/ACC 2022 Aortic Guidelines',
      },
      {
        title: 'Inter-arm BP difference — clinical pearl',
        body: 'BP difference >20 mmHg between arms suggests subclavian artery involvement in the dissection flap. Always measure both arms in suspected dissection. Pulse deficits (absent femoral, radial, carotid) indicate malperfusion — sign of involvement of branch vessels. Assess all pulses systematically.',
        source: 'ESC 2014 Aortic Diseases Guidelines',
      },
    ],
    dischargeNotes:
      'Lifelong antihypertensive therapy: beta-blocker first-line (bisoprolol/atenolol). SBP target <120 mmHg. Annual CT aorta surveillance. Avoid strenuous isometric exercise. Genetic testing if age <40 or Marfan features. First-degree relative screening.',
    bedPrefix: 'ED',
  },

  // ── 17. DVT / VTE Management ───────────────────────────────────────────────
  {
    id: 'dvt_proximal',
    title: 'Proximal DVT — Unprovoked',
    department: 'internal',
    acuity: 'standard',
    stemTemplate:
      '{{age}}{{sex}} presenting with 5 days of right calf and thigh swelling, redness, and tenderness. No recent travel or surgery. Wells score: 3 (high probability). No family history of thrombosis.',
    vitals: { bp: '132/82', hr: '78', temp: '37.0', o2: '98%', rr: '16' },
    diagnosis: 'Proximal DVT (ilieofemoral) — first unprovoked VTE',
    labSummary:
      'D-dimer: 4,280 ng/mL (↑↑). Doppler USS: non-compressible right femoral and popliteal veins — extensive proximal DVT confirmed. Cr: 88. LFTs: normal. FBC: normal.',
    journeyMilestones: [
      { time: 'Diagnosis', event: 'Start therapeutic anticoagulation immediately — do not wait for thrombophilia results. Rivaroxaban 15mg BD × 21 days preferred (outpatient suitable).', done: false },
      { time: 'Day 1', event: 'Assess for provoked vs unprovoked. Provoked: 3 months anticoagulation. Unprovoked: ≥3 months, assess for indefinite.', done: false },
      { time: 'Week 1', event: 'Consider cancer screening: CXR, urine dip, FBC, LFTs, Ca2+, PSA (men), mammogram/cervical (women) as indicated by age and symptoms.', done: false },
      { time: '3 months', event: 'Review: recurrence risk, bleeding risk, patient preference. Unprovoked proximal DVT: consider indefinite anticoagulation.', done: false },
      { time: 'Follow-up', event: 'Thrombophilia testing 3 months after stopping anticoagulation (if result will change management). Check for post-thrombotic syndrome.', done: false },
    ],
    teachingPoints: [
      {
        title: 'DOAC outpatient treatment — most DVTs do not need admission',
        body: 'Uncomplicated proximal DVT: outpatient DOAC treatment is safe and preferred. Rivaroxaban 15mg BD × 21 days then 20mg OD, OR apixaban 10mg BD × 7 days then 5mg BD. No monitoring required. Exceptions requiring admission: bilateral DVT, PE symptoms, high bleeding risk, renal failure (eGFR <15 — use warfarin or LMWH/heparin), haemodynamic instability.',
        source: 'ESC VTE Guidelines 2019 · NICE NG158',
      },
      {
        title: 'Unprovoked VTE: thrombophilia testing timing',
        body: 'Do NOT test thrombophilia while on anticoagulation — results are unreliable. Test 3 months after stopping anticoagulation. Test only if result will change management (e.g. indefinite anticoagulation already planned → testing adds little). Always test: Factor V Leiden, Prothrombin 20210A, Protein C/S, Antithrombin, Antiphospholipid antibodies × 2 (12 weeks apart for APS diagnosis).',
        source: 'BSH Thrombophilia Testing Guidelines 2022',
      },
      {
        title: 'Duration of anticoagulation in DVT',
        body: 'Provoked (surgery, trauma, immobility): 3 months. Unprovoked first DVT, distal: 3 months. Unprovoked first DVT, proximal: ≥3 months, consider indefinite (weigh bleeding vs recurrence risk — HAS-BLED vs HERDOO2). Second unprovoked: indefinite. Cancer-associated: DOAC (rivaroxaban/edoxaban) preferred. Antiphospholipid syndrome: warfarin (DOAC inferior in triple-positive APS).',
        source: 'ESC 2019 PE/DVT Guidelines · NICE NG158',
      },
    ],
    dischargeNotes:
      'Rivaroxaban 15mg BD × 21 days then 20mg OD with evening meal. Duration: ≥3 months (review at 3 months for indefinite therapy decision). GP: arrange age-appropriate cancer screening. Haematology/anticoagulation clinic follow-up. Compression stockings (below knee, 23-32 mmHg) for 2 years — reduces post-thrombotic syndrome.',
    bedPrefix: 'M',
  },

  // ── 18. Bacterial Meningitis ───────────────────────────────────────────────
  {
    id: 'bacterial_meningitis',
    title: 'Bacterial Meningitis',
    department: 'internal',
    acuity: 'urgent',
    stemTemplate:
      '{{age}}{{sex}} with severe headache, neck stiffness, photophobia, and fever for 18 hours. GCS 13 (E3V4M6). Non-blanching petechial rash on trunk. Kernig\'s sign positive.',
    vitals: { bp: '104/62', hr: '128', temp: '39.8', o2: '95%', rr: '24' },
    diagnosis: 'Bacterial meningitis — meningococcal (non-blanching rash)',
    labSummary:
      'WBC: 22.4 × 10⁹/L (neutrophilia). CRP: 344 mg/L. PCT: 28 ng/mL. Lactate: 2.8 mmol/L. CT head: no contraindication to LP. CSF: turbid — WBC 4,800 (98% neutrophils), protein 3.2 g/L, glucose 1.4 (plasma 7.2, ratio 0.19). Gram stain: Gram-negative diplococci.',
    journeyMilestones: [
      { time: 'Arrival', event: 'Do NOT delay antibiotics for LP — give ceftriaxone 2g IV immediately. If meningococcal rash: treat BEFORE any investigation. Dexamethasone 0.15mg/kg QDS with or before first antibiotic dose.', done: false },
      { time: 'Hour 1', event: 'LP if CT head confirms no contraindication (papilloedema/herniation). Blood cultures × 2. Notify public health — contact tracing for meningococcal.', done: false },
      { time: 'Hour 4', event: 'ITU/HDU level care. Monitor for: SIADH (restrict fluids if Na+ falling), DIC (FBC/clotting), raised ICP (GCS monitoring), septic shock.', done: false },
      { time: 'Day 2', event: 'Sensitivities → rationalise antibiotics. If pneumococcal: penicillin G or amoxicillin. Continue dexamethasone × 4 days.', done: false },
      { time: 'Day 7-14', event: 'If improving: IV to oral step-down when able. Audiological assessment before discharge. Rehab referral.', done: false },
    ],
    teachingPoints: [
      {
        title: 'Antibiotics BEFORE LP — never delay treatment',
        body: 'In suspected bacterial meningitis, administer IV ceftriaxone 2g IMMEDIATELY — do not wait for LP or CT results. LP can safely follow once antibiotics have been given. The risk of untreated bacterial meningitis (death within hours, ~20% mortality) far outweighs any risk of post-antibiotic LP interpretation difficulty. Dexamethasone 0.15mg/kg QDS × 4 days: give with or before first antibiotic dose — reduces mortality in pneumococcal meningitis and hearing loss.',
        source: 'NICE NG240 Meningitis 2023 · Surviving Sepsis Campaign',
      },
      {
        title: 'Non-blanching rash = meningococcal until proven otherwise',
        body: 'A non-blanching petechial or purpuric rash in a febrile patient = meningococcal septicaemia/meningitis until proven otherwise. Treat IMMEDIATELY with IM/IV benzylpenicillin or ceftriaxone — even in the community before hospital transfer. The "glass test": press a glass against the rash — if it does not blanch (remains visible), it is non-blanching = vascular injury/petechiae = emergency. Blanching rash = capillary engorgement = less alarming.',
        source: 'NICE NG240 2023 · Meningitis Research Foundation',
      },
      {
        title: 'Meningococcal disease: public health notification mandatory',
        body: 'Meningococcal disease is a notifiable disease in most countries. Notify public health immediately. Close contacts (household, intimate kissing contacts within 7 days) require: prophylactic ciprofloxacin 500mg stat (adults) OR rifampicin BD × 2 days. Contacts should also receive meningococcal vaccine (ACWY) if not previously vaccinated. Healthcare workers: respiratory precautions until 24h of antibiotics given.',
        source: 'PHE Meningococcal Guidelines 2020 · NICE NG240 2023',
      },
    ],
    dischargeNotes:
      'Complete 10-14 days IV ceftriaxone (or oral step-down if improving). Audiological assessment — sensorineural deafness in 10% of survivors. Neuropsychology referral if cognitive symptoms. Public health follow-up. Vaccination review: MenACWY, MenB if eligible. GP + neurology follow-up 6 weeks.',
    bedPrefix: 'M',
  },

  // ── 19. Acute Pancreatitis ─────────────────────────────────────────────────
  {
    id: 'pancreatitis_severe',
    title: 'Severe Acute Pancreatitis',
    department: 'surgery',
    acuity: 'urgent',
    stemTemplate:
      '{{age}}{{sex}} with known gallstones presenting with severe epigastric pain radiating to the back, vomiting × 8 hours. BP 98/62, HR 122, O2 94%. Obese (BMI 36). Alcohol: 40 units/week.',
    vitals: { bp: '98/62', hr: '122', temp: '38.6', o2: '94%', rr: '26' },
    diagnosis: 'Severe acute pancreatitis — gallstone aetiology (APACHE II score >8)',
    labSummary:
      'Amylase: 4,820 U/L (↑↑↑). Lipase: 8,240 U/L (↑↑↑). WBC: 24.6. CRP: 312 (↑↑). Ca2+: 1.84 mmol/L (↓). Glucose: 18.2 mmol/L. ALT: 248 (↑ — biliary cause). CT severity index (Balthazar): Grade D — peripancreatic fluid.',
    journeyMilestones: [
      { time: 'Admission', event: 'Aggressive IV fluid resuscitation: Hartmann\'s solution 250-500ml/h (not normal saline — worse outcomes). Analgesia: IV morphine PCA. Strict fluid balance. NBM initially.', done: false },
      { time: 'Hour 4', event: 'Aetiology: biliary (USS) vs alcohol. Severity score (APACHE II, Glasgow, CRP >150 at 48h). ITU if APACHE II >8 or organ failure.', done: false },
      { time: 'Day 1', event: 'Early enteral nutrition (nasojejunal) within 24-72h — superior to TPN. Do NOT keep NBM. Early feeding reduces infectious complications.', done: false },
      { time: 'Day 2-3', event: 'Biliary pancreatitis + cholangitis: urgent ERCP within 24h. Biliary pancreatitis + no cholangitis: cholecystectomy before discharge.', done: false },
      { time: 'Day 5+', event: 'CT if clinical deterioration — pancreatic necrosis? Infected necrosis (gas in pancreas): step-up drainage + antibiotics (meropenem). Surgery only if minimally invasive approach fails.', done: false },
    ],
    teachingPoints: [
      {
        title: 'Fluid resuscitation: Hartmann\'s NOT normal saline',
        body: 'Multiple RCTs demonstrate Hartmann\'s solution (lactated Ringer\'s) is superior to normal saline in acute pancreatitis. Normal saline causes hyperchloraemic acidosis which worsens pancreatic inflammation. Give 250-500ml/h in first 24h, then titrate to urine output >0.5ml/kg/h, HR <100, MAP >65. Aggressive early resuscitation prevents progression to pancreatic necrosis.',
        source: 'ACG Pancreatitis Guidelines 2024 · IAP/APA 2022',
      },
      {
        title: 'Early enteral nutrition — not NBM, not TPN',
        body: 'Dogma "resting the pancreas" with NBM has been disproven. Early enteral nutrition (within 24-72h) via nasogastric or nasojejunal tube reduces infection, length of stay, organ failure, and mortality compared to TPN. The pancreas is already maximally stimulated by the injury itself — enteral nutrition does not worsen pancreatitis. Reserve TPN only when enteral route is not feasible.',
        source: 'ACG 2024 · ESPEN Pancreatitis Guidelines 2020',
      },
      {
        title: 'Infected pancreatic necrosis: step-up approach',
        body: 'Infected necrotising pancreatitis (gas in pancreas on CT, FNA positive): do NOT rush to open surgery. Step-up approach: (1) Antibiotics (meropenem or imipenem — good pancreatic penetration). (2) Radiological or endoscopic drainage (percutaneous/endoscopic) 4+ weeks after onset when necrosis walled-off. (3) Minimally invasive necrosectomy. (4) Open surgery only if all above fail. PANTER trial: step-up approach halves mortality vs primary open necrosectomy.',
        source: 'PANTER Trial · ACG 2024 · IAP/APA 2022',
      },
    ],
    dischargeNotes:
      'Cholecystectomy before discharge (if gallstone pancreatitis + fit for surgery). Alcohol cessation counselling + referral if alcohol aetiology. GP: LFTs + Ca2+ at 6 weeks. Diabetes screen (exocrine + endocrine insufficiency). Pancreatic enzyme replacement if steatorrhoea. Gastroenterology follow-up.',
    bedPrefix: 'S',
  },

  // ── 20. Thyroid Storm ──────────────────────────────────────────────────────
  {
    id: 'thyroid_storm',
    title: 'Thyroid Storm (Thyrotoxic Crisis)',
    department: 'internal',
    acuity: 'urgent',
    stemTemplate:
      '{{age}}{{sex}} with known Graves\' disease who stopped antithyroid medication 2 weeks ago. Presenting with high fever, agitation, palpitations, and vomiting. Burch-Wartofsky score: 55 (impending storm).',
    vitals: { bp: '164/62', hr: '152', temp: '39.9', o2: '96%', rr: '26' },
    diagnosis: 'Thyroid storm — Graves\' disease, precipitated by medication withdrawal',
    labSummary:
      'TSH: <0.01 mIU/L (↓↓↓). FT4: 68 pmol/L (↑↑↑, normal 12-22). FT3: 24 pmol/L (↑↑↑). WBC: 14.2. CRP: 88. LFTs: mildly elevated (thyrotoxic hepatitis). ECG: AF rate 152.',
    journeyMilestones: [
      { time: 'Admission', event: 'Beta-blocker STAT: propranolol 60-80mg PO or IV esmolol infusion (rate control + peripheral T4→T3 conversion block). Cooling measures for fever. IV fluids.', done: false },
      { time: 'Hour 1', event: 'Propylthiouracil (PTU) 500-1000mg loading dose PO/NG — blocks new hormone synthesis AND peripheral T4→T3 conversion (preferred over carbimazole in storm). Wait 1h then Lugol\'s iodine (blocks hormone release — Wolff-Chaikoff effect).', done: false },
      { time: 'Hour 2', event: 'Hydrocortisone 100mg IV TDS — blocks T4→T3 conversion, treats relative adrenal insufficiency. Digoxin for AF rate control if beta-blocker alone insufficient.', done: false },
      { time: 'Day 1', event: 'Continue PTU 250mg QDS. Monitor: temperature, HR, clinical Burch-Wartofsky score. Treat precipitating cause. Endocrinology urgent review.', done: false },
      { time: 'Day 3-5', event: 'Score improving: transition to maintenance carbimazole. Plan definitive treatment: radioiodine or thyroidectomy.', done: false },
    ],
    teachingPoints: [
      {
        title: 'The Burch-Wartofsky Score — diagnose thyroid storm',
        body: 'Burch-Wartofsky Point Scale (BWPS) diagnoses thyroid storm based on: temperature (37-41°C: 5-30 points), CNS dysfunction (mild-severe: 10-30 points), GI symptoms (5-20 points), HR (99-140+: 5-25 points), AF (10 points), precipitating event (10 points), CHF (5-20 points). Score ≥45: thyroid storm. Score 25-44: impending storm — treat aggressively. Score <25: storm unlikely.',
        source: 'Burch & Wartofsky 1993 · ATA Thyroid Storm Guidelines 2016',
      },
      {
        title: 'Treatment order matters: beta-blocker → PTU → iodine → steroids',
        body: 'Order is critical: (1) Beta-blocker first — propranolol (also blocks peripheral T4→T3). (2) PTU 1h before iodine — iodine alone can increase hormone synthesis (Jod-Basedow). Wait at least 1 hour after PTU before Lugol\'s iodine. (3) Iodine (Lugol\'s 5-10 drops TDS) — blocks hormone RELEASE (Wolff-Chaikoff effect). (4) Hydrocortisone — blocks conversion, treats adrenal insufficiency. Cholestyramine: adjunct to bind thyroid hormones in gut.',
        source: 'ATA Thyroid Storm Guidelines 2016 · ETA 2022',
      },
      {
        title: 'PTU preferred over carbimazole in thyroid storm',
        body: 'In thyroid storm specifically, PTU is preferred because it: (1) blocks new thyroid hormone synthesis (like carbimazole) AND (2) inhibits peripheral conversion of T4 to the more active T3 (carbimazole does not do this). PTU loading dose: 500-1000mg, then 250mg every 4-6h. After the storm is controlled, transition to carbimazole for long-term maintenance (PTU has higher risk of hepatotoxicity with prolonged use).',
        source: 'ATA Guidelines 2016 · NICE Thyroid Disease 2023',
      },
    ],
    dischargeNotes:
      'Carbimazole maintenance (transitioned from PTU after storm controlled). Beta-blocker until euthyroid. Endocrinology follow-up 4 weeks. Definitive treatment plan: radioiodine vs thyroidectomy. TFTs every 4-6 weeks. Patient education: never stop antithyroid medication abruptly.',
    bedPrefix: 'M',
  },
]
