/**
 * Code Lab — BLS Track lessons 1–6
 * Save to: app/lib/codelab/blsLessons.ts
 * Educational content aligned with AHA 2025 published science.
 * Not official AHA course material.
 */

export type LessonKind = "lesson" | "practice" | "drill";

export interface BlsLesson {
  id: string;
  track: "bls";
  order: number;
  title: string;
  durationMin: number;
  objective: string;
  keyPoints: string[];
  videoBrief: string;
  practice: {
    type: "sequence" | "timer" | "checklist" | "scenario" | "mini_megacode";
    prompt: string;
    items?: string[];
  };
  mcqs: { q: string; options: string[]; answerIndex: number }[];
  unlockNext: string | null;
}

export const BLS_DISCLAIMER =
  "Educational simulation aligned with published resuscitation science (AHA 2025). Not an official AHA course. Does not issue AHA provider cards. Complete skills testing at an authorized AHA Training Center for certification. Practice safely. Not for real-patient care decisions alone.";

export const BLS_LESSONS: BlsLesson[] = [
  {
    id: "bls_01_chain",
    track: "bls",
    order: 1,
    title: "Chain of Survival & Recognition",
    durationMin: 6,
    objective: "Recognize cardiac arrest quickly and activate the chain of survival.",
    keyPoints: [
      "Act on unresponsiveness and absent or abnormal breathing (including gasping).",
      "Activate emergency response early.",
      "High-quality BLS is the foundation of the chain of survival.",
      "Do not delay compressions for prolonged assessment.",
    ],
    videoBrief:
      "45–60s original: rescuer finds unresponsive adult → checks responsiveness → notes gasping → calls for help/AED → starts compressions.",
    practice: {
      type: "sequence",
      prompt: "Put the early response steps in order",
      items: [
        "Check responsiveness",
        "Activate emergency response / call for AED",
        "Check breathing",
        "Start high-quality CPR",
      ],
    },
    mcqs: [
      {
        q: "Agonal gasping in an unresponsive adult should be treated as:",
        options: [
          "Normal breathing — monitor only",
          "A sign of cardiac arrest — start CPR",
          "A seizure — wait 5 minutes",
          "Hyperventilation — give oxygen only",
        ],
        answerIndex: 1,
      },
      {
        q: "You are alone with a suspected adult cardiac arrest and a phone. Best early approach:",
        options: [
          "Leave for 10 minutes to find a manual",
          "Activate emergency response and start CPR; use phone on speaker if needed",
          "Wait for a second rescuer before any action",
          "Only apply an AED and never compress",
        ],
        answerIndex: 1,
      },
    ],
    unlockNext: "bls_02_compressions",
  },
  {
    id: "bls_02_compressions",
    track: "bls",
    order: 2,
    title: "High-Quality Chest Compressions",
    durationMin: 8,
    objective:
      "Deliver compressions at the correct rate, depth, and recoil with minimal interruptions.",
    keyPoints: [
      "Rate approximately 100–120 compressions per minute.",
      "Adult depth about 5–6 cm with full chest recoil.",
      "Hands on the lower half of the sternum.",
      "Minimize pauses; switch compressors about every 2 minutes.",
    ],
    videoBrief:
      "60–90s original manikin demo: hand position, depth cue, full recoil, metronome 110.",
    practice: {
      type: "timer",
      prompt: "Complete a 2-minute compression round with metronome and checklist",
      items: [
        "Rate near 100–120",
        "Allow full recoil",
        "Correct hand position",
        "Minimize interruptions",
      ],
    },
    mcqs: [
      {
        q: "Target adult compression rate is closest to:",
        options: ["40–50/min", "60–80/min", "100–120/min", "150–180/min"],
        answerIndex: 2,
      },
      {
        q: "Full chest recoil matters primarily because it:",
        options: [
          "Looks more professional on camera",
          "Allows the heart to refill between compressions",
          "Replaces the need for ventilations forever",
          "Prevents the need for an AED",
        ],
        answerIndex: 1,
      },
    ],
    unlockNext: "bls_03_ventilations",
  },
  {
    id: "bls_03_ventilations",
    track: "bls",
    order: 3,
    title: "Ventilations & 30:2 Cycles",
    durationMin: 7,
    objective: "Provide effective breaths without long pauses or hyperventilation.",
    keyPoints: [
      "Open the airway with appropriate technique for the setting.",
      "Each breath about 1 second with visible chest rise.",
      "Single-rescuer adult cycles commonly taught as 30:2 in healthcare BLS education.",
      "Avoid excessive ventilation.",
    ],
    videoBrief:
      "60s original: airway open + two breaths with chest rise; label training demo.",
    practice: {
      type: "sequence",
      prompt: "Order a single-rescuer 30:2 cycle",
      items: [
        "30 chest compressions",
        "Open airway",
        "Deliver 2 breaths (1 sec each)",
        "Resume compressions without delay",
      ],
    },
    mcqs: [
      {
        q: "Each rescue breath should be delivered over about:",
        options: ["0.1 second", "1 second", "5 seconds", "10 seconds"],
        answerIndex: 1,
      },
      {
        q: "Excessive ventilation during cardiac arrest can:",
        options: [
          "Always improve survival",
          "Increase intrathoracic pressure and worsen venous return",
          "Replace compressions entirely",
          "Eliminate the need to call for help",
        ],
        answerIndex: 1,
      },
    ],
    unlockNext: "bls_04_aed",
  },
  {
    id: "bls_04_aed",
    track: "bls",
    order: 4,
    title: "AED Use",
    durationMin: 7,
    objective: "Operate an AED with correct pad placement and minimal CPR interruption.",
    keyPoints: [
      "Power on the AED as soon as available.",
      "Apply pads correctly; follow voice prompts.",
      "Clear the patient for analysis and shock.",
      "Resume CPR immediately after shock or if no shock advised.",
    ],
    videoBrief:
      "60–75s original: training AED pads on manikin + clear + shock + back to CPR.",
    practice: {
      type: "checklist",
      prompt: "Complete the AED sequence checklist",
      items: [
        "Power on",
        "Attach pads",
        "Plug connector if needed",
        "Clear for analysis",
        "Shock if advised / clear",
        "Resume CPR immediately",
      ],
    },
    mcqs: [
      {
        q: "After a shock is delivered, the next priority is usually:",
        options: [
          "Check a full set of labs",
          "Resume high-quality CPR",
          "Stop all care for 5 minutes",
          "Remove the pads permanently",
        ],
        answerIndex: 1,
      },
      {
        q: "During AED rhythm analysis you should:",
        options: [
          "Continue leaning on the chest",
          "Ensure no one is touching the patient",
          "Pour water on the chest",
          "Disable the metronome only",
        ],
        answerIndex: 1,
      },
    ],
    unlockNext: "bls_05_airway",
  },
  {
    id: "bls_05_airway",
    track: "bls",
    order: 5,
    title: "Airway Obstruction & Opioid-Associated Emergencies",
    durationMin: 8,
    objective:
      "Differentiate mild vs severe obstruction and apply an educational FBAO sequence; understand naloxone as an adjunct when indicated.",
    keyPoints: [
      "Mild obstruction: encourage coughing; monitor.",
      "Severe adult obstruction: cycles of back blows and abdominal thrusts until relief or unresponsiveness.",
      "If unresponsive: start CPR and look for visible object when opening airway.",
      "In suspected opioid-associated arrest, prioritize CPR; give naloxone when available without delaying compressions.",
    ],
    videoBrief:
      "75s original acted demo: severe obstruction sequence then unresponsive transition to CPR.",
    practice: {
      type: "scenario",
      prompt: "Choose the correct branch for each presentation",
      items: [
        "Mild obstruction — effective cough",
        "Severe obstruction — conscious adult",
        "Becomes unresponsive",
        "Suspected opioid emergency with apnea",
      ],
    },
    mcqs: [
      {
        q: "An adult with severe FBAO becomes unresponsive. Next best educational action:",
        options: [
          "Continue only abdominal thrusts standing",
          "Start CPR and check for visible object when opening the airway",
          "Wait for spontaneous recovery without compressions",
          "Give water immediately",
        ],
        answerIndex: 1,
      },
      {
        q: "When naloxone is available in suspected opioid-associated cardiac arrest:",
        options: [
          "It fully replaces the need for CPR",
          "Give it while continuing high-quality CPR priorities",
          "Never give it to healthcare providers' patients",
          "Only give it after 30 minutes of CPR",
        ],
        answerIndex: 1,
      },
    ],
    unlockNext: "bls_06_team",
  },
  {
    id: "bls_06_team",
    track: "bls",
    order: 6,
    title: "Team Skills & BLS Integration Drill",
    durationMin: 10,
    objective:
      "Run a coordinated BLS response with roles, closed-loop communication, and 2-minute cycles.",
    keyPoints: [
      "Assign roles: compressor, airway/AED, leader-timer.",
      "Use closed-loop communication.",
      "Coordinate AED and compressor switches.",
      "Integrate recognition → CPR → AED into one flow.",
    ],
    videoBrief:
      "90s original vignette: 3 rescuers running a short BLS code with clear role calls.",
    practice: {
      type: "mini_megacode",
      prompt: "Complete a 4-minute BLS mini-megacode",
      items: [
        "Recognition",
        "Start CPR",
        "Apply AED",
        "Shock or no-shock path",
        "Resume CPR",
      ],
    },
    mcqs: [
      {
        q: "Best example of closed-loop communication:",
        options: [
          "Someone should probably shock sometime",
          "Leader: 'Epi 1 mg IV now.' Member: 'Giving Epi 1 mg IV.' Leader: 'Epi given.'",
          "Everyone talks at once over the AED",
          "Silence until ROSC",
        ],
        answerIndex: 1,
      },
    ],
    unlockNext: null,
  },
];
