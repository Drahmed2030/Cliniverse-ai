/**
 * aclsLessons.ts
 * Save to: app/lib/codelab/aclsLessons.ts
 *
 * Code Lab — ACLS Track · 6 lessons
 * Standards: AHA 2025 CPR & ECC Guidelines (educational reference)
 * Educational only. Not official AHA ACLS certification.
 *
 * DISCLAIMER (display on every ACLS screen):
 * "Educational simulation aligned with published resuscitation science (AHA 2025).
 *  Not an official AHA course. Does not issue AHA ACLS provider cards.
 *  Complete skills testing at an authorized AHA Training Center for certification."
 */

export interface ACLSLesson {
  id: string
  track: 'acls'
  order: number
  title: string
  durationMin: number
  objective: string
  keyPoints: string[]
  videoBrief: string
  clinicalContext: string  // real-world framing
  practice: {
    type: 'sequence' | 'timer' | 'checklist' | 'scenario' | 'algorithm' | 'drug_drill'
    prompt: string
    items?: string[]
    drugs?: { name: string; dose: string; indication: string; timing: string }[]
  }
  mcqs: {
    q: string
    options: string[]
    answerIndex: number
    explanation: string
  }[]
  keyNumbers: { label: string; value: string }[]
  commonMistakes: string[]
  unlockNext: string | null
}

export const ACLS_DISCLAIMER =
  'Educational simulation aligned with published resuscitation science (AHA 2025). ' +
  'Not an official AHA course. Does not issue AHA ACLS provider cards. ' +
  'Complete skills testing at an authorized AHA Training Center for certification. ' +
  'Practice safely. Not for real-patient care decisions alone.'

