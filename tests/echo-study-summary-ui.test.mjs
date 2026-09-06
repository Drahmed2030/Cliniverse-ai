import test from 'node:test'
import assert from 'node:assert/strict'
import fs from 'node:fs'

const preview = fs.readFileSync(new URL('../app/components/clinical-media/ClinicalMediaPreview.tsx', import.meta.url), 'utf8')
const lesson = fs.readFileSync(new URL('../app/components/clinical-media/EchoA4cLesson.tsx', import.meta.url), 'utf8')
const navigation = fs.readFileSync(new URL('../app/components/clinical-media/EchoStudyNavigation.tsx', import.meta.url), 'utf8')
const summary = fs.readFileSync(new URL('../app/components/clinical-media/EchoStudySummaryPanel.tsx', import.meta.url), 'utf8')

test('Clinical Studio owns Echo session and competency state without a global store', () => {
  assert.match(preview, /createEchoStudySession/)
  assert.match(preview, /createEchoStudyCompetencyState/)
  assert.doesNotMatch(preview, /redux|zustand|createContext/i)
})

test('lesson emits a competency signal instead of importing study summary logic', () => {
  assert.match(lesson, /onCompetencySignal/)
  assert.doesNotMatch(lesson, /EchoStudySummaryPanel|buildEchoStudySummary/)
})

test('navigation supports controlled state while retaining standalone fallback', () => {
  assert.match(navigation, /controlledSession \?\? internalSession/)
  assert.match(navigation, /onSessionChange/)
})

test('summary does not invent a next case when the governed batch has none', () => {
  assert.match(summary, /recommendation unlocks when another learner-ready Echo case/i)
})
