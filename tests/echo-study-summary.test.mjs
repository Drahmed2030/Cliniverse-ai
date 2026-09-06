import test from 'node:test'
import assert from 'node:assert/strict'
import { buildEchoStudySummary } from '../app/lib/competency/echoStudySummary.ts'
import { createEchoStudySession, navigateEchoStudySession } from '../app/lib/competency/echoStudySessionController.ts'
import { createEchoStudyCompetencyState, recordEchoClipCompetency } from '../app/lib/competency/echoStudyCompetencyState.ts'

const study = { schemaVersion:'1.0', studyId:'study-1', title:'Study', studyType:'full-echo-study', modality:'echo', intendedUse:'education-only', clips:[
  { clipId:'c1',assetId:'a1',order:1,view:'A4C',label:'A4C',kind:'cine',mediaPath:'/clinical-media/echo/1.mp4',qaState:'learner-ready',skillIds:['echo.view.a4c-recognition'],assessmentTaskIds:['t1'] },
  { clipId:'c2',assetId:'a2',order:2,view:'PLAX',label:'PLAX',kind:'cine',mediaPath:'/clinical-media/echo/2.mp4',qaState:'learner-ready',skillIds:['echo.view.a4c-recognition'],assessmentTaskIds:[] },
]}
const mastery={ skillId:'echo.view.a4c-recognition',evidenceCount:1,score:100,confidenceCalibration:100,band:'mastered',lastObservedAt:'2026-09-06T10:00:00Z' }

test('summary distinguishes viewed-complete from assessed-complete', () => {
  let session=createEchoStudySession(study)
  session=navigateEchoStudySession({study,session,direction:'next'})
  const summary=buildEchoStudySummary({study,session,competency:null})
  assert.equal(summary.status,'viewed-complete')
  assert.equal(summary.competencyCoveragePercent,0)
})

test('summary exposes deterministic skill signals from clip competency state', () => {
  const session=createEchoStudySession(study)
  let competency=createEchoStudyCompetencyState(study)
  competency=recordEchoClipCompetency({state:competency,study,clipId:'c1',mastery,taskId:'t1',updatedAt:'2026-09-06T10:00:00Z'})
  const summary=buildEchoStudySummary({study,session,competency})
  assert.equal(summary.skillSignals[0].band,'mastered')
  assert.equal(summary.competencyCoveragePercent,50)
})
