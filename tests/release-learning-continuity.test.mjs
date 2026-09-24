import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'

const read = path => readFileSync(new URL('../' + path, import.meta.url), 'utf8')
const app = read('app/components/ReleaseApp.tsx')
const learn = read('app/components/release/LearnTracks.tsx')
const progress = read('app/components/release/ProgressTrajectory.tsx')
const nav = read('app/components/ReleaseNav.tsx')

test('release continuity keeps Today, Learn and Progress on one canonical navigation model', () => {
  assert.deepEqual([...nav.matchAll(/label: '([^']+)'/g)].map(match => match[1]), ['Today','Learn','Progress','Explore','Me'])
  assert.match(app, /<TodaySurface actorId=\{accountId\} onNavigate=\{goTab\} \/>/)
  assert.match(app, /<LearnTracks actorId=\{accountId\} onOpenWorkspace=\{openWorkspace\} \/>/)
  assert.match(app, /<ProgressTrajectory includeWard=\{showWardPractice\}[\s\S]*?onOpenLearn=\{\(\) => onNavigate\('learn'\)\}/)
})

test('Core Learn and Progress share ECG, Echo and Ward destinations without legacy lab routes', () => {
  const core = learn.slice(learn.indexOf('const CORE:'), learn.indexOf('const ADVANCED:'))
  assert.match(core, /id:\s*'ecg'[\s\S]*?href:\s*'\/learn\/ecg'/)
  assert.match(core, /id:\s*'echo'[\s\S]*?href:\s*'\/learn\/echo'/)
  assert.match(core, /id:\s*'ward'[\s\S]*?workspace:\s*'ward'/)
  assert.doesNotMatch(core, /\/labs\/ecg-challenge|\/labs\/echo-preview/)
  assert.match(progress, /ecg: \{ accent: 'var\(--cv-teal\)', href: '\/learn\/ecg' \}/)
  assert.match(progress, /echo: \{ accent: 'var\(--cv-violet\)', href: '\/learn\/echo' \}/)
  assert.match(progress, /ward: \{ accent: 'var\(--cv-blue\)', href: null \}/)
})

test('Connected Practice records account-scoped activity and excludes institutional onboarding', () => {
  assert.match(learn, /const LEARN_COLLECTION_IDS = \['cardiology-practice','acute-care-foundations'\] as const/)
  assert.match(learn, /appendCliniverseEvent\(window\.localStorage, actorId/)
  assert.match(learn, /name:'collection\.started'/)
  assert.doesNotMatch(learn, /resident-onboarding/)
})
