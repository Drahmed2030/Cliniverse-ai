import {
  buildEchoBatch01EvidenceLedger,
  ECHO_BATCH_01_LEDGER_ASSETS,
  type EchoBatch01LedgerSeedInput,
} from './echoBatch01EvidenceLedger.ts'
import {
  persistLedgerEvent,
  type GovernanceLedgerDatabaseAdapter,
  type GovernanceLedgerDatabaseRow,
} from '../governance/evidenceLedgerDatabaseAdapter.ts'
import { evaluateLedgerBackedPromotion } from '../governance/ledgerBackedPromotionGate.ts'

export interface EchoBatch01ReplayPilotInput extends EchoBatch01LedgerSeedInput {
  recordedAt: string
}

export interface EchoBatch01ReplayAssetResult {
  candidateId: string
  artifactSha256: string
  persistedEventCount: number
  promotionDecision: 'PROMOTION_CANDIDATE' | 'HOLD' | 'REJECT'
  promotionBlockers: readonly string[]
  learnerEligible: false
}

export interface EchoBatch01ReplayPilotResult {
  mode: 'IN_MEMORY_REPLAY_ONLY'
  appendedEvents: number
  noopEvents: number
  heldPersistenceEvents: number
  assets: readonly EchoBatch01ReplayAssetResult[]
  allHeldOnlyByPrivacyAttestation: boolean
  supabaseChanged: false
  productionChanged: false
}

function createInMemoryAdapter(): {
  adapter: GovernanceLedgerDatabaseAdapter
  rows: GovernanceLedgerDatabaseRow[]
} {
  const rows: GovernanceLedgerDatabaseRow[] = []
  return {
    rows,
    adapter: {
      async findByEventId(eventId: string) {
        return rows.find(row => row.event_id === eventId) ?? null
      },
      async append(row: GovernanceLedgerDatabaseRow) {
        rows.push(row)
      },
    },
  }
}

export async function runEchoBatch01LedgerReplayPilot(
  input: EchoBatch01ReplayPilotInput,
): Promise<EchoBatch01ReplayPilotResult> {
  const events = buildEchoBatch01EvidenceLedger(input)
  const memory = createInMemoryAdapter()
  let appendedEvents = 0
  let noopEvents = 0
  let heldPersistenceEvents = 0

  for (const event of events) {
    const persisted = await persistLedgerEvent({
      event,
      recordedAt: input.recordedAt,
      adapter: memory.adapter,
    })
    if (persisted.decision === 'APPEND') appendedEvents += 1
    else if (persisted.decision === 'NOOP') noopEvents += 1
    else heldPersistenceEvents += 1
  }

  const assets: EchoBatch01ReplayAssetResult[] = ECHO_BATCH_01_LEDGER_ASSETS.map(([candidateId, artifactSha256]) => {
    const promotion = evaluateLedgerBackedPromotion({
      product: 'CLINIVERSE',
      subjectId: candidateId,
      expectedArtifactSha256: artifactSha256,
      events,
      rightsStillValid: true,
      provenanceStillValid: true,
    })

    return {
      candidateId,
      artifactSha256,
      persistedEventCount: memory.rows.filter(row => row.subject_id === candidateId).length,
      promotionDecision: promotion.decision,
      promotionBlockers: promotion.blockers,
      learnerEligible: false,
    }
  })

  const privacyOnlyBlocker = 'required-pass-event-missing:PRIVACY_ATTESTED'
  const allHeldOnlyByPrivacyAttestation = assets.every(asset =>
    asset.promotionDecision === 'HOLD'
    && asset.promotionBlockers.length === 1
    && asset.promotionBlockers[0] === privacyOnlyBlocker,
  )

  return {
    mode: 'IN_MEMORY_REPLAY_ONLY',
    appendedEvents,
    noopEvents,
    heldPersistenceEvents,
    assets,
    allHeldOnlyByPrivacyAttestation,
    supabaseChanged: false,
    productionChanged: false,
  }
}
