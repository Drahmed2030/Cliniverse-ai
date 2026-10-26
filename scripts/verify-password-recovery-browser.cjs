// Real-browser check of the password-recovery page against a locally started production build.
//   npm run build && npx next start -p 3111   (any dummy NEXT_PUBLIC_SUPABASE_* values)
//   node scripts/verify-password-recovery-browser.cjs        (needs Playwright + Chromium)
// All Supabase traffic is intercepted in the browser; nothing reaches a real project. Server behaviour (one-time link
// consumption, token validation, revocation) is SIMULATED here and must be proven on a real test project.
const { chromium } = require('playwright')
const b64 = o => Buffer.from(JSON.stringify(o)).toString('base64url')
const jwt = (sub, email) => `${b64({ alg: 'HS256', typ: 'JWT' })}.${b64({ sub, email, aud: 'authenticated', role: 'authenticated', exp: Math.floor(Date.now() / 1000) + 3600, session_id: 'sess' })}.sig`
const BASE = (process.env.BASE || 'http://localhost:3111') + '/reset-password'
const SUPA = 'https://zbiujqxinvcxvuviuenx.supabase.co'
const results = []
const check = (name, ok, detail = '') => { results.push({ name, ok }); console.log(`${ok ? 'PASS' : 'FAIL'}  ${name}${detail ? '  — ' + detail : ''}`) }

