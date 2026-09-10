export type CommercialAppearance = 'SYSTEM' | 'LIGHT' | 'DARK'

export interface CommercialVisualSystem2026 {
  typography: {
    primaryFamily: 'SYSTEM_SF_PRO'
    alternateEditorialFamily: 'NY_WHERE_APPROPRIATE'
    dynamicTypeRequired: true
    fixedPixelBodyTypeProhibited: true
  }
  appearance: {
    defaultMode: 'SYSTEM'
    supportsLight: true
    supportsDark: true
    supportsIncreasedContrast: true
    customColorsRequireSemanticVariants: true
  }
  materials: {
    liquidGlassForNavigationAndControlsOnly: true
    contentLayerUsesStandardMaterials: true
    excessiveCustomGlassProhibited: true
  }
  clinicalDisplay: {
    waveformContrastProtected: true
    diagnosticColorAloneProhibited: true
    alwaysOnGlanceContentMustBeNonCritical: true
  }
}

export const COMMERCIAL_VISUAL_SYSTEM_2026: CommercialVisualSystem2026 = {
  typography: {
    primaryFamily: 'SYSTEM_SF_PRO',
    alternateEditorialFamily: 'NY_WHERE_APPROPRIATE',
    dynamicTypeRequired: true,
    fixedPixelBodyTypeProhibited: true,
  },
  appearance: {
    defaultMode: 'SYSTEM',
    supportsLight: true,
    supportsDark: true,
    supportsIncreasedContrast: true,
    customColorsRequireSemanticVariants: true,
  },
  materials: {
    liquidGlassForNavigationAndControlsOnly: true,
    contentLayerUsesStandardMaterials: true,
    excessiveCustomGlassProhibited: true,
  },
  clinicalDisplay: {
    waveformContrastProtected: true,
    diagnosticColorAloneProhibited: true,
    alwaysOnGlanceContentMustBeNonCritical: true,
  },
}

export function describeCommercialVisualSystem2026() {
  return {
    followsSystemAppearanceByDefault: true,
    systemTypographyFirst: true,
    dynamicTypeRequired: true,
    lightDarkAndContrastVariantsRequired: true,
    liquidGlassReservedForFunctionalChrome: true,
    clinicalContentLegibilityOutranksDecoration: true,
  } as const
}
