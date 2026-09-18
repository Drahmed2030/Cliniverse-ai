// teamModeBoundary — Batch 9 Section 18. ARCHITECTURE ONLY. No real
// multiplayer/team simulation is implemented in this batch — every
// scenario this batch ships is single-learner. This file reserves the
// role vocabulary a future team-mode batch would use, so that batch has a
// real contract to implement against rather than inventing one under
// time pressure. Nothing here spawns a session, opens a connection, or
// creates any shared state between learners.

export type ResuscitationTeamRole = 'team_leader' | 'compressor' | 'airway' | 'medication' | 'recorder'

export interface FutureTeamModeAssignment {
  role: ResuscitationTeamRole
  /** Always null today — no real multi-learner session exists. */
  assignedLearnerId: string | null
}

/** Always returns every role unassigned — there is no multiplayer session anywhere in this batch's code paths that could populate a real assignment. */
export function readUnassignedTeamRoles(): readonly FutureTeamModeAssignment[] {
  const roles: ResuscitationTeamRole[] = ['team_leader', 'compressor', 'airway', 'medication', 'recorder']
  return roles.map(role => ({ role, assignedLearnerId: null }))
}

/** Single-learner scenarios use `team_leadership`/`closed_loop_communication` competency domains as a PROXY (see competencyDomains.ts) — this function documents that proxy relationship rather than leaving it implicit. */
export function isTeamRoleProxiedBySingleLearnerDomain(domainId: string): boolean {
  return domainId === 'team_leadership' || domainId === 'closed_loop_communication'
}
