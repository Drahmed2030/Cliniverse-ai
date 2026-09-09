export type EcgRendererPlatformFamily =
  | 'LINUX_POPPLER'
  | 'IPHONE_IOS'
  | 'IPAD_IPADOS'
  | 'MACOS_WINDOWS_ANDROID_VIEWERS'
  | 'BROWSER_PDF_VIEWERS'
  | 'PHYSICAL_PRINT_A3'

export type EcgRendererBaselineDecision = 'PASS' | 'HOLD'

export interface EcgRendererBaselineObservation {
  platformFamily: EcgRendererPlatformFamily
  decision: EcgRendererBaselineDecision
  rendererOrViewer: string
  scope: string
  assumptions: readonly string[]
  deviations: readonly string[]
}

export const ECG_RECORD_10_RENDERER_BASELINE_VERSION = '1.0.0' as const

export const ECG_RECORD_10_RENDERER_REQUIREMENTS = {
  leadCount: 12,
  paperSpeedMmPerSec: 25,
  gainMmPerMv: 10,
  calibrationPulseMv: 1,
  calibrationPulseMs: 200,
  timelineSeconds: 10,
  terminalCaveatStartSeconds: 9.894,
  terminalCaveatEndSeconds: 10,
  preserveTerminalBehavior: true,
  allowFitToPageForMeasurement: false,
} as const

/**
 * Baseline matrix derived only from the completed review-only renderer/device
 * verification for PTB-XL record 10. A PASS applies only to the exact platform
 * family and scope described. HOLD entries must not be inferred as failures;
 * they are untested coverage gaps. No entry grants learner readiness or
 * promotion by itself.
 */
export const ECG_RECORD_10_RENDERER_BASELINES: readonly EcgRendererBaselineObservation[] = [
  {
    platformFamily: 'LINUX_POPPLER',
    decision: 'PASS',
    rendererOrViewer: 'Poppler 26.05.0',
    scope: 'PDF geometry and 96-dpi visual rendering only',
    assumptions: [
      'review-only PDF output',
      '12 leads preserved',
      '25 mm/s and 10 mm/mV geometry preserved in PDF',
      '1 mV x 200 ms calibration pulses preserved',
      'full 10-second timeline preserved',
      'documented final 106 ms terminal behavior preserved',
    ],
    deviations: [],
  },
  {
    platformFamily: 'IPHONE_IOS',
    decision: 'HOLD',
    rendererOrViewer: 'untested',
    scope: 'physical device/viewer baseline',
    assumptions: [],
    deviations: ['device/viewer untested'],
  },
  {
    platformFamily: 'IPAD_IPADOS',
    decision: 'HOLD',
    rendererOrViewer: 'untested',
    scope: 'physical device/viewer baseline',
    assumptions: [],
    deviations: ['device/viewer untested'],
  },
  {
    platformFamily: 'MACOS_WINDOWS_ANDROID_VIEWERS',
    decision: 'HOLD',
    rendererOrViewer: 'untested',
    scope: 'desktop/mobile viewer baseline',
    assumptions: [],
    deviations: ['viewer families untested'],
  },
  {
    platformFamily: 'BROWSER_PDF_VIEWERS',
    decision: 'HOLD',
    rendererOrViewer: 'untested',
    scope: 'browser PDF viewer baseline',
    assumptions: [],
    deviations: ['browser PDF viewers untested'],
  },
  {
    platformFamily: 'PHYSICAL_PRINT_A3',
    decision: 'HOLD',
    rendererOrViewer: 'physical print path',
    scope: 'measured A3 Actual Size output',
    assumptions: ['A3 paper', 'Actual Size / 100% scale required'],
    deviations: ['measured physical output not yet verified'],
  },
] as const

export function getEcgRecord10RendererBaseline(platformFamily: EcgRendererPlatformFamily) {
  return ECG_RECORD_10_RENDERER_BASELINES.find(item => item.platformFamily === platformFamily) ?? null
}

export function getEcgRecord10RendererCoverage() {
  const pass = ECG_RECORD_10_RENDERER_BASELINES.filter(item => item.decision === 'PASS')
  const hold = ECG_RECORD_10_RENDERER_BASELINES.filter(item => item.decision === 'HOLD')
  return {
    passPlatformFamilies: pass.map(item => item.platformFamily),
    holdPlatformFamilies: hold.map(item => item.platformFamily),
    fullyCovered: hold.length === 0,
    learnerPromotionSupported: false,
  } as const
}
