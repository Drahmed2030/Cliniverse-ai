import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import test from 'node:test'
import { getNexusReference } from '../app/lib/cardiology/nexusReferences.ts'
import { MEDICAL_OPERATIONS_REGISTRY, summarizeEvidenceRegistry } from '../app/lib/evidence/medicalOperationsRegistry.ts'

const read = path => readFileSync(new URL(`../${path}`, import.meta.url), 'utf8')

test('NeuraOps company surface presents Cliniverse as its product without replacing the release entry point', () => {
  const company = read('app/neuraops/page.tsx')
  const releaseEntry = read('app/page.tsx')

  assert.match(company, /Clinical Pathway Replay/)
  assert.match(company, /Medical Operations Registry/)
  assert.match(company, /one operating contract/i)
  assert.match(company, /NeuraOps is the governed operating company/)
  assert.match(company, /Cliniverse AI is its first healthcare product/)
  assert.match(company, /MEDIA &amp; ADOPTION SYSTEM/)
  assert.match(company, /30 SEC/)
  assert.match(company, /90 SEC/)
  assert.match(releaseEntry, /<ReleaseApp/)
  assert.equal(releaseEntry.includes('NeuraOpsPage'), false)
})

test('progressive onboarding collects no identity, patient data or credentials', () => {
  const onboarding = read('app/neuraops/AudienceNavigator.tsx')

  assert.match(onboarding, /No registration and no patient information/)
  assert.match(onboarding, /role="group"/)
  assert.match(onboarding, /aria-pressed=/)
  assert.match(onboarding, /aria-live="polite"/)
  assert.equal(/fetch\(|supabase|localStorage|email|password|patientId/i.test(onboarding), false)
})

test('medical operations registry is source-versioned, regional and human-gated', () => {
  const summary = summarizeEvidenceRegistry()

  assert.equal(summary.sources, 4)
  assert.equal(summary.regions, 3)
  assert.equal(summary.uses, 4)
  assert.equal(summary.linkedPathways, 4)
  assert.equal(summary.humanReviewItems, 1)

  for (const source of MEDICAL_OPERATIONS_REGISTRY) {
    const canonical = getNexusReference(source.id)

    assert.ok(canonical, `${source.id} must resolve from the canonical Nexus registry`)
    assert.equal(source.title, canonical.title)
    assert.equal(source.publisher, canonical.publisher)
    assert.equal(source.versionLabel, canonical.version)
    assert.equal(source.sourceUrl, canonical.sourceUrl)
    assert.deepEqual(source.linkedPathways, canonical.linkedPathwayIds)
    assert.equal(source.operationalRole, canonical.intendedUse)
    assert.equal(source.reviewBoundary, canonical.scope)
    assert.match(source.sourceUrl, /^https:\/\//)
    assert.ok(source.versionLabel.length > 8)
    assert.ok(source.linkedPathways.length > 0)
    assert.match(source.reviewBoundary, /review|prototype|certification/i)
  }
})

test('NeuraOps surface avoids unverified adoption, validation and outcome claims', () => {
  const company = read('app/neuraops/page.tsx')
  const banned = [
    /clinically validated/i,
    /improves patient outcomes/i,
    /trusted by \d+/i,
    /used by \d+ hospitals/i,
    /diagnoses/i,
    /autonomous activation/i,
  ]

  for (const pattern of banned) assert.equal(pattern.test(company), false)
  assert.match(company, /Illustrative and unvalidated/)
  assert.match(company, /Human judgment leads/)
})
