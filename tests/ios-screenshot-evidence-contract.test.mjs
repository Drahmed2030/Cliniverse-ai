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
  assert.match(evidence, /--allow-screenshot-native-delta/)
  assert.match(evidence, /install-ios-screenshot-tests\.rb/)
  assert.match(evidence, /run-ios-screenshot-evidence\.sh/)
  assert.match(evidence, /build\/apple-screenshot-evidence\/\*\*\/\*\.png/)
  assert.match(evidence, /build\/apple-screenshot-evidence\/diagnostics\/\*\*\/\*/)
  assert.doesNotMatch(evidence, /Build IPA/)
  assert.doesNotMatch(evidence, /publishing:/)
  assert.doesNotMatch(evidence, /submit_to_(testflight|app_store)/)
})

test('screenshot origin compatibility allows only audited non-web deltas', () => {
  const verifier = read('scripts/verify-native-release-origin.mjs')

  assert.match(verifier, /merge-base', '--is-ancestor'/)
  assert.match(verifier, /--diff-filter=ACDMRTUXB/)
  assert.match(verifier, /path === 'codemagic\.yaml'/)
  assert.match(verifier, /path === 'scripts\/verify-native-release-origin\.mjs'/)
  assert.match(verifier, /path\.startsWith\('native\/'\)/)
  assert.match(verifier, /path\.startsWith\('tests\/'\)/)
  assert.match(verifier, /path\.startsWith\('docs\/'\)/)
  assert.match(verifier, /screenshot commit changes web runtime files/)
  assert.doesNotMatch(verifier, /path\.startsWith\('app\/'\)/)
  assert.doesNotMatch(verifier, /path\.startsWith\('public\/'\)/)
})

test('XCUITest captures the six approved surfaces and protects reviewer identity', () => {
  const source = read('native/screenshot/CliniverseScreenshotTests.swift')
  const authScreen = read('app/components/AuthScreen.tsx')
  const atlasCatalog = read('app/components/release/AtlasReleaseCatalog.tsx')
  const wardHome = read('app/components/ward/WardHome.tsx')
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
  assert.match(source, /app\.links\["Privacy"\]/)
  assert.match(source, /Release safety boundary/)
  assert.match(source, /Reviewer email must not be present/)
  assert.doesNotMatch(source, /for _ in 0\.\.<4 where emailField\.isHittable/)
  assert.match(source, /XCUIScreen\.main\.screenshot\(\)/)
  assert.match(source, /assertSystemChromeClear\("Cliniverse AI"\)/)
  assert.match(source, /assertSystemChromeClear\("PATIENT JOURNEY"\)/)
  assert.match(source, /app\.statusBars\.firstMatch/)
  assert.match(source, /statusBar\.frame\.maxY \+ 4/)
  assert.match(source, /windowWidth >= 700 \? 28 : 60/)
  assert.match(source, /overlaps the iOS status bar/)
  assert.match(source, /failure-accessibility-hierarchy/)
  assert.match(source, /CLINIVERSE_LAYOUT_DIAGNOSTICS/)
  assert.match(source, /cliniverse\.layout\.diagnostics/)
  assert.match(source, /layout-diagnostics-/)
  assert.match(source, /redactedAccessibilityHierarchy/)
  assert.match(source, /XCTContext\.runActivity/)
  assert.match(source, /attachment\.lifetime = \.keepAlways/)
  assert.match(source, /for attempt in 0\.\.<3/)
  assert.match(source, /label ==\[c\] %@/)
  assert.match(source, /Continue with email/)
  assert.match(source, /Sign in/)
  assert.doesNotMatch(source, /app\.buttons\["Continue"\]/)
  assert.match(authScreen, /continueEmail: "Sign in"/)
  assert.match(source, /emailEntry\.isHittable/)
  assert.match(source, /emailField\.waitForExistence\(timeout: 6\)/)
  assert.match(source, /hasKeyboardFocus == true/)
  assert.match(source, /coordinate\(withNormalizedOffset: CGVector\(dx: 0\.5, dy: 0\.5\)\)\.tap\(\)/)
  assert.match(source, /try enter\(password, into: passwordField\)/)
  assert.match(source, /for swipe in 0\.\.\.maximumSwipes/)
  assert.match(source, /element\.exists && element\.isHittable/)
  assert.match(source, /if swipe < maximumSwipes/)
  assert.match(source, /app\.buttons\["Open Hassan Al-Amri simulated case"\]/)
  assert.doesNotMatch(source, /app\.staticTexts\["Hassan Al-Amri"\]/)
  assert.match(source, /CURRENT RELEASE TOUR/)
  assert.doesNotMatch(source, /CURATED CAPABILITY LIBRARY/)
  assert.match(atlasCatalog, /CURRENT RELEASE TOUR/)
  assert.match(wardHome, /`Open \$\{patient\.name\} simulated case`/)
  assert.match(wardHome, /patient\.id === 'w1'/)
  assert.doesNotMatch(source, /capture\([^\n]+\)[\s\S]{0,300}typeText\(/)
})

test('evidence runner validates current Apple dimensions and twelve opaque PNGs', () => {
  const runner = read('scripts/run-ios-screenshot-evidence.sh')
  const buildIndex = runner.indexOf('build-for-testing')
  const iphoneCreateIndex = runner.indexOf('IPHONE_UDID="$(xcrun simctl create')
  const iphoneTestIndex = runner.indexOf('run_device_test "iphone-6.9"')
  const ipadCreateIndex = runner.indexOf('IPAD_UDID="$(xcrun simctl create')

  assert.match(runner, /1320x2868\|1290x2796\|1260x2736/)
  assert.match(runner, /2064x2752\|2048x2732/)
  assert.match(runner, /sips -g hasAlpha/)
  assert.match(runner, /xcresulttool export attachments/)
  assert.match(runner, /\.totalTestCount == 1/)
  assert.match(runner, /Expected twelve final screenshots/)
  assert.match(runner, /export_failure_diagnostics/)
  assert.match(runner, /get test-results tests/)
  assert.match(runner, /test-details\.json/)
  assert.match(runner, /status_bar.*override/s)
  assert.match(runner, /trap cleanup EXIT/)
  assert.match(runner, /-destination "generic\/platform=iOS Simulator"/)
  assert.doesNotMatch(runner, /xcodebuild -quiet/)
  assert.ok(buildIndex >= 0 && buildIndex < iphoneCreateIndex)
  assert.ok(iphoneCreateIndex < iphoneTestIndex && iphoneTestIndex < ipadCreateIndex)
  assert.match(runner, /xctestrun_root="\$\(dirname "\$BASE_XCTESTRUN"\)"/)
  assert.match(runner, /local xctestrun="\$xctestrun_root\/\$device_class\.xctestrun"/)
  assert.doesNotMatch(runner, /local xctestrun="\$WORK_DIR\/\$device_class\.xctestrun"/)
})

test('generated UI test target supports both device families without signing', () => {
  const installer = read('scripts/install-ios-screenshot-tests.rb')

  assert.match(installer, /:ui_test_bundle/)
  assert.match(installer, /product_reference\.path = "#\{target_name\}\.xctest"/)
  assert.match(installer, /PRODUCT_NAME'\] = target_name/)
  assert.match(installer, /PRODUCT_MODULE_NAME'\] = target_name/)
  assert.match(installer, /EXECUTABLE_NAME'\] = target_name/)
  assert.match(installer, /USES_XCTRUNNER'\] = 'YES'/)
  assert.match(installer, /TEST_TARGET_NAME'\] = app_target\.name/)
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
