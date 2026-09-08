import assert from 'node:assert/strict'
import test from 'node:test'
import { readFile } from 'node:fs/promises'

const SOURCE_URL = new URL('../app/lib/clinicalMedia/clinicalMediaPrivacyEscalation.ts', import.meta.url)
const source = await readFile(SOURCE_URL, 'utf8')

function requireText(fragment) {
  assert.ok(source.includes(fragment), `Expected privacy escalation contract to contain: ${fragment}`)
}

test('automation can never self-clear privacy', () => {
  requireText('privacyCleared: false')
  requireText('humanAttestationRequired: true')
  requireText("'CLEAR_CANDIDATE' | 'HUMAN_REVIEW' | 'REJECT'")
})

test('direct identifier findings fail closed', () => {
  for (const blocker of [
    'metadata-identifiers-detected',
    'burned-in-identifiers-detected',
    'disallowed-date-time-detected',
    'dicom-direct-identifier-tags-detected',
  ]) requireText(blocker)
  requireText("? 'REJECT'")
})

test('uncertainty escalates to human review', () => {
  for (const reason of [
    'metadata-identifier-status-unknown',
    'burned-in-identifier-status-unknown',
    'date-time-status-unknown',
    'residual-annotations-require-human-acceptance',
    'privacy-scan-confidence-below-threshold',
    'privacy-scan-confidence-not-recorded',
  ]) requireText(reason)
  requireText("? 'HUMAN_REVIEW'")
})

test('CT requires explicit DICOM identifier-tag status', () => {
  requireText("evidence.modality === 'CT'")
  requireText('dicom-identifier-tag-status-unknown')
})

test('privacy scan is SHA-bound and requires provenance', () => {
  requireText('artifactSha256 must be a SHA256 hex digest')
  requireText('provenance-record-missing')
  requireText('privacy-scan-incomplete')
})

test('batch summary preserves human attestation requirement', () => {
  requireText('clearCandidates')
  requireText('humanReview')
  requireText('rejected')
  requireText('humanAttestationRequired: true')
})
