import assert from 'node:assert/strict'
import fs from 'node:fs'
import test from 'node:test'

function read(path) {
  return fs.readFileSync(new URL(`../${path}`, import.meta.url), 'utf8')
}

test('screenshot evidence is an isolated non-publishing Codemagic workflow', () => {
  const workflow = read('codemagic.yaml')
  const evidence = workflow.slice(workflow.indexOf('  ios-screenshot-evidence:'))

  assert.match(evidence, /name: Cliniverse AI iPhone and iPad Screenshot Evidence/)
  assert.match(evidence, /SCREENSHOT_REVIEW_EMAIL/)
  assert.match(evidence, /SCREENSHOT_REVIEW_PASSWORD/)
  assert.match(evidence, /verify-native-release-origin\.mjs/)
  assert.match(evidence, /install-ios-screenshot-tests\.rb/)
  assert.match(evidence, /run-ios-screenshot-evidence\.sh/)
  assert.match(evidence, /build\/apple-screenshot-evidence\/\*\*\/\*\.png/)
  assert.doesNotMatch(evidence, /Build IPA/)
  assert.doesNotMatch(evidence, /publishing:/)
  assert.doesNotMatch(evidence, /submit_to_(testflight|app_store)/)
})

test('XCUITest captures the six approved surfaces and protects reviewer identity', () => {
  const source = read('native/screenshot/CliniverseScreenshotTests.swift')
  const captures = [...source.matchAll(/capture\("([^"]+)"\)/g)].map(match => match[1])

  assert.deepEqual(captures, [
    '01-home',
    '02-care',
    '03-care-detail',
    '04-intelligence',
    '05-atlas',
    '06-me-privacy',
  ])
  assert.match(source, /SCREENSHOT_REVIEW_EMAIL/)
  assert.match(source, /SCREENSHOT_REVIEW_PASSWORD/)
  assert.match(source, /Privacy & Support/)
  assert.match(source, /Reviewer email must not be visible/)
  assert.match(source, /XCUIScreen\.main\.screenshot\(\)/)
  assert.match(source, /attachment\.lifetime = \.keepAlways/)
  assert.doesNotMatch(source, /capture\([^\n]+\)[\s\S]{0,300}typeText\(/)
})

test('evidence runner validates current Apple dimensions and twelve opaque PNGs', () => {
  const runner = read('scripts/run-ios-screenshot-evidence.sh')

  assert.match(runner, /1320x2868\|1290x2796\|1260x2736/)
  assert.match(runner, /2064x2752\|2048x2732/)
  assert.match(runner, /sips -g hasAlpha/)
  assert.match(runner, /xcresulttool export attachments/)
  assert.match(runner, /\.totalTestCount == 1/)
  assert.match(runner, /Expected twelve final screenshots/)
  assert.match(runner, /status_bar.*override/s)
  assert.match(runner, /trap cleanup EXIT/)
})

test('generated UI test target supports both device families without signing', () => {
  const installer = read('scripts/install-ios-screenshot-tests.rb')

  assert.match(installer, /:ui_test_bundle/)
  assert.match(installer, /TARGETED_DEVICE_FAMILY'\] = '1,2'/)
  assert.match(installer, /CODE_SIGNING_ALLOWED'\] = 'NO'/)
  assert.match(installer, /scheme\.configure_with_targets/)
  assert.match(installer, /scheme\.save_as\(project_path, target_name, true\)/)
})

test('secure reviewer values are injected only from environment at CI runtime', () => {
  const configurator = read('scripts/configure-ios-screenshot-xctestrun.mjs')

  assert.match(configurator, /process\.env\.SCREENSHOT_REVIEW_EMAIL/)
  assert.match(configurator, /process\.env\.SCREENSHOT_REVIEW_PASSWORD/)
  assert.match(configurator, /node\.EnvironmentVariables/)
  assert.equal(/@[A-Za-z0-9.-]+\.[A-Za-z]{2,}/.test(configurator), false)
  assert.equal(/password\s*[:=]\s*['"][^'"]+['"]/i.test(configurator), false)
})
