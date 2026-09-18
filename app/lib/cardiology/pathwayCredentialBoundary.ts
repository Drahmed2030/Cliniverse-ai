import type { CodeLabTrainingCompletionReceipt } from '../codelab/trainingActivity.ts'
import type { PathwayClosureBrief } from './pathwaySession.ts'

// PathwayCredentialBoundary — Batch 7 Section 11. ARCHITECTURE ONLY.
//
// HARD RULE: Receipt ≠ Credential.
//
// A CodeLabTrainingCompletionReceipt or PathwayClosureBrief is a
// tamper-evident structural record that a learner completed a fictional
// simulation activity in this session. It is never a badge, never a
// verifiable credential, and never proof of competency by itself.
//
// This file defines the SHAPE a future credential would need — an Open
// Badges 3.0 / W3C Verifiable Credentials 2.0 style envelope — and the
// governance preconditions that must ALL be true before one may be issued.
// There is no issuance function here. isEligibleForCredentialConsideration
// below always returns false in this batch, by construction, because none
// of the real-world preconditions (approved curriculum, verified issuer,
// institutional governance, human verification, an explicit competency
// standard) can be satisfied by anything this repo currently has — they
// are external governance facts, not something client-side code can assert
// about itself.

export type FutureCredentialFormat = 'open-badges-3.0' | 'w3c-verifiable-credential-2.0'

/** The full set of preconditions a real credential issuance would require. Every field is a governance fact this repo does not and should not try to assert on its own. */
export interface CredentialIssuancePreconditions {
  approvedCurriculum: boolean
  verifiedIssuer: boolean
  institutionalGovernance: boolean
  humanVerification: boolean
  explicitCompetencyStandard: string | null
}

/** The shape a future credential envelope would carry — never constructed with real values by this batch. Kept here so a future issuer integration has one contract to implement against, not an invented one per call site. */
export interface FutureCredentialEnvelope {
  format: FutureCredentialFormat
  subject: { sessionScopedHandle: string /* never a real learner identity */ }
  basedOnReceipt: { receiptId: string; receiptHash: string }
  competencyStandard: string
  issuer: { verifiedIdentity: string; institutionalApproval: string }
  issuedAt: string
  /** Always false for anything this repo can construct today — see file header. */
  eligibleForRealIssuance: false
}

export function evaluateCredentialIssuancePreconditions(
  _receipt: CodeLabTrainingCompletionReceipt | PathwayClosureBrief,
): CredentialIssuancePreconditions {
  // Every precondition is hardcoded false/null — this batch has no source of
  // truth for curriculum approval, issuer verification, institutional
  // governance, or human competency sign-off. A future batch that adds a
  // real governance surface should make each field a real lookup, not flip
  // these constants directly.
  return {
    approvedCurriculum: false,
    verifiedIssuer: false,
    institutionalGovernance: false,
    humanVerification: false,
    explicitCompetencyStandard: null,
  }
}

/** Always false today — see file header. A future governance batch must change how this is computed (real lookups, not this function's shape) before it could ever return true. */
export function isEligibleForCredentialConsideration(preconditions: CredentialIssuancePreconditions): boolean {
  return Boolean(
    preconditions.approvedCurriculum
    && preconditions.verifiedIssuer
    && preconditions.institutionalGovernance
    && preconditions.humanVerification
    && preconditions.explicitCompetencyStandard,
  )
}
