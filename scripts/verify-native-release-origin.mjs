#!/usr/bin/env node

const [contractUrl, expectedCommit] = process.argv.slice(2)

function block(message) {
  console.error(`RC BLOCKED: ${message}`)
  process.exit(2)
}

if (!contractUrl || !expectedCommit) {
  block('provide the release-contract URL and expected commit')
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

if (payload.commit !== expectedCommit) {
  block(`production commit ${String(payload.commit)} does not match RC commit ${expectedCommit}`)
}

console.log(`PASS: canonical production origin matches RC commit ${expectedCommit}`)
