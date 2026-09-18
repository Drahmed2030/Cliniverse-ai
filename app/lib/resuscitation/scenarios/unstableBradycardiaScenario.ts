import type { ResuscitationScenario } from '../scenarioContract.ts'

// unstableBradycardiaScenario — Batch 9 Section 8, scenario 3 of 3. Chosen
// over unstable tachycardia for best fit with existing reviewed ACLS
// content: app/lib/codelab/aclsLessons.ts's acls_04_bradycardia lesson
// already covers this pathway conceptually. No prior arrest occurs in
// this scenario — the patient has a pulse throughout — so it does not use
// the post_rosc competency domain (that domain specifically means
// post-return-of-spontaneous-circulation care after an arrest, which
// never happens here); 'reassessment' covers this scenario's final
// stabilization/consolidation step instead.

export const UNSTABLE_BRADYCARDIA_SCENARIO: ResuscitationScenario = {
  scenarioId: 'resus_unstable_bradycardia_v1',
  title: 'Unstable Bradycardia',
  version: '1.0.0',
  intendedUse: 'Educational simulation only. Not real-time clinical guidance. Not an official AHA course.',
  sourceRefs: ['2025 AHA Guidelines for CPR and ECC — Adult Bradycardia Algorithm', 'app/lib/codelab/aclsLessons.ts (acls_04_bradycardia)'],
  reviewStatus: 'pending_clinical_review',
  initialPhaseId: 'init',
  objectives: [
    'Recognize bradycardia with signs of instability (hypotension, altered mentation, signs of shock, ischemic chest discomfort, acute heart failure).',
    'Give atropine as first-line pharmacologic treatment, respecting its dosing interval.',
    'Escalate to transcutaneous pacing (with analgesia/sedation) or a chronotropic infusion when atropine is ineffective.',
    'Confirm mechanical capture with pacing and reassess before concluding stabilization.',
  ],
  criticalErrorPolicy: 'pause_for_feedback',
  criticalErrorsBeforePause: 1,
  feedbackTags: ['bradycardia', 'unstable-rhythm', 'pacing'],
  debriefTags: ['bradycardia', 'unstable'],
  competencyDomains: ['recognition', 'sequence', 'rhythm_interpretation', 'medication_timing', 'reassessment'],
  timingWindows: [
    {
      phaseId: 'reassess_after_atropine',
      maxDurationMs: 90_000,
      timeoutTransitionTo: 'transcutaneous_pacing',
      competencyDomain: 'timing',
    },
  ],
  phases: [
    {
      phaseId: 'init',
      label: 'Initial assessment',
      isCheckpoint: true,
      actions: [
        { actionId: 'recognize_unstable_bradycardia', label: 'Recognize bradycardia with signs of instability', critical: true, correct: true, transitionTo: 'assess', feedback: null, competencyDomains: ['recognition', 'rhythm_interpretation'], sourceRefs: ['2025 AHA Adult Bradycardia Algorithm'] },
        { actionId: 'delay_treatment', label: 'Delay treatment pending a full cardiology consult', critical: true, correct: false, transitionTo: null, feedback: 'An unstable bradycardia (hypotension, altered mentation, signs of shock, ischemic chest discomfort, or acute heart failure) should be treated without waiting for a full specialist consult.', competencyDomains: ['recognition'], sourceRefs: ['2025 AHA Adult Bradycardia Algorithm'] },
      ],
    },
    {
      phaseId: 'assess',
      label: 'First-line treatment',
      isCheckpoint: true,
      actions: [
        { actionId: 'atropine_first', label: 'Give atropine (educational reference only)', critical: true, correct: true, transitionTo: 'reassess_after_atropine', feedback: null, competencyDomains: ['medication_timing', 'sequence'], sourceRefs: ['2025 AHA Adult Bradycardia Algorithm'] },
        { actionId: 'start_compressions_unnecessarily', label: 'Start chest compressions', critical: true, correct: false, transitionTo: null, feedback: 'This patient has a pulse — chest compressions are not indicated for symptomatic bradycardia with a pulse.', competencyDomains: ['recognition'], sourceRefs: ['2025 AHA Adult Bradycardia Algorithm'] },
      ],
    },
    {
      phaseId: 'reassess_after_atropine',
      label: 'Reassess response to atropine',
      isCheckpoint: false,
      actions: [
        { actionId: 'improved_stable', label: 'Patient improved and is now stable', critical: true, correct: true, transitionTo: 'post_stabilization', feedback: null, competencyDomains: ['reassessment'], sourceRefs: ['2025 AHA Adult Bradycardia Algorithm'] },
        { actionId: 'still_unstable_pacing', label: 'Still unstable — proceed to transcutaneous pacing', critical: true, correct: true, transitionTo: 'transcutaneous_pacing', feedback: null, competencyDomains: ['reassessment', 'sequence'], sourceRefs: ['2025 AHA Adult Bradycardia Algorithm'] },
        { actionId: 'give_more_atropine_unlimited', label: 'Give repeated atropine doses without regard to the dosing interval or maximum', critical: true, correct: false, transitionTo: null, feedback: 'Atropine has a defined re-dosing interval and maximum total dose — repeating it without limit is not the governed pathway once it has already been given.', competencyDomains: ['medication_timing'], sourceRefs: ['2025 AHA Adult Bradycardia Algorithm'] },
      ],
    },
    {
      phaseId: 'transcutaneous_pacing',
      label: 'Escalate to transcutaneous pacing',
      isCheckpoint: true,
      actions: [
        { actionId: 'pacing_with_sedation', label: 'Begin transcutaneous pacing with analgesia/sedation considered', critical: true, correct: true, transitionTo: 'reassess_pacing', feedback: null, competencyDomains: ['sequence'], sourceRefs: ['2025 AHA Adult Bradycardia Algorithm'] },
        { actionId: 'pacing_without_analgesia', label: 'Begin transcutaneous pacing without considering analgesia/sedation', critical: true, correct: false, transitionTo: null, feedback: 'Transcutaneous pacing is uncomfortable for an awake patient — analgesia/sedation should be considered as part of initiating pacing, not omitted.', competencyDomains: ['sequence'], sourceRefs: ['2025 AHA Adult Bradycardia Algorithm'] },
      ],
    },
    {
      phaseId: 'reassess_pacing',
      label: 'Confirm capture and reassess',
      isCheckpoint: false,
      actions: [
        { actionId: 'capture_confirmed_stable', label: 'Mechanical capture confirmed, patient stabilized', critical: true, correct: true, transitionTo: 'post_stabilization', feedback: null, competencyDomains: ['reassessment'], sourceRefs: ['2025 AHA Adult Bradycardia Algorithm'] },
        { actionId: 'consider_epi_dopamine_infusion', label: 'Consider an epinephrine or dopamine infusion as an alternative/adjunct to pacing', critical: false, correct: true, transitionTo: 'post_stabilization', feedback: null, competencyDomains: ['medication_timing'], sourceRefs: ['2025 AHA Adult Bradycardia Algorithm'] },
        { actionId: 'ignore_capture_check', label: 'Assume pacing is effective without confirming mechanical capture', critical: true, correct: false, transitionTo: null, feedback: 'Electrical capture on the monitor is not sufficient — mechanical capture (a palpable pulse corresponding to the paced rate) must be confirmed.', competencyDomains: ['reassessment'], sourceRefs: ['2025 AHA Adult Bradycardia Algorithm'] },
      ],
    },
    {
      phaseId: 'post_stabilization',
      label: 'Consolidate and monitor',
      isCheckpoint: true,
      actions: [
        { actionId: 'monitor_and_expert_consult', label: 'Continue monitoring and arrange expert consultation', critical: true, correct: true, transitionTo: 'ended', feedback: null, competencyDomains: ['reassessment'], sourceRefs: ['2025 AHA Adult Bradycardia Algorithm'] },
        { actionId: 'discharge_without_monitoring', label: 'Discharge without further monitoring', critical: true, correct: false, transitionTo: null, feedback: 'A patient who required treatment for unstable bradycardia needs ongoing monitoring and expert follow-up, not immediate discharge.', competencyDomains: ['reassessment'], sourceRefs: ['2025 AHA Adult Bradycardia Algorithm'] },
      ],
    },
    { phaseId: 'ended', label: 'Scenario complete', isCheckpoint: false, actions: [] },
  ],
}
