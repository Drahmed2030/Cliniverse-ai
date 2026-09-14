import test from 'node:test'
import assert from 'node:assert/strict'
import { createHash } from 'node:crypto'
import { readFileSync } from 'node:fs'
import { batch20 } from '../content/medical/batch20.ts'
import { caseMediaLinks, mediaForCase, deferredCaseMedia } from '../content/medical/caseMedia.ts'

test('the linked cine matches the frozen derivative bytes and attribution', () => {
  assert.equal(caseMediaLinks.length, 1)
  const link = mediaForCase('a4c-orientation')
  const bytes = readFileSync(new URL('../public/clinical-media/echo/a4c-normal-cardionetworks-v1.mp4', import.meta.url))
  assert.equal(createHash('sha256').update(bytes).digest('hex'), link.sha256)
  assert.equal(link.href, '/labs/echo-account-review?from=a4c-orientation')
  assert.equal(link.licenseId, 'CC-BY-SA-3.0')
  assert.ok(link.creator && link.sourceUrl && link.licenseUrl)
})

test('normal A4C is not silently reused for pathology or ECG cases', () => {
  for (const c of batch20.filter(c => c.id !== 'a4c-orientation')) assert.equal(mediaForCase(c.id), undefined)
  assert.equal(deferredCaseMedia.length, 5)
  for (const c of deferredCaseMedia) {
    assert.ok(batch20.some(item => item.id === c.caseId))
    assert.equal('href' in c, false)
    assert.ok(c.reason)
  }
})

test('owner text-review confirmation is tied to the exact current snapshot', () => {
  const confirmation = JSON.parse(readFileSync(new URL('../content/medical/batch20-review-confirmation.json', import.meta.url)))
  const bytes = readFileSync(new URL('../content/medical/batch20.ts', import.meta.url))
  assert.equal(confirmation.snapshotSha256, createHash('sha256').update(bytes).digest('hex'))
  assert.equal(confirmation.caseCount, batch20.length)
  assert.equal(confirmation.status, 'user-confirmed')
})
