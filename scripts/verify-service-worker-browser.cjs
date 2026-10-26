// Real-browser check of the service worker with a genuinely CONTROLLING worker (navigator.serviceWorker.controller),
// against a locally started production build. Supabase traffic is intercepted in the browser; nothing reaches a real project.
//   npm run build && npx next start -p 3112          (any dummy NEXT_PUBLIC_SUPABASE_* values)
//   BASE=http://localhost:3112 LEGACY_SW=/path/to/baseline/sw.js [BASE_R6=http://localhost:3113] node scripts/verify-service-worker-browser.cjs
// BASE_R6 (optional) is a second server running the PREVIOUS (R6) build, used only as a negative control for section D.
// LEGACY_SW is the pre-R6 public/sw.js (git show e4dab59:public/sw.js). Needs Playwright + Chromium.
const { chromium } = require('playwright')
const fs = require('fs')
const BASE = process.env.BASE || 'http://localhost:3112'
const SUPA = 'https://zbiujqxinvcxvuviuenx.supabase.co'
const LEGACY = fs.readFileSync(process.env.LEGACY_SW, 'utf8')
// Earlier cliniverse-v* versions that DID install cached the same way; the shipped v3 lists PNG icons that 404,
// so for the legacy simulation only the (non-existent) PNG precache entries are removed. Fetch logic is untouched.
const LEGACY_INSTALLABLE = LEGACY.replace("'/icons/icon-192.png',\n  '/icons/icon-512.png',", '')
const results = []
const check = (name, ok, detail = '') => { results.push({ name, ok }); console.log(`${ok ? 'PASS' : 'FAIL'}  ${name}${detail ? '  — ' + detail : ''}`) }
const sleep = ms => new Promise(r => setTimeout(r, ms))
async function until(fn, ms = 15000) { const end = Date.now() + ms; for (;;) { try { const v = await fn(); if (v) return v } catch {} if (Date.now() > end) return false; await sleep(150) } }
const dumpOnce = page => page.evaluate(async () => { const out = {}; for (const n of await caches.keys()) { const c = await caches.open(n); out[n] = (await c.keys()).map(r => r.url) } return out })
// the offline page reloads itself on the browser 'online' event, so retry across that navigation
const dump = async page => { let last; for (let i = 0; i < 20; i++) { try { await page.waitForLoadState('load'); return await dumpOnce(page) } catch (e) { last = e; await page.goto(`${BASE}/native-offline.html`).catch(() => {}); await sleep(250) } } throw new Error('dump failed: ' + last) }
const flat = d => Object.values(d).flat()
const SENSITIVE_URL = /supabase\.co|\/auth\/|\/rest\/v1|\/reset-password|\/api\/|access_token|refresh_token|\/\?code=/
const ALLOWED_URL = /\/(icons\/|_next\/static\/|manifest\.json|native-offline\.html)/

async function supabaseStub(ctx, counter) {
  await ctx.route(`${SUPA}/**`, route => { counter.n++; const u = new URL(route.request().url()); return route.fulfill({ json: u.pathname.includes('/rest/') ? [{ id: 'user-a', name: 'Dr A' }] : { id: 'user-a', email: 'a@x.test', aud: 'authenticated' }, headers: { 'access-control-allow-origin': '*', 'access-control-allow-headers': '*' } }) })
}
const pull = (page) => page.evaluate(async (S) => {
  const get = (u, init) => fetch(u, init).then(r => r.status).catch(() => 'ERR')
  return { authUser: await get(S + '/auth/v1/user', { headers: { Authorization: 'Bearer SYNTHETIC-A', apikey: 'anon' } }), rest: await get(S + '/rest/v1/profiles?id=eq.user-a', { headers: { Authorization: 'Bearer SYNTHETIC-A', apikey: 'anon' } }), reset: await get('/reset-password?probe=1'), resetPlain: await get('/reset-password'), api: await get('/api/release-contract'), icon: await get('/icons/icon-192.svg'), manifest: await get('/manifest.json') }
}, SUPA)
async function offlineProbe(page, ctx, label) {
  // Remove the browser-level Supabase stub first: a stubbed response is not a network response and would be served even offline.
  await ctx.unroute(`${SUPA}/**`).catch(() => {})
  await ctx.setOffline(true)
  const r = await page.evaluate(async (S) => {
    const t = u => fetch(u, { headers: { Authorization: 'Bearer SYNTHETIC-B' } }).then(x => 'SERVED:' + x.status).catch(() => 'FAILED')
    return { auth: await t(S + '/auth/v1/user'), rest: await t(S + '/rest/v1/profiles?id=eq.user-a'), reset: await t('/reset-password?probe=1'), resetPlain: await t('/reset-password'), api: await t('/api/release-contract') }
  }, SUPA)
  await ctx.setOffline(false)
  await page.goto(`${BASE}/native-offline.html`).catch(() => {}) // the offline page reloads itself when the network returns; start from a stable page
  return r
}

