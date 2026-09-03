import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import {
  runPathwayReplay,
  STEMI_REPLAY_DEMO,
} from '../app/lib/cardiology/pathwayReplayAgents.ts'

test('Pathway Replay runs six governed agents in the approved order', () => {
  const report = runPathwayReplay(STEMI_REPLAY_DEMO)

  assert.deepEqual(
    report.agents.map(agent => agent.id),
    [
      'intake-normalization',
      'timeline-integrity',
      'kpi-computation',
      'gap-attribution',
      'training-orchestration',
      'governance-closure',
    ],
  )
  assert.equal(report.agents.length, 6)
  assert.equal(report.agents[3].requiresHumanReview, true)
  assert.equal(report.agents[5].requiresHumanReview, true)
})

test('the synthetic demo calculates traceable KPIs without hiding missing evidence', () => {
  const report = runPathwayReplay(STEMI_REPLAY_DEMO)

  assert.equal(report.dataMode, 'fictional-simulation')
  assert.equal(report.metrics.elapsedMinutes, 12)
  assert.equal(report.metrics.targetMinutes, 10)
  assert.equal(report.metrics.deltaMinutes, 2)
  assert.equal(report.metrics.status, 'at-risk')
  assert.equal(report.metrics.completenessPercent, 86)
  assert.equal(report.events.find(event => event.id === 'ecg')?.integrity, 'delayed')
  assert.equal(report.events.find(event => event.id === 'cath-lab-arrival')?.integrity, 'missing')
  assert.deepEqual(report.gap.evidenceIds, ['arrival', 'ecg'])
  assert.equal(report.gap.requiresHumanReview, true)
  assert.equal(report.training.activityId, 'door-to-ecg-drill-v1')
  assert.match(report.training.label, /ECG Drill/i)
  assert.equal(report.closure.state, 'blocked')
})

test('Pathway Replay rejects real-patient mode and is deterministic', () => {
  assert.throws(
    () => runPathwayReplay({ ...STEMI_REPLAY_DEMO, dataMode: 'real-patient' }),
    /fictional simulation data only/i,
  )

  assert.deepEqual(
    runPathwayReplay(STEMI_REPLAY_DEMO),
    runPathwayReplay(STEMI_REPLAY_DEMO),
  )
})

test('the prototype remains isolated from providers, databases and the Apple release shell', () => {
  const engine = readFileSync(new URL('../app/lib/cardiology/pathwayReplayAgents.ts', import.meta.url), 'utf8')
  const session = readFileSync(new URL('../app/lib/cardiology/pathwaySession.ts', import.meta.url), 'utf8')
  const page = readFileSync(new URL('../app/labs/pathway-replay/page.tsx', import.meta.url), 'utf8')
  const experience = readFileSync(new URL('../app/labs/pathway-replay/PathwayReplayExperience.tsx', import.meta.url), 'utf8')
  const release = readFileSync(new URL('../app/components/ReleaseApp.tsx', import.meta.url), 'utf8')

  for (const prohibited of ['fetch(', 'supabase', '/api/oracle', 'ANTHROPIC_API_KEY']) {
    for (const source of [engine, session, page, experience]) {
      assert.equal(source.includes(prohibited), false)
    }
  }
  assert.equal(release.includes('pathway-replay'), false)
  assert.match(page, /Synthetic data only/i)
  assert.match(page, /Human review required/i)
  assert.match(page, /Back to Cliniverse/i)
  assert.match(experience, /Brief compiled; closure not granted/i)
  assert.match(experience, /Session-only · No upload/i)
})
