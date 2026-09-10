export type CommercialViewportClass = 'COMPACT' | 'EXPANDED' | 'WIDE_CLINICAL'
export type CommercialAppearanceMode = 'LIGHT' | 'DARK'
export type CommercialContrastMode = 'STANDARD' | 'INCREASED'

export interface CommercialVisualQaScenario2026 {
  id: string
  viewport: CommercialViewportClass
  minWidth: number
  maxWidth: number | null
  appearance: CommercialAppearanceMode
  contrast: CommercialContrastMode
  navigation: 'BOTTOM_TABS' | 'ADAPTIVE_RAIL'
  dynamicTypeScale: 'DEFAULT' | 'ACCESSIBILITY_LARGE'
}

export const COMMERCIAL_VISUAL_QA_MATRIX_2026: readonly CommercialVisualQaScenario2026[] = [
  {
    id: 'compact-light-default',
    viewport: 'COMPACT',
    minWidth: 320,
    maxWidth: 899,
    appearance: 'LIGHT',
    contrast: 'STANDARD',
    navigation: 'BOTTOM_TABS',
    dynamicTypeScale: 'DEFAULT',
  },
  {
    id: 'compact-dark-accessibility',
    viewport: 'COMPACT',
    minWidth: 320,
    maxWidth: 899,
    appearance: 'DARK',
    contrast: 'INCREASED',
    navigation: 'BOTTOM_TABS',
    dynamicTypeScale: 'ACCESSIBILITY_LARGE',
  },
  {
    id: 'expanded-light-default',
    viewport: 'EXPANDED',
    minWidth: 900,
    maxWidth: 1279,
    appearance: 'LIGHT',
    contrast: 'STANDARD',
    navigation: 'ADAPTIVE_RAIL',
    dynamicTypeScale: 'DEFAULT',
  },
  {
    id: 'expanded-dark-accessibility',
    viewport: 'EXPANDED',
    minWidth: 900,
    maxWidth: 1279,
    appearance: 'DARK',
    contrast: 'INCREASED',
    navigation: 'ADAPTIVE_RAIL',
    dynamicTypeScale: 'ACCESSIBILITY_LARGE',
  },
  {
    id: 'wide-clinical-light-default',
    viewport: 'WIDE_CLINICAL',
    minWidth: 1280,
    maxWidth: null,
    appearance: 'LIGHT',
    contrast: 'STANDARD',
    navigation: 'ADAPTIVE_RAIL',
    dynamicTypeScale: 'DEFAULT',
  },
  {
    id: 'wide-clinical-dark-accessibility',
    viewport: 'WIDE_CLINICAL',
    minWidth: 1280,
    maxWidth: null,
    appearance: 'DARK',
    contrast: 'INCREASED',
    navigation: 'ADAPTIVE_RAIL',
    dynamicTypeScale: 'ACCESSIBILITY_LARGE',
  },
] as const

export function evaluateCommercialVisualQaMatrix2026(
  scenarios: readonly CommercialVisualQaScenario2026[] = COMMERCIAL_VISUAL_QA_MATRIX_2026,
) {
  const blockers: string[] = []
  const ids = scenarios.map(scenario => scenario.id)

  if (new Set(ids).size !== ids.length) blockers.push('duplicate-qa-scenario')

  for (const viewport of ['COMPACT', 'EXPANDED', 'WIDE_CLINICAL'] as const) {
    const viewportScenarios = scenarios.filter(scenario => scenario.viewport === viewport)
    if (!viewportScenarios.some(scenario => scenario.appearance === 'LIGHT')) {
      blockers.push(`${viewport.toLowerCase()}-light-required`)
    }
    if (!viewportScenarios.some(scenario => scenario.appearance === 'DARK')) {
      blockers.push(`${viewport.toLowerCase()}-dark-required`)
    }
    if (!viewportScenarios.some(scenario => scenario.dynamicTypeScale === 'ACCESSIBILITY_LARGE')) {
      blockers.push(`${viewport.toLowerCase()}-accessibility-type-required`)
    }
  }

  const compact = scenarios.filter(scenario => scenario.viewport === 'COMPACT')
  if (compact.some(scenario => scenario.navigation !== 'BOTTOM_TABS')) {
    blockers.push('compact-must-use-bottom-tabs')
  }

  const expanded = scenarios.filter(scenario => scenario.viewport !== 'COMPACT')
  if (expanded.some(scenario => scenario.navigation !== 'ADAPTIVE_RAIL')) {
    blockers.push('expanded-must-use-adaptive-rail')
  }

  return {
    decision: blockers.length ? 'HOLD' as const : 'READY' as const,
    blockers,
  }
}

export function describeCommercialVisualQaMatrix2026() {
  return {
    geometryDriven: true,
    deviceNameForksProhibited: true,
    lightAndDarkRequired: true,
    increasedContrastRequired: true,
    accessibilityLargeTypeRequired: true,
    liveDeviceValidationStillRequiredBeforeRelease: true,
  } as const
}
