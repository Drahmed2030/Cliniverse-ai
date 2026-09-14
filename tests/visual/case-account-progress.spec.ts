import { test, expect, type Page, type TestInfo } from '@playwright/test'
import AxeBuilder from '@axe-core/playwright'

type Row = { id: string; user_id: string; case_id: string; errors: number; xp_earned: number; completed_at: string }
const owner = '00000000-0000-4000-8000-000000000001'
const saveLabel = 'I reviewed the explanation — save completion'

async function isolatedAccount(page: Page) {
  const rows = new Map<string, Row>(), writes: Row[] = [], unexpected: string[] = []
  let release = () => {}, gate = Promise.resolve(), rejectNext = false
  const user = { id: owner, aud: 'authenticated', role: 'authenticated',
    email: 'visual-test@example.invalid', app_metadata: {}, user_metadata: {}, created_at: '2026-01-01T00:00:00Z' }
  // Synthetic session, useful only against the intercepted API; never a real JWT.
  await page.addInitScript(({ user }) => {
    localStorage.setItem('sb-zbiujqxinvcxvuviuenx-auth-token', JSON.stringify({
      access_token: 'synthetic-test-token', refresh_token: 'synthetic-test-refresh',
      expires_at: Math.floor(Date.now() / 1000) + 3600, expires_in: 3600, token_type: 'bearer', user,
    }))
  }, { user })
  await page.route('**/*', async route => {
    const req = route.request(), url = new URL(req.url())
    if (url.origin === 'http://127.0.0.1:3101') return route.continue()
    const headers = { 'access-control-allow-origin': '*', 'access-control-allow-headers': '*' }
    if (url.hostname !== 'zbiujqxinvcxvuviuenx.supabase.co') {
      unexpected.push(`${req.method()} ${url.origin}${url.pathname}`); return route.abort()
    }
    if (req.method() === 'OPTIONS') return route.fulfill({ status: 204, headers })
    if (url.pathname === '/auth/v1/user' && req.method() === 'GET') return route.fulfill({ json: user, headers })
    if (url.pathname === '/rest/v1/case_completions') {
      if (req.method() === 'GET') {
        const row = [...rows.values()].find(r => url.searchParams.get('user_id') === `eq.${r.user_id}` &&
          (url.searchParams.get('id') === `eq.${r.id}` || url.searchParams.get('case_id') === `eq.${r.case_id}`))
        return route.fulfill({ json: row ?? null, headers })
      }
      if (req.method() === 'POST') {
        const row = req.postDataJSON() as Row
        writes.push(row)
        expect(row.user_id).toBe(owner); expect(row.xp_earned).toBe(0)
        await gate
        if (rejectNext) {
          rejectNext = false
          return route.fulfill({ status: 403, json: { code: '42501', message: 'Synthetic policy rejection' }, headers })
        }
        if (rows.has(row.id)) return route.fulfill({ status: 409, json: { code: '23505', message: 'Synthetic duplicate' }, headers })
        rows.set(row.id, row)
        return route.fulfill({ status: 201, json: row, headers })
      }
    }
    unexpected.push(`${req.method()} ${url.pathname}`)
    return route.abort()
  })
  return { rows, writes, unexpected,
    hold() { gate = new Promise<void>(resolve => { release = resolve }) },
    release() { release() }, failNext() { rejectNext = true },
  }
}

async function explain(page: Page, title: string) {
  await page.getByRole('button', { name: new RegExp(`Start case\\s*:\\s*${title}`) }).click()
  await page.getByRole('button', { name: 'Continue to question', exact: true }).click()
  await page.getByRole('radio').first().check()
  await page.getByRole('button', { name: 'Review explanation', exact: true }).click()
}

async function evidence(page: Page, info: TestInfo, label: string) {
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true)
  const overflow = await page.locator('main section, main button').evaluateAll(nodes => nodes.filter(n => n.scrollWidth > n.clientWidth + 1).length)
  expect(overflow).toBe(0)
  expect((await new AxeBuilder({ page }).include('main').withTags(['wcag2a', 'wcag2aa', 'wcag21aa']).analyze()).violations).toEqual([])
  await page.screenshot({ path: info.outputPath(`${label}.png`), fullPage: true })
}

