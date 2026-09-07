import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync, mkdtempSync, writeFileSync, existsSync, rmSync } from 'node:fs'
import { createHash } from 'node:crypto'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { spawnSync } from 'node:child_process'
import { evaluateApicalHcmReadiness, APICAL_HCM_SOURCE_SHA256 } from '../app/lib/clinicalMedia/echoApicalHcmReadiness.ts'

const root = new URL('../', import.meta.url)
const folder = new URL('docs/echo-media-lab-2026-09-07/echo-a4c-apical-hcm-e00291/', root)
const json = name => JSON.parse(readFileSync(new URL(name, folder), 'utf8'))

test('source checksum mismatch blocks processing before output or ffmpeg', () => {
  const temp = mkdtempSync(join(tmpdir(), 'apical-checksum-'))
  try {
    writeFileSync(join(temp, 'wrong.webm'), 'wrong source revision')
    const result = spawnSync('python3', [new URL('scripts/prepare-echo-apical-hcm-derivative.py', root).pathname,
      join(temp, 'wrong.webm'), join(temp, 'absent.html'), join(temp, 'output')], { encoding: 'utf8' })
    assert.equal(result.status, 1)
    assert.match(result.stderr, /Source checksum mismatch/)
    assert.equal(existsSync(join(temp, 'output')), false)
  } finally {
    rmSync(temp, { recursive: true, force: true })
  }
})

test('exact source-to-derivative binding and all frame timestamps are recorded', () => {
  const t = json('technical.json')
  const e = json('evidence.json')
  assert.equal(t.sourceSha256, APICAL_HCM_SOURCE_SHA256)
  assert.equal(t.derivativeSha256, 'd7bd8c51449596da112362d7747f67d2fedec979f0a5327b748ebd5d8984260e')
  assert.equal(e.derivativeSha256, t.derivativeSha256)
  assert.equal(t.derivativeBytes, 336958)
  assert.equal(t.before.frameCount, 50)
  assert.equal(t.after.frameCount, 50)
  assert.deepEqual(t.after.timestampsSeconds, t.before.timestampsSeconds)
  assert.ok(t.after.timestampsSeconds.every((v, i, a) => i === 0 || v > a[i - 1]))
  assert.equal(t.after.width, t.before.width + 1)
  assert.equal(t.after.height, t.before.height)
  assert.deepEqual(t.after.audioStreams, [])
  assert.equal(t.crop, null)
  assert.equal(t.mask, null)
  assert.equal(t.interpolation, false)
})

test('recorded readiness remains held and all prohibited teaching claims persist', () => {
  const e = json('evidence.json')
  assert.deepEqual(json('readiness.json'), evaluateApicalHcmReadiness(null, null))
  assert.equal(e.learnerReady, false)
  assert.equal(e.binaryCommitEligible, false)
  for (const claim of ['wall-thickness-measurement', 'chamber-measurement', 'lvot-obstruction-inference',
    'doppler-severity', 'genotype-inference', 'prognosis', 'treatment-recommendation',
    'independent-hcm-diagnosis', 'exclusion-of-alternative-pathology', 'numerical-ef',
    'learner-discrimination-before-specialist-approval']) assert.ok(e.prohibitedClaims.includes(claim), claim)
})

test('Foundation, DCM evidence and frozen Studio files remain byte-identical', () => {
  for (const [path, expected] of Object.entries(json('frozen-assets.json'))) {
    const actual = createHash('sha256').update(readFileSync(new URL(path, root))).digest('hex')
    assert.equal(actual, expected, path)
  }
})
