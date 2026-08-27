import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync, existsSync } from 'node:fs'

function read(path) {
  return readFileSync(new URL(`../${path}`, import.meta.url), 'utf8')
}

test('every iOS package build fails closed when authoritative privacy manifest is missing', () => {
  const workflow = read('codemagic.yaml')
  assert.match(workflow, /PRIVACY_SOURCE="native\/privacy\/PrivacyInfo\.xcprivacy"/)
  assert.match(workflow, /RC BLOCKED:/)
  assert.match(workflow, /exit 1/)
  assert.equal(workflow.includes('RELEASE_CANDIDATE'), false)
})

test('approved privacy manifest is authoritative outside regenerated ios directory', () => {
  const authority = read('native/privacy/README.md')
  const manifest = read('native/privacy/PrivacyInfo.xcprivacy')
  assert.match(authority, /source-of-truth location/i)
  assert.match(authority, /Do \*\*not\*\* create or ship `PrivacyInfo\.xcprivacy` from assumptions/)
  assert.match(authority, /checked-in\/generated `ios\/` directory is not authoritative/i)
  assert.equal(existsSync(new URL('../native/privacy/PrivacyInfo.xcprivacy', import.meta.url)), true)
  assert.match(manifest, /NSPrivacyCollectedDataTypeEmailAddress/)
  assert.match(manifest, /NSPrivacyCollectedDataTypeUserID/)
  assert.match(manifest, /NSPrivacyCollectedDataTypeName/)
  assert.match(manifest, /<key>NSPrivacyTracking<\/key>\s*<false\/>/)
  assert.equal(manifest.includes('NSPrivacyCollectedDataTypeHealth'), false)
})

test('final IPA verification requires privacy manifest and deterministic package identity', () => {
  const verify = read('scripts/verify-ios-ipa.sh')
  assert.match(verify, /com\.cliniverse\.ai/)
  assert.match(verify, /ITSAppUsesNonExemptEncryption/)
  assert.match(verify, /Assets\.car/)
  assert.match(verify, /APP_PATH\/PrivacyInfo\.xcprivacy/)
  assert.match(verify, /public\/native-offline\.html/)
  assert.match(verify, /NSHealthShareUsageDescription/)
  assert.match(verify, /exit 2/)
})

test('generated Xcode target explicitly bundles the app privacy manifest', () => {
  const injector = read('scripts/inject-ios-privacy-manifest.rb')
  const workflow = read('codemagic.yaml')
  assert.match(injector, /resources_build_phase\.add_file_reference/)
  assert.match(injector, /PrivacyInfo\.xcprivacy/)
  assert.match(workflow, /ruby scripts\/inject-ios-privacy-manifest\.rb/)
})

test('native dependency and asset generation are deterministic', () => {
  const workflow = read('codemagic.yaml')
  const pkg = JSON.parse(read('package.json'))
  assert.equal(pkg.devDependencies['@capacitor/assets'], '3.0.5')
  assert.equal(pkg.devDependencies['@capacitor/cli'], '6.2.1')
  assert.equal(pkg.overrides.tar, '7.5.22')
  assert.equal(pkg.overrides.uuid, '11.1.1')
  assert.equal(pkg.scripts.postinstall, 'node scripts/patch-capacitor-cli-tar.mjs')
  assert.match(workflow, /node:\s*22\.14\.0/)
  assert.match(workflow, /script: npm ci/)
  assert.match(workflow, /npx --no-install capacitor-assets generate/)
  assert.match(workflow, /--logoSplashScale 0\.65/)
  assert.match(workflow, /sips -g hasAlpha/)
  assert.equal(workflow.includes('npm install @capacitor/core'), false)
  const compatibilityPatch = read('scripts/patch-capacitor-cli-tar.mjs')
  assert.match(compatibilityPatch, /cliPackage\.version !== '6\.2\.1'/)
  assert.match(compatibilityPatch, /tar_1\.extract/)
  assert.match(compatibilityPatch, /Refusing to patch unexpected/)
})

test('native shell uses HTTPS and blocks cleartext transport', () => {
  const config = JSON.parse(read('capacitor.config.json'))
  assert.equal(config.appId, 'com.cliniverse.ai')
  assert.equal(config.appName, 'Cliniverse AI')
  assert.equal(config.server.url, 'https://cliniverse-ai-u7gi.vercel.app')
  assert.equal(config.server.cleartext, false)
  assert.equal(config.server.errorPath, 'native-offline.html')
  assert.equal(config.ios.backgroundColor, '#080C16')
  const offline = read('public/native-offline.html')
  assert.match(offline, /Connection unavailable/)
  assert.match(offline, /window\.location\.replace\(origin\)/)
  assert.match(offline, /addEventListener\('online', retry\)/)
})
