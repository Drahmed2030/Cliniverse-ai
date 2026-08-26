import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync, existsSync } from 'node:fs'

function read(path) {
  return readFileSync(new URL(`../${path}`, import.meta.url), 'utf8')
}

test('release candidate fails closed when authoritative privacy manifest is missing', () => {
  const workflow = read('codemagic.yaml')
  assert.match(workflow, /PRIVACY_SOURCE="native\/privacy\/PrivacyInfo\.xcprivacy"/)
  assert.match(workflow, /RELEASE_CANDIDATE:-false/)
  assert.match(workflow, /RC BLOCKED:/)
  assert.match(workflow, /exit 1/)
})

test('checked-in generated iOS privacy manifest is not treated as release authority', () => {
  const authority = read('native/privacy/README.md')
  assert.match(authority, /source-of-truth location/i)
  assert.match(authority, /Do \*\*not\*\* create or ship `PrivacyInfo\.xcprivacy` from assumptions/)
  assert.match(authority, /checked-in\/generated `ios\/` directory is not authoritative/i)
  assert.equal(existsSync(new URL('../native/privacy/PrivacyInfo.xcprivacy', import.meta.url)), false)
})

test('final IPA verification requires privacy manifest and deterministic package identity', () => {
  const verify = read('scripts/verify-ios-ipa.sh')
  assert.match(verify, /com\.cliniverse\.ai/)
  assert.match(verify, /ITSAppUsesNonExemptEncryption/)
  assert.match(verify, /Assets\.car/)
  assert.match(verify, /PrivacyInfo\.xcprivacy/)
  assert.match(verify, /exit 2/)
})

test('native shell uses HTTPS and blocks cleartext transport', () => {
  const config = JSON.parse(read('capacitor.config.json'))
  assert.equal(config.appId, 'com.cliniverse.ai')
  assert.equal(config.appName, 'Cliniverse AI')
  assert.equal(config.server.url, 'https://cliniverse-ai-u7gi.vercel.app')
  assert.equal(config.server.cleartext, false)
})
