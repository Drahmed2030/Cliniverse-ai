import test from 'node:test'
import assert from 'node:assert/strict'
import {
  ECG_RECORD_10_RENDERER_REQUIREMENTS,
  getEcgRecord10RendererBaseline,
  getEcgRecord10RendererCoverage,
} from '../app/lib/clinicalIntelligence/ecgRecord10RendererBaseline.ts'

test('Linux Poppler baseline is scoped PASS only', () => {
  const baseline = getEcgRecord10RendererBaseline('LINUX_POPPLER')
  assert.ok(baseline)
  assert.equal(baseline.decision, 'PASS')
  assert.match(baseline.rendererOrViewer, /Poppler 26\.05\.0/)
  assert.match(baseline.scope, /96-dpi visual rendering only/)
})

test('untested platform families remain HOLD', () => {
  for (const family of [
    'IPHONE_IOS',
    'IPAD_IPADOS',
    'MACOS_WINDOWS_ANDROID_VIEWERS',
    'BROWSER_PDF_VIEWERS',
    'PHYSICAL_PRINT_A3',
  ]) {
    assert.equal(getEcgRecord10RendererBaseline(family)?.decision, 'HOLD')
  }
})

test('renderer requirements preserve clinical calibration and terminal caveat', () => {
  assert.equal(ECG_RECORD_10_RENDERER_REQUIREMENTS.leadCount, 12)
  assert.equal(ECG_RECORD_10_RENDERER_REQUIREMENTS.paperSpeedMmPerSec, 25)
  assert.equal(ECG_RECORD_10_RENDERER_REQUIREMENTS.gainMmPerMv, 10)
  assert.equal(ECG_RECORD_10_RENDERER_REQUIREMENTS.timelineSeconds, 10)
  assert.equal(ECG_RECORD_10_RENDERER_REQUIREMENTS.terminalCaveatStartSeconds, 9.894)
  assert.equal(ECG_RECORD_10_RENDERER_REQUIREMENTS.preserveTerminalBehavior, true)
})

test('partial baseline coverage cannot authorize learner promotion', () => {
  const coverage = getEcgRecord10RendererCoverage()
  assert.deepEqual(coverage.passPlatformFamilies, ['LINUX_POPPLER'])
  assert.equal(coverage.fullyCovered, false)
  assert.equal(coverage.learnerPromotionSupported, false)
})
