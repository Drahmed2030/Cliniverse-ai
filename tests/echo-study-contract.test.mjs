import test from 'node:test'
import assert from 'node:assert/strict'
import {
  getEchoStudyCursor,
  orderedEchoStudyClips,
  resolveEchoStudyResumeClip,
  validateEchoStudy,
} from '../app/lib/clinicalMedia/echoStudyContract.ts'

const STUDY = {
  schemaVersion: '1.0',
  studyId: 'echo-study-demo-v1',
  title: 'Governed full Echo study demo',
  studyType: 'full-echo-study',
  modality: 'echo',
  intendedUse: 'education-only',
  clips: [
    {
      clipId: 'clip-a4c',
      assetId: 'asset-a4c',
      order: 1,
      view: 'A4C',
      label: 'Apical four-chamber',
      kind: 'cine',
      mediaPath: '/clinical-media/echo/a4c.mp4',
      qaState: 'learner-ready',
      skillIds: ['echo.view.a4c-recognition'],
      assessmentTaskIds: ['task-a4c'],
      durationMs: 1000,
    },
    {
      clipId: 'clip-plax',
      assetId: 'asset-plax',
      order: 2,
      view: 'PLAX',
      label: 'Parasternal long axis',
      kind: 'cine',
      mediaPath: '/clinical-media/echo/plax.mp4',
      qaState: 'learner-ready',
      skillIds: [],
      assessmentTaskIds: [],
      durationMs: 1200,
    },
    {
      clipId: 'clip-psax',
      assetId: 'asset-psax',
      order: 3,
      view: 'PSAX',
      label: 'Parasternal short axis',
      kind: 'cine',
      mediaPath: '/clinical-media/echo/psax.mp4',
      qaState: 'learner-ready',
      skillIds: [],
      assessmentTaskIds: [],
      durationMs: 900,
    },
  ],
}

test('full Echo studies validate and preserve deterministic clip order', () => {
  assert.doesNotThrow(() => validateEchoStudy(STUDY))
  assert.deepEqual(orderedEchoStudyClips(STUDY).map(clip => clip.clipId), ['clip-a4c', 'clip-plax', 'clip-psax'])
})

test('study cursor exposes previous, next and progress semantics', () => {
  assert.deepEqual(getEchoStudyCursor(STUDY, 'clip-plax'), {
    studyId: 'echo-study-demo-v1',
    clipId: 'clip-plax',
    index: 1,
    position: 2,
    total: 3,
    previousClipId: 'clip-a4c',
    nextClipId: 'clip-psax',
    progressPercent: 67,
    isFirst: false,
    isLast: false,
  })
})

test('resume advances after the last completed clip and remains on final completion', () => {
  assert.equal(resolveEchoStudyResumeClip(STUDY, null), 'clip-a4c')
  assert.equal(resolveEchoStudyResumeClip(STUDY, 'clip-a4c'), 'clip-plax')
  assert.equal(resolveEchoStudyResumeClip(STUDY, 'clip-psax'), 'clip-psax')
})

test('blocked or non-contiguous content fails closed', () => {
  const blocked = {
    ...STUDY,
    clips: STUDY.clips.map((clip, index) => index === 1 ? { ...clip, qaState: 'blocked' } : clip),
  }
  assert.throws(() => validateEchoStudy(blocked), /Blocked Echo clip/)

  const gap = {
    ...STUDY,
    clips: STUDY.clips.map((clip, index) => index === 2 ? { ...clip, order: 4 } : clip),
  }
  assert.throws(() => validateEchoStudy(gap), /contiguous/)
})
