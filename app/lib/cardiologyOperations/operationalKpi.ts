import type { OperationalClock, OperationalClockType, OperationalRoleId } from './operationalCore'

// operationalKpi — Batch 10 Section 10. Generalizes
// app/lib/cardiology/nexusKpiEngine.ts's draft-only KPI calculation over
// the shared OperationalClock contract instead of Nexus-specific clock
// events, and adds an explicitly SEPARATE OperationalKpiValidatedResult
// type — a draft can never silently become a validated result; the only
// way one exists is validateKpiDraft(), which requires a human actor and
// keeps the draft's own source clocks/events attached for audit.

export interface OperationalKpiDefinition {
  id: string
  label: string
  version: string
  startClock: OperationalClockType
  endClock: OperationalClockType
  targetMinutes: number | null
  referenceIds: readonly string[]
}

export type OperationalKpiDraftStatus = 'ready_for_validation' | 'missing_clock' | 'invalid_order'

export interface OperationalKpiDraft {
  definitionId: string
  definitionVersion: string
  status: OperationalKpiDraftStatus
  elapsedMinutes: number | null
  missingClocks: readonly OperationalClockType[]
  sourceEventRefs: readonly string[]
  referenceIds: readonly string[]
  requiresHumanValidation: true
}

/** A KPI never becomes a hospital-quality claim without this. Distinct type from OperationalKpiDraft on purpose (Section 10) — a caller cannot accidentally render a draft where a validated result is expected. */
export interface OperationalKpiValidatedResult {
  definitionId: string
  definitionVersion: string
  elapsedMinutes: number
  validatedBy: OperationalRoleId
  validatedAt: string
  sourceEventRefs: readonly string[]
  referenceIds: readonly string[]
}

export function deriveKpiDraft(definition: OperationalKpiDefinition, clocks: readonly OperationalClock[]): OperationalKpiDraft {
  const start = latestClock(clocks, definition.startClock)
  const end = latestClock(clocks, definition.endClock)
  const missingClocks: OperationalClockType[] = [
    ...(start ? [] : [definition.startClock]),
    ...(end ? [] : [definition.endClock]),
  ]

  if (!start || !end) {
    return {
      definitionId: definition.id,
      definitionVersion: definition.version,
      status: 'missing_clock',
      elapsedMinutes: null,
      missingClocks,
      sourceEventRefs: [start?.eventRef, end?.eventRef].filter((value): value is string => Boolean(value)),
      referenceIds: definition.referenceIds,
      requiresHumanValidation: true,
    }
  }

  const elapsedMinutes = Math.round((Date.parse(end.occurredAt) - Date.parse(start.occurredAt)) / 60_000)
  return {
    definitionId: definition.id,
    definitionVersion: definition.version,
    status: elapsedMinutes < 0 ? 'invalid_order' : 'ready_for_validation',
    elapsedMinutes,
    missingClocks: [],
    sourceEventRefs: [start.eventRef, end.eventRef],
    referenceIds: definition.referenceIds,
    requiresHumanValidation: true,
  }
}

/** The ONLY way an OperationalKpiValidatedResult may be created. Refuses a draft that isn't ready-for-validation — a human cannot "validate" a KPI that is missing clocks or has an invalid interval. */
export function validateKpiDraft(
  draft: OperationalKpiDraft,
  validatedBy: OperationalRoleId,
  validatedAt: string,
): OperationalKpiValidatedResult | null {
  if (draft.status !== 'ready_for_validation' || draft.elapsedMinutes === null) return null
  return {
    definitionId: draft.definitionId,
    definitionVersion: draft.definitionVersion,
    elapsedMinutes: draft.elapsedMinutes,
    validatedBy,
    validatedAt,
    sourceEventRefs: draft.sourceEventRefs,
    referenceIds: draft.referenceIds,
  }
}

function latestClock(clocks: readonly OperationalClock[], clockType: OperationalClockType): OperationalClock | null {
  const matching = clocks.filter(clock => clock.clockType === clockType)
  return matching.at(-1) ?? null
}
