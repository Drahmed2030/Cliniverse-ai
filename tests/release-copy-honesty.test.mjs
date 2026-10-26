import test from 'node:test'
import assert from 'node:assert/strict'
import fs from 'node:fs'
import { evaluateEcgLearnerAvailability } from '../app/lib/competency/ecgLearnerAvailability.ts'
import { BLS_LESSONS } from '../app/lib/codelab/blsLessons.ts'
import { ACLS_LESSONS } from '../app/lib/codelab/aclsLessons.ts'

// Release copy must describe what a learner can actually do today. These tests read the real availability
// decisions and the real gates and compare them with the English copy the release displays
// (Arabic is not displayed: PaywallScreen never passes a locale; the Arabic strings are kept in parity below).
const read = p => fs.readFileSync(new URL(`../${p}`, import.meta.url), 'utf8')
const paywall = read('app/components/PaywallSheet.tsx')
const learn = read('app/components/release/LearnTracks.tsx')
const freeNotes = [...paywall.matchAll(/freeNote: "([^"]+)"/g)].map(m => m[1])
const [freeEn, freeAr] = freeNotes
const learnEntry = id => learn.match(new RegExp(`\\{ id:'${id}'[^}]*description:'([^']+)'`))[1]

test('ECG: while the learner experience is HELD, no copy offers it; it says ECG practice is being prepared', () => {
  const availability = evaluateEcgLearnerAvailability()
  assert.equal(availability.state, 'held', 'ECG availability changed — review every ECG sentence in Paywall, Learn and Onboarding copy before updating this test')
  assert.match(learnEntry('ecg'), /ECG practice is being prepared\./)
  const [listed, ...tail] = freeEn.split('ECG practice is being prepared.')
  assert.equal(tail.length, 1, 'the paywall free note carries the "being prepared" sentence exactly once')
  assert.doesNotMatch(listed, /\bECG\b/, 'ECG is not in the included-free list')
  assert.match(freeAr, /تدريب ECG قيد الإعداد/)
  assert.doesNotMatch(freeAr.split('تدريب ECG قيد الإعداد')[0], /ECG/)
  // the PRO groups never mention ECG
  const groups = [...paywall.matchAll(/groups: \[([\s\S]*?)\] as CapabilityGroup\[\]/g)].map(m => m[1]).join('\n')
  assert.doesNotMatch(groups, /ECG/)
})

test('Echo: copy says one introductory study, and exactly one licensed study exists', () => {
  const clips = fs.readdirSync(new URL('../public/clinical-media/echo', import.meta.url)).filter(f => /\.(mp4|mov|webm)$/.test(f))
  assert.equal(clips.length, 1, 'more than one Echo clip exists — review the "one introductory study" copy')
  assert.match(learnEntry('echo'), /^One introductory study:/)
  assert.match(freeEn, /Echo \(one introductory study\)/)
  assert.match(freeAr, /Echo \(دراسة تمهيدية واحدة\)/)
})

test('Code Lab: the free allowance in the copy equals the gate, per track', () => {
  const hub = read('app/components/ward/CodeLabHub.tsx')
  const freeOrders = Number(hub.match(/return lessonOrder <= (\d+);/)[1])
  assert.equal(freeOrders, 2)
  assert.deepEqual([BLS_LESSONS.length, ACLS_LESSONS.length], [6, 6])
  assert.match(freeEn, /first two lessons of each Code Lab track/)
  assert.match(paywall, /Code Lab — all BLS and ACLS lessons \(the first two lessons of each track are free\)/)
  assert.match(paywall, /Code Lab — جميع دروس BLS وACLS \(أول درسين من كل مسار مجانيان\)/)
  assert.match(freeAr, /أول درسين من كل مسار في Code Lab/)
})

test('1.1 keeps currently open features free: no entitlement reference was added to them', () => {
  for (const [name, path] of [['Resuscitation', 'app/labs/resuscitation-hub'], ['Pathway Replay', 'app/labs/pathway-replay'], ['Clinical Reference', 'app/labs/clinical-reference']]) {
    for (const file of fs.readdirSync(new URL(`../${path}`, import.meta.url)).filter(f => /\.(ts|tsx)$/.test(f))) {
      assert.doesNotMatch(read(`${path}/${file}`), /useCliniverseSubscription|canAccessPremium|entitlement|\bisPro\b|premium|openPaywall/i, `${name}: ${file}`)
    }
  }
  const ward = read('app/components/ward/index.tsx')
  assert.match(ward, /label: 'Handover Practice',[\s\S]*?premium: false/)
  assert.match(ward, /label: 'Cardiology Operations',[\s\S]*?premium: true/)
  assert.match(ward, /label: 'Nexus Learning',[\s\S]*?premium: true/)
  assert.match(read('app/components/ward/WardHome.tsx'), /const caseUnlocked = isPro \|\| patient\.id === 'w1'/)
})
