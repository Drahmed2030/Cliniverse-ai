// hardwareAdapterBoundary — Batch 9 Section 17. ARCHITECTURE ONLY. No CPR
// feedback device, manikin, sensor, or training hardware is connected
// anywhere in this batch. This file defines the shape a future adapter
// would need, and the explicit unsupported-metric list
// (UNSUPPORTED_RESUSCITATION_METRICS in competencyDomains.ts) so those
// metrics are never silently fabricated in the meantime.

export type HardwareAdapterMetricId = 'compressionRate' | 'compressionDepth' | 'recoil' | 'ventilationRate' | 'handsOffTime'

export interface HardwareAdapterReading {
  metricId: HardwareAdapterMetricId
  /** Always null today — no adapter exists. A real implementation would populate this from a real device stream. */
  value: number | null
  unit: string
  source: 'unsupported-no-adapter'
  capturedAt: string | null
}

/** The full set of readings a future hardware adapter would supply — every value is null today, by construction, because no adapter exists. */
export interface FutureHardwareAdapterBoundary {
  deviceConnected: false
  readings: readonly HardwareAdapterReading[]
}

const HARDWARE_METRIC_UNITS: Record<HardwareAdapterMetricId, string> = {
  compressionRate: 'compressions/min',
  compressionDepth: 'mm',
  recoil: 'percent',
  ventilationRate: 'breaths/min',
  handsOffTime: 'seconds',
}

/** Always returns deviceConnected: false and every reading's value: null — there is no code path in this batch that could populate a real value. Exists so a future batch has one function to implement against, not an invented shape. */
export function readUnsupportedHardwareMetrics(): FutureHardwareAdapterBoundary {
  return {
    deviceConnected: false,
    readings: (Object.keys(HARDWARE_METRIC_UNITS) as HardwareAdapterMetricId[]).map(metricId => ({
      metricId,
      value: null,
      unit: HARDWARE_METRIC_UNITS[metricId],
      source: 'unsupported-no-adapter',
      capturedAt: null,
    })),
  }
}
