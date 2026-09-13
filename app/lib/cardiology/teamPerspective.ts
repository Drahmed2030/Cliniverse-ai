import type { NexusCase } from './nexusCore'

const perspectives = [
  { role: 'cardiology', title: 'Clinician', task: 'Review the referral information and record an accountable review before acceptance.', expected: ['review-completed', 'acceptance-recorded'] },
  { role: 'coordination', title: 'Coordinator', task: 'Check the identity link and identify who owns the next handover. Missing examination information remains unresolved.', expected: ['identity-linked'] },
] as const

/** Summarizes recorded simulation events only; never infers clinical correctness. */
export function teamPerspective(current: NexusCase) {
  return perspectives.map(perspective => {
    const events = current.events.filter(event => event.kind === 'transition' && event.actorRole === perspective.role)
    return {
      ...perspective,
      recorded: events.map(event => ({ id: event.eventId, type: event.type })),
      pending: perspective.expected.filter(type => !events.some(event => event.type === type)),
    }
  })
}
