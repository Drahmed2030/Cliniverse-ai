import type { ResuscitationScenario } from '../scenarioContract.ts'

// peaAsystoleScenario — Batch 9 Section 8, scenario 2 of 3. New content —
// MegacodeRunner.tsx never had a PEA/asystole case. Non-shockable pathway:
// no defibrillation_sequence domain is used anywhere in this scenario
// (deliberately — shocking PEA/asystole is never indicated), distinguishing
// it structurally from the VF/pVT scenario.

export const PEA_ASYSTOLE_SCENARIO: ResuscitationScenario = {
  scenarioId: 'resus_pea_asystole_v1',
  title: 'PEA / Asystole',
  version: '1.0.0',
  intendedUse: 'Educational simulation only. Not real-time clinical guidance. Not an official AHA course.',
  sourceRefs: ['2025 AHA Guidelines for CPR and ECC — Adult Cardiac Arrest Algorithm (non-shockable rhythm pathway)'],
  reviewStatus: 'pending_clinical_review',
  initialPhaseId: 'init',
  objectives: [
    'Recognize a non-shockable rhythm (PEA or asystole) and continue high-quality CPR without a shock.',
    'Give epinephrine early and identify a reversible cause (H\'s and T\'s) within the CPR cycle.',
    'Reassess rhythm every 2-minute cycle without unnecessary interruption.',
    'Initiate post-ROSC care once return of spontaneous circulation is confirmed.',
  ],
  criticalErrorPolicy: 'pause_for_feedback',
  criticalErrorsBeforePause: 1,
  feedbackTags: ['non-shockable-rhythm', 'reversible-causes', 'cpr-cycle'],
  debriefTags: ['pea-asystole', 'non-shockable'],
  competencyDomains: ['recognition', 'sequence', 'rhythm_interpretation', 'timing', 'medication_timing', 'reassessment', 'post_rosc'],
  timingWindows: [
    {
      phaseId: 'cpr_cycle_2',
      maxDurationMs: 125_000,
      timeoutTransitionTo: 'rhythm_recheck_2',
      competencyDomain: 'timing',
    },
  ],
  phases: [
    {
      phaseId: 'init',
      label: 'Initial assessment',
      isCheckpoint: true,
      actions: [
        { actionId: 'confirm_arrest', label: 'Confirm unresponsive, no pulse', critical: true, correct: true, transitionTo: 'cpr', feedback: null, competencyDomains: ['recognition'], sourceRefs: ['2025 AHA Adult Cardiac Arrest Algorithm'] },
        { actionId: 'skip_to_rhythm', label: 'Check the monitor before confirming arrest', critical: true, correct: false, transitionTo: null, feedback: 'Arrest must be confirmed (unresponsive, no pulse) before any rhythm assessment.', competencyDomains: ['recognition'], sourceRefs: ['2025 AHA Adult Cardiac Arrest Algorithm'] },
      ],
    },
    {
      phaseId: 'cpr',
      label: 'Begin CPR',
      isCheckpoint: true,
      actions: [
        { actionId: 'start_cpr', label: 'Start chest compressions', critical: true, correct: true, transitionTo: 'rhythm_check', feedback: null, competencyDomains: ['sequence'], sourceRefs: ['2025 AHA Adult Cardiac Arrest Algorithm'] },
        { actionId: 'delay_for_access', label: 'Obtain IV access before starting compressions', critical: true, correct: false, transitionTo: null, feedback: 'Compressions should not be delayed for IV/IO access — access is obtained without interrupting CPR.', competencyDomains: ['sequence'], sourceRefs: ['2025 AHA Adult Cardiac Arrest Algorithm'] },
      ],
    },
    {
      phaseId: 'rhythm_check',
      label: 'Rhythm check',
      isCheckpoint: false,
      actions: [
        { actionId: 'confirm_pea_asystole', label: 'Rhythm check — PEA/asystole confirmed (non-shockable)', critical: true, correct: true, transitionTo: 'epi_and_causes', feedback: null, competencyDomains: ['rhythm_interpretation'], sourceRefs: ['2025 AHA Adult Cardiac Arrest Algorithm'] },
        { actionId: 'shock_pea', label: 'Deliver a shock', critical: true, correct: false, transitionTo: null, feedback: 'PEA and asystole are non-shockable rhythms — a shock is never indicated for either.', competencyDomains: ['rhythm_interpretation'], sourceRefs: ['2025 AHA Adult Cardiac Arrest Algorithm'] },
      ],
    },
    {
      phaseId: 'epi_and_causes',
      label: 'Epinephrine and reversible-cause screening',
      isCheckpoint: true,
      actions: [
        { actionId: 'epi_early', label: 'Give epinephrine as soon as feasible (educational reference only)', critical: true, correct: true, transitionTo: 'reversible_causes', feedback: null, competencyDomains: ['medication_timing'], sourceRefs: ['2025 AHA Adult Cardiac Arrest Algorithm'] },
        { actionId: 'delay_epi', label: 'Withhold epinephrine until reversible causes are fully worked up', critical: true, correct: false, transitionTo: null, feedback: 'Epinephrine should be given as soon as feasible in the non-shockable pathway, in parallel with — not delayed for — the reversible-cause work-up.', competencyDomains: ['medication_timing'], sourceRefs: ['2025 AHA Adult Cardiac Arrest Algorithm'] },
      ],
    },
    {
      phaseId: 'reversible_causes',
      label: 'Identify a reversible cause (H\'s and T\'s)',
      isCheckpoint: false,
      actions: [
        { actionId: 'identify_reversible_cause', label: 'Screen for reversible causes (hypoxia, hypovolemia, tension pneumothorax, tamponade, toxins, thrombosis)', critical: true, correct: true, transitionTo: 'cpr_cycle_2', feedback: null, competencyDomains: ['reassessment'], sourceRefs: ['2025 AHA Adult Cardiac Arrest Algorithm'] },
        { actionId: 'skip_causes', label: 'Continue CPR cycles without screening for a reversible cause', critical: true, correct: false, transitionTo: null, feedback: 'PEA/asystole management requires actively screening for and treating a reversible cause within each CPR cycle — this step should not be skipped.', competencyDomains: ['reassessment'], sourceRefs: ['2025 AHA Adult Cardiac Arrest Algorithm'] },
      ],
    },
    {
      phaseId: 'cpr_cycle_2',
      label: 'Continue CPR (2-minute cycle)',
      isCheckpoint: true,
      actions: [
        { actionId: 'continue_cpr_2min', label: 'Continue CPR for 2 minutes', critical: true, correct: true, transitionTo: 'rhythm_recheck_2', feedback: null, competencyDomains: ['timing', 'sequence'], sourceRefs: ['2025 AHA Adult Cardiac Arrest Algorithm'] },
        { actionId: 'pause_unnecessarily', label: 'Pause compressions to reassess mid-cycle', critical: true, correct: false, transitionTo: null, feedback: 'Compressions should continue uninterrupted through the 2-minute cycle — reassessment happens at the cycle boundary, not mid-cycle.', competencyDomains: ['timing'], sourceRefs: ['2025 AHA Adult Cardiac Arrest Algorithm'] },
      ],
    },
    {
      phaseId: 'rhythm_recheck_2',
      label: 'Rhythm re-check after the CPR cycle',
      isCheckpoint: false,
      actions: [
        { actionId: 'still_nonshockable', label: 'Rhythm still PEA/asystole — continue the cycle', critical: true, correct: true, transitionTo: 'reversible_causes', feedback: null, competencyDomains: ['reassessment', 'rhythm_interpretation'], sourceRefs: ['2025 AHA Adult Cardiac Arrest Algorithm'] },
        { actionId: 'rosc_achieved', label: 'Organized rhythm with pulse present — proceed to post-ROSC care', critical: true, correct: true, transitionTo: 'post_rosc', feedback: null, competencyDomains: ['reassessment'], sourceRefs: ['2025 AHA Adult Cardiac Arrest Algorithm'] },
        { actionId: 'shock_now', label: 'Deliver a shock now', critical: true, correct: false, transitionTo: null, feedback: 'The rhythm remains non-shockable — a shock is still not indicated.', competencyDomains: ['rhythm_interpretation'], sourceRefs: ['2025 AHA Adult Cardiac Arrest Algorithm'] },
      ],
    },
    {
      phaseId: 'post_rosc',
      label: 'Post-ROSC care',
      isCheckpoint: true,
      actions: [
        { actionId: 'abc_post', label: 'Airway, breathing, circulation and vitals, post-ROSC bundle', critical: true, correct: true, transitionTo: 'ended', feedback: null, competencyDomains: ['post_rosc'], sourceRefs: ['2025 AHA Adult Cardiac Arrest Algorithm'] },
        { actionId: 'ignore_postrosc', label: 'Conclude the encounter without post-ROSC care', critical: true, correct: false, transitionTo: null, feedback: 'Post-ROSC care must not be skipped once ROSC is achieved.', competencyDomains: ['post_rosc'], sourceRefs: ['2025 AHA Adult Cardiac Arrest Algorithm'] },
      ],
    },
    { phaseId: 'ended', label: 'Scenario complete', isCheckpoint: false, actions: [] },
  ],
}