;(async () => {
  const browser = await chromium.launch()

  // ───────── A. NEGATIVE CONTROLS: the pre-fix worker ─────────
  {
    const ctx = await browser.newContext(); const page = await ctx.newPage(); const hits = { n: 0 }
    await supabaseStub(ctx, hits)
    await ctx.route(`${BASE}/sw.js`, r => r.fulfill({ body: LEGACY, contentType: 'text/javascript' }))
    await page.goto(`${BASE}/native-offline.html`)
    const outcome = await page.evaluate(async () => { try { const reg = await navigator.serviceWorker.register('/sw.js'); await new Promise(r => setTimeout(r, 3500)); return { active: !!reg.active, installing: !!reg.installing, waiting: !!reg.waiting } } catch (e) { return { error: String(e) } } })
    check('control A1: the pre-fix worker AS SHIPPED never installs (its precache lists /icons/icon-*.png which return 404)', outcome.active === false, JSON.stringify(outcome))
    await ctx.close()
  }
  {
    const ctx = await browser.newContext(); const page = await ctx.newPage(); const hits = { n: 0 }
    await supabaseStub(ctx, hits)
    await ctx.route(`${BASE}/sw.js`, r => r.fulfill({ body: LEGACY_INSTALLABLE, contentType: 'text/javascript' }))
    await page.goto(`${BASE}/native-offline.html`)
    await page.evaluate(() => navigator.serviceWorker.register('/sw.js'))
    const controlled = await until(async () => { await page.reload(); return page.evaluate(() => !!navigator.serviceWorker.controller) }, 20000)
    check('control A2: legacy-logic worker installs and CONTROLS the page', !!controlled)
    await pull(page); await sleep(500)
    const d = await dump(page)
    const leaked = flat(d).filter(u => SENSITIVE_URL.test(u))
    check('control A2: the legacy logic DID cache Supabase auth/REST responses and /reset-password (the reported exposure is real)', leaked.some(u => /auth\/v1\/user/.test(u)) && leaked.some(u => /reset-password/.test(u)), leaked.map(u => u.replace(SUPA, 'SUPA')).join(' | '))
    const off = await offlineProbe(page, ctx, 'legacy')
    check('control A2: offline, the legacy worker answers an auth request from cache (another account\'s identity could be served)', off.auth.startsWith('SERVED') && off.reset.startsWith('SERVED'), JSON.stringify(off))

    // ───────── B. UPGRADE from the legacy worker (same browser profile, cached sensitive entries present) ─────────
    await ctx.unroute(`${BASE}/sw.js`)               // the server now delivers the fixed worker
    const before = Object.keys(await dump(page))
    await page.evaluate(async () => { const reg = await navigator.serviceWorker.getRegistration('/'); await reg.update() })
    const cleaned = await until(async () => { const k = Object.keys(await dump(page)); return !k.includes('cliniverse-v3') && k.includes('cliniverse-static-v4') }, 20000)
    const after = await dump(page)
    check('upgrade: legacy cache "cliniverse-v3" existed before and is removed by the new worker\'s activation', before.includes('cliniverse-v3') && !!cleaned, `before=${before} after=${Object.keys(after)}`)
    check('upgrade: no sensitive entry remains in any cache', flat(after).every(u => !SENSITIVE_URL.test(u)), flat(after).join(' | '))
    check('upgrade: only allow-listed public assets remain', flat(after).every(u => ALLOWED_URL.test(u)))
    const reg = await page.evaluate(async () => { const r = await navigator.serviceWorker.getRegistration('/'); return { active: r.active && r.active.state, waiting: !!r.waiting, controlled: !!navigator.serviceWorker.controller } })
    check('upgrade: the new worker is ACTIVE with no waiting worker and still controls the open page (skipWaiting + claim)', reg.active === 'activated' && !reg.waiting && reg.controlled, JSON.stringify(reg))
    const off2 = await offlineProbe(page, ctx, 'upgraded')
    check('upgrade: offline, auth, REST and recovery requests now FAIL (nothing served from cache)', Object.values(off2).every(v => v === 'FAILED'), JSON.stringify(off2))
    await ctx.close()
  }
  {
    // B2: upgrade path where the user simply opens the app (new page script purges legacy caches immediately)
    const ctx = await browser.newContext(); const page = await ctx.newPage(); const hits = { n: 0 }
    await supabaseStub(ctx, hits)
    await ctx.route(`${BASE}/sw.js`, r => r.fulfill({ body: LEGACY_INSTALLABLE, contentType: 'text/javascript' }))
    await page.goto(`${BASE}/native-offline.html`)
    await page.evaluate(() => navigator.serviceWorker.register('/sw.js'))
    await until(async () => { await page.reload(); return page.evaluate(() => !!navigator.serviceWorker.controller) }, 20000)
    await pull(page); await sleep(400)
    const seeded = Object.keys(await dump(page)).includes('cliniverse-v3') && flat(await dump(page)).some(u => /auth\/v1\/user/.test(u))
    await ctx.unroute(`${BASE}/sw.js`)
    await page.goto(`${BASE}/`)
    const gone = await until(async () => { const k = Object.keys(await dump(page)); return !k.includes('cliniverse-v3') }, 20000)
    check('upgrade via normal app launch: legacy cache seeded with an auth response, then removed once the app loads', seeded && !!gone)
    await ctx.close()
  }

  // ───────── C. FRESH INSTALL with the fixed worker ─────────
  {
    const ctx = await browser.newContext(); const page = await ctx.newPage(); const hits = { n: 0 }
    await supabaseStub(ctx, hits)
    await page.goto(`${BASE}/`)
    const controlled = await until(async () => { await page.reload(); return page.evaluate(() => !!navigator.serviceWorker.controller) }, 25000)
    const info = await page.evaluate(async () => { const r = await navigator.serviceWorker.getRegistration('/'); return { state: r && r.active && r.active.state, script: r && r.active && r.active.scriptURL, controller: navigator.serviceWorker.controller && navigator.serviceWorker.controller.scriptURL } })
    check('fresh install: the page is CONTROLLED by the new worker (navigator.serviceWorker.controller set)', !!controlled && info.controller === info.script && /sw\.js$/.test(info.controller), JSON.stringify(info))
    const status = await pull(page); await sleep(500)
    check('fresh install: requests through the controlling worker still work (auth stub, API, icon, manifest)', status.authUser === 200 && status.api === 200 && status.icon === 200 && status.manifest === 200, JSON.stringify(status))
    const d = await dump(page)
    check('fresh install: caches hold only allow-listed public assets (no Supabase, no /reset-password, no /api, no pages)', flat(d).length > 0 && flat(d).every(u => ALLOWED_URL.test(u) && !SENSITIVE_URL.test(u)), flat(d).map(u => u.replace(BASE, '')).join(' | '))
    check('fresh install: only the current cache name exists', JSON.stringify(Object.keys(d)) === JSON.stringify(['cliniverse-static-v4']))

    // recovery page while controlled: tokens in the fragment, query probes, Supabase calls from the page
    const jwt = 'x.y.z'
    await page.goto(`${BASE}/reset-password?probe=2#access_token=${jwt}&refresh_token=RB&expires_in=3600&token_type=bearer&type=recovery`)
    const ctrlOnReset = await page.evaluate(() => !!navigator.serviceWorker.controller)
    await sleep(800)
    const d2 = await dump(page)
    check('recovery page: it is controlled by the worker, yet nothing about it (or its Supabase calls) is cached', ctrlOnReset && flat(d2).every(u => !SENSITIVE_URL.test(u)), flat(d2).filter(u => SENSITIVE_URL.test(u)).join(' | '))
    check('recovery page: the worker did not register itself from this page', await page.evaluate(async () => (await navigator.serviceWorker.getRegistrations()).length === 1))
    const off = await offlineProbe(page, ctx, 'fresh')
    check('offline: auth, REST, API and recovery requests FAIL (never served from cache)', Object.values(off).every(v => v === 'FAILED'), JSON.stringify(off))
    await ctx.setOffline(true)
    let resetNav = 'LOADED'; try { await page.goto(`${BASE}/reset-password`, { timeout: 8000 }); resetNav = 'LOADED' } catch (e) { resetNav = 'NET_ERROR' }
    const resetBody = resetNav === 'LOADED' ? await page.content() : ''
    check('offline: navigating to /reset-password fails closed (browser network error, no cached page)', resetNav === 'NET_ERROR' && !/Reset your password/.test(resetBody), resetNav)
    await page.goto(`${BASE}/`, { timeout: 8000 }).catch(() => {})   // may report an interrupted navigation; judge the resulting page instead
    await until(async () => /Connection unavailable/.test(await page.title()), 10000)
    const title = await page.title(); const html = await page.content()
    check('offline: navigating to / shows only the generic offline page, never a cached app shell', /Connection unavailable/.test(title) && !/Today|Ward|Sign in/.test(html.replace(/<style[\s\S]*?<\/style>/g, '')), title)
    await ctx.setOffline(false)
    await page.goto(`${BASE}/native-offline.html`).catch(() => {})
    const final = await dump(page)
    check('no sensitive cache remnants after the whole session', flat(final).every(u => !SENSITIVE_URL.test(u)))
    await ctx.close()
  }

  // ───────── D. FIRST DIRECT VISIT TO /reset-password WHILE AN OLD WORKER STILL CONTROLS THE ORIGIN ─────────
  const jwtFor = (sub, email) => { const b64 = o => Buffer.from(JSON.stringify(o)).toString('base64url'); return `${b64({ alg: 'HS256', typ: 'JWT' })}.${b64({ sub, email, aud: 'authenticated', role: 'authenticated', exp: Math.floor(Date.now() / 1000) + 3600 })}.sig` }
  const RECOVERY_HASH = `#access_token=${jwtFor('user-a', 'jane.doe@clinic.test')}&refresh_token=RA&expires_in=3600&token_type=bearer&type=recovery`
  async function oldWorkerContext(base, events, { blockUnregister = false } = {}) {
    const ctx = await browser.newContext(); const page = await ctx.newPage()
    await ctx.route(`${SUPA}/**`, route => {
      const req = route.request(); const u = new URL(req.url()); const auth = req.headers()['authorization'] || ''
      events.push(['supabase', req.method(), u.pathname, auth.slice(0, 12)])
      const cors = { 'access-control-allow-origin': '*', 'access-control-allow-headers': '*', 'access-control-allow-methods': '*' }
      if (req.method() === 'OPTIONS') return route.fulfill({ status: 204, headers: cors })
      if (u.pathname === '/auth/v1/user' && req.method() === 'GET') return route.fulfill({ headers: cors, json: { id: 'user-a', email: 'jane.doe@clinic.test', aud: 'authenticated', role: 'authenticated', app_metadata: {}, user_metadata: {}, created_at: '2026-01-01T00:00:00Z' } })
      if (u.pathname === '/auth/v1/user') return route.fulfill({ headers: cors, json: { id: 'user-a', email: 'jane.doe@clinic.test' } })
      if (u.pathname === '/auth/v1/logout') return route.fulfill({ status: 204, headers: cors, body: '' })
      return route.fulfill({ headers: cors, json: [] })
    })
    await ctx.route(`${base}/sw.js`, r => r.fulfill({ body: LEGACY_INSTALLABLE, contentType: 'text/javascript' }))   // the old worker keeps being served: no update yet
    await page.goto(`${base}/native-offline.html`)
    await page.evaluate(() => navigator.serviceWorker.register('/sw.js'))
    await until(async () => { await page.reload(); return page.evaluate(() => !!navigator.serviceWorker.controller) }, 25000)
    await pull(page); await sleep(400)                 // seed the legacy cache with auth / REST / API / recovery responses
    events.length = 0
    await page.exposeFunction('__report', d => events.push(['doc', d.path, d.controller]))
    await ctx.addInitScript(blocked => {
      try { window.__report({ path: location.pathname + location.search, controller: !!(navigator.serviceWorker && navigator.serviceWorker.controller) }) } catch (e) {}
      if (blocked) ServiceWorkerRegistration.prototype.unregister = () => Promise.resolve(false)
    }, blockUnregister)
    return { ctx, page }
  }
  const docsOf = events => events.filter(e => e[0] === 'doc').map(e => ({ path: e[1], controller: e[2] }))

  {
    const events = []; const { ctx, page } = await oldWorkerContext(BASE, events)
    const seeded = flat(await dump(page)).some(u => /auth\/v1\/user/.test(u))
    await page.goto(`${BASE}/reset-password${RECOVERY_HASH}`)
    await page.getByLabel('New password', { exact: true }).waitFor({ timeout: 20000 })
    const docs = docsOf(events); const firstSupabase = events.findIndex(e => e[0] === 'supabase'); const lastOldDoc = events.map((e, i) => e[0] === 'doc' && e[2] ? i : -1).reduce((a, b) => Math.max(a, b), -1)
    check('D1 (fixed build): the legacy cache was seeded with an auth response, and the FIRST document of the visit was controlled by the old worker', seeded && docs[0] && docs[0].controller === true, JSON.stringify(docs))
    check('D1: the page removed the old worker and reloaded itself once (marker query, fragment kept) into an UNcontrolled document', docs.length === 2 && docs[1].path === '/reset-password?swclean=1' && docs[1].controller === false, JSON.stringify(docs))
    check('D1: no Supabase request was made while the old worker controlled the page (the tokens were first used after the reload)', firstSupabase > lastOldDoc && firstSupabase > -1, JSON.stringify(events.map(e => e.slice(0, 3).join(' '))))
    check('D1: the recovery form appears for the right (masked) account and the address bar no longer carries tokens', (await page.textContent('main')).includes('j••••••@clinic.test') && !page.url().includes('access_token') && !page.url().includes('swclean'), page.url())
    await page.getByLabel('New password', { exact: true }).fill('correct-horse-9'); await page.getByLabel('Confirm new password').fill('correct-horse-9'); await page.getByRole('button', { name: 'Update password' }).click()
    await page.getByText('Your password was updated.').waitFor({ timeout: 15000 })
    const regs = await page.evaluate(async () => (await navigator.serviceWorker.getRegistrations()).length)
    const caches1 = await dump(page)
    check('D1: the old worker is unregistered and no legacy cache or sensitive entry remains', regs === 0 && !Object.keys(caches1).some(k => /^cliniverse-v/.test(k)) && flat(caches1).every(u => !SENSITIVE_URL.test(u)), `registrations=${regs} caches=${Object.keys(caches1)}`)
    await ctx.close()
  }
  {
    const events = []; const { ctx, page } = await oldWorkerContext(BASE, events, { blockUnregister: true })
    await page.goto(`${BASE}/reset-password${RECOVERY_HASH}`)
    await page.getByText('We could not prepare this page safely.').waitFor({ timeout: 20000 })
    const docs = docsOf(events)
    check('D2 (old worker cannot be removed): the page fails CLOSED — blocked message, the link is not used', docs.length === 2 && docs[1].controller === true, JSON.stringify(docs))
    check('D2: no Supabase request at all, and the tokens are gone from the address bar', events.every(e => e[0] !== 'supabase') && !page.url().includes('access_token') && !page.url().includes('#'), page.url())
    await ctx.close()
  }
  if (process.env.BASE_R6) {
    const events = []; const { ctx, page } = await oldWorkerContext(process.env.BASE_R6, events)
    await page.goto(`${process.env.BASE_R6}/reset-password${RECOVERY_HASH}`)
    await page.getByLabel('New password', { exact: true }).waitFor({ timeout: 20000 })
    await sleep(500)
    const docs = docsOf(events); const supa = events.filter(e => e[0] === 'supabase')
    const cached = flat(await dump(page)).filter(u => /auth\/v1\/user/.test(u))
    check('control D3 (previous R6 build, no guard): the page stays under the old worker and its recovery lookup goes through it', docs.length === 1 && docs[0].controller === true && supa.some(e => e[2] === '/auth/v1/user'), JSON.stringify(docs))
    check('control D3: the old worker STORES that recovery-session user lookup in its cache (the exposure the guard prevents)', cached.length > 0, cached.map(u => u.replace(SUPA, 'SUPA')).join(' | '))
    await ctx.close()
  } else console.log('SKIP  control D3 (set BASE_R6 to a server running the previous build)')

  await browser.close()
  const failed = results.filter(r => !r.ok).length
  console.log(`\n${results.length - failed}/${results.length} browser checks passed`)
  process.exit(failed ? 1 : 0)
})().catch(e => { console.error(e); process.exit(2) })
