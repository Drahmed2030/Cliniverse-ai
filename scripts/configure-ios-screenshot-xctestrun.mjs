#!/usr/bin/env node

import { readFile, writeFile } from 'node:fs/promises'

const [inputPath, outputPath, deviceClass] = process.argv.slice(2)

if (!inputPath || !outputPath || !deviceClass) {
  console.error('Usage: configure-ios-screenshot-xctestrun.mjs <input.json> <output.json> <device-class>')
  process.exit(64)
}

const email = process.env.SCREENSHOT_REVIEW_EMAIL?.trim()
const password = process.env.SCREENSHOT_REVIEW_PASSWORD

if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
  console.error('RC BLOCKED: secure SCREENSHOT_REVIEW_EMAIL is missing or invalid.')
  process.exit(1)
}

if (!password || password.length < 8) {
  console.error('RC BLOCKED: secure SCREENSHOT_REVIEW_PASSWORD is missing or invalid.')
  process.exit(1)
}

const document = JSON.parse(await readFile(inputPath, 'utf8'))
let configuredTargets = 0

function configure(node) {
  if (!node || typeof node !== 'object') return

  if (
    typeof node.TestBundlePath === 'string' &&
    node.TestBundlePath.includes('CliniverseScreenshots')
  ) {
    node.EnvironmentVariables = {
      ...(node.EnvironmentVariables || {}),
      SCREENSHOT_REVIEW_EMAIL: email,
      SCREENSHOT_REVIEW_PASSWORD: password,
      SCREENSHOT_DEVICE_CLASS: deviceClass,
    }
    configuredTargets += 1
  }

  for (const value of Object.values(node)) {
    if (value && typeof value === 'object') configure(value)
  }
}

configure(document)

if (configuredTargets < 1) {
  console.error('RC BLOCKED: CliniverseScreenshots was not found in the generated xctestrun file.')
  process.exit(1)
}

await writeFile(outputPath, `${JSON.stringify(document, null, 2)}\n`, { mode: 0o600 })
console.log(`Configured ${configuredTargets} screenshot test target(s) for ${deviceClass}.`)
