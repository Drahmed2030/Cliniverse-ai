import test from 'node:test'
import assert from 'node:assert/strict'
import { createEchoStudySession, navigateEchoStudySession, projectEchoStudySession } from '../app/lib/competency/echoStudySessionController.ts'

const study = { schemaVersion:'1.0', studyId:'study-1', title:'Study', studyType:'full-echo-study', modality:'echo', intendedUse:'education-only', clips:[
  { clipId:'c1',assetId:'a1',order:1,view:'A4C',label:'A4C',kind:'cine',mediaPath:'/clinical-media/echo/1.mp4',qaState:'learner-ready',skillIds:['echo.view.a4c-recognition'],assessmentTaskIds:[] },
  { clipId:'c2',assetId:'a2',order:2,view:'PLAX',label:'PLAX',kind:'cine',mediaPath:'/clinical-media/echo/2.mp4',qaState:'learner-ready',skillIds:['echo.view.a4c-recognition'],assessmentTaskIds:[] },
  { clipId:'c3',assetId:'a3',order:3,view:'PSAX',label:'PSAX',kind:'cine',mediaPath:'/clinical-media/echo/3.mp4',qaState:'learner-ready',skillIds:['echo.view.a4c-recognition'],assessmentTaskIds:[] },
]}

test('session navigates next and previous without competency state', () => {
  let session=createEchoStudySession(study)
  session=navigateEchoStudySession({study,session,direction:'next'})
  assert.equal(session.activeClipId,'c2')
  session=navigateEchoStudySession({study,session,direction:'previous'})
  assert.equal(session.activeClipId,'c1')
})

test('navigation stops safely at study boundaries', () => {
  const session=createEchoStudySession(study)
  const unchanged=navigateEchoStudySession({study,session,direction:'previous'})
  assert.deepEqual(unchanged,session)
})

test('viewer and competency progress remain separate projections', () => {
  let session=createEchoStudySession(study)
  session=navigateEchoStudySession({study,session,direction:'next'})
  const projection=projectEchoStudySession({study,session,competency:null})
  assert.equal(projection.position,2)
  assert.equal(projection.viewingProgressPercent,67)
  assert.equal(projection.visitedPercent,67)
  assert.equal(projection.competencyCoveragePercent,0)
})
