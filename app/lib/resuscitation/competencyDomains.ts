import type { ResuscitationCompetencyDomainId } from './resuscitationCore.ts'

// competencyDomains — Batch 9 Section 3. The single source of truth for
// which resuscitation competency domains exist and whether each is
// CURRENTLY measurable from this app's own event stream. A domain like
// "compression depth" is a real, important skill — but this app has no
// device/hardware input, so it stays unsupported (measurable: false)
// until a future hardware adapter exists (see hardwareAdapterBoundary.ts).
// Never claim objective measurement for a domain this app cannot actually
// observe.

export interface ResuscitationCompetencyDomainDefinition {
  id: ResuscitationCompetencyDomainId
  label: string
  measurable: true
  /** How this domain is actually derived from event evidence — kept honest and specific, never "AI-assessed" with no basis. */
  evidenceBasis: string
}

export const RESUSCITATION_COMPETENCY_DOMAINS: readonly ResuscitationCompetencyDomainDefinition[] = [
  {
    id: 'recognition',
    label: 'Recognition',
    measurable: true,
    evidenceBasis: 'Whether the first governed action selected in a scenario correctly identifies the presenting problem (e.g. confirming arrest before intervening).',
  },
  {
    id: 'sequence',
    label: 'Sequence',
    measurable: true,
    evidenceBasis: 'Whether actions were selected in the order the governed scenario manifest declares as correct, independent of timing.',
  },
  {
    id: 'rhythm_interpretation',
    label: 'Rhythm interpretation',
    measurable: true,
    evidenceBasis: 'Whether a rhythm-check action in the scenario manifest was answered correctly against its governed answer key.',
  },
  {
    id: 'timing',
    label: 'Timing',
    measurable: true,
    evidenceBasis: 'Elapsed time between a scenario phase entry event and the next required action event, compared against the manifest\'s declared timingWindows.',
  },
  {
    id: 'defibrillation_sequence',
    label: 'Defibrillation sequence',
    measurable: true,
    evidenceBasis: 'Whether the charge/clear/shock action sequence in a defibrillation-eligible scenario phase matches the manifest\'s governed order.',
  },
  {
    id: 'medication_timing',
    label: 'Medication timing',
    measurable: true,
    evidenceBasis: 'Whether a medication-timing action event occurred within the manifest\'s declared timingWindow for that phase.',
  },
  {
    id: 'reassessment',
    label: 'Reassessment',
    measurable: true,
    evidenceBasis: 'Whether a reassessment action (rhythm/pulse check) was taken at each manifest-declared reassessment checkpoint.',
  },
  {
    id: 'post_rosc',
    label: 'Post-ROSC care',
    measurable: true,
    evidenceBasis: 'Whether the governed post-ROSC bundle actions were selected when a scenario reaches its post-ROSC phase.',
  },
  {
    id: 'team_leadership',
    label: 'Team leadership',
    measurable: true,
    evidenceBasis: 'Whether role-assignment/closed-loop-confirmation actions were selected when the manifest offers them — a single-learner proxy only; see teamModeBoundary.ts for the real multi-role concept this will eventually measure.',
  },
  {
    id: 'closed_loop_communication',
    label: 'Closed-loop communication',
    measurable: true,
    evidenceBasis: 'Whether an explicit confirmation action was selected after a delegated instruction action in the manifest — a single-learner proxy only, same caveat as team_leadership.',
  },
] as const

// Explicitly unsupported today — kept here (not silently omitted) so the
// gap is documented rather than invisible. Each requires a real hardware/
// device adapter (see hardwareAdapterBoundary.ts) before it can ever be
// measured. Never fabricate a value for any of these.
export const UNSUPPORTED_RESUSCITATION_METRICS = [
  'compression_depth',
  'compression_rate',
  'ventilation_quality',
  'chest_recoil',
  'hands_off_time',
] as const
export type UnsupportedResuscitationMetric = typeof UNSUPPORTED_RESUSCITATION_METRICS[number]

export function getResuscitationCompetencyDomain(id: ResuscitationCompetencyDomainId): ResuscitationCompetencyDomainDefinition {
  const domain = RESUSCITATION_COMPETENCY_DOMAINS.find(candidate => candidate.id === id)
  if (!domain) throw new Error(`Unknown resuscitation competency domain: ${id}`)
  return domain
}

export function isUnsupportedResuscitationMetric(id: string): id is UnsupportedResuscitationMetric {
  return (UNSUPPORTED_RESUSCITATION_METRICS as readonly string[]).includes(id)
}
