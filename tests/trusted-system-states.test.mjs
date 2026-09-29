import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'

import { evidencePresentationState } from '../app/lib/trust/trustedSurfaceState.ts'

test('permission-limited evidence remains explicit and never becomes empty or normal', () => {
  assert.deepEqual(
    evidencePresentationState({
      availability: 'permission-limited',
      freshness: 'unknown',
      verification: 'unknown',
      sourceAuthority: 'health-cloud-context',
    }),
    {
      state: 'permission-limited',
      reason: 'Access is limited. This does not mean the evidence is absent or normal.',
    },
  )
})

test('stale evidence stays stale even when available', () => {
  assert.deepEqual(
    evidencePresentationState({
      availability: 'available',
      freshness: 'stale',
      verification: 'verified',
      provenanceRef: 'evidence://example/v1',
      sourceAuthority: 'source-system',
    }),
    {
      state: 'stale',
      reason: 'Evidence exists, but freshness is not confirmed.',
    },
  )
})

test('only fully trusted evidence resolves ready', () => {
  assert.equal(
    evidencePresentationState({
      availability: 'available',
      freshness: 'current',
      verification: 'verified',
      provenanceRef: 'evidence://example/v1',
      sourceAuthority: 'cliniverse-governed',
    }).state,
    'ready',
  )
})

test('release loading state uses the shared trusted system-state primitive', () => {
  const release = readFileSync(new URL('../app/components/ReleaseApp.tsx', import.meta.url), 'utf8')
  assert.match(release, /SurfaceState/)
  assert.match(release, /kind="loading"/)
})

test('account identity no longer uses gold as decorative branding', () => {
  const css = readFileSync(new URL('../app/commercial-visual-system.css', import.meta.url), 'utf8')
  const avatar = css.match(/\.cv-me-avatar\s*\{[\s\S]*?\}/)?.[0] || ''
  assert.match(avatar, /--cv-blue/)
  assert.doesNotMatch(avatar, /--cv-gold/)
})
