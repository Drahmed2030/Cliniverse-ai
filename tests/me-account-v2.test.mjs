import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'

const read = path => readFileSync(new URL(`../${path}`, import.meta.url), 'utf8')
const stripComments = source => source.replace(/\{\/\*[\s\S]*?\*\/\}/g, '').replace(/\/\*[\s\S]*?\*\//g, '').replace(/^\s*\/\/.*$/gm, '')
const app = read('app/components/ReleaseApp.tsx')
const hub = stripComments(read('app/components/release/MeHub.tsx'))
const account = stripComments(read('app/components/release/MeAccountSummary.tsx'))
const appearance = read('app/components/release/AppearanceSettings.tsx')
const topics = read('app/components/release/TopicsIFollow.tsx')
const session = read('app/components/auth/AccountSessionActions.tsx')
const css = read('app/commercial-visual-system.css')
const meCss = stripComments(css.slice(css.lastIndexOf('/*', css.indexOf('Me — account, plan and preferences'))))
const header = app.slice(app.indexOf('function ReleaseHeader'), app.indexOf('function TodaySurface'))

// ── shell, heading, navigation ────────────────────────────────────────────────

test('Me owns its page heading and support line in the shared header; navigation is unchanged', () => {
  assert.match(header, /me: \{ title: 'Me', sub: 'Account, plan and preferences\.' \}/)
  assert.match(header, /active === 'me' \? <h1 id=\{`\$\{active\}-title`\}/)
  assert.match(hub, /<section aria-labelledby="me-title" data-commercial-surface="me" data-commercial-me-surface>/)
  assert.doesNotMatch(hub, /<h1/)
  assert.match(app, /\{tab === 'me' && <MeHub \/>\}/)
  const nav = read('app/components/ReleaseNav.tsx')
  assert.deepEqual([...nav.matchAll(/label: '([^']+)'/g)].map(match => match[1]), ['Today', 'Learn', 'Progress', 'Explore', 'Me'])
  assert.doesNotMatch(nav, /Intelligence/)
})

// ── identity ──────────────────────────────────────────────────────────────────

test('identity comes from the real profile and Supabase Auth email, with nothing invented or exposed', () => {
  assert.match(account, /getOwnProfile\(\)/)
  assert.match(account, /userResult\.data\.user\?\.email/)
  assert.doesNotMatch(account, /profileResult\.data\.email/)
  // The profile name leads, the email stands in when there is no name; no placeholder name or sync claim.
  assert.match(account, /const displayName = name\?\.trim\(\) \|\| email/)
  assert.doesNotMatch(account, /Cliniverse (learner|user)|Synced|Last sync|Signed in as/i)
  // No identifiers, tokens or reviewer details reach the screen.
  assert.doesNotMatch(account, /user\.id|\.id\}|access_token|refresh_token|session|reviewer|admin/i)
})

test('profile update still saves only the name, and the email has no input at all', () => {
  assert.match(account, /updateOwnProfile\(\{\s*name: draft,\s*\}\)/)
  assert.match(account, /setMessage\('Profile update failed\. Please try again\.'\)/)
  assert.equal((account.match(/<input/g) ?? []).length, 1)
  assert.match(account, /<input aria-label="Name"/)
  assert.doesNotMatch(account, /aria-label="Email"|setEmail\(event|readOnly/)
  assert.match(account, /Your sign-in email is read-only\./)
  assert.match(account, /<details className="cv-me-edit">/)
})

// ── plan / StoreKit ───────────────────────────────────────────────────────────

test('plan shows the real entitlement and StoreKit product, and keeps upgrade, restore and manage reachable', () => {
  assert.match(account, /useCliniverseSubscription\(\)/)
  assert.match(account, /entitlement \? entitlement\.tier : 'Plan unavailable'/)
  assert.match(account, /Status: \{entitlement\.status\.replace\('_', ' '\)\}/)
  assert.match(account, /\{primaryProduct\.displayName\} · \{primaryProduct\.displayPrice\} · \{primaryProduct\.subscriptionPeriod\}/)
  assert.match(account, /onClick=\{openPaywall\}/)
  assert.match(account, /entitlement\?\.isPro \? 'View Cliniverse PRO plan' : 'Upgrade to Cliniverse PRO'/)
  // Manage is offered only to a subscriber; restore stays in the paywall's existing StoreKit flow, and Me says so.
  assert.match(account, /entitlement\?\.isPro \? \(\s*<li>\s*<a[^>]*href="https:\/\/apps\.apple\.com\/account\/subscriptions"/)
  assert.match(account, /View available plans or restore an existing purchase in the iOS app\./)
  // No invented price, no local activation, no second StoreKit path.
  assert.doesNotMatch(account, /\$\d|£\d|€\d|activatePro|storeKit|restorePurchases|completeStoreKitPurchase/)
  const provider = read('app/components/release/SubscriptionPurchaseProvider.tsx')
  assert.match(provider, /restorePurchases/)
  assert.match(provider, /onRestore=\{restorePurchases\}/)
})

// ── preferences ───────────────────────────────────────────────────────────────

test('appearance keeps its three real options and local device persistence', () => {
  assert.match(appearance, /const key = 'cliniverse\.appearance\.v1'/)
  assert.match(appearance, /\(\['system', 'light', 'dark'\] as const\)/)
  assert.match(appearance, /aria-pressed=\{appearance === value\}/)
  assert.match(appearance, /Applies to this browser or app on this device\./)
  // The selected option carries a check mark that is kept out of the accessible name (aria-pressed states it).
  assert.match(meCss, /\.cv-me-choice\[aria-pressed="true"\]::before \{[^}]*content: "\\2713\\00a0" \/ ""/)
})

test('topics keep their explicit local selection and engagement boundary; no invented single learning focus', () => {
  assert.match(topics, /const key = 'cliniverse\.topics-i-follow\.v1'/)
  assert.match(topics, /void updateInterestPreferences\(next\.map\(topic => \(\{ topic, source: 'explicit' as const \}\)\)\)/)
  assert.match(topics, /Applies to this browser or app on this device\./)
  assert.match(topics, /<details className="cv-me-disclosure">/)
  assert.match(topics, /selectedLabels\.length \? selectedLabels\.join\(', '\) : 'None selected'/)
  // Comments may explain the boundary; the rendered code must not claim a focus field or sync.
  for (const source of [hub, account, stripComments(topics), stripComments(appearance)]) assert.doesNotMatch(source, /Learning focus|Focus:|cross-device|synced across|Synced/i)
})

// ── what left Me ──────────────────────────────────────────────────────────────

test('Me does not repeat Progress and does not present Connections & devices', () => {
  assert.doesNotMatch(hub, /AccountLearningSummary|learningSummary|Your saved learning|View learning progress|onOpenProgress/)
  assert.doesNotMatch(app.slice(app.indexOf("tab === 'me'"), app.indexOf("tab === 'me'") + 120), /AccountLearningSummary|onOpenProgress/)
  assert.doesNotMatch(hub, /Connections|Apple Health|Apple Watch|NeuraOps|Hospital/)
  assert.doesNotMatch(hub, /YOUR CLINIVERSE|Help & privacy|Manage your profile/)
})

// ── account & support, sign out ───────────────────────────────────────────────

test('Privacy, Terms and Support are plain rows and sign out is the one existing session action', () => {
  assert.deepEqual([...hub.matchAll(/href: '([^']+)'/g)].map(match => match[1]), ['/privacy', '/terms', '/support'])
  assert.match(hub, /<a className="cv-me-row" href=\{link\.href\}>\s*<span>\{link\.label\}<\/span>\s*<span className="cv-me-row-go" aria-hidden="true">→<\/span>/)
  // Same sign-out logic as before: Supabase Auth through lib/identity, failure surfaced, no second mechanism.
  assert.match(session, /import \{ signOut \} from '\.\.\/\.\.\/lib\/identity'/)
  assert.match(session, /const \{ error: signOutError \} = await signOut\(\)/)
  assert.match(session, /Unable to sign out\. Please try again\./)
  assert.match(session, /className="cv-me-row cv-me-signout"/)
  for (const source of [hub, account]) assert.doesNotMatch(source, /signOut|auth\.signOut|supabase/)
  assert.doesNotMatch(session, /#[0-9a-fA-F]{3,8}\b|rgba?\(/)
})

// ── styling ───────────────────────────────────────────────────────────────────

test('Me styling is scoped, token-only and restrained', () => {
  assert.doesNotMatch(meCss, /#[0-9a-fA-F]{3,8}\b|\brgba?\(/)
  assert.doesNotMatch(meCss, /gradient|box-shadow|text-shadow|filter:\s*blur|position:\s*absolute|animation|@keyframes|transition/)
  const selectors = [...meCss.matchAll(/([^{}]+)\{/g)].map(match => match[1].trim()).filter(head => !head.startsWith('@')).flatMap(head => head.split(/,(?![^()]*\))/).map(part => part.trim()))
  assert.ok(selectors.length >= 20)
  for (const selector of selectors) assert.match(selector, /^\[data-commercial-surface="me"\]/, `unscoped selector: ${selector}`)
  // Long emails and product strings wrap; touch targets stay practical; the reading column stays focused.
  assert.match(meCss, /:is\(\.cv-me-identity, \.cv-me-item, \.cv-me-note[^)]*\) \{ overflow-wrap: anywhere; \}/)
  // Choices never split a word: they keep their content width and wrap to the next row instead.
  assert.match(meCss, /\.cv-me-choice \{[^}]*min-width: max-content/)
  assert.doesNotMatch(meCss.slice(0, meCss.indexOf('.cv-me-identity')), /overflow-wrap: anywhere/)
  assert.match(meCss, /\.cv-me-choice \{[^}]*min-height: 44px/)
  assert.match(meCss, /\.cv-me-row \{[^}]*min-height: 56px/)
  assert.match(meCss, /\.cv-me-edit > summary,[^{]*\{[^}]*min-height: 44px/)
  assert.match(meCss, /max-width: 680px/)
  assert.doesNotMatch(meCss, /repeat\(auto-fit|repeat\(\d/)
  // Sizes are relative (rem or tokens), so large text scales the whole surface.
  assert.doesNotMatch(meCss.replace(/min-height: \d+px|max-width: \d+px|flex: 1 1 \d+px|@media \(min-width: \d+px\)/g, ''), /font-size: \d+px/)
})