export const ACLS_LESSONS: ACLSLesson[] = [

  // ── Lesson 1 — The ACLS Systematic Approach ────────────────────────────────
  {
    id: 'acls_01_systematic',
    track: 'acls',
    order: 1,
    title: 'The ACLS Systematic Approach',
    durationMin: 8,
    objective:
      'Apply the BLS–ACLS continuum and use the systematic approach to assess and manage any critically ill patient.',

    clinicalContext:
      'You are called to a patient who was found unresponsive in the hospital corridor. You have 2 nurses and a defibrillator available. How do you lead this response?',

    keyPoints: [
      'ACLS builds on high-quality BLS — never compromise BLS for advanced interventions.',
      'Primary survey (ABCDE): Airway · Breathing · Circulation · Disability · Exposure.',
      'Secondary survey: 12-lead ECG, history (SAMPLE), targeted physical exam, labs.',
      'The team leader coordinates — assigns roles, monitors quality, makes decisions.',
      'Closed-loop communication is non-negotiable: sender → receiver confirms → sender acknowledges.',
      'H\'s and T\'s guide reversible cause identification in all arrests.',
    ],

    videoBrief:
      '90s original: ACLS team arrives at unresponsive patient — leader assigns roles (compressor/airway/IV-IO/recorder), closed-loop comms demonstrated, primary survey performed in parallel.',

    practice: {
      type: 'sequence',
      prompt: 'Arrange the ACLS systematic approach in correct order',
      items: [
        'Ensure scene safety + call for help',
        'Primary survey: ABCDE + attach monitor/defibrillator',
        'Identify rhythm + determine if shockable',
        'Continue CPR while establishing IV/IO access',
        'Secondary survey: 12-lead ECG + H\'s and T\'s',
        'Reassess and adjust treatment every 2-minute cycle',
      ],
    },

    mcqs: [
      {
        q: 'A team member gives epinephrine without being asked. The team leader says "Epi 1mg given — thank you." This exchange represents:',
        options: [
          'A breakdown in closed-loop communication',
          'Appropriate closed-loop communication — confirming the action',
          'An unsafe medication error — must be documented',
          'The recorder\'s role, not the team leader\'s',
        ],
        answerIndex: 1,
        explanation: 'Closed-loop communication: action performed → team leader acknowledges → recorded. This prevents errors and confirms the task. The team leader confirming "Epi given" is correct and expected.',
      },
      {
        q: 'The H\'s and T\'s mnemonic is used during cardiac arrest to:',
        options: [
          'Remember which drugs to give in which order',
          'Identify potentially reversible causes of cardiac arrest',
          'Determine when to stop resuscitation efforts',
          'Calculate the correct defibrillation energy',
        ],
        answerIndex: 1,
        explanation: 'H\'s and T\'s guide the team to identify and treat reversible causes: Hypovolaemia, Hypoxia, Hydrogen ion (acidosis), Hypo/Hyperkalaemia, Hypothermia | Tension pneumothorax, Tamponade, Toxins, Thrombosis (coronary/pulmonary).',
      },
      {
        q: 'During a code, when should advanced interventions (intubation, IV access) be performed?',
        options: [
          'Before starting CPR — establish access first',
          'After the first shock in all cases',
          'Without interrupting or compromising high-quality CPR',
          'Only after 3 cycles of CPR have been completed',
        ],
        answerIndex: 2,
        explanation: 'Advanced interventions must never interrupt high-quality CPR. IV access, drug administration, and even intubation should be timed to occur during compressions — not during pulse checks or pauses.',
      },
    ],

    keyNumbers: [
      { label: 'H\'s count', value: '5: Hypovolaemia, Hypoxia, H+ acidosis, Hypo/Hyperkalaemia, Hypothermia' },
      { label: 'T\'s count', value: '5: Tension pneumo, Tamponade, Toxins, Thrombosis (×2), Trauma' },
      { label: 'Primary survey components', value: 'A-B-C-D-E (Airway/Breathing/Circulation/Disability/Exposure)' },
      { label: 'CPR cycle duration', value: '2 minutes before rhythm check' },
    ],

    commonMistakes: [
      'Stopping CPR to establish IV access — always continue compressions',
      'No role assignment — everyone does everything = chaos',
      'Failing to call out H\'s and T\'s systematically — reversible causes missed',
      'Team leader performing hands-on tasks — loses situational awareness',
    ],

    unlockNext: 'acls_02_vf_vt',
  },

  // ── Lesson 2 — VF/pVT: Shockable Rhythm Algorithm ─────────────────────────
  {
    id: 'acls_02_vf_vt',
    track: 'acls',
    order: 2,
    title: 'VF / Pulseless VT — Shockable Rhythm',
    durationMin: 12,
    objective:
      'Execute the shockable rhythm algorithm with correct shock energy, drug timing, and CPR integration.',

    clinicalContext:
      'A 58-year-old man collapses on the cardiac ward. Monitor shows coarse VF. You have a biphasic defibrillator, IV access, and a full ACLS team. The clock starts now.',

    keyPoints: [
      'VF and pulseless VT are shockable rhythms — defibrillation is the priority intervention.',
      'Shock energy: 200J biphasic (or manufacturer-specified); 360J monophasic.',
      'Resume CPR IMMEDIATELY after shock — do not pause to check pulse for 2 minutes.',
      'Epinephrine 1mg IV/IO every 3-5 minutes — give after 2nd shock (during CPR).',
      'Amiodarone 300mg IV/IO after 3rd shock for refractory VF/pVT; 150mg second dose.',
      'Lidocaine 1-1.5mg/kg IV/IO is alternative to amiodarone if unavailable.',
      'Minimise CPR interruptions — pre-charge defibrillator while CPR ongoing.',
    ],

    videoBrief:
      '120s original: Full VF code run — identify VF, charge while CPR, clear-shock-resume, drug timing at 2-min cycles, 2 rhythm checks, ROSC achieved.',

    practice: {
      type: 'algorithm',
      prompt: 'Complete the VF/pVT algorithm — select the correct action at each decision point',
      items: [
        'Confirm pulseless + start CPR + attach defibrillator',
        'Rhythm check → VF/pVT confirmed',
        'Shock 200J biphasic → IMMEDIATELY resume CPR',
        'CPR × 2 min → IV/IO access + epinephrine 1mg (can give during CPR)',
        'Rhythm check → persistent VF → Shock 200J',
        'CPR × 2 min → Epinephrine 1mg (if 3-5 min since last dose)',
        'Rhythm check → persistent VF → Shock 200J → Amiodarone 300mg during CPR',
        'Rhythm check → organised rhythm → check pulse → ROSC or continue',
      ],
    },

    mcqs: [
      {
        q: 'After the first shock in VF, the next immediate action is:',
        options: [
          'Check carotid pulse to confirm rhythm change',
          'Resume CPR immediately for 2 minutes',
          'Administer epinephrine 1mg IV immediately',
          'Recheck the rhythm on the monitor',
        ],
        answerIndex: 1,
        explanation: 'Immediately resume CPR after every shock — do NOT pause to check pulse or rhythm. The next rhythm check happens after 2 full minutes of CPR. The post-shock pause is one of the most critical times to maintain perfusion pressure.',
      },
      {
        q: 'Amiodarone 300mg IV is indicated in VF/pVT after:',
        options: [
          'The first shock if VF persists',
          'The second shock, before epinephrine',
          'The third shock for shock-refractory VF/pVT',
          'Any time during the resuscitation at the team leader\'s discretion',
        ],
        answerIndex: 2,
        explanation: 'Amiodarone 300mg is given after the 3rd shock in shock-refractory VF/pVT. Epinephrine 1mg is given after the 2nd shock (and every 3-5 min thereafter). The order: 1st shock → CPR/epi → 2nd shock → CPR → 3rd shock → CPR + amiodarone.',
      },
      {
        q: 'A patient in VF has no IV access. The correct alternative route for drug administration is:',
        options: [
          'Endotracheal (ET) tube — 2-2.5x IV dose',
          'Intraosseous (IO) — same dose as IV',
          'Subcutaneous — absorbs rapidly in arrest',
          'Sublingual — fastest absorption',
        ],
        answerIndex: 1,
        explanation: 'Intraosseous (IO) access is the preferred alternative when IV access cannot be established rapidly. IO provides reliable, fast drug delivery with the same doses as IV. The ET route is no longer recommended by AHA 2025 as a primary alternative due to unreliable drug absorption during CPR.',
      },
    ],

    keyNumbers: [
      { label: 'Shock energy (biphasic)', value: '200J (or manufacturer-specified)' },
      { label: 'Shock energy (monophasic)', value: '360J' },
      { label: 'Epinephrine dose + interval', value: '1mg IV/IO every 3-5 minutes' },
      { label: 'Amiodarone 1st dose', value: '300mg IV/IO after 3rd shock' },
      { label: 'Amiodarone 2nd dose', value: '150mg IV/IO if VF persists' },
      { label: 'Lidocaine (alternative)', value: '1-1.5mg/kg IV/IO; 2nd dose 0.5-0.75mg/kg' },
      { label: 'CPR cycle before each rhythm check', value: '2 minutes' },
    ],

    commonMistakes: [
      'Pausing CPR to check pulse after shock — costs perfusion pressure',
      'Giving amiodarone after 1st or 2nd shock — not indicated until 3rd',
      'Long pre-shock pause — pre-charge defibrillator during CPR',
      'Not giving epinephrine during CPR — waiting for rhythm check pauses',
      'Forgetting second dose of amiodarone (150mg) if VF continues',
    ],

    unlockNext: 'acls_03_pea_asystole',
  },

  // ── Lesson 3 — PEA / Asystole: Non-Shockable Rhythm ──────────────────────
  {
    id: 'acls_03_pea_asystole',
    track: 'acls',
    order: 3,
    title: 'PEA & Asystole — Non-Shockable Rhythms',
    durationMin: 10,
    objective:
      'Manage PEA and asystole with the correct algorithm and systematically identify reversible causes using H\'s and T\'s.',

    clinicalContext:
      'A 72-year-old woman with known PE collapses. Monitor shows organised electrical activity but no pulse. BP unrecordable. This is PEA — your next 10 minutes are critical.',

    keyPoints: [
      'PEA: organised rhythm on monitor + no palpable pulse = Pulseless Electrical Activity.',
      'Asystole: flat line (confirm in ≥2 leads — rule out fine VF).',
      'Neither PEA nor asystole responds to defibrillation — do NOT shock.',
      'High-quality CPR + epinephrine + H\'s and T\'s = the entire algorithm.',
      'Epinephrine 1mg IV/IO as soon as access established, then every 3-5 min.',
      'H\'s and T\'s MUST be systematically called out — the reversible cause IS the treatment.',
      'Survival from PEA depends on finding and fixing the underlying cause.',
    ],

    videoBrief:
      '90s original: PEA code — team identifies PEA, CPR continues, leader calls H\'s and T\'s systematically (tension pneumothorax identified → needle decompression → ROSC).',

    practice: {
      type: 'scenario',
      prompt: 'For each presentation, identify the most likely reversible cause and correct immediate action',
      items: [
        'PEA in trauma patient + tracheal deviation → Tension pneumothorax → Needle decompression',
        'PEA + muffled heart sounds + JVD + hypotension → Tamponade → Pericardiocentesis',
        'PEA + massive PE history + no breath sounds → PE → Consider thrombolysis during CPR',
        'Asystole + known hypo/hyperkalaemia → Electrolyte → Calcium/Insulin-Dextrose',
        'PEA + suspected opioid OD → Toxin → Naloxone + CPR priority',
        'PEA + large haemorrhage + no IV access → Hypovolaemia → IO access + blood products',
      ],
    },

    mcqs: [
      {
        q: 'A patient in PEA has JVD, muffled heart sounds, and hypotension (Beck\'s triad). The correct immediate action is:',
        options: [
          'Defibrillation at 200J — PEA requires immediate shock',
          'Pericardiocentesis — cardiac tamponade is the likely cause',
          'IV fluids 2L rapidly — hypovolaemia is most likely',
          'Amiodarone 300mg IV — antiarrhythmic for PEA',
        ],
        answerIndex: 1,
        explanation: 'Beck\'s triad (JVD + muffled heart sounds + hypotension) = cardiac tamponade. PEA from tamponade requires pericardiocentesis. Defibrillation is never indicated for PEA. Amiodarone is not indicated in PEA. Fluids are incorrect here — the problem is obstructed filling, not hypovolaemia.',
      },
      {
        q: 'You identify asystole on the monitor. Before proceeding, the most important immediate step is:',
        options: [
          'Shock at 200J — asystole may be fine VF',
          'Confirm in at least 2 leads to rule out fine VF',
          'Give atropine 1mg IV — indicated for all asystole',
          'Stop resuscitation — asystole is not survivable',
        ],
        answerIndex: 1,
        explanation: 'Always confirm asystole in ≥2 leads — fine VF can mimic asystole in one lead and IS shockable. Asystole itself is not shocked. Atropine is no longer recommended for PEA/asystole by AHA 2025. Asystole is survivable when the cause is identified and treated.',
      },
      {
        q: 'In PEA arrest, what determines survival more than any other factor?',
        options: [
          'Speed of epinephrine administration',
          'Early defibrillation',
          'Identification and treatment of the reversible cause (H\'s and T\'s)',
          'Type of IV access established (peripheral vs central)',
        ],
        answerIndex: 2,
        explanation: 'PEA survival hinges entirely on finding the reversible cause. Without correcting the underlying problem (tension pneumo, tamponade, hypovolaemia, PE, toxin, electrolyte), the patient cannot achieve ROSC regardless of how perfectly the algorithm is followed. H\'s and T\'s should be called out loudly and systematically by the team leader.',
      },
    ],

    keyNumbers: [
      { label: 'Epinephrine dose', value: '1mg IV/IO every 3-5 minutes — give ASAP' },
      { label: 'Leads to confirm asystole', value: '≥2 leads — rule out fine VF' },
      { label: 'Atropine in PEA/asystole', value: 'NOT recommended (removed AHA 2020/2025)' },
      { label: 'Defibrillation in PEA/asystole', value: 'NEVER — non-shockable rhythms' },
      { label: 'H\'s and T\'s total', value: '10 reversible causes — all must be considered' },
    ],

    commonMistakes: [
      'Shocking PEA or asystole — non-shockable, wastes time and causes harm',
      'Not calling H\'s and T\'s — missing the treatable cause',
      'Giving atropine — no longer recommended in PEA/asystole (AHA 2025)',
      'Confirming asystole in only one lead — may miss fine VF',
      'Delaying epinephrine — give as soon as IV/IO access established',
    ],

    unlockNext: 'acls_04_bradycardia',
  },

  // ── Lesson 4 — Bradycardia Management ─────────────────────────────────────
  {
    id: 'acls_04_bradycardia',
    track: 'acls',
    order: 4,
    title: 'Symptomatic Bradycardia',
    durationMin: 9,
    objective:
      'Distinguish stable from unstable bradycardia and apply the correct intervention sequence: atropine → TCP → dopamine/epinephrine infusion.',

    clinicalContext:
      'A 68-year-old man with dizziness and near-syncope. HR 34, BP 82/50. ECG: complete heart block. He is pale, diaphoretic, and barely responsive. This is unstable bradycardia.',

    keyPoints: [
      'Bradycardia: HR <60 bpm. Symptomatic if: hypotension, AMS, signs of shock, ischaemic chest pain, acute HF.',
      'Stable bradycardia with no adverse signs: observe, investigate, treat cause.',
      'Unstable bradycardia: atropine 0.5mg IV first-line → repeat every 3-5 min, max 3mg total.',
      'If atropine ineffective or unreliable: transcutaneous pacing (TCP) is definitive.',
      'Dopamine 2-10 mcg/kg/min or epinephrine 2-10 mcg/min infusion while awaiting pacing.',
      'Atropine ineffective in heart transplant recipients (denervated heart) — go straight to TCP.',
      'Prepare for transvenous pacing if TCP required for prolonged period.',
    ],

    videoBrief:
      '90s original: Unstable bradycardia scenario — atropine given, no response, TCP applied with correct pad placement, capture achieved, patient stabilises pending transvenous pacing.',

    practice: {
      type: 'drug_drill',
      prompt: 'Match the correct drug, dose, and indication for bradycardia management',
      drugs: [
        {
          name: 'Atropine',
          dose: '0.5mg IV every 3-5 min · max 3mg total',
          indication: 'First-line for symptomatic bradycardia',
          timing: 'Immediately when unstable features identified',
        },
        {
          name: 'Dopamine infusion',
          dose: '2-10 mcg/kg/min IV infusion',
          indication: 'Second-line if atropine ineffective · while preparing TCP',
          timing: 'Start while setting up transcutaneous pacing',
        },
        {
          name: 'Epinephrine infusion',
          dose: '2-10 mcg/min IV infusion',
          indication: 'Alternative to dopamine if severe hypotension',
          timing: 'Bridge to definitive pacing',
        },
        {
          name: 'Transcutaneous Pacing (TCP)',
          dose: 'Rate 60-80 bpm · increase mA until capture',
          indication: 'Atropine-refractory or high-degree block',
          timing: 'Prepare simultaneously — apply when atropine fails',
        },
      ],
    },

    mcqs: [
      {
        q: 'A patient with symptomatic bradycardia (HR 38, BP 78/50) receives atropine 0.5mg IV × 2 with no improvement. HR now 36. The next most appropriate action is:',
        options: [
          'Wait 10 minutes — atropine takes time to work',
          'Give a third dose of atropine 1mg IV',
          'Initiate transcutaneous pacing (TCP)',
          'Administer adenosine 6mg IV',
        ],
        answerIndex: 2,
        explanation: 'After 2 doses of atropine with no response, proceed immediately to TCP (transcutaneous pacing). Waiting is dangerous with BP 78/50. A third atropine is appropriate if still within 3mg total but TCP should not be delayed. Adenosine is for tachyarrhythmias, not bradycardia.',
      },
      {
        q: 'Why is atropine likely to be ineffective in a heart transplant recipient with bradycardia?',
        options: [
          'Transplanted hearts metabolise atropine 10x faster',
          'The transplanted heart is denervated — atropine works via vagal block which is absent',
          'Immunosuppressants block atropine\'s muscarinic receptors',
          'Atropine is contraindicated post-transplant due to rejection risk',
        ],
        answerIndex: 1,
        explanation: 'Atropine works by blocking vagal (parasympathetic) tone at the sinoatrial node. Heart transplant recipients have a denervated heart with no vagal innervation — atropine has no site of action. Go directly to TCP or dopamine/epinephrine infusion in transplant patients with symptomatic bradycardia.',
      },
      {
        q: 'The correct initial pacing rate when initiating transcutaneous pacing for symptomatic bradycardia is:',
        options: [
          '40-50 bpm — just above the intrinsic rate',
          '60-80 bpm — physiological rate for haemodynamic support',
          '100-120 bpm — high rate to maximise cardiac output',
          '150 bpm — overdrive pacing to suppress underlying rhythm',
        ],
        answerIndex: 1,
        explanation: 'Set TCP rate at 60-80 bpm for haemodynamic stability. Start mA at minimum and increase gradually until electrical and mechanical capture is confirmed (capture = pacing spike followed by QRS + pulse at that rate). Too low = inadequate CO; too high = unnecessary myocardial demand.',
      },
    ],

    keyNumbers: [
      { label: 'Atropine dose', value: '0.5mg IV every 3-5 min' },
      { label: 'Atropine maximum total dose', value: '3mg IV total' },
      { label: 'Dopamine infusion rate', value: '2-10 mcg/kg/min' },
      { label: 'Epinephrine infusion rate', value: '2-10 mcg/min' },
      { label: 'TCP initial rate', value: '60-80 bpm; increase mA until capture' },
      { label: 'Bradycardia definition', value: 'HR <60 bpm' },
    ],

    commonMistakes: [
      'Giving atropine in heart transplant — ineffective, delays TCP',
      'Exceeding 3mg atropine total — higher doses cause paradoxical bradycardia',
      'Not confirming mechanical capture with TCP — electrical ≠ mechanical',
      'Delaying TCP while waiting for multiple atropine doses in unstable patient',
      'Adenosine for bradycardia — it IS a bradycardia-causing drug',
    ],

    unlockNext: 'acls_05_tachycardia',
  },

  // ── Lesson 5 — Tachycardia with Pulse ──────────────────────────────────────
  {
    id: 'acls_05_tachycardia',
    track: 'acls',
    order: 5,
    title: 'Tachycardia with Pulse',
    durationMin: 11,
    objective:
      'Differentiate stable from unstable tachycardia, apply the correct cardioversion energy, and manage narrow vs wide complex tachycardias.',

    clinicalContext:
      'A 45-year-old woman with palpitations for 2 hours. HR 178, BP 94/60, diaphoretic, confused. ECG: narrow complex regular tachycardia. She is symptomatic — this is unstable tachycardia.',

    keyPoints: [
      'Unstable tachycardia with pulse: immediate SYNCHRONISED cardioversion.',
      'Unstable signs: hypotension, AMS, signs of shock, acute HF, ischaemic chest pain.',
      'Synchronised cardioversion energies: narrow regular 50-100J; narrow irregular 120-200J; wide regular 100J; wide irregular (VF) 200J UNSYNCHRONISED.',
      'Stable narrow regular SVT: vagal manoeuvres → adenosine 6mg → 12mg → 12mg IV.',
      'Stable narrow irregular (AF): rate control (beta-blocker/diltiazem) + anticoagulation.',
      'Stable wide complex regular: amiodarone 150mg IV over 10 min (if VT suspected).',
      'NEVER use adenosine, verapamil, or diltiazem for wide complex tachycardia — risk of VF.',
      'Pre-medicate with sedation/analgesia before cardioversion in conscious patients.',
    ],

    videoBrief:
      '120s original: Two scenarios — (1) Unstable SVT → synchronised cardioversion with sedation; (2) Stable SVT → vagal manoeuvre → adenosine → sinus rhythm. Clear role assignments and drug preparation demonstrated.',

    practice: {
      type: 'scenario',
      prompt: 'Select the correct management for each tachycardia presentation',
      items: [
        'Unstable + narrow regular → Synchronised cardioversion 50-100J (sedate first)',
        'Unstable + narrow irregular (AF) → Synchronised cardioversion 120-200J',
        'Unstable + wide regular (suspected VT) → Synchronised cardioversion 100J',
        'Unstable + wide irregular → UNSYNCHRONISED shock 200J (treat as VF)',
        'Stable + narrow regular (SVT) → Vagal manoeuvre → Adenosine 6mg IV',
        'Stable + narrow irregular (AF) → Rate control + anticoagulation',
        'Stable + wide regular → Amiodarone 150mg IV over 10 min',
      ],
    },

    mcqs: [
      {
        q: 'A conscious patient with unstable SVT requires cardioversion. Before delivering the shock, the essential step is:',
        options: [
          'Administer adenosine 12mg to attempt chemical cardioversion first',
          'Provide sedation and analgesia — cardioversion is painful without it',
          'Apply 200J unsynchronised shock immediately',
          'Confirm IV access is patent — no other preparation needed',
        ],
        answerIndex: 1,
        explanation: 'Synchronised cardioversion is painful and distressing without sedation. Always administer appropriate sedation/analgesia (e.g. midazolam + fentanyl) before cardioverting a conscious patient unless they are in extremis. Unsynchronised shock (200J) is for pulseless rhythms/VF, not stable or unstable tachycardia with pulse.',
      },
      {
        q: 'A patient with wide complex regular tachycardia at 180 bpm is haemodynamically stable. BP 122/78, no chest pain, alert. Correct management:',
        options: [
          'Adenosine 6mg IV rapid push — terminates most wide complex tachycardias',
          'Verapamil 5mg IV — calcium channel blocker for rate control',
          'Amiodarone 150mg IV over 10 minutes — treats presumed VT safely',
          'Immediate unsynchronised 200J shock',
        ],
        answerIndex: 2,
        explanation: 'Stable wide complex regular tachycardia should be treated as VT until proven otherwise. Amiodarone 150mg IV over 10 min is the correct approach. Adenosine can be used if SVT with aberrancy is strongly suspected (regular, narrow-appearing in some leads) but is NEVER used if truly wide complex due to risk of degeneration. Verapamil in VT can cause haemodynamic collapse.',
      },
      {
        q: 'The correct synchronised cardioversion energy for stable atrial fibrillation with a rapid ventricular rate (if cardioversion chosen) is:',
        options: [
          '50J — same as narrow regular SVT',
          '100J — standard for all narrow rhythms',
          '120-200J biphasic — AF is irregular and requires higher energy',
          '360J — maximum energy for all cardioversion',
        ],
        answerIndex: 2,
        explanation: 'AF is an irregular rhythm requiring higher cardioversion energy than regular narrow rhythms: 120-200J biphasic. Regular narrow SVT: 50-100J. Wide regular (VT): 100J. The irregular nature of AF requires more energy to achieve synchronised conversion. Always use SYNCHRONISED mode for AF with pulse.',
      },
    ],

    keyNumbers: [
      { label: 'Narrow regular cardioversion', value: '50-100J synchronised' },
      { label: 'Narrow irregular (AF) cardioversion', value: '120-200J synchronised' },
      { label: 'Wide regular cardioversion', value: '100J synchronised' },
      { label: 'Wide irregular (VF/pulseless)', value: '200J UNSYNCHRONISED' },
      { label: 'Adenosine doses', value: '6mg → 12mg → 12mg IV rapid push' },
      { label: 'Amiodarone (stable wide complex)', value: '150mg IV over 10 min' },
    ],

    commonMistakes: [
      'Cardioverting without sedation in conscious patient — causes severe pain and distress',
      'Using adenosine for wide complex tachycardia — risk of VF if true VT',
      'Using verapamil/diltiazem for wide complex — can cause haemodynamic collapse in VT',
      'Forgetting to synchronise the defibrillator — shock on T-wave can cause VF',
      'Unsynchronised shock for tachycardia with pulse — only for pulseless/VF',
    ],

    unlockNext: 'acls_06_post_rosc',
  },

  // ── Lesson 6 — Post-ROSC Care & Integration ────────────────────────────────
  {
    id: 'acls_06_post_rosc',
    track: 'acls',
    order: 6,
    title: 'Post-ROSC Care & ACLS Integration',
    durationMin: 12,
    objective:
      'Execute the post-ROSC bundle, prevent re-arrest, and integrate all ACLS algorithms into a seamless team response.',

    clinicalContext:
      'ROSC achieved after 18 minutes of VF arrest. Patient: 62M, now has spontaneous rhythm but GCS 6, BP 88/50, HR 118, O2 94% on 15L, temperature 35.2°C. The arrest is over — the next hour determines survival.',

    keyPoints: [
      'ROSC is not the end — post-cardiac arrest syndrome causes significant morbidity and mortality.',
      'Airway: if not already intubated, consider intubation for GCS ≤8 + airway protection.',
      'Breathing: titrate O2 to SpO2 94-98% — avoid hyperoxia (worsens neurological outcomes).',
      'Circulation: target MAP ≥65 mmHg. IV fluids + vasopressors (noradrenaline) as needed.',
      'Targeted Temperature Management (TTM): 32-36°C for comatose survivors — AHA 2023 update.',
      '12-lead ECG immediately: if STEMI or high suspicion of occlusion → emergency PCI.',
      'Avoid hypoglycaemia and hyperglycaemia: target glucose 7.8-10 mmol/L.',
      'Transfer to ICU with neuroprotective care and ongoing haemodynamic support.',
    ],

    videoBrief:
      '120s original: Post-ROSC handover scene — intubation, O2 titration, vasopressor initiation, 12-lead ECG showing STEMI, cath lab activation, temperature monitoring, ICU transfer checklist.',

    practice: {
      type: 'checklist',
      prompt: 'Complete the Post-ROSC care bundle — tick each element in correct priority',
      items: [
        'Airway: intubate if GCS ≤8 or inadequate airway protection',
        'Breathing: titrate O2 to SpO2 94-98% (avoid hyperoxia)',
        'Ventilation: target PaCO2 35-45 mmHg (avoid hyperventilation)',
        'Circulation: MAP ≥65 mmHg — fluids then noradrenaline',
        '12-lead ECG: STEMI or suspected acute coronary occlusion → Cath lab',
        'Temperature: TTM 32-36°C if comatose — active cooling',
        'Glucose: target 7.8-10 mmol/L — avoid hypo and hyperglycaemia',
        'Neuro: avoid fever (>37.7°C worsens outcome), seizure monitoring/treatment',
        'ICU transfer: continuous monitoring, neuroprognostication planning',
      ],
    },

    mcqs: [
      {
        q: 'Immediately after ROSC, the patient\'s SpO2 is 100% on 15L O2 via non-rebreather mask. The correct action is:',
        options: [
          'Maintain 15L O2 — higher O2 improves neurological recovery',
          'Titrate O2 DOWN to target SpO2 94-98% — hyperoxia is harmful post-arrest',
          'Switch to room air immediately — ROSC means the patient no longer needs O2',
          'Intubate immediately to control oxygen delivery precisely',
        ],
        answerIndex: 1,
        explanation: 'Hyperoxia (SpO2 >98% or PaO2 >300 mmHg) after ROSC is independently associated with worse neurological outcomes — oxygen free radicals worsen reperfusion injury. AHA 2025 recommends titrating O2 to SpO2 94-98%. This is a critical post-ROSC principle often overlooked.',
      },
      {
        q: 'Post-ROSC 12-lead ECG shows 4mm ST elevation in leads V1-V4. The patient is intubated and haemodynamically supported. Next action:',
        options: [
          'Thrombolysis — IV tPA is preferred over PCI in comatose post-arrest patients',
          'Immediate coronary angiography with intent to perform primary PCI',
          'Repeat ECG in 30 minutes — ST changes may resolve post-arrest',
          'Defer cath lab to 24 hours — allow neurological stabilisation first',
        ],
        answerIndex: 1,
        explanation: 'STEMI post-ROSC: immediate coronary angiography with primary PCI is Class I. Being comatose is NOT a contraindication — neurological outcome cannot be predicted acutely and PCI addresses the causative lesion. Thrombolysis is relatively contraindicated after CPR (chest trauma). Deferring PCI worsens outcomes.',
      },
      {
        q: 'Targeted Temperature Management (TTM) after ROSC is indicated for which patient?',
        options: [
          'All post-ROSC patients regardless of neurological status',
          'Comatose survivors of cardiac arrest (GCS ≤8) — not responsive to verbal commands',
          'Only patients with VF as the initial rhythm',
          'Patients with temperature >38°C at the time of ROSC',
        ],
        answerIndex: 1,
        explanation: 'TTM (32-36°C) is indicated for comatose survivors of cardiac arrest — those who do not respond meaningfully to verbal commands post-ROSC. It does not need to be restricted to VF (AHA 2023 applies to non-shockable rhythms too). TTM prevents secondary neurological injury from post-cardiac arrest syndrome. Active fever prevention (>37.7°C) should be maintained for all.',
      },
    ],

    keyNumbers: [
      { label: 'Target SpO2 post-ROSC', value: '94-98% — avoid hyperoxia' },
      { label: 'Target PaCO2 post-ROSC', value: '35-45 mmHg — normocapnia' },
      { label: 'Target MAP post-ROSC', value: '≥65 mmHg (some centres target ≥80)' },
      { label: 'TTM target temperature', value: '32-36°C for comatose survivors' },
      { label: 'Glucose target post-ROSC', value: '7.8-10 mmol/L' },
      { label: 'Fever threshold to treat', value: '>37.7°C — actively prevent' },
      { label: 'STEMI post-ROSC', value: 'Immediate PCI — coma not a contraindication' },
    ],

    commonMistakes: [
      'Maintaining 100% O2 post-ROSC — hyperoxia worsens neurological outcomes',
      'Hyperventilating intubated post-arrest patient — hypocapnia causes cerebral vasoconstriction',
      'Delaying PCI for comatose post-ROSC STEMI patient — neurological status not a contraindication',
      'Not targeting MAP ≥65 — hypotension post-ROSC perpetuates organ dysfunction',
      'Missing fever — temperature >37.7°C significantly worsens neurological outcomes',
      'Not monitoring for seizures — occur in ~20% of comatose post-arrest patients',
    ],

    unlockNext: null,
  },
]
