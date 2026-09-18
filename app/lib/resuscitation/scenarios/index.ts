import { validateResuscitationScenario, type ResuscitationScenario } from '../scenarioContract.ts'
import { VF_PVT_SCENARIO } from './vfPvtScenario.ts'
import { PEA_ASYSTOLE_SCENARIO } from './peaAsystoleScenario.ts'
import { UNSTABLE_BRADYCARDIA_SCENARIO } from './unstableBradycardiaScenario.ts'

// scenarios/index — Batch 9 Section 8. Initial governed scope: exactly
// three scenarios. app/components/ward/MegacodeRunner.tsx's PE
// (mega_pe_01) and Sepsis (mega_sepsis_01) cases are DELIBERATELY NOT
// promoted here — per the batch contract, those belong better in Ward/
// Pathway Simulation unless separately reviewed, and porting them
// blindly (with hardcoded scenario logic and no provenance/review
// status) would violate this batch's own governance requirements.

export const RESUSCITATION_SCENARIOS: readonly ResuscitationScenario[] = [
  VF_PVT_SCENARIO,
  PEA_ASYSTOLE_SCENARIO,
  UNSTABLE_BRADYCARDIA_SCENARIO,
]

export function validateResuscitationScenarios(scenarios: readonly ResuscitationScenario[] = RESUSCITATION_SCENARIOS): void {
  const ids = new Set<string>()
  for (const scenario of scenarios) {
    validateResuscitationScenario(scenario)
    if (ids.has(scenario.scenarioId)) throw new Error(`Duplicate scenarioId: ${scenario.scenarioId}`)
    ids.add(scenario.scenarioId)
  }
}

export function findResuscitationScenario(scenarioId: string): ResuscitationScenario | null {
  return RESUSCITATION_SCENARIOS.find(scenario => scenario.scenarioId === scenarioId) ?? null
}

/** Explicitly NOT part of this batch's governed scope — see this file's header. Kept as a named export (not a UI-facing list) so a future batch's review decision has one place to record. */
export const NOT_PROMOTED_THIS_BATCH = ['mega_pe_01', 'mega_sepsis_01'] as const
