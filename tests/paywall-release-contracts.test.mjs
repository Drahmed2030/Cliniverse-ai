import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'

function read(path) {
  return readFileSync(new URL(`../${path}`, import.meta.url), 'utf8')
}

test('release paywall contains no external digital checkout URL or optimistic browser purchase', () => {
  const screen = read('app/components/PaywallScreen.tsx')
  const sheet = read('app/components/PaywallSheet.tsx')
  for (const source of [screen, sheet]) {
    assert.equal(/lemonsqueezy/i.test(source), false)
    assert.equal(/window\.open\s*\(/.test(source), false)
    assert.equal(/activatePro\s*\(/.test(source), false)
  }
})

test('release paywall is fail-closed until a purchase controller enables it', () => {
  const sheet = read('app/components/PaywallSheet.tsx')
  assert.match(sheet, /purchaseEnabled\s*=\s*false/)
  assert.match(sheet, /disabled=\{!canPurchase\}/)
  assert.match(sheet, /Boolean\(monthlyPrice\s*&&\s*yearlyPrice\)/)
})

test('release paywall does not hard-code a free trial or authoritative App Store price', () => {
  const sheet = read('app/components/PaywallSheet.tsx')
  const screen = read('app/components/PaywallScreen.tsx')
  for (const source of [sheet, screen]) {
    assert.equal(/\$14\.99|\$99\.99|7-Day Free Trial|7-day free trial/.test(source), false)
  }
  assert.match(sheet, /monthlyPrice\?: string/)
  assert.match(sheet, /yearlyPrice\?: string/)
  assert.match(sheet, /trialLabel\?: string \| null/)
})

test('restore remains a caller-controlled StoreKit boundary rather than a local entitlement write', () => {
  const sheet = read('app/components/PaywallSheet.tsx')
  assert.match(sheet, /onRestore\?: \(\) => void \| Promise<void>/)
  assert.equal(/\.from\(['"]subscriptions['"]\)/.test(sheet), false)
  assert.equal(/service_role/i.test(sheet), false)
})
