import type { ResuscitationScenario } from '../scenarioContract.ts'

// vfPvtScenario — Batch 9 Section 8, scenario 1 of 3. Restructured from
// app/components/ward/MegacodeRunner.tsx's mega_vf_01 case (its clinical
// action sequence was reasonable and is reused as reference content) into
// the new declarative DSL: hardcoded phase logic replaced with data,
// "2 wrong = game over" replaced with pause-for-feedback + Rapid Replay,
// a single crude score replaced by per-action competencyDomains tags, and
// every action/band now carries sourceRefs instead of none.

export const VF_PVT_SCENARIO: ResuscitationScenario = {
  scenarioId: 'resus_vf_pvt_v1',
  title: 'Ventricular Fibrillation / Pulseless VT',
  version: '1.0.0',
  intendedUse: 'Educational simulation only. Not real-time clinical guidance. Not an official AHA course.',
  sourceRefs: ['2025 AHA Guidelines for CPR and ECC — Adult Cardiac Arrest Algorithm (shockable rhythm pathway)'],
  reviewStatus: 'pending_clinical_review',
  initialPhaseId: 'init',
  objectives: [
    'Recognize cardiac arrest and begin CPR without delay.',
    'Correctly sequence rhythm check, charge/clear/shock, and immediate post-shock CPR.',
    'Apply the 2-minute CPR cycle with rhythm reassessment between shocks.',
    'Initiate the post-ROSC bundle once return of spontaneous circulation is confirmed.',
  ],
  criticalErrorPolicy: 'pause_for_feedback',
  criticalErrorsBeforePause: 1,
  feedbackTags: ['shockable-rhythm', 'defibrillation', 'cpr-cycle'],
  debriefTags: ['vf-pvt', 'shockable'],
  competencyDomains: ['recognition', 'sequence', 'rhythm_interpretation', 'timing', 'defibrillation_sequence', 'medication_timing', 'reassessment', 'post_rosc'],
  timingWindows: [
    {
      phaseId: 'post_shock_cpr',
      maxDurationMs: 125_000,
      timeoutTransitionTo: 'rhythm_recheck',
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
        { actionId: 'skip_to_defib', label: 'Skip straight to defibrillation', critical: true, correct: false, transitionTo: null, feedback: 'Arrest must be confirmed (unresponsive, no pulse) before any intervention — skipping confirmation risks treating a patient who has a pulse.', competencyDomains: ['recognition'], sourceRefs: ['2025 AHA Adult Cardiac Arrest Algorithm'] },
      ],
    },
    {
      phaseId: 'cpr',
      label: 'Begin CPR',
      isCheckpoint: true,
      actions: [
        { actionId: 'start_cpr', label: 'Start chest compressions', critical: true, correct: true, transitionTo: 'rhythm_check_phase', feedback: null, competencyDomains: ['sequence'], sourceRefs: ['2025 AHA Adult Cardiac Arrest Algorithm'] },
        { actionId: 'call_code', label: 'Call code team and get the defibrillator', critical: false, correct: true, transitionTo: null, feedback: null, competencyDomains: [], sourceRefs: ['2025 AHA Adult Cardiac Arrest Algorithm'] },
        { actionId: 'check_pulse_again', label: 'Re-check pulse for 30 seconds before starting CPR', critical: true, correct: false, transitionTo: null, feedback: 'CPR should not be delayed for a prolonged pulse check — compressions must start immediately once arrest is confirmed.', competencyDomains: ['sequence'], sourceRefs: ['2025 AHA Adult Cardiac Arrest Algorithm'] },
      ],
    },
    {
      phaseId: 'rhythm_check_phase',
      label: 'Rhythm check',
      isCheckpoint: false,
      actions: [
        { actionId: 'confirm_vf', label: 'Rhythm check — VF/pVT confirmed', critical: true, correct: true, transitionTo: 'shock_phase', feedback: null, competencyDomains: ['rhythm_interpretation'], sourceRefs: ['2025 AHA Adult Cardiac Arrest Algorithm'] },
        { actionId: 'shock_without_check', label: 'Shock without checking the rhythm', critical: true, correct: false, transitionTo: null, feedback: 'A rhythm check is required before every shock decision — shocking a non-shockable rhythm is unsafe and non-indicated.', competencyDomains: ['rhythm_interpretation'], sourceRefs: ['2025 AHA Adult Cardiac Arrest Algorithm'] },
      ],
    },
    {
      phaseId: 'shock_phase',
      label: 'Deliver shock',
      isCheckpoint: false,
      actions: [
        { actionId: 'charge_clear_shock', label: 'Charge, clear, deliver shock', critical: true, correct: true, transitionTo: 'post_shock_cpr', feedback: null, competencyDomains: ['defibrillation_sequence'], sourceRefs: ['2025 AHA Adult Cardiac Arrest Algorithm'] },
        { actionId: 'resume_cpr_only', label: 'Resume CPR without shocking a confirmed shockable rhythm', critical: true, correct: false, transitionTo: null, feedback: 'A confirmed shockable rhythm (VF/pVT) should be shocked — resuming CPR alone skips the indicated defibrillation step.', competencyDomains: ['defibrillation_sequence'], sourceRefs: ['2025 AHA Adult Cardiac Arrest Algorithm'] },
      ],
    },
    {
      phaseId: 'post_shock_cpr',
      label: 'Immediate post-shock CPR (2-minute cycle)',
      isCheckpoint: true,
      actions: [
        { actionId: 'resume_cpr_2min', label: 'Resume CPR immediately for 2 minutes', critical: true, correct: true, transitionTo: 'rhythm_recheck', feedback: null, competencyDomains: ['timing', 'sequence'], sourceRefs: ['2025 AHA Adult Cardiac Arrest Algorithm'] },
        { actionId: 'check_rosc_early', label: 'Stop CPR immediately after the shock to check for a pulse', critical: true, correct: false, transitionTo: null, feedback: 'CPR should resume immediately after a shock, without pausing to check for a pulse — interruptions reduce coronary perfusion pressure.', competencyDomains: ['timing'], sourceRefs: ['2025 AHA Adult Cardiac Arrest Algorithm'] },
      ],
    },
    {
      phaseId: 'rhythm_recheck',
      label: 'Rhythm re-check after the CPR cycle',
      isCheckpoint: false,
      actions: [
        { actionId: 'epi_1mg', label: 'Epinephrine 1mg IV (educational reference only)', critical: false, correct: true, transitionTo: null, feedback: null, competencyDomains: ['medication_timing'], sourceRefs: ['2025 AHA Adult Cardiac Arrest Algorithm'] },
        { actionId: 'still_vf_shock_again', label: 'Rhythm still shockable — charge, clear, shock again', critical: true, correct: true, transitionTo: 'shock_phase', feedback: null, competencyDomains: ['reassessment', 'rhythm_interpretation'], sourceRefs: ['2025 AHA Adult Cardiac Arrest Algorithm'] },
        { actionId: 'rhythm_organized_rosc', label: 'Rhythm organized, pulse present — proceed to post-ROSC care', critical: true, correct: true, transitionTo: 'post_rosc', feedback: null, competencyDomains: ['reassessment'], sourceRefs: ['2025 AHA Adult Cardiac Arrest Algorithm'] },
        { actionId: 'atropine_vf', label: 'Give atropine for VF', critical: true, correct: false, transitionTo: null, feedback: 'Atropine has no role in shockable rhythms (VF/pVT) — it is not part of this pathway.', competencyDomains: ['medication_timing'], sourceRefs: ['2025 AHA Adult Cardiac Arrest Algorithm'] },
      ],
    },
    {
      phaseId: 'post_rosc',
      label: 'Post-ROSC care',
      isCheckpoint: true,
      actions: [
        { actionId: 'abc_post', label: 'Airway, breathing, circulation and vitals, post-ROSC bundle', critical: true, correct: true, transitionTo: 'ended', feedback: null, competencyDomains: ['post_rosc'], sourceRefs: ['2025 AHA Adult Cardiac Arrest Algorithm'] },
        { actionId: 'ecg_12lead', label: 'Obtain a 12-lead ECG', critical: false, correct: true, transitionTo: null, feedback: null, competencyDomains: ['post_rosc'], sourceRefs: ['2025 AHA Adult Cardiac Arrest Algorithm'] },
        { actionId: 'ignore_postrosc', label: 'Conclude the encounter without post-ROSC care', critical: true, correct: false, transitionTo: null, feedback: 'Post-ROSC care (airway/breathing/circulation, targeted temperature management planning, 12-lead ECG) must not be skipped once ROSC is achieved.', competencyDomains: ['post_rosc'], sourceRefs: ['2025 AHA Adult Cardiac Arrest Algorithm'] },
      ],
    },
    { phaseId: 'ended', label: 'Scenario complete', isCheckpoint: false, actions: [] },
  ],
}
