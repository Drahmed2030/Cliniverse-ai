import type { EvidenceLedgerEvent, LedgerProduct } from './evidenceProvenanceLedger.ts'
import type { GovernanceLedgerDatabaseRow } from './evidenceLedgerDatabaseAdapter.ts'
import {
  persistLedgerEventViaSupabase,
  readLedgerEventsBySubjectViaSupabase,
  type GovernanceLedgerSupabaseClient,
  type LedgerRuntimeAppendResult,
  type LedgerSubjectReadResult,
  type SupabaseRuntimeAdapterConfig,
} from './evidenceLedgerSupabaseRuntimeAdapter.ts'

export const GOVERNANCE_LEDGER_RPC_SCHEMA = 'api' as const
export const GOVERNANCE_LEDGER_RPC_NAMES = {
  findByEventId: 'governance_ledger_find_event',
  appendEvent: 'governance_ledger_append_event',
  listBySubject: 'governance_ledger_list_subject',
} as const

export interface PrivateLedgerRpcResult<T> {
  data: T | null
  error: { message: string; code?: string } | null
}

export interface PrivateLedgerRpcListResult<T> {
  data: readonly T[] | null
  error: { message: string; code?: string } | null
}

export interface GovernanceLedgerPrivateRpcTransport {
  findByEventId(eventId: string): Promise<PrivateLedgerRpcResult<GovernanceLedgerDatabaseRow>>
  appendEvent(row: GovernanceLedgerDatabaseRow): Promise<PrivateLedgerRpcResult<GovernanceLedgerDatabaseRow>>
  listBySubject(input: {
    product: LedgerProduct
    subjectId: string
    limit: number
  }): Promise<PrivateLedgerRpcListResult<GovernanceLedgerDatabaseRow>>
}

export interface GovernanceLedgerPrivateRpcConfig {
  credentialKind: 'SERVICE_ROLE'
  rpcSchema: typeof GOVERNANCE_LEDGER_RPC_SCHEMA
  transport: GovernanceLedgerPrivateRpcTransport
}

function assertPrivateRpcConfig(config: GovernanceLedgerPrivateRpcConfig): void {
  if (config.credentialKind !== 'SERVICE_ROLE') {
    throw new Error('private governance ledger RPC boundary requires SERVICE_ROLE')
  }
  if (config.rpcSchema !== GOVERNANCE_LEDGER_RPC_SCHEMA) {
    throw new Error('private governance ledger RPC boundary requires api schema')
  }
}

export function createPrivateRpcGovernanceLedgerClient(
  config: GovernanceLedgerPrivateRpcConfig,
): GovernanceLedgerSupabaseClient {
  assertPrivateRpcConfig(config)

  return {
    findEvidenceLedgerEventById(eventId) {
      return config.transport.findByEventId(eventId)
    },
    insertEvidenceLedgerEvent(row) {
      return config.transport.appendEvent(row)
    },
    listEvidenceLedgerEventsBySubject(input) {
      return config.transport.listBySubject(input)
    },
  }
}

function toRuntimeConfig(config: GovernanceLedgerPrivateRpcConfig): SupabaseRuntimeAdapterConfig {
  return {
    credentialKind: 'SERVICE_ROLE',
    schema: 'governance',
    table: 'evidence_ledger_events',
    client: createPrivateRpcGovernanceLedgerClient(config),
  }
}

export async function persistLedgerEventViaPrivateRpc(input: {
  event: EvidenceLedgerEvent
  recordedAt: string
  config: GovernanceLedgerPrivateRpcConfig
}): Promise<LedgerRuntimeAppendResult> {
  return persistLedgerEventViaSupabase({
    event: input.event,
    recordedAt: input.recordedAt,
    config: toRuntimeConfig(input.config),
  })
}

export async function readLedgerEventsBySubjectViaPrivateRpc(input: {
  product: LedgerProduct
  subjectId: string
  limit?: number
  config: GovernanceLedgerPrivateRpcConfig
}): Promise<LedgerSubjectReadResult> {
  return readLedgerEventsBySubjectViaSupabase({
    product: input.product,
    subjectId: input.subjectId,
    limit: input.limit,
    config: toRuntimeConfig(input.config),
  })
}

export interface PrivateRpcBoundaryDescriptor {
  privateStorageSchema: 'governance'
  exposedRpcSchema: 'api'
  directTableExposureAllowed: false
  clientCredentialAllowed: false
  serviceRoleOnly: true
  realtimeEnabled: false
}

export function describePrivateLedgerRpcBoundary(): PrivateRpcBoundaryDescriptor {
  return {
    privateStorageSchema: 'governance',
    exposedRpcSchema: 'api',
    directTableExposureAllowed: false,
    clientCredentialAllowed: false,
    serviceRoleOnly: true,
    realtimeEnabled: false,
  }
}
