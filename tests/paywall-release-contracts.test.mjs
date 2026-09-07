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

test('release paywall is fail-closed until StoreKit returns the selected product', () => {
  const sheet = read('app/components/PaywallSheet.tsx')
  assert.match(sheet, /purchaseEnabled\s*=\s*false/)
  assert.match(sheet, /disabled=\{!canPurchase\}/)
  assert.match(sheet, /Boolean\(selectedProduct\?\.displayPrice\)/)
  assert.match(sheet, /products\.map/)
  assert.doesNotMatch(sheet, /Boolean\(monthlyPrice\s*&&\s*yearlyPrice\)/)
})

test('release paywall does not hard-code a free trial or authoritative App Store price', () => {
  const sheet = read('app/components/PaywallSheet.tsx')
  const screen = read('app/components/PaywallScreen.tsx')
  for (const source of [sheet, screen]) {
    assert.equal(/\$14\.99|\$99\.99|7-Day Free Trial|7-day free trial/.test(source), false)
  }
  assert.match(sheet, /products\?: StoreProduct\[\]/)
  assert.match(sheet, /product\.displayPrice/)
  assert.match(sheet, /trialLabel\?: string \| null/)
})

test('restore remains a caller-controlled StoreKit boundary rather than a local entitlement write', () => {
  const sheet = read('app/components/PaywallSheet.tsx')
  assert.match(sheet, /onRestore\?: \(\) => void \| Promise<void>/)
  assert.equal(/\.from\(['"]subscriptions['"]\)/.test(sheet), false)
  assert.equal(/service_role/i.test(sheet), false)
})

test('release account keeps Upgrade and Restore active through the verified StoreKit path', () => {
  const account = read('app/components/release/MeAccountSummary.tsx')
  const provider = read('app/components/release/SubscriptionPurchaseProvider.tsx')
  const release = read('app/components/ReleaseApp.tsx')
  assert.match(account, /Upgrade to Cliniverse PRO/)
  assert.match(account, /View Cliniverse PRO plan/)
  assert.match(account, /useCliniverseSubscription/)
  assert.match(account, /primaryProduct\.displayPrice/)
  assert.match(account, /https:\/\/apps\.apple\.com\/account\/subscriptions/)
  assert.match(provider, /createCapacitorStoreKitController/)
  assert.match(provider, /completeStoreKitPurchase/)
  assert.match(provider, /storeKit\.finish/)
  assert.match(provider, /restorePurchases/)
  assert.match(release, /<SubscriptionPurchaseProvider>/)
  assert.equal(account.includes('activatePro'), false)
  assert.equal(provider.includes('activatePro'), false)
})

test('every visible premium action opens the shared paywall instead of staying disabled', () => {
  const ward = read('app/components/ward/index.tsx')
  const home = read('app/components/ward/WardHome.tsx')
  const evidence = read('app/components/ward/RelatedEvidencePanel.tsx')

  assert.match(ward, /if \(premium && !isPro\)/)
  assert.match(ward, /openPaywall\(\)/)
  assert.match(home, /else onUpgrade\?\.\(\)/)
  assert.match(evidence, /else onUpgrade\?\.\(\)/)
  assert.doesNotMatch(evidence, /disabled=\{!isPro\}/)
})

test('Atlas links reviewers only to active release paths and the shared StoreKit plan', () => {
  const atlas = read('app/components/release/AtlasReleaseCatalog.tsx')
  const release = read('app/components/ReleaseApp.tsx')

  assert.match(atlas, /CURRENT RELEASE TOUR/)
  assert.match(atlas, /Ward Simulation/)
  assert.match(atlas, /Cardiology Operations/)
  assert.match(atlas, /Nexus Learning/)
  assert.match(atlas, /onNavigate\(path\.destination\)/)
  assert.match(atlas, /onOpenPlan/)
  assert.match(atlas, /localized price from StoreKit/)
  assert.doesNotMatch(atlas, /Imaging analysis|Symptom interpretation|Prescription \/ dosing AI/)
  assert.match(release, /<AtlasReleaseCatalog onNavigate=\{handleAtlasNavigate\} onOpenPlan=\{openPaywall\}/)
})
