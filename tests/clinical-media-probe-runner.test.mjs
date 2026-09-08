import test from 'node:test'
import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'

const runner = await readFile(new URL('../scripts/clinical-media-probe.mjs', import.meta.url), 'utf8')
const manifest = JSON.parse(await readFile(new URL('../docs/echo-media-lab-2026-09-07/pipeline/echo-batch-01-probe-manifest.json', import.meta.url), 'utf8'))

function requireText(fragment) {
  assert.ok(runner.includes(fragment), `Expected probe runner to contain: ${fragment}`)
}

test('runner is exact-SHA bound and does not depend on filenames', () => {
  requireText('const bySha = new Map')
  requireText("blockers: ['exact-sha-file-not-found']")
  assert.equal(manifest.candidates.length, 6)
  for (const candidate of manifest.candidates) assert.match(candidate.derivativeSha256, /^[a-f0-9]{64}$/)
})

test('runner requires ffprobe and full ffmpeg decode', () => {
  requireText("requireTool('ffprobe')")
  requireText("requireTool('ffmpeg')")
  requireText("'-map', '0:v:0'")
  requireText("'-f', 'null'")
})

test('runner records media evidence needed by automated media gate', () => {
  for (const fragment of [
    'videoCodec',
    'audioStreams',
    'videoStreams',
    'width',
    'height',
    'durationMs',
    'frameCount',
    'nominalFps',
    'decodeComplete',
    'unexpectedMetadataPresent',
    'corruptionDetected',
  ]) requireText(fragment)
})

test('runner fails closed on missing file, probe failure, decode failure or corruption', () => {
  requireText('exact-sha-file-not-found')
  requireText('ffprobe-failed')
  requireText('decode-incomplete')
  requireText('corruption-detected')
})

test('runner cannot self-approve governance or learner readiness', () => {
  requireText('technicallyVerified: false')
  requireText('privacyCleared: false')
  requireText('clinicalReviewed: false')
  requireText('learnerEligible: false')
})
