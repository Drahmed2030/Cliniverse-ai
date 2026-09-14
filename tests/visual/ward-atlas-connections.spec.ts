import { test, expect } from '@playwright/test'
import AxeBuilder from '@axe-core/playwright'

test('reviewer can study related cases from Ward and Atlas without changing account evidence', async ({ page, context }, info) => {
  const user = { id: '00000000-0000-4000-8000-000000000001', email: 'reviewer@cliniverseai.com',
    aud: 'authenticated', role: 'authenticated', email_confirmed_at: '2026-01-01T00:00:00Z',
    created_at: '2026-01-01T00:00:00Z', app_metadata: {}, user_metadata: {} }
  await context.addInitScript(({ user }) => {
    localStorage.setItem('sb-zbiujqxinvcxvuviuenx-auth-token', JSON.stringify({ user,
      access_token: 'synthetic-test-token', refresh_token: 'synthetic-test-refresh',
      expires_at: Math.floor(Date.now() / 1000) + 3600, expires_in: 3600, token_type: 'bearer' }))
  }, { user })
  const writes: string[] = []
  await context.route('**/*', async route => {
    const req = route.request(), url = new URL(req.url())
    if (url.origin === 'http://127.0.0.1:3101' && !url.pathname.startsWith('/api/')) return route.continue()
    if (!['GET', 'OPTIONS'].includes(req.method())) { writes.push(url.pathname); return route.abort() }
    const headers = { 'access-control-allow-origin': '*', 'access-control-allow-headers': '*' }
    if (req.method() === 'OPTIONS') return route.fulfill({ status: 204, headers })
    if (url.hostname === 'zbiujqxinvcxvuviuenx.supabase.co') {
      if (url.pathname === '/auth/v1/user') return route.fulfill({ json: user, headers })
      if (url.pathname.startsWith('/rest/v1/')) return route.fulfill({ json: [], headers })
    }
    if (url.origin === 'http://127.0.0.1:3101' && url.pathname === '/api/reviewer-feature-access') {
      return route.fulfill({ json: { allowed: false } })
    }
    return route.abort()
  })
  await page.goto('/?view=learn')
  const section = page.getByRole('region', { name: 'Connect evidence to your Ward handover' })
  await expect(section).toBeVisible({ timeout: 30_000 })
  await section.getByText('ECG: report versus tracing', { exact: true }).click()
  await expect(section).toContainText('Attribute that description to the record')
  const popup = context.waitForEvent('page')
  await section.getByRole('link', { name: 'Study the related case · new tab' }).first().click()
  const study = await popup
  await expect(study.getByRole('heading', { name: 'Anterior STEMI', exact: true })).toBeVisible()
  await study.close()
  await expect(section).toBeVisible()
  await expect(page.getByRole('status').filter({ hasText: 'No saved practice yet' })).toBeVisible()
  await page.getByRole('navigation', { name: 'Primary' }).getByRole('button', { name: 'Explore', exact: true }).click()
  await expect(page.getByRole('heading', { name: 'Atlas', exact: true })).toBeVisible()
  await section.getByText('Echo: state what is missing', { exact: true }).click()
  await expect(section).toContainText('Echo findings and an ejection fraction are not supplied')
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true)
  expect((await new AxeBuilder({ page }).include('[aria-labelledby="atlas-evidence-title"]').withTags(['wcag2a','wcag2aa','wcag21aa']).analyze()).violations).toEqual([])
  await page.screenshot({ path: info.outputPath('atlas-ward-connections.png'), fullPage: true })
  await page.getByRole('button', { name: 'Open Ward', exact: false }).click()
  await expect(page.getByRole('heading', { name: 'A clearer handover', exact: true })).toBeVisible()
  expect(writes).toEqual([])
})
