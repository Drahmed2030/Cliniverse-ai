import assert from 'node:assert/strict'
import { createHash } from 'node:crypto'
import { readFileSync, statSync } from 'node:fs'
import test from 'node:test'
import {
  createEchoA4cCompletionReceipt,
  ECHO_A4C_TRAINING_ACTIVITY,
  parseEchoA4cCompletionReceipt,
} from '../app/lib/codelab/echoA4cTrainingActivity.ts'
import {
  CLINICAL_MEDIA_PROGRAM_ACCESS,
  compileClinicalMedia,
  compileClinicalMediaPreview,
  compileLearnerClinicalMedia,
  PREVIEW_CLINICAL_MEDIA_PROGRAMS,
} from '../app/lib/clinicalMedia/clinicalMediaCompiler.ts'
import {
  A4C_NORMAL_CLINICAL_STUDIO_ASSET,
  validateLicensedEchoAsset,
} from '../app/lib/clinicalMedia/licensedEchoAsset.ts'
import {
  REAL_ECG_CURATION_CONTRACT,
  REAL_ECG_SOURCE_REGISTRY,
} from '../app/lib/clinicalMedia/realEcgSourceRegistry.ts'

const CORRECT_A4C_ANSWERS = {
  'view-identity': 'apical-four-chamber',
  'visible-landmarks': 'four-chambers-av-valves-septa',
  'safe-conclusion': 'source-labeled-view-recognition-only',
}

test('the licensed A4C manifest freezes the inspected source and derivative', () => {
  assert.doesNotThrow(() => validateLicensedEchoAsset(A4C_NORMAL_CLINICAL_STUDIO_ASSET))
  assert.equal(A4C_NORMAL_CLINICAL_STUDIO_ASSET.cine.view, 'A4C')
  assert.equal(A4C_NORMAL_CLINICAL_STUDIO_ASSET.cine.sourceLabel, 'normal')
  assert.equal(A4C_NORMAL_CLINICAL_STUDIO_ASSET.cine.audio, 'none')
  assert.equal(A4C_NORMAL_CLINICAL_STUDIO_ASSET.rights.licenseId, 'CC-BY-SA-3.0')
  assert.equal(A4C_NORMAL_CLINICAL_STUDIO_ASSET.rights.vrtTicket, '2011102310008874')
  assert.equal(A4C_NORMAL_CLINICAL_STUDIO_ASSET.privacy.directPatientIdentifiersVisible, false)
  assert.deepEqual(A4C_NORMAL_CLINICAL_STUDIO_ASSET.privacy.maskedElements, ['burned-in acquisition date and time'])

  const media = readFileSync(new URL('../public/clinical-media/echo/a4c-normal-cardionetworks-v1.mp4', import.meta.url))
  assert.equal(statSync(new URL('../public/clinical-media/echo/a4c-normal-cardionetworks-v1.mp4', import.meta.url)).size, A4C_NORMAL_CLINICAL_STUDIO_ASSET.rights.derivativeBytes)
  assert.equal(createHash('sha256').update(media).digest('hex'), A4C_NORMAL_CLINICAL_STUDIO_ASSET.rights.derivativeSha256)
})

test('real A4C is English-only and Preview-only while the synthetic phantom remains internal', () => {
  assert.equal(CLINICAL_MEDIA_PROGRAM_ACCESS['echo-a4c-normal'], 'preview-only')
  assert.deepEqual(PREVIEW_CLINICAL_MEDIA_PROGRAMS, ['echo-a4c-normal'])
  const media = compileClinicalMediaPreview('en', 'landscape', 'echo-a4c-normal')

  assert.equal(media.modality, 'echo')
  assert.equal(media.locale, 'en')
  assert.equal(media.direction, 'ltr')
  assert.equal(media.durationInFrames, 600)
  assert.equal(media.durationInFrames / media.fps, 20)
  assert.equal(media.governance.dataMode, 'licensed-real-clinical-media')
  assert.equal(media.governance.surfaceAccess, 'preview-only')
  assert.deepEqual(media.governance.renderTargets, ['web-video', 'remotion-video'])
  assert.throws(() => compileClinicalMedia('ar', 'landscape', 'echo-a4c-normal'), /No echo-a4c-normal.*ar/i)
  assert.throws(() => compileLearnerClinicalMedia('en', 'landscape', 'echo-a4c-normal'), /not available on the learner surface/i)
  assert.throws(() => compileClinicalMediaPreview('en', 'landscape', 'echo-motion-orientation'), /internal-only/i)
})

