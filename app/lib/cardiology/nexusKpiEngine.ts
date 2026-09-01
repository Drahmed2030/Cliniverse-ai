import type { NexusClockEvent, NexusClockType, NexusEvent } from './nexusCore'

export type NexusKpiId = 'AHACAD2' | 'AHACAD8' | 'AHACAD9'

export interface NexusKpiDefinition {
  id: NexusKpiId
  label: string
  startClock: NexusClockType
  endClock: NexusClockType
  targetMinutes: number | null
  referenceIds: string[]
}

export interface NexusKpiDraft {
  id: NexusKpiId
  status: 'ready-for-validation' | 'missing-clock' | 'invalid-order'
  elapsedMinutes: number | null
  missingClocks: NexusClockType[]
  sourceEventIds: string[]
  requiresHumanValidation: true
}

export const NEXUS_KPI_DEFINITIONS: NexusKpiDefinition[] = [
  { id: 'AHACAD2', label: 'First hospital to PCI', startClock: 'first-hospital-arrival', endClock: 'procedure-milestone', targetMinutes: 120, referenceIds: ['AHA-KPI-LOCAL-AUDIT'] },
  { id: 'AHACAD8', label: 'First medical contact to PCI', startClock: 'first-medical-contact', endClock: 'procedure-milestone', targetMinutes: null, referenceIds: ['AHA-KPI-LOCAL-AUDIT'] },
  { id: 'AHACAD9', label: 'Receiving hospital arrival to primary PCI', startClock: 'receiving-hospital-arrival', endClock: 'procedure-milestone', targetMinutes: 90, referenceIds: ['AHA-KPI-LOCAL-AUDIT'] },
]

export function calculateKpiDrafts(events: NexusEvent[]): NexusKpiDraft[] {
  const clocks = events.filter((event): event is NexusClockEvent => event.kind === 'clock')

  return NEXUS_KPI_DEFINITIONS.map(definition => {
    const start = latestClock(clocks, definition.startClock)
    const end = latestClock(clocks, definition.endClock)
    const missingClocks = [
      ...(start ? [] : [definition.startClock]),
      ...(end ? [] : [definition.endClock]),
    ]

    if (!start || !end) {
      return {
        id: definition.id,
        status: 'missing-clock',
        elapsedMinutes: null,
        missingClocks,
        sourceEventIds: [start?.eventId, end?.eventId].filter((value): value is string => Boolean(value)),
        requiresHumanValidation: true,
      }
    }

    const elapsedMinutes = Math.round((Date.parse(end.occurredAt) - Date.parse(start.occurredAt)) / 60_000)
    return {
      id: definition.id,
      status: elapsedMinutes < 0 ? 'invalid-order' : 'ready-for-validation',
      elapsedMinutes,
      missingClocks: [],
      sourceEventIds: [start.eventId, end.eventId],
      requiresHumanValidation: true,
    }
  })
}

function latestClock(events: NexusClockEvent[], clockType: NexusClockType): NexusClockEvent | null {
  const matching = events.filter(event => event.clockType === clockType)
  return matching.at(-1) ?? null
}
