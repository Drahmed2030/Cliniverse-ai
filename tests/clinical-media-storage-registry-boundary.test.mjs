import assert from 'node:assert/strict'
import test from 'node:test'
import { readFile } from 'node:fs/promises'

const SOURCE_URL = new URL('../app/lib/clinicalMedia/clinicalMediaStorageRegistryBoundary.ts', import.meta.url)
const source = await readFile(SOURCE_URL, 'utf8')

function requireText(fragment) {
  assert.ok(source.includes(fragment), `Expected storage/registry boundary to contain: ${fragment}`)
}

test('registry binds source and derivative checksums', () => {
  requireText("requireSha256(record.sourceSha256, 'sourceSha256')")
  requireText("requireSha256(record.derivativeSha256, 'derivativeSha256')")
})

test('learner distribution requires governed review references', () => {
  requireText("privacy-review-record-missing")
  requireText("clinical-review-record-missing")
  requireText("device-baseline-record-missing")
  requireText("targetStorageClass: 'LEARNER_DISTRIBUTION'")
})

test('quarantined assets stay isolated from governed distribution', () => {
  requireText("storageClass === 'QUARANTINE'")
  requireText("targetStorageClass: 'QUARANTINE'")
  requireText("targetStorageClass: 'GOVERNED'")
})

test('hold, reject and retirement block promotion', () => {
  requireText("asset-retired")
  requireText("governance-hold")
  requireText("governance-rejected")
})

test('asset versioning is immutable and checksum-linked', () => {
  requireText("asset versions must use distinct assetIds")
  requireText("new asset version must not silently reuse an identical derivative checksum")
})
