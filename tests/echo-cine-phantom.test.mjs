import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import test from 'node:test'
import {
  createEchoMotionCompletionReceipt,
  ECHO_MOTION_TRAINING_ACTIVITY,
  parseEchoMotionCompletionReceipt,
} from '../app/lib/codelab/echoTrainingActivity.ts'
import {
  ECHO_CLINICAL_STUDIO_ASSETS,
} from '../app/lib/clinicalMedia/clinicalStudioManifest.ts'
import {
  compileClinicalMedia,
} from '../app/lib/clinicalMedia/clinicalMediaCompiler.ts'
import {
  createEchoCineFrame,
  describeEchoCineFrame,
  ECHO_CINE_CYCLE_FRAMES,
  ECHO_CINE_PHANTOM_SPEC,
  ECHO_CINE_SOURCE_ID,
  wrapEchoCineFrame,
} from '../app/lib/clinicalMedia/echoCinePhantom.ts'
import {
  ECHO_LEARNING_ASSETS,
  IMAGING_ENGINE_BOUNDARIES,
} from '../app/lib/clinicalMedia/imagingEngineContract.ts'

const CORRECT_ANSWERS = {
  'scientific-object': 'ordered-cine-frames',
  'permitted-observation': 'describe-cyclical-motion',
}

test('the Echo cine engine emits one deterministic ordered motion cycle', () => {
  assert.deepEqual(createEchoCineFrame(22), createEchoCineFrame(22))
  assert.equal(createEchoCineFrame(20).phase, 'inward-motion')
  assert.equal(createEchoCineFrame(45).phase, 'turning-point')
  assert.equal(createEchoCineFrame(70).phase, 'outward-motion')
  assert.ok(createEchoCineFrame(45).innerContour.rx < createEchoCineFrame(0).innerContour.rx)
  assert.equal(wrapEchoCineFrame(-1), ECHO_CINE_CYCLE_FRAMES - 1)
  assert.equal(wrapEchoCineFrame(ECHO_CINE_CYCLE_FRAMES), 0)
  assert.throws(() => createEchoCineFrame(-1), /integer from 0/i)
  assert.throws(() => createEchoCineFrame(ECHO_CINE_CYCLE_FRAMES), /integer from 0/i)
})

test('every synthetic frame stays finite and carries bilingual accessible descriptions', () => {
  for (let frameIndex = 0; frameIndex < ECHO_CINE_CYCLE_FRAMES; frameIndex += 1) {
    const frame = createEchoCineFrame(frameIndex)
    const numericGeometry = [
      frame.cyclePosition,
      frame.motionAmount,
      ...Object.values(frame.outerContour),
      ...Object.values(frame.innerContour),
      ...frame.speckles.flatMap(point => Object.values(point)),
    ]
    assert.equal(numericGeometry.every(Number.isFinite), true)
    assert.match(describeEchoCineFrame(frame, 'en'), /Synthetic frame/)
    assert.match(describeEchoCineFrame(frame, 'ar'), /الإطار الاصطناعي/)
  }
})

test('the imaging, Clinical Studio and activity contracts share one Echo identity', () => {
  assert.equal(IMAGING_ENGINE_BOUNDARIES.echo.implementationState, 'strategy-prototype')
  assert.equal(IMAGING_ENGINE_BOUNDARIES.ct.implementationState, 'contract-only')
  assert.equal(ECHO_CINE_PHANTOM_SPEC.engineId, IMAGING_ENGINE_BOUNDARIES.echo.engineId)
  assert.equal(ECHO_CINE_PHANTOM_SPEC.sourceId, ECHO_CINE_SOURCE_ID)
  assert.deepEqual(ECHO_CINE_PHANTOM_SPEC.renderTargets, ['web-canvas', 'remotion-video'])
  assert.deepEqual(
    ECHO_CLINICAL_STUDIO_ASSETS.map(asset => asset.assetId),
    ECHO_LEARNING_ASSETS.map(asset => asset.assetId),
  )

  for (const asset of ECHO_CLINICAL_STUDIO_ASSETS) {
    assert.equal(asset.linkedActivityId, ECHO_MOTION_TRAINING_ACTIVITY.activityId)
    assert.equal(asset.version, ECHO_MOTION_TRAINING_ACTIVITY.contentVersion)
    assert.equal(asset.cine.engine, ECHO_MOTION_TRAINING_ACTIVITY.engineId)
    assert.equal(asset.cine.sourceId, ECHO_CINE_SOURCE_ID)
    assert.deepEqual(asset.renderTargets, ['web-canvas', 'remotion-video'])
  }
})

test('the compiler produces bilingual contiguous Echo timelines for Remotion', () => {
  const english = compileClinicalMedia('en', 'landscape', 'echo-motion-orientation')
  const arabic = compileClinicalMedia('ar', 'portrait', 'echo-motion-orientation')

  assert.equal(english.modality, 'echo')
  assert.equal(english.direction, 'ltr')
  assert.equal(arabic.direction, 'rtl')
  assert.equal(english.durationInFrames, 540)
  assert.equal(english.durationInFrames / english.fps, 18)
  assert.deepEqual(
    english.scenes.map(scene => [scene.startFrame, scene.endFrame]),
    [[0, 120], [120, 300], [300, 450], [450, 540]],
  )
  assert.match(arabic.scenes[0].title, /الإيكو/)
  assert.deepEqual(english.governance.renderTargets, ['web-canvas', 'remotion-video'])
})

test('a correct boundary check creates one deterministic session-only Echo receipt', () => {
  const first = createEchoMotionCompletionReceipt({ locale: 'en', attempts: 2, answers: CORRECT_ANSWERS })
  const second = createEchoMotionCompletionReceipt({ locale: 'en', attempts: 2, answers: CORRECT_ANSWERS })

  assert.deepEqual(first, second)
  assert.match(first.receiptId, /^echo-cine-receipt-v0-[a-f0-9]{8}$/)
  assert.equal(first.contentAssetId, ECHO_MOTION_TRAINING_ACTIVITY.contentAssetIds.en)
  assert.equal(first.completionMode, 'session-only')
  assert.equal(first.humanReviewRequired, true)
  assert.deepEqual(parseEchoMotionCompletionReceipt(first), first)
  assert.throws(
    () => createEchoMotionCompletionReceipt({
      locale: 'en',
      attempts: 1,
      answers: { ...CORRECT_ANSWERS, 'permitted-observation': 'estimate-function' },
    }),
    /answer key/i,
  )
  assert.equal(parseEchoMotionCompletionReceipt({ ...first, receiptId: 'tampered' }), null)
  assert.equal(parseEchoMotionCompletionReceipt({ ...first, reviewStatus: 'approved' }), null)
})

test('the Echo prototype stays local, synthetic and reduced-motion aware', () => {
  const activitySource = readFileSync(
    new URL('../app/lib/codelab/echoTrainingActivity.ts', import.meta.url),
    'utf8',
  )
  const canvasSource = readFileSync(
    new URL('../app/components/clinical-media/EchoCineCanvas.tsx', import.meta.url),
    'utf8',
  )
  const previewSource = readFileSync(
    new URL('../app/components/clinical-media/ClinicalMediaPreview.tsx', import.meta.url),
    'utf8',
  )

  assert.doesNotMatch(activitySource, /fetch\s*\(|supabase|postgres|indexedDB|localStorage/i)
  assert.match(activitySource, /completionMode: 'session-only'/)
  assert.match(canvasSource, /disabled=\{reducedMotion\}/)
  assert.match(previewSource, /autoPlay=\{false\}/)
  assert.match(previewSource, /prefers-reduced-motion: reduce/)
})
