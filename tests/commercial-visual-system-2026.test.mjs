import test from 'node:test'
import assert from 'node:assert/strict'
import {
  COMMERCIAL_VISUAL_SYSTEM_2026,
  describeCommercialVisualSystem2026,
} from '../app/lib/commercial/commercialVisualSystem2026.ts'

test('uses system-first typography with Dynamic Type', () => {
  assert.equal(COMMERCIAL_VISUAL_SYSTEM_2026.typography.primaryFamily, 'SYSTEM_SF_PRO')
  assert.equal(COMMERCIAL_VISUAL_SYSTEM_2026.typography.dynamicTypeRequired, true)
  assert.equal(COMMERCIAL_VISUAL_SYSTEM_2026.typography.fixedPixelBodyTypeProhibited, true)
})

test('supports system light dark and increased contrast appearances', () => {
  assert.equal(COMMERCIAL_VISUAL_SYSTEM_2026.appearance.defaultMode, 'SYSTEM')
  assert.equal(COMMERCIAL_VISUAL_SYSTEM_2026.appearance.supportsLight, true)
  assert.equal(COMMERCIAL_VISUAL_SYSTEM_2026.appearance.supportsDark, true)
  assert.equal(COMMERCIAL_VISUAL_SYSTEM_2026.appearance.supportsIncreasedContrast, true)
})

test('reserves Liquid Glass for navigation and controls', () => {
  assert.equal(COMMERCIAL_VISUAL_SYSTEM_2026.materials.liquidGlassForNavigationAndControlsOnly, true)
  assert.equal(COMMERCIAL_VISUAL_SYSTEM_2026.materials.contentLayerUsesStandardMaterials, true)
})

test('protects clinical legibility over decoration', () => {
  const contract = describeCommercialVisualSystem2026()
  assert.equal(contract.clinicalContentLegibilityOutranksDecoration, true)
  assert.equal(COMMERCIAL_VISUAL_SYSTEM_2026.clinicalDisplay.waveformContrastProtected, true)
})
