import { BLS_LESSONS, type BlsLesson } from '../codelab/blsLessons.ts'
import { ACLS_LESSONS, type ACLSLesson } from '../codelab/aclsLessons.ts'
import { CLINICAL_CONTENT_CATALOG_SEED } from '../contentCatalogSeed.ts'
import { isAvailable } from '../contentCatalogQueries.ts'
import type { ResuscitationCompetencyDomainId, ResuscitationLearningUnit, ResuscitationReviewStatus } from './resuscitationCore.ts'

// curriculumContract — Batch 9 Section 4/5. Normalizes the EXISTING BLS/
// ACLS lessons (app/lib/codelab/blsLessons.ts, aclsLessons.ts — REUSED
// verbatim, not discarded or duplicated) into the shared
// ResuscitationLearningUnit contract, and reframes each lesson's own
// `practice` block as its linked drill unit — this IS "Code Lab becomes
// the drill engine" (Section 5): no second drill framework, no new
// interactive player. A future batch may build a richer standalone drill
// UI; this batch only normalizes what already exists.
//
// Lesson reviewStatus is NOT independently guessed — it is looked up from
// the existing clinical_content_catalog row for that exact lesson
// source_key (all 12 BLS/ACLS lessons already exist there as
// visibility: 'visible', readiness: 'ready'). This is the same "catalog
// is the authoritative gate" lesson Batch 8 enforced for Clinical
// Reference — this file does not invent a second, possibly-contradictory
// opinion about lesson readiness. Synthesized DRILL units (this batch's
// own reframing of each lesson's `practice` block — new derived content,
// not yet in the catalog under its own source_key) have no existing
// catalog row to look up, so they fail closed to 'pending_clinical_review'.

function catalogReviewStatusFor(sourceKey: string): ResuscitationReviewStatus {
  const catalogItem = CLINICAL_CONTENT_CATALOG_SEED.find(item => item.source_key === sourceKey)
  if (!catalogItem) return 'pending_clinical_review'
  return isAvailable(catalogItem) ? 'reviewed' : 'pending_clinical_review'
}

const BLS_DOMAIN_MAP: Record<string, readonly ResuscitationCompetencyDomainId[]> = {
  bls_01_chain: ['recognition', 'sequence'],
  bls_02_compressions: ['sequence', 'timing'],
  bls_03_ventilations: ['sequence', 'timing'],
  bls_04_aed: ['rhythm_interpretation', 'defibrillation_sequence'],
  bls_05_airway: ['sequence', 'recognition'],
  bls_06_team: ['team_leadership', 'closed_loop_communication'],
}

const ACLS_DOMAIN_MAP: Record<string, readonly ResuscitationCompetencyDomainId[]> = {
  acls_01_systematic: ['recognition', 'reassessment'],
  acls_02_vf_vt: ['rhythm_interpretation', 'defibrillation_sequence', 'medication_timing'],
  acls_03_pea_asystole: ['rhythm_interpretation', 'sequence'],
  acls_04_bradycardia: ['rhythm_interpretation', 'recognition'],
  acls_05_tachycardia: ['rhythm_interpretation', 'defibrillation_sequence'],
  acls_06_post_rosc: ['post_rosc'],
}

function blsLessonToUnit(lesson: BlsLesson): ResuscitationLearningUnit {
  return {
    unitId: lesson.id,
    kind: 'lesson',
    track: 'bls',
    title: lesson.title,
    objectives: [lesson.objective],
    sourceRefs: ['app/lib/codelab/blsLessons.ts (AHA 2025 CPR & ECC published science)'],
    competencyDomains: BLS_DOMAIN_MAP[lesson.id] ?? [],
    drillLinks: [`${lesson.id}::drill`],
    simulationPrerequisites: [],
    reviewStatus: catalogReviewStatusFor(lesson.id),
  }
}

function blsLessonToDrillUnit(lesson: BlsLesson): ResuscitationLearningUnit {
  return {
    unitId: `${lesson.id}::drill`,
    kind: 'drill',
    track: 'bls',
    title: `${lesson.title} — ${lesson.practice.type} drill`,
    objectives: [lesson.practice.prompt],
    sourceRefs: ['app/lib/codelab/blsLessons.ts (AHA 2025 CPR & ECC published science)'],
    competencyDomains: BLS_DOMAIN_MAP[lesson.id] ?? [],
    drillLinks: [],
    simulationPrerequisites: [],
    reviewStatus: 'pending_clinical_review',
  }
}

function aclsLessonToUnit(lesson: ACLSLesson): ResuscitationLearningUnit {
  return {
    unitId: lesson.id,
    kind: 'lesson',
    track: 'acls',
    title: lesson.title,
    objectives: [lesson.objective],
    sourceRefs: ['app/lib/codelab/aclsLessons.ts (AHA 2025 CPR & ECC Guidelines, educational reference)'],
    competencyDomains: ACLS_DOMAIN_MAP[lesson.id] ?? [],
    drillLinks: [`${lesson.id}::drill`],
    simulationPrerequisites: [],
    reviewStatus: catalogReviewStatusFor(lesson.id),
  }
}

function aclsLessonToDrillUnit(lesson: ACLSLesson): ResuscitationLearningUnit {
  return {
    unitId: `${lesson.id}::drill`,
    kind: 'drill',
    track: 'acls',
    title: `${lesson.title} — ${lesson.practice.type} drill`,
    objectives: [lesson.practice.prompt],
    sourceRefs: ['app/lib/codelab/aclsLessons.ts (AHA 2025 CPR & ECC Guidelines, educational reference)'],
    competencyDomains: ACLS_DOMAIN_MAP[lesson.id] ?? [],
    drillLinks: [],
    simulationPrerequisites: [],
    reviewStatus: 'pending_clinical_review',
  }
}

export const RESUSCITATION_LEARNING_UNITS: readonly ResuscitationLearningUnit[] = [
  ...BLS_LESSONS.map(blsLessonToUnit),
  ...BLS_LESSONS.map(blsLessonToDrillUnit),
  ...ACLS_LESSONS.map(aclsLessonToUnit),
  ...ACLS_LESSONS.map(aclsLessonToDrillUnit),
]

export function findResuscitationLearningUnit(unitId: string): ResuscitationLearningUnit | null {
  return RESUSCITATION_LEARNING_UNITS.find(unit => unit.unitId === unitId) ?? null
}

export function findResuscitationDrillsForDomain(domainId: ResuscitationCompetencyDomainId): ResuscitationLearningUnit[] {
  return RESUSCITATION_LEARNING_UNITS.filter(unit => unit.kind === 'drill' && unit.competencyDomains.includes(domainId))
}

export function validateResuscitationLearningUnits(units: readonly ResuscitationLearningUnit[] = RESUSCITATION_LEARNING_UNITS): void {
  const ids = new Set<string>()
  for (const unit of units) {
    if (!unit.unitId.trim() || !unit.title.trim()) throw new Error('Learning unit identity is required.')
    if (!unit.sourceRefs.length) throw new Error(`Learning unit ${unit.unitId} has no sourceRefs.`)
    if (ids.has(unit.unitId)) throw new Error(`Duplicate learning unit id: ${unit.unitId}`)
    ids.add(unit.unitId)
  }
}