test('delayed save, rejection, retry and reload', async ({ page }, info) => {
  const api = await isolatedAccount(page)
  await page.goto('/labs/case-batch-preview')
  const progress = page.getByRole('region', { name: 'Account progress' })
  await expect(progress).toContainText('Account completions restored')
  await explain(page, 'Anterior STEMI')
  const save = page.getByRole('button', { name: saveLabel, exact: true })
  await save.scrollIntoViewIfNeeded()
  const before = await save.boundingBox()
  api.hold(); api.failNext()
  await save.click()
  try {
    await expect(progress.getByRole('status')).toHaveText('Saving to your account…')
    const saving = page.getByRole('button', { name: 'Saving…', exact: true }).last()
    await expect(saving).toBeDisabled()
    const during = await saving.boundingBox()
    expect(Math.abs(during!.width - before!.width)).toBeLessThanOrEqual(1)
    expect(Math.abs(during!.height - before!.height)).toBeLessThanOrEqual(1)
    await expect(progress).toContainText('0 current text exercises saved')
    await expect.poll(() => api.writes.length).toBe(1)
    await evidence(page, info, 'saving')
  } finally { api.release() }
  await expect(progress).toContainText('Save not confirmed')
  const retry = page.getByRole('button', { name: 'Retry saving completion' })
  await expect(retry).toBeEnabled()
  await retry.scrollIntoViewIfNeeded()
  const retryBox = await retry.boundingBox()
  expect(retryBox!.height).toBeGreaterThanOrEqual(44)
  expect(retryBox!.width).toBeGreaterThanOrEqual(44)
  await evidence(page, info, 'failed')
  await retry.focus(); await page.keyboard.press('Enter')
  await expect(progress).toContainText('Saved to your account')
  await expect(page.getByRole('button', { name: 'Completion saved', exact: true })).toBeDisabled()
  expect(api.writes).toHaveLength(2)
  expect(api.writes[1].id).toBe(api.writes[0].id)
  expect(api.rows.size).toBe(1)
  await evidence(page, info, 'saved')
  await page.reload()
  await expect(progress).toContainText('1 current text exercises saved')
  expect(api.writes).toHaveLength(2)
  expect(api.unexpected).toEqual([])
})

test('pending save stays associated with its original case', async ({ page }, info) => {
  const api = await isolatedAccount(page)
  await page.goto('/labs/case-batch-preview')
  await expect(page.getByRole('region', { name: 'Account progress' })).toContainText('Account completions restored')
  await explain(page, 'Anterior STEMI')
  api.hold()
  await page.getByRole('button', { name: saveLabel, exact: true }).click()
  try {
    await expect.poll(() => api.writes.length).toBe(1)
    await page.getByRole('button', { name: 'Back to cases', exact: true }).click()
    await explain(page, 'Chest pain without ST elevation')
    // A global pending request may disable saving, but must not label this case as saving.
    await expect(page.getByRole('button', { name: saveLabel, exact: true })).toBeDisabled()
    await expect(page.getByRole('button', { name: 'Completion saved', exact: true })).toHaveCount(0)
    await evidence(page, info, 'other-case-pending')
  } finally { api.release() }
  await expect(page.getByRole('button', { name: saveLabel, exact: true })).toBeEnabled()
  await page.getByRole('button', { name: 'Back to cases', exact: true }).click()
  const cards = page.getByRole('article')
  await expect(cards.filter({ has: page.getByRole('heading', { name: 'Anterior STEMI', exact: true }) })).toContainText('Text exercise completion saved')
  await expect(cards.filter({ has: page.getByRole('heading', { name: 'Chest pain without ST elevation', exact: true }) })).not.toContainText('Text exercise completion saved')
  expect(api.writes).toHaveLength(1)
  expect(api.unexpected).toEqual([])
})
