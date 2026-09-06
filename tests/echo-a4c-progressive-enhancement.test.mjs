import test from 'node:test'
import assert from 'node:assert/strict'
import fs from 'node:fs'

const source = fs.readFileSync(new URL('../app/components/clinical-media/EchoA4cLesson.tsx', import.meta.url), 'utf8')

test('A4C lesson keeps competency integration behind preview adapter', () => {
  assert.match(source, /submitEchoPreviewCompetency/)
  assert.doesNotMatch(source, /createClient|supabase/i)
})

test('A4C lesson degrades competency without throwing through the studio', () => {
  assert.match(source, /Progressive enhancement: competency failure must never break the governed lesson/)
  assert.match(source, /setCompetencyStatus\('degraded'\)/)
})

test('A4C lesson captures learner confidence and exposes non-certification boundary', () => {
  assert.match(source, /aria-label="Confidence"/)
  assert.match(source, /not certification, clinical validation or medical approval/i)
})
