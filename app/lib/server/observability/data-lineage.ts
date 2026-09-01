import 'server-only'
import { FlightRecorder, type SafeAttributeValue } from './flight-recorder'
import type { OperationalContext } from './operational-telemetry'

export type DataClassification = 'public' | 'internal' | 'account' | 'sensitive' | 'clinical-restricted'

export type DataLineageEdge = {
  source: string
  transform: string
  sink: string
  classification: DataClassification
  fields: string[]
  outcome: 'success' | 'failure'
}

function safeFieldNames(fields: string[]): string[] {
  return fields
    .filter((field) => /^[A-Za-z0-9_.:-]{1,80}$/.test(field))
    .slice(0, 32)
}

export async function recordDataLineage(input: {
  recorder: FlightRecorder
  context: OperationalContext
  operation: string
  edge: DataLineageEdge
}) {
  const fields = safeFieldNames(input.edge.fields)
  const attributes: Record<string, SafeAttributeValue> = {
    lineage_source: input.edge.source,
    lineage_transform: input.edge.transform,
    lineage_sink: input.edge.sink,
    data_classification: input.edge.classification,
    field_count: fields.length,
    fields: fields.join(','),
  }

  return input.recorder.record({
    kind: 'lineage.edge',
    operation: input.operation,
    correlationId: input.context.correlationId,
    traceId: input.context.traceId,
    spanId: input.context.spanId,
    outcome: input.edge.outcome === 'success' ? 'success' : 'failure',
    attributes,
  })
}
