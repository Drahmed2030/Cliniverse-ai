import test from 'node:test'
import assert from 'node:assert/strict'
import fs from 'node:fs'

const nav = fs.readFileSync(new URL('../app/components/clinical-media/EchoStudyNavigation.tsx', import.meta.url), 'utf8')
const preview = fs.readFileSync(new URL('../app/components/clinical-media/ClinicalMediaPreview.tsx', import.meta.url), 'utf8')
const study = fs.readFileSync(new URL('../app/lib/clinicalMedia/echoPreviewStudy.ts', import.meta.url), 'utf8')

test('study navigation exposes previous, next and clip position semantics', () => {
  assert.match(nav, /Previous Echo clip/)
  assert.match(nav, /Next Echo clip/)
  assert.match(nav, /Clip \{projection\.position\} of \{projection\.total\}/)
})

test('clinical studio renders study navigation only for governed Echo program', () => {
  assert.match(preview, /EchoStudyNavigation study=\{ECHO_A4C_PREVIEW_STUDY\}/)
  assert.match(preview, /program === 'echo-a4c-normal'/)
})

test('preview study uses the governed licensed media asset rather than placeholder clips', () => {
  assert.match(study, /A4C_NORMAL_CLINICAL_STUDIO_ASSET\.cine\.mediaPath/)
  assert.match(study, /clinical-review-required/)
  assert.doesNotMatch(study, /placeholder|dummy|mock/i)
})
