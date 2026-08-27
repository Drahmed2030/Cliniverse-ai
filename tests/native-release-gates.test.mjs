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
  assert.match(workflow, /--logoSplashTargetWidth 960/)
  assert.match(workflow, /EXPECTED_ICON_SOURCE_SHA256=/)
  assert.match(workflow, /node scripts\/sync-brand-icons\.mjs/)
  assert.match(workflow, /sips -g hasAlpha/)
  assert.equal(workflow.includes('npm install @capacitor/core'), false)
  const compatibilityPatch = read('scripts/patch-capacitor-cli-tar.mjs')
  assert.match(compatibilityPatch, /cliPackage\.version !== '6\.2\.1'/)
  assert.match(compatibilityPatch, /tar_1\.extract/)
  assert.match(compatibilityPatch, /Refusing to patch unexpected/)
})

test('native cold launch remains branded until remote content or local recovery is visible', () => {
  const workflow = read('codemagic.yaml')
  const nativeDelegate = read('native/ios/AppDelegate.swift')
  const configurator = read('scripts/configure-ios-launch-guard.mjs')
  const verify = read('scripts/verify-ios-ipa.sh')

  assert.match(workflow, /node scripts\/configure-ios-launch-guard\.mjs/)
  assert.match(nativeDelegate, /CliniverseBridgeViewController/)
  assert.match(nativeDelegate, /UIImage\(named: "Splash"\)/)
  assert.match(nativeDelegate, /observe\(\\\.estimatedProgress/)
  assert.match(nativeDelegate, /errorPathURL/)
  assert.match(nativeDelegate, /DispatchQueue\.main\.asyncAfter\(deadline: \.now\(\) \+ 15/)
  assert.match(configurator, /customClass="CliniverseBridgeViewController"/)
  assert.match(configurator, /0\.03137254901960784/)
  assert.match(verify, /CliniverseLaunchGuardVersion/)
  assert.match(verify, /compiled native launch guard/)
})

test('native and web icon families share one frozen Cliniverse source', () => {
  const source = read('assets/logo.svg').trimEnd()
  const sync = read('scripts/sync-brand-icons.mjs')
  const webIcon = read('public/icons/icon.svg').trimEnd()

  assert.equal(webIcon, source)
  assert.match(sync, /assets\/logo\.svg/)
  assert.match(sync, /public\/icons\/icon-\$\{size\}\.svg/)
  assert.match(sync, /brand icon drift detected/)
})

test('native shell uses HTTPS and blocks cleartext transport', () => {
  const config = JSON.parse(read('capacitor.config.json'))
  assert.equal(config.appId, 'com.cliniverse.ai')
  assert.equal(config.appName, 'Cliniverse AI')
  assert.equal(config.server.url, 'https://www.cliniverseai.com')
  assert.equal(config.server.cleartext, false)
  assert.equal(config.server.errorPath, 'native-offline.html')
  assert.equal(config.ios.backgroundColor, '#080C16')
  const offline = read('public/native-offline.html')
  assert.match(offline, /Connection unavailable/)
  assert.match(offline, /window\.location\.replace\(origin\)/)
  assert.match(offline, /addEventListener\('online', retry\)/)
})

test('native packaging is blocked until the canonical production origin matches the RC commit', () => {
  const workflow = read('codemagic.yaml')
  const verifier = read('scripts/verify-native-release-origin.mjs')
  assert.match(workflow, /CM_COMMIT:\?Codemagic CM_COMMIT is required/)
  assert.match(workflow, /https:\/\/www\.cliniverseai\.com\/api\/release-contract/)
  assert.match(workflow, /verify-native-release-origin\.mjs/)
  assert.match(verifier, /payload\.commit !== expectedCommit/)
  assert.match(verifier, /payload\.environment !== 'production'/)
  assert.match(verifier, /RC BLOCKED:/)
})

test('Apple reviewer package is release-scoped and contains no credentials', () => {
  const reviewer = read('docs/APPLE_RC1_REVIEWER_PACKAGE.md')
  assert.match(reviewer, /PREPARED \/ HOLD — do not submit/)
  assert.match(reviewer, /sign-in-only release/)
  assert.match(reviewer, /fictional simulation data/)
  assert.match(reviewer, /no in-app purchase flow/i)
  assert.match(reviewer, /Store username and password only in App Store Connect/)
  assert.match(reviewer, /Support URL/)
  assert.match(reviewer, /Privacy URL/)
  assert.match(reviewer, /Screenshot contract/)
  assert.equal(/password\s*[:=]\s*\S+/i.test(reviewer), false)

  const waveOne = read('docs/APPLE_WAVE1_RESPONSE_AND_EVIDENCE.md')
  assert.match(waveOne, /Guideline 2\.1/)
  assert.match(waveOne, /Guideline 2\.3\.3/)
  assert.match(waveOne, /Guideline 3\.1\.2/)
  assert.match(waveOne, /Guideline 5\.1\.1/)
  assert.match(waveOne, /physical-device recording/i)
  assert.match(waveOne, /Account creation is disabled in Apple v1/)
  assert.equal(/password\s*[:=]\s*\S+/i.test(waveOne), false)
})
