import type { EvidenceLedgerEvent, LedgerProduct } from './evidenceProvenanceLedger.ts'
import {
  persistLedgerEvent,
  type GovernanceLedgerDatabaseAdapter,
  type GovernanceLedgerDatabaseRow,
  type PersistLedgerEventResult,
} from './evidenceLedgerDatabaseAdapter.ts'

export type SupabaseRuntimeCredentialKind = 'SERVICE_ROLE'
export type SupabaseRuntimeErrorCode =
  | 'CONFIGURATION_ERROR'
  | 'READ_FAILED'
  | 'WRITE_FAILED'
  | 'ROW_INVALID'
  | 'PRODUCT_SCOPE_VIOLATION'

export interface SupabaseRuntimeError {
  code: SupabaseRuntimeErrorCode
  message: string
  cause?: unknown
}

export interface SupabaseQueryResult<T> {
  data: T | null
  error: { message: string; code?: string } | null
}

export interface SupabaseListResult<T> {
  data: readonly T[] | null
  error: { message: string; code?: string } | null
}

export interface GovernanceLedgerSupabaseClient {
  findEvidenceLedgerEventById(eventId: string): Promise<SupabaseQueryResult<GovernanceLedgerDatabaseRow>>
  insertEvidenceLedgerEvent(row: GovernanceLedgerDatabaseRow): Promise<SupabaseQueryResult<GovernanceLedgerDatabaseRow>>
  listEvidenceLedgerEventsBySubject(input: {
    product: LedgerProduct
    subjectId: string
    limit: number
  }): Promise<SupabaseListResult<GovernanceLedgerDatabaseRow>>
}

export interface SupabaseRuntimeAdapterConfig {
  credentialKind: SupabaseRuntimeCredentialKind
  schema: 'governance'
  table: 'evidence_ledger_events'
  client: GovernanceLedgerSupabaseClient
}

export interface LedgerSubjectReadInput {
  product: LedgerProduct
  subjectId: string
  limit?: number
}

export interface LedgerSubjectReadResult {
  rows: readonly GovernanceLedgerDatabaseRow[]
  error?: SupabaseRuntimeError
}

export interface LedgerRuntimeAppendResult extends PersistLedgerEventResult {
  error?: SupabaseRuntimeError
}

function runtimeError(
  code: SupabaseRuntimeErrorCode,
  message: string,
  cause?: unknown,
): SupabaseRuntimeError {
  return { code, message, cause }
}

function assertRuntimeConfig(config: SupabaseRuntimeAdapterConfig): void {
  if (config.credentialKind !== 'SERVICE_ROLE') {
    throw new Error('governance ledger runtime adapter requires SERVICE_ROLE credential boundary')
  }
  if (config.schema !== 'governance') throw new Error('governance ledger runtime adapter requires governance schema')
  if (config.table !== 'evidence_ledger_events') throw new Error('governance ledger runtime adapter requires evidence_ledger_events table')
}

function validateRowScope(row: GovernanceLedgerDatabaseRow, product: LedgerProduct): SupabaseRuntimeError | undefined {
  if (row.product !== product) {
    return runtimeError(
      'PRODUCT_SCOPE_VIOLATION',
      `ledger row product ${row.product} does not match requested product ${product}`,
    )
  }
  return undefined
}

export function createSupabaseGovernanceLedgerDatabaseAdapter(
  config: SupabaseRuntimeAdapterConfig,
): GovernanceLedgerDatabaseAdapter {
  assertRuntimeConfig(config)

  return {
    async findByEventId(eventId: string): Promise<GovernanceLedgerDatabaseRow | null> {
      const result = await config.client.findEvidenceLedgerEventById(eventId)
      if (result.error) throw runtimeError('READ_FAILED', result.error.message, result.error)
      return result.data
    },

    async append(row: GovernanceLedgerDatabaseRow): Promise<void> {
      const result = await config.client.insertEvidenceLedgerEvent(row)
      if (result.error) throw runtimeError('WRITE_FAILED', result.error.message, result.error)
      if (!result.data) throw runtimeError('WRITE_FAILED', 'Supabase insert returned no persisted row')
      if (result.data.event_id !== row.event_id) {
        throw runtimeError('ROW_INVALID', 'Supabase insert response event_id mismatch')
      }
      if (result.data.product !== row.product) {
        throw runtimeError('ROW_INVALID', 'Supabase insert response product mismatch')
      }
    },
  }
}

export async function persistLedgerEventViaSupabase(input: {
  event: EvidenceLedgerEvent
  recordedAt: string
  config: SupabaseRuntimeAdapterConfig
}): Promise<LedgerRuntimeAppendResult> {
  try {
    const adapter = createSupabaseGovernanceLedgerDatabaseAdapter(input.config)
    return await persistLedgerEvent({
      event: input.event,
      recordedAt: input.recordedAt,
      adapter,
    })
  } catch (cause) {
    const error = isSupabaseRuntimeError(cause)
      ? cause
      : runtimeError('CONFIGURATION_ERROR', cause instanceof Error ? cause.message : 'Unknown runtime adapter error', cause)
    return {
      decision: 'HOLD',
      blockers: [`supabase-runtime:${error.code.toLowerCase()}`],
      error,
    }
  }
}

export async function readLedgerEventsBySubjectViaSupabase(
  input: LedgerSubjectReadInput & { config: SupabaseRuntimeAdapterConfig },
): Promise<LedgerSubjectReadResult> {
  try {
    assertRuntimeConfig(input.config)
    const limit = input.limit ?? 100
    if (!Number.isInteger(limit) || limit < 1 || limit > 500) {
      return {
        rows: [],
        error: runtimeError('CONFIGURATION_ERROR', 'subject read limit must be an integer between 1 and 500'),
      }
    }

    const result = await input.config.client.listEvidenceLedgerEventsBySubject({
      product: input.product,
      subjectId: input.subjectId,
      limit,
    })
    if (result.error) return { rows: [], error: runtimeError('READ_FAILED', result.error.message, result.error) }

    const rows = [...(result.data ?? [])]
    for (const row of rows) {
      const scopeError = validateRowScope(row, input.product)
      if (scopeError) return { rows: [], error: scopeError }
      if (row.subject_id !== input.subjectId) {
        return {
          rows: [],
          error: runtimeError('ROW_INVALID', 'Supabase subject read returned a mismatched subject_id'),
        }
      }
    }

    return { rows }
  } catch (cause) {
    return {
      rows: [],
      error: isSupabaseRuntimeError(cause)
        ? cause
        : runtimeError('CONFIGURATION_ERROR', cause instanceof Error ? cause.message : 'Unknown runtime adapter error', cause),
    }
  }
}

export function isSupabaseRuntimeError(value: unknown): value is SupabaseRuntimeError {
  if (!value || typeof value !== 'object') return false
  const candidate = value as Partial<SupabaseRuntimeError>
  return typeof candidate.code === 'string' && typeof candidate.message === 'string'
}
