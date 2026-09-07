#!/usr/bin/env node

import { execFileSync } from 'node:child_process'

const [contractUrl, expectedCommit, mode] = process.argv.slice(2)
const allowScreenshotNativeDelta = mode === '--allow-screenshot-native-delta'

function block(message) {
  console.error(`RC BLOCKED: ${message}`)
  process.exit(2)
}

if (!contractUrl || !expectedCommit) {
  block('provide the release-contract URL and expected commit')
}

if (mode && !allowScreenshotNativeDelta) {
  block(`unsupported verification mode: ${mode}`)
}

if (!/^[0-9a-f]{40}$/.test(expectedCommit)) {
  block('expected commit must be a full lowercase Git SHA')
}

let url
try {
  url = new URL(contractUrl)
} catch {
  block('release-contract URL is invalid')
}

if (url.origin !== 'https://www.cliniverseai.com' || url.pathname !== '/api/release-contract') {
  block(`unexpected native release origin: ${url.origin}${url.pathname}`)
}

let response
try {
  response = await fetch(url, {
    headers: { Accept: 'application/json' },
    cache: 'no-store',
    redirect: 'error',
  })
} catch (error) {
  block(`canonical production origin is unavailable: ${error.message}`)
}

if (!response.ok) {
  block(`release contract returned HTTP ${response.status}`)
}

let payload
try {
  payload = await response.json()
} catch {
  block('release contract did not return JSON')
}

if (payload.product !== 'Cliniverse AI' || payload.channel !== 'apple-v1') {
  block('release contract identifies an unexpected product or channel')
}

if (payload.environment !== 'production') {
  block(`canonical origin is not production (${String(payload.environment)})`)
}

if (payload.commit === expectedCommit) {
  console.log(`PASS: canonical production origin matches RC commit ${expectedCommit}`)
  process.exit(0)
}

if (!allowScreenshotNativeDelta) {
  block(`production commit ${String(payload.commit)} does not match RC commit ${expectedCommit}`)
}

const productionCommit = String(payload.commit)
if (!/^[0-9a-f]{40}$/.test(productionCommit)) {
  block('production release contract returned an invalid Git SHA')
}

function git(args) {
  try {
    return execFileSync('git', args, {
      encoding: 'utf8',
      stdio: ['ignore', 'pipe', 'pipe'],
    }).trim()
  } catch (error) {
    const stderr = String(error?.stderr || '').trim()
    block(`Git verification failed for ${args[0]}${stderr ? `: ${stderr}` : ''}`)
  }
}

function ensureCommit(commit) {
  try {
    execFileSync('git', ['cat-file', '-e', `${commit}^{commit}`], { stdio: 'ignore' })
  } catch {
    git(['fetch', '--quiet', '--no-tags', 'origin', commit])
    git(['cat-file', '-e', `${commit}^{commit}`])
  }
}

ensureCommit(productionCommit)
ensureCommit(expectedCommit)

try {
  execFileSync('git', ['merge-base', '--is-ancestor', productionCommit, expectedCommit], {
    stdio: 'ignore',
  })
} catch {
  block(`production commit ${productionCommit} is not an ancestor of screenshot commit ${expectedCommit}`)
}

const changedFiles = git([
  'diff',
  '--name-only',
  '--diff-filter=ACDMRTUXB',
  `${productionCommit}..${expectedCommit}`,
]).split('\n').filter(Boolean)

const allowedScreenshotDelta = (path) =>
  path === 'codemagic.yaml' ||
  path === 'scripts/verify-native-release-origin.mjs' ||
  path.startsWith('native/') ||
  path.startsWith('tests/') ||
  path.startsWith('docs/')

const webRuntimeChanges = changedFiles.filter((path) => !allowedScreenshotDelta(path))
if (webRuntimeChanges.length > 0) {
  block(`screenshot commit changes web runtime files: ${webRuntimeChanges.join(', ')}`)
}

console.log(
  `PASS: screenshot evidence commit ${expectedCommit} is web-compatible with production ${productionCommit}; ` +
  `${changedFiles.length} native/evidence file(s) changed`,
)
