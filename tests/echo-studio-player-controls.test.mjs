import test from 'node:test'
import assert from 'node:assert/strict'
import { studioPlayerCapabilities, stepStudioFrame } from '../app/lib/clinicalMedia/studioPlayerCapabilities.ts'

test('DCM review capabilities cannot grant assessment or study progression', () => {
  assert.deepEqual(studioPlayerCapabilities('echo-review'), {
    playback:true, cine:true, frameNavigation:true, studyNavigation:false,
    review:true, assessment:false, learnerReady:false,
  })
})

test('ECG preview has no cine or frame-navigation capability', () => {
  const capabilities=studioPlayerCapabilities('ecg-preview')
  assert.equal(capabilities.playback,true)
  assert.equal(capabilities.cine,false)
  assert.equal(capabilities.frameNavigation,false)
  assert.equal(capabilities.assessment,false)
  assert.equal(capabilities.learnerReady,false)
})

test('Foundation retains preview assessment without learner release authority', () => {
  const capabilities=studioPlayerCapabilities('echo-preview')
  assert.equal(capabilities.assessment,true)
  assert.equal(capabilities.studyNavigation,true)
  assert.equal(capabilities.learnerReady,false)
})

test('frame stepping clamps at source boundaries and rejects invalid frame counts', () => {
  assert.equal(stepStudioFrame(0,-1,44),0)
  assert.equal(stepStudioFrame(43,1,44),43)
  assert.equal(stepStudioFrame(22,-1,44),21)
  assert.equal(stepStudioFrame(22,1,44),23)
  for(const count of [0,-1,NaN,Infinity,1.5])assert.equal(stepStudioFrame(12,1,count),0)
  assert.equal(stepStudioFrame(NaN,1,44),0)
})