;(async () => {
  const browser = await chromium.launch()
  async function run(hash, fn) {
    const ctx = await browser.newContext()
    const page = await ctx.newPage()
    const supaCalls = []
    await page.route(`${SUPA}/**`, async route => {
      const req = route.request(); const url = new URL(req.url())
      supaCalls.push({ method: req.method(), path: url.pathname + url.search, body: req.postData() })
      if (url.pathname === '/auth/v1/user' && req.method() === 'GET') return route.fulfill({ json: { id: 'user-b', email: 'jane.doe@clinic.test', aud: 'authenticated', role: 'authenticated', app_metadata: {}, user_metadata: {}, created_at: '2026-01-01T00:00:00Z' } })
      if (url.pathname === '/auth/v1/user' && req.method() === 'PUT') return route.fulfill({ json: { id: 'user-b', email: 'jane.doe@clinic.test' } })
      if (url.pathname === '/auth/v1/logout') return route.fulfill({ status: 204, body: '' })
      return route.fulfill({ status: 404, json: {} })
    })
    // An unrelated, already-signed-in account (user A) in the app's own storage.
    const keyA = 'sb-zbiujqxinvcxvuviuenx-auth-token'
    const sessionA = JSON.stringify({ access_token: jwt('user-a', 'a@x.test'), refresh_token: 'RA', expires_at: Math.floor(Date.now() / 1000) + 3600, token_type: 'bearer', user: { id: 'user-a', email: 'a@x.test' } })
    await page.addInitScript(([k, v]) => { try { if (!localStorage.getItem(k)) localStorage.setItem(k, v) } catch {} }, [keyA, sessionA])
    await page.goto(BASE + hash)
    await fn(page, supaCalls, { keyA, sessionA })
    await ctx.close()
  }

  const goodHash = `#access_token=${jwt('user-b', 'jane.doe@clinic.test')}&refresh_token=RB&expires_in=3600&token_type=bearer&type=recovery`

  await run(goodHash, async (page, calls, { keyA, sessionA }) => {
    await page.getByLabel('New password', { exact: true }).waitFor()
    check('valid link: form shows the masked account email', (await page.textContent('main')).includes('j••••••@clinic.test'))
    check('valid link: tokens removed from the address bar', !page.url().includes('access_token') && page.url().endsWith('/reset-password'), page.url())
    check('valid link: only GET /auth/v1/user used to validate before submit', calls.length === 1 && calls[0].method === 'GET', JSON.stringify(calls.map(c => c.method + ' ' + c.path)))
    await page.getByLabel('New password', { exact: true }).fill('short'); await page.getByLabel('Confirm new password').fill('short'); await page.getByRole('button', { name: 'Update password' }).click()
    check('short password: rejected locally, no request sent', (await page.textContent('[role=alert]')).includes('at least 8') && calls.length === 1)
    await page.getByLabel('New password', { exact: true }).fill('correct-horse-9'); await page.getByLabel('Confirm new password').fill('different-horse-9'); await page.getByRole('button', { name: 'Update password' }).click()
    check('mismatch: rejected locally, no request sent', (await page.textContent('[role=alert]')).includes('do not match') && calls.length === 1)
    await page.getByLabel('Confirm new password').fill('correct-horse-9'); await page.getByRole('button', { name: 'Update password' }).click()
    await page.getByText('Your password was updated.').waitFor()
    const put = calls.find(c => c.method === 'PUT'); const out = calls.find(c => c.path.startsWith('/auth/v1/logout'))
    check('submit: PUT /user carries the new password and nothing else (auth-js adds null PKCE fields)', !!put && JSON.parse(put.body).password === 'correct-horse-9' && Object.entries(JSON.parse(put.body)).filter(([k, v]) => k !== 'password' && v !== null).length === 0)
    check('submit: global sign-out requested after the update', !!out && out.path.includes('scope=global') && calls.indexOf(out) > calls.indexOf(put), out && out.path)
    check('done: honest session wording (refresh tokens revoked; open sessions may last briefly) and no "all devices" claim', (await page.textContent('main')).includes('may keep working briefly') && !/all devices/i.test(await page.textContent('main')))
    check('done: tells the user to return to the app and sign in', (await page.textContent('main')).includes('Return to the Cliniverse app'))
    const stored = await page.evaluate(k => localStorage.getItem(k), keyA)
    check('isolation: the other signed-in account (A) in app storage is byte-for-byte unchanged', stored === sessionA)
    const keys = await page.evaluate(() => Object.keys(localStorage))
    check('isolation: the recovery flow wrote nothing to localStorage', keys.length === 1 && keys[0] === keyA, keys.join(','))
  })

  await run('#error=access_denied&error_code=otp_expired&error_description=Email+link+is+invalid+or+has+expired', async (page, calls) => {
    await page.getByText('This link has expired.').waitFor()
    check('expired link: clear message, no Supabase request, no form', calls.length === 0 && (await page.getByLabel('New password', { exact: true }).count()) === 0)
  })
  await run('', async (page, calls) => {
    await page.getByText('not valid or was already used').waitFor()
    check('no hash: invalid message, no request', calls.length === 0)
  })
  await run(goodHash.replace('type=recovery', 'type=signup'), async (page, calls) => {
    await page.getByText('not valid or was already used').waitFor()
    check('non-recovery link type: refused, no request', calls.length === 0)
  })
  await run(goodHash, async (page, calls) => {
    // Reuse: server rejects the (already used) session on validation
    await page.unroute(`${SUPA}/**`)
    await page.route(`${SUPA}/**`, route => route.fulfill({ status: 401, json: { msg: 'invalid JWT', code: 401 } }))
    await page.goto(BASE + goodHash)
    await page.getByText('not valid or was already used').waitFor()
    check('SIMULATED server 401 on session validation: page shows the invalid-link state (this does NOT prove the live service enforces one-time links; see the preview plan)', true)
  })
  await run(goodHash, async (page) => {
    await page.getByLabel('New password', { exact: true }).waitFor()
    await page.unroute(`${SUPA}/**`)
    await page.route(`${SUPA}/**`, route => route.request().method() === 'PUT' ? route.fulfill({ status: 422, json: { code: 'weak_password', msg: 'Password is known to be weak' } }) : route.fulfill({ status: 204, body: '' }))
    await page.getByLabel('New password', { exact: true }).fill('correct-horse-9'); await page.getByLabel('Confirm new password').fill('correct-horse-9'); await page.getByRole('button', { name: 'Update password' }).click()
    await page.locator('main [role=alert]').waitFor()
    check('SIMULATED server 422 on updateUser: error shown, success never claimed', (await page.textContent('main')).includes('could not be accepted') && !(await page.textContent('main')).includes('was updated'))
  })

  // ───────── ACCOUNT ISOLATION: recover account A in a browser profile that already holds account B's session ─────────
  {
    const ctx = await browser.newContext(); const page = await ctx.newPage()
    const requests = []
    const subOf = auth => { try { return JSON.parse(Buffer.from(auth.replace('Bearer ', '').split('.')[1], 'base64url').toString()).sub } catch { return null } }
    await ctx.route(`${SUPA}/**`, route => {
      const req = route.request(); const u = new URL(req.url()); const sub = subOf(req.headers()['authorization'] || '')
      requests.push({ method: req.method(), path: u.pathname + u.search, sub })
      const cors = { 'access-control-allow-origin': '*', 'access-control-allow-headers': '*', 'access-control-allow-methods': '*' }
      if (req.method() === 'OPTIONS') return route.fulfill({ status: 204, headers: cors })
      if (u.pathname === '/auth/v1/user' && req.method() === 'GET') return route.fulfill({ headers: cors, json: { id: sub, email: `${sub}@clinic.test`, aud: 'authenticated', role: 'authenticated', app_metadata: { provider: 'email' }, user_metadata: {}, email_confirmed_at: '2026-01-01T00:00:00Z', created_at: '2026-01-01T00:00:00Z' } })
      if (u.pathname === '/auth/v1/user') return route.fulfill({ headers: cors, json: { id: sub } })
      if (u.pathname === '/auth/v1/logout') return route.fulfill({ status: 204, headers: cors, body: '' })
      if (u.pathname.startsWith('/rest/v1/profiles')) return route.fulfill({ headers: cors, json: { id: sub, name: 'Test' } })
      return route.fulfill({ headers: cors, json: [] })
    })
    const key = 'sb-zbiujqxinvcxvuviuenx-auth-token'
    const sessionB = JSON.stringify({ access_token: jwt('user-b', 'user-b@clinic.test'), refresh_token: 'RB', expires_at: Math.floor(Date.now() / 1000) + 3600, expires_in: 3600, token_type: 'bearer', user: { id: 'user-b', email: 'user-b@clinic.test', email_confirmed_at: '2026-01-01T00:00:00Z', app_metadata: { provider: 'email' }, aud: 'authenticated' } })
    await page.addInitScript(([k, v]) => { try { if (!localStorage.getItem(k)) localStorage.setItem(k, v) } catch {} }, [key, sessionB])
    const appRecognisesB = async () => { await page.goto(BASE.replace('/reset-password', '/')); await page.waitForTimeout(2500); const text = await page.textContent('body'); return !/Welcome back to Cliniverse/.test(text) }
    const before = await appRecognisesB()
    {   // control: without B's session the very same check reports the sign-in screen, so "recognised" is meaningful
      const c2 = await browser.newContext(); const p2 = await c2.newPage()
      await c2.route(`${SUPA}/**`, route => route.fulfill({ status: 404, json: {} }))
      await p2.goto(BASE.replace('/reset-password', '/')); await p2.waitForTimeout(2000)
      check('isolation control: with no stored session the same page shows the sign-in screen', /Welcome back to Cliniverse/.test(await p2.textContent('body')))
      await c2.close()
    }
    check('isolation: before the recovery, the app recognises the signed-in account B (no sign-in screen)', before)
    const storedBefore = await page.evaluate(k => localStorage.getItem(k), key)
    requests.length = 0
    const jwtA = jwt('user-a', 'user-a@clinic.test')
    await page.goto(`${BASE}#access_token=${jwtA}&refresh_token=RA&expires_in=3600&token_type=bearer&type=recovery`)
    await page.getByLabel('New password', { exact: true }).waitFor()
    check('isolation: recovery of account A shows A\'s masked email, not B\'s', (await page.textContent('main')).includes('u•••••@clinic.test') && !(await page.textContent('main')).includes('user-b'))
    await page.getByLabel('New password', { exact: true }).fill('correct-horse-9'); await page.getByLabel('Confirm new password').fill('correct-horse-9'); await page.getByRole('button', { name: 'Update password' }).click()
    await page.getByText('Your password was updated.').waitFor()
    check('isolation: every Supabase request of the recovery carried A\'s token; none carried B\'s', requests.length >= 3 && requests.every(r => r.sub === 'user-a'), JSON.stringify(requests.map(r => r.method + ' ' + r.path.split('?')[0] + ' ' + r.sub)))
    const logout = requests.find(r => r.path.startsWith('/auth/v1/logout'))
    check('isolation: the global sign-out was issued for A\'s session only', !!logout && logout.sub === 'user-a' && logout.path.includes('scope=global'))
    const storedAfter = await page.evaluate(k => localStorage.getItem(k), key)
    check('isolation: B\'s stored session is byte-for-byte unchanged after A\'s recovery', storedAfter === storedBefore && !!storedBefore)
    requests.length = 0
    const after = await appRecognisesB()
    check('isolation: afterwards the app still recognises account B and uses B\'s token (not A\'s)', after && requests.some(r => r.sub === 'user-b') && requests.every(r => r.sub !== 'user-a'), JSON.stringify(requests.map(r => r.sub)))
    check('isolation: B\'s session is still stored unchanged after the app reloaded it', (await page.evaluate(k => localStorage.getItem(k), key)) === storedBefore)
    await ctx.close()
  }
  await browser.close()
  const failed = results.filter(r => !r.ok).length
  console.log(`\n${results.length - failed}/${results.length} browser checks passed`)
  process.exit(failed ? 1 : 0)
})().catch(e => { console.error(e); process.exit(2) })
