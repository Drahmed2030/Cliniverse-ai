import test from 'node:test'
import assert from 'node:assert/strict'
import { evaluateEchoMedia2026, canReplaceFoundationReference } from '../app/lib/clinicalMedia/echoMediaStandard2026.ts'

const foundation = evaluateEchoMedia2026({
  candidateId:'foundation-a4c',sourcePageUrl:'x',sourceDate:'2007-10-01',width:624,height:480,durationMs:980,framesPerSecond:51,view:'A4C',intendedUse:'education-only',licenseId:'CC-BY-SA-3.0',vrtConfirmed:true,provenanceVerified:true,privacyReviewed:true,directIdentifiersVisible:false,unexpectedAudio:false,clinicallySuitableForViewRecognition:true,clinicallySuitableForDiscrimination:false,mobileReadable:true,ipadReadable:true,desktopReadable:true,distractingOverlays:false,
})

test('foundation A4C cannot be silently promoted to gold when score is below threshold',()=>{
  assert.notEqual(foundation.releaseTier,'gold')
})

test('challenger must clear all blocking gates before gold promotion',()=>{
  const blocked=evaluateEchoMedia2026({
    candidateId:'blocked',sourcePageUrl:'x',sourceDate:'2026-01-01',width:1920,height:1080,durationMs:1800,framesPerSecond:60,view:'A4C',intendedUse:'education-only',licenseId:'CC-BY-SA-3.0',vrtConfirmed:true,provenanceVerified:true,privacyReviewed:false,directIdentifiersVisible:false,unexpectedAudio:false,clinicallySuitableForViewRecognition:true,clinicallySuitableForDiscrimination:true,mobileReadable:true,ipadReadable:true,desktopReadable:true,distractingOverlays:false,
  })
  assert.equal(blocked.releaseTier,'foundation')
  assert.ok(blocked.blockingIssues.includes('privacy-not-reviewed'))
})

test('replacement requires a meaningful quality delta, not novelty alone',()=>{
  const challenger=evaluateEchoMedia2026({
    normalReferenceConfirmed:true,motionContinuous:true,clinicalReviewComplete:true,candidateId:'gold-a4c',sourcePageUrl:'x',sourceDate:'2026-01-01',width:1920,height:1080,durationMs:1800,framesPerSecond:60,view:'A4C',intendedUse:'education-only',licenseId:'CC-BY-SA-3.0',vrtConfirmed:true,provenanceVerified:true,privacyReviewed:true,directIdentifiersVisible:false,unexpectedAudio:false,clinicallySuitableForViewRecognition:true,clinicallySuitableForDiscrimination:true,mobileReadable:true,ipadReadable:true,desktopReadable:true,distractingOverlays:false,
  })
  assert.equal(challenger.releaseTier,'gold')
  assert.equal(canReplaceFoundationReference({foundation,challenger}),true)
})

const reviewedGold = {
  candidateId: 'reviewed', sourcePageUrl: 'https://example.invalid/reviewed', sourceDate: '2026-01-01',
  width: 1920, height: 1080, durationMs: 1800, framesPerSecond: 60, view: 'A4C', intendedUse: 'education-only',
  licenseId: 'CC-BY-SA-3.0', vrtConfirmed: true, provenanceVerified: true, privacyReviewed: true,
  directIdentifiersVisible: false, unexpectedAudio: false, clinicallySuitableForViewRecognition: true,
  clinicallySuitableForDiscrimination: true, mobileReadable: true, ipadReadable: true, desktopReadable: true,
  distractingOverlays: false, normalReferenceConfirmed: true, motionContinuous: true, clinicalReviewComplete: true,
}

for (const [field, value, blocker] of [
  ['normalReferenceConfirmed', false, 'normal-reference-not-confirmed'],
  ['motionContinuous', false, 'motion-continuity-not-confirmed'],
  ['clinicalReviewComplete', undefined, 'clinical-review-incomplete'],
  ['distractingOverlays', true, 'distracting-overlays'],
  ['clinicallySuitableForDiscrimination', false, 'not-suitable-for-discrimination'],
  ['mobileReadable', false, 'not-mobile-readable'],
  ['view', 'A3C', 'not-a4c'],
  ['framesPerSecond', NaN, 'invalid-media-metadata'],
]) {
  test(`high resolution cannot compensate for ${blocker}`, () => {
    const score = evaluateEchoMedia2026({ ...reviewedGold, [field]: value })
    assert.ok(score.blockingIssues.includes(blocker))
    assert.equal(canReplaceFoundationReference({ foundation, challenger: score }), false)
  })
}
