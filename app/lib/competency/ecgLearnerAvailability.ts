import { evaluateEcgEligibility, type EcgEligibilitySnapshot } from '../clinicalIntelligence/ecgEligibilityDecision.ts'
import { getRecord10ReviewedPdfSnapshot } from '../clinicalIntelligence/ecgRecord10ReviewedPdfBinding.ts'
import { RECORD10_REVIEW_PDF } from '../clinicalIntelligence/ecgReviewedPdfIdentity.ts'
import { ECG_RECORD10_RUBRIC_APPROVAL_SHA256, getApprovedRecord10Rubric } from './ecgRecord10ApprovedRubric.ts'
import { ECG_RECORD10_QUESTION } from './ecgRecord10Question.ts'

// Server-side runtime decision for the learner ECG workspace. It answers one question: may this workspace show the
// Record 10 tracing and its approved question to a learner? It never grants access, stores anything or scores anything.
//
// The evidence in the repository binds the retained reviewed PDF to ONE display route (an external PDF viewer on one
// reported iPhone configuration). This workspace would show the tracing through a different route, an embedded viewer
// in the app, so the existing coverage check is run against THAT route. It returns HOLD, and the workspace fails
// closed. Nothing here relabels device evidence for another platform (see tests/ecg-record10-reviewed-pdf-binding.test.mjs).
//
// A learner also needs somewhere to fetch the reviewed file from. The PDF bytes are deliberately not in the repository,
// and no governed source for them exists yet, so ECG_LEARNER_ARTIFACT_SOURCE is null. Both conditions must hold
// before the workspace can be 'ready'.

export const ECG_LEARNER_CASE_ID = 'ecg-governed-case-001'
/** The display route this workspace uses today. Not the route the device evidence covers. */
export const ECG_LEARNER_DELIVERY_ROUTE = 'cliniverse-in-app-embedded-pdf-viewer'
/** No governed learner source for the reviewed PDF's bytes exists yet. Replacing null is a governance decision, not a code change. */
export const ECG_LEARNER_ARTIFACT_SOURCE: { url: string } | null = null

export interface EcgLearnerEvidenceRow { kind: string; decision: string | null; actorType: string; occurredAt: string }

interface EcgLearnerAvailabilityBase {
  caseId: string
  deliveryRoute: string
  /** Everything that currently blocks learner display, from the eligibility evaluator plus the artifact-source check. */
  blockers: string[]
  decision: { id: string; evidenceDigest: string; policy: { id: string; version: string }; learnerReady: boolean; integrityValid: boolean; deviceBaselineBound: boolean; promotionAuthorized: boolean }
  evidence: EcgLearnerEvidenceRow[]
  source: { artifactId: string; sha256: string }
  reviewedFile: { filename: string; bytes: number; sha256: string }
  // The prompt and the approved-definition digest only. Options and the skill (which names the answer) are ready-only.
  question: { id: string; version: string; prompt: string; approvalSha256: string }
}

export type EcgLearnerAvailability =
  | (EcgLearnerAvailabilityBase & { state: 'held' })
  // Only a ready payload carries the artifact source, the answer options and the reference answer. A held payload never contains them.
  | (EcgLearnerAvailabilityBase & { state: 'ready'; artifact: { url: string }; options: { id: string; label: string }[]; review: { correctOptionId: string; statement: string; source: string } })

export interface EcgLearnerAvailabilityInput {
  snapshot?: EcgEligibilitySnapshot
  deliveryRoute?: string
  artifactSource?: { url: string } | null
}

export function evaluateEcgLearnerAvailability(input: EcgLearnerAvailabilityInput = {}): EcgLearnerAvailability {
  const snapshot = input.snapshot ?? getRecord10ReviewedPdfSnapshot()
  const deliveryRoute = input.deliveryRoute ?? ECG_LEARNER_DELIVERY_ROUTE
  const artifactSource = input.artifactSource === undefined ? ECG_LEARNER_ARTIFACT_SOURCE : input.artifactSource

  // Evaluate the route the learner would actually use. The evidence snapshot itself is untouched.
  const routed: EcgEligibilitySnapshot = { ...snapshot, target: snapshot.target && { ...snapshot.target, platformFamily: deliveryRoute } }
  const decision = evaluateEcgEligibility(routed)

  const blockers = [...decision.blockers]
  if (snapshot.caseId !== ECG_LEARNER_CASE_ID) blockers.push('case-not-the-governed-record-10')
  if (!artifactSource) blockers.push('governed-artifact-source-unavailable')

  const base: EcgLearnerAvailabilityBase = {
    caseId: snapshot.caseId,
    deliveryRoute,
    blockers: [...new Set(blockers)].sort(),
    decision: {
      id: decision.decisionId, evidenceDigest: decision.evidenceDigest, policy: { ...decision.policy },
      learnerReady: decision.learnerReady, integrityValid: decision.integrityValid,
      deviceBaselineBound: decision.deviceBaselineBound, promotionAuthorized: decision.promotionAuthorized,
    },
    // Kind, outcome, actor type and date only. Notes and evidence references stay on the server.
    evidence: snapshot.events.map(event => ({ kind: event.kind, decision: event.decision ?? null, actorType: event.actor.actorType, occurredAt: event.occurredAt })),
    source: { artifactId: 'ptb-xl-record-10-500hz', sha256: snapshot.sourceArtifactSha256 },
    reviewedFile: { filename: RECORD10_REVIEW_PDF.filename, bytes: RECORD10_REVIEW_PDF.bytes, sha256: RECORD10_REVIEW_PDF.sha256 },
    question: {
      id: ECG_RECORD10_QUESTION.id, version: ECG_RECORD10_QUESTION.version, prompt: ECG_RECORD10_QUESTION.prompt,
      approvalSha256: ECG_RECORD10_RUBRIC_APPROVAL_SHA256,
    },
  }
  if (base.blockers.length > 0 || !decision.learnerReady || !artifactSource) return { ...base, state: 'held' }

  // The frozen, approved rubric is the only source of the reference answer; it throws if its definition ever changes.
  const correct = getApprovedRecord10Rubric().questions[0]
  const label = ECG_RECORD10_QUESTION.options.find(option => option.id === correct.correctOptionId)?.label
  if (!label) return { ...base, blockers: [...base.blockers, 'approved-rubric-option-missing'], state: 'held' }
  return {
    ...base, state: 'ready', artifact: { url: artifactSource.url }, options: ECG_RECORD10_QUESTION.options.map(option => ({ ...option })),
    review: { correctOptionId: correct.correctOptionId, statement: `The existing human review identifies ${label.toLowerCase()}.`, source: 'ECG Record 10 Human Clinical Attestation v1' },
  }
}
