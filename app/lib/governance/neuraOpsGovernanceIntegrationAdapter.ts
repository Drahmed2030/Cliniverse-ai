import type { EvidenceLedgerEvent } from './evidenceProvenanceLedger.ts'
import {
  getLedgerPersistencePartition,
  type LedgerPersistencePartition,
} from './evidenceLedgerPersistenceBoundary.ts'
import {
  persistLedgerEvent,
  type GovernanceLedgerDatabaseAdapter,
  type PersistLedgerEventResult,
} from './evidenceLedgerDatabaseAdapter.ts'

export interface NeuraOpsGovernanceEventInput {
  event: EvidenceLedgerEvent
  recordedAt: string
}

export interface NeuraOpsGovernanceIntegrationResult extends PersistLedgerEventResult {
  partition: LedgerPersistencePartition
}

function requireNeuraOpsProduct(event: EvidenceLedgerEvent): void {
  if (event.product !== 'NEURAOPS_CORE') {
    throw new Error('NeuraOps governance integration requires product NEURAOPS_CORE')
  }
}

export async function persistNeuraOpsGovernanceEvent(
  input: NeuraOpsGovernanceEventInput,
  adapter: GovernanceLedgerDatabaseAdapter,
): Promise<NeuraOpsGovernanceIntegrationResult> {
  requireNeuraOpsProduct(input.event)

  const partition = getLedgerPersistencePartition('NEURAOPS_CORE')
  const result = await persistLedgerEvent({
    event: input.event,
    recordedAt: input.recordedAt,
    adapter,
  })

  return {
    ...result,
    partition,
  }
}

export interface NeuraOpsGovernanceSeedInput {
  eventId: string
  subjectId: string
  artifactId: string
  artifactSha256: string
  occurredAt: string
  actorId: string
  policyId: string
  policyVersion: string
  evidenceRecordIds?: readonly string[]
  notes?: readonly string[]
}

export function buildNeuraOpsGovernanceEvidenceEvent(
  input: NeuraOpsGovernanceSeedInput,
): EvidenceLedgerEvent {
  return {
    eventId: input.eventId,
    ledgerVersion: '1.0.0',
    product: 'NEURAOPS_CORE',
    subjectId: input.subjectId,
    kind: 'INGESTED',
    occurredAt: input.occurredAt,
    actor: {
      actorType: 'SYSTEM',
      actorId: input.actorId,
    },
    artifacts: [{
      artifactId: input.artifactId,
      sha256: input.artifactSha256,
    }],
    policies: [{
      policyId: input.policyId,
      policyVersion: input.policyVersion,
    }],
    evidenceRecordIds: input.evidenceRecordIds,
    decision: 'PASS',
    notes: input.notes,
  }
}
