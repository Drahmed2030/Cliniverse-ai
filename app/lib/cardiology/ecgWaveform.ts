export type SyntheticLeadId = 'II' | 'V2' | 'V3' | 'V4'

export interface SyntheticLead {
  id: SyntheticLeadId
  label: string
  path: string
  configuredMarker: boolean
  accessibleSummary: string
}

const MARKER_LEADS = new Set<SyntheticLeadId>(['V2', 'V3', 'V4'])

export function createSyntheticLead(id: SyntheticLeadId, width = 640, baseline = 54): SyntheticLead {
  const marker = MARKER_LEADS.has(id)
  const path = Array.from({ length: 4 }, (_, beat) => {
    const x = beat * (width / 4)
    const elevation = marker ? 8 : 0
    const points = [
      [x, baseline], [x + 18, baseline], [x + 27, baseline - 4], [x + 36, baseline],
      [x + 48, baseline], [x + 54, baseline + 7], [x + 61, baseline - 34],
      [x + 68, baseline + 18], [x + 78, baseline - elevation], [x + 104, baseline - elevation],
      [x + 118, baseline - 10 - elevation], [x + 132, baseline - elevation], [x + 150, baseline],
    ]
    return points.map(([pointX, pointY], index) => `${beat === 0 && index === 0 ? 'M' : 'L'} ${pointX.toFixed(1)} ${pointY.toFixed(1)}`).join(' ')
  }).join(' ')

  return {
    id,
    label: `Lead ${id}`,
    path,
    configuredMarker: marker,
    accessibleSummary: marker
      ? `Synthetic ${id} strip containing the configured post-QRS elevation marker.`
      : `Synthetic ${id} reference strip without the configured elevation marker.`,
  }
}

export const DOOR_TO_ECG_SYNTHETIC_LEADS: SyntheticLead[] = (['II', 'V2', 'V3', 'V4'] as const)
  .map(id => createSyntheticLead(id))

export const DOOR_TO_ECG_MARKER_LEADS = [...MARKER_LEADS]

export function matchesConfiguredMarker(selected: SyntheticLeadId[]): boolean {
  return selected.length === MARKER_LEADS.size && selected.every(id => MARKER_LEADS.has(id))
}
