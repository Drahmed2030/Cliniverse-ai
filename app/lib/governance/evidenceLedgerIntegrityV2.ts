import type { EvidenceLedgerEvent } from './evidenceProvenanceLedger.ts'
import { validateEvidenceLedgerChain } from './evidenceProvenanceLedger.ts'

export interface LedgerIntegrityV2Result {
  valid: boolean
  blockers: readonly string[]
  orderedEventIds: readonly string[]
}

const PROMOTION_REQUIRED_KINDS = [
  'PROBED',
  'PRIVACY_ATTESTED',
  'CLINICAL_ATTESTED',
  'DEVICE_BASELINE_BOUND',
] as const

function artifactShas(event: EvidenceLedgerEvent): Set<string> {
  return new Set(event.artifacts.map(artifact => artifact.sha256.toLowerCase()))
}

function sharesArtifactSha(a: EvidenceLedgerEvent, b: EvidenceLedgerEvent): boolean {
  const aShas = artifactShas(a)
  return b.artifacts.some(artifact => aShas.has(artifact.sha256.toLowerCase()))
}

function parseTime(value: string): number | null {
  const parsed = Date.parse(value)
  return Number.isFinite(parsed) ? parsed : null
}

function hasDuplicate(values: readonly string[]): boolean {
  return new Set(values).size !== values.length
}

function priorMatchingPass(
  prior: readonly EvidenceLedgerEvent[],
  event: EvidenceLedgerEvent,
  kind: typeof PROMOTION_REQUIRED_KINDS[number],
  sha256: string,
): boolean {
  return prior.some(candidate =>
    candidate.product === event.product
    && candidate.subjectId === event.subjectId
    && candidate.kind === kind
    && candidate.decision === 'PASS'
    && candidate.artifacts.some(artifact => artifact.sha256.toLowerCase() === sha256),
  )
}

export function validateEvidenceLedgerIntegrityV2(
  events: readonly EvidenceLedgerEvent[],
): LedgerIntegrityV2Result {
  const blockers: string[] = []
  const base = validateEvidenceLedgerChain({ events })
  blockers.push(...base.blockers.map(blocker => `v1:${blocker}`))

  const byId = new Map<string, EvidenceLedgerEvent>()
  const prior: EvidenceLedgerEvent[] = []

  for (const event of events) {
    const eventTime = parseTime(event.occurredAt)
    if (eventTime === null) blockers.push(`occurred-at-invalid:${event.eventId}`)

    const parentIds = event.parentEventIds ?? []
    if (hasDuplicate(parentIds)) blockers.push(`duplicate-parent-id:${event.eventId}`)

    const policyBindings = event.policies.map(policy => `${policy.policyId}@${policy.policyVersion}`)
    if (hasDuplicate(policyBindings)) blockers.push(`duplicate-policy-binding:${event.eventId}`)

    const artifactIds = event.artifacts.map(artifact => artifact.artifactId)
    if (hasDuplicate(artifactIds)) blockers.push(`duplicate-artifact-id:${event.eventId}`)

    for (const parentId of parentIds) {
      const parent = byId.get(parentId)
      if (!parent) continue

      if (parent.product !== event.product) {
        blockers.push(`parent-product-mismatch:${event.eventId}:${parentId}`)
      }
      if (parent.subjectId !== event.subjectId) {
        blockers.push(`parent-subject-mismatch:${event.eventId}:${parentId}`)
      }
      if (!sharesArtifactSha(parent, event)) {
        blockers.push(`parent-artifact-lineage-mismatch:${event.eventId}:${parentId}`)
      }

      const parentTime = parseTime(parent.occurredAt)
      if (eventTime !== null && parentTime !== null && eventTime < parentTime) {
        blockers.push(`child-occurs-before-parent:${event.eventId}:${parentId}`)
      }
    }

    if (event.kind === 'TRANSFORMED' && event.transform) {
      const outputIds = new Set(event.artifacts.map(artifact => artifact.artifactId))
      for (const outputId of event.transform.outputArtifactIds) {
        if (!outputIds.has(outputId)) blockers.push(`transform-output-not-in-event-artifacts:${event.eventId}:${outputId}`)
      }

      const parentArtifactIds = new Set(
        parentIds.flatMap(parentId => byId.get(parentId)?.artifacts.map(artifact => artifact.artifactId) ?? []),
      )
      for (const inputId of event.transform.inputArtifactIds) {
        if (!parentArtifactIds.has(inputId)) blockers.push(`transform-input-not-in-parent-artifacts:${event.eventId}:${inputId}`)
      }
    }

    if (event.kind === 'PROMOTION_DECIDED' && event.decision === 'PROMOTE') {
      const shas = [...artifactShas(event)]
      for (const sha256 of shas) {
        for (const kind of PROMOTION_REQUIRED_KINDS) {
          if (!priorMatchingPass(prior, event, kind, sha256)) {
            blockers.push(`promotion-prerequisite-missing:${event.eventId}:${kind}:${sha256}`)
          }
        }
      }
    }

    byId.set(event.eventId, event)
    prior.push(event)
  }

  return {
    valid: blockers.length === 0,
    blockers,
    orderedEventIds: events.map(event => event.eventId),
  }
}