test('the real A4C composition is local, silent, attributed and user-controlled', () => {
  const compositionSource = readFileSync(
    new URL('../app/components/clinical-media/EchoA4cMediaComposition.tsx', import.meta.url),
    'utf8',
  )
  const lessonSource = readFileSync(
    new URL('../app/components/clinical-media/EchoA4cLesson.tsx', import.meta.url),
    'utf8',
  )
  const previewSource = readFileSync(
    new URL('../app/components/clinical-media/ClinicalMediaPreview.tsx', import.meta.url),
    'utf8',
  )

  assert.match(compositionSource, /OffthreadVideo/)
  assert.match(compositionSource, /staticFile\(mediaPath\)/)
  assert.match(compositionSource, /muted/)
  assert.match(compositionSource, /Loop durationInFrames/)
  assert.match(compositionSource, /objectFit: 'contain'/)
  assert.match(compositionSource, /objectPosition: 'center center'/)
  assert.doesNotMatch(compositionSource, /fetch\s*\(|https:\/\//)
  assert.match(lessonSource, /CC BY-SA 3\.0/)
  assert.match(lessonSource, /acquisition date\/time was masked/)
  assert.match(lessonSource, /sourcePageUrl/)
  assert.match(previewSource, /autoPlay=\{false\}/)
  assert.match(previewSource, /style=\{RESPONSIVE_PLAYER_STYLE\}/)
  assert.match(previewSource, /Export format/)
  assert.match(previewSource, /Device-fit preview/)
  assert.match(previewSource, /'echo-a4c-normal'/)
  assert.doesNotMatch(previewSource, /setLocale|>عربي<|Preview language/)
})

test('Clinical Studio has an explicit device-fit display contract', () => {
  const previewSource = readFileSync(
    new URL('../app/components/clinical-media/ClinicalMediaPreview.tsx', import.meta.url),
    'utf8',
  )
  const mediaStyles = readFileSync(
    new URL('../app/components/clinical-media/clinical-media.module.css', import.meta.url),
    'utf8',
  )
  const layoutSource = readFileSync(new URL('../app/layout.tsx', import.meta.url), 'utf8')
  const globalStyles = readFileSync(new URL('../app/globals.css', import.meta.url), 'utf8')

  assert.match(previewSource, /data-testid="clinical-media-player-viewport"/)
  assert.match(previewSource, /data-export-format=\{format\}/)
  assert.match(mediaStyles, /\.portraitPlayerViewport[\s\S]*40\.5dvh/)
  assert.match(mediaStyles, /\.landscapePlayerViewport[\s\S]*128dvh/)
  assert.match(mediaStyles, /\.squarePlayerViewport[\s\S]*72dvh/)
  assert.match(mediaStyles, /\.realEchoVideoFrame video[\s\S]*object-fit: contain !important/)
  assert.match(layoutSource, /aria-hidden="true" className="cliniverse-watermark"/)
  assert.match(globalStyles, /@media \(max-width: 760px\)[\s\S]*\.cliniverse-watermark[\s\S]*opacity: \.028/)
})

test('a correct A4C assessment creates a deterministic session-only receipt', () => {
  const first = createEchoA4cCompletionReceipt({ attempts: 2, answers: CORRECT_A4C_ANSWERS })
  const second = createEchoA4cCompletionReceipt({ attempts: 2, answers: CORRECT_A4C_ANSWERS })

  assert.deepEqual(first, second)
  assert.match(first.receiptId, /^echo-a4c-receipt-v1-[a-f0-9]{8}$/)
  assert.equal(first.contentAssetId, ECHO_A4C_TRAINING_ACTIVITY.contentAssetId)
  assert.equal(first.dataMode, 'licensed-real-clinical-media')
  assert.equal(first.completionMode, 'session-only')
  assert.equal(first.humanReviewRequired, true)
  assert.deepEqual(parseEchoA4cCompletionReceipt(first), first)
  assert.throws(
    () => createEchoA4cCompletionReceipt({
      attempts: 1,
      answers: { ...CORRECT_A4C_ANSWERS, 'safe-conclusion': 'calculate-ejection-fraction' },
    }),
    /answer key/i,
  )
  assert.equal(parseEchoA4cCompletionReceipt({ ...first, receiptId: 'tampered' }), null)
})

test('the ECG real-signal registry uses authoritative open WFDB sources and ingests nothing yet', () => {
  assert.deepEqual(
    REAL_ECG_SOURCE_REGISTRY.map(source => source.sourceId),
    ['physionet:ptb-xl:1.0.3', 'physionet:mit-bih-arrhythmia:1.0.0', 'physionet:ludb:1.0.1'],
  )
  for (const source of REAL_ECG_SOURCE_REGISTRY) {
    assert.equal(source.publisher, 'PhysioNet')
    assert.equal(source.access, 'open')
    assert.equal(source.signalObject, 'wfdb-calibrated-time-series')
    assert.match(source.url, /^https:\/\/physionet\.org\/content\//)
    assert.ok(['CC-BY-4.0', 'ODC-BY-1.0'].includes(source.licenseId))
    assert.equal(source.selectionStatus, 'approved-for-file-level-curation-no-signals-ingested')
  }
  assert.equal(REAL_ECG_CURATION_CONTRACT.language, 'en')
  assert.equal(REAL_ECG_CURATION_CONTRACT.currentState, 'source-contract-only-no-signals-ingested')
  assert.equal(REAL_ECG_CURATION_CONTRACT.firstTranche.targetCases, 30)
  assert.ok(REAL_ECG_CURATION_CONTRACT.prohibited.includes('llm-generated-diagnosis-label'))
})

test('the derivative notice carries attribution, changes and both integrity hashes', () => {
  const notice = readFileSync(
    new URL('../public/clinical-media/echo/A4C_NORMAL_LICENSE.txt', import.meta.url),
    'utf8',
  )
  assert.match(notice, /CardioNetworks \/ Vdbilt/)
  assert.match(notice, /CC BY-SA 3\.0/)
  assert.match(notice, new RegExp(A4C_NORMAL_CLINICAL_STUDIO_ASSET.rights.originalSha1))
  assert.match(notice, new RegExp(A4C_NORMAL_CLINICAL_STUDIO_ASSET.rights.derivativeSha256))
  assert.match(notice, /Masked the burned-in acquisition date and time/)
})
