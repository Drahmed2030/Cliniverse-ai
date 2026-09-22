import { test, expect } from '@playwright/test'
import AxeBuilder from '@axe-core/playwright'

test('reviewer can move from unified Learn into Ward v2 and Explore without changing account evidence', async ({ page, context }, info) => {
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
      if (url.pathname === '/rest/v1/profiles') return route.fulfill({ json: [{ id: user.id, name: 'Synthetic reviewer', rank: 'Clinical Learner' }], headers })
      if (url.pathname.startsWith('/rest/v1/')) return route.fulfill({ json: [], headers })
    }
    if (url.origin === 'http://127.0.0.1:3101' && url.pathname === '/api/reviewer-feature-access') {
      return route.fulfill({ json: { allowed: false } })
    }
    return route.abort()
  })

  await page.goto('/?view=learn')
  await expect(page.getByRole('heading', { name: 'Core practice', exact: true })).toBeVisible({ timeout: 30_000 })
  await page.getByRole('button', { name: /DECIDE.*Ward/s }).click()

  await expect(page.getByRole('heading', { name: 'Ward Simulation', exact: true })).toBeVisible()
  await expect(page.getByText('SIMULATED CASES (7)', { exact: true })).toBeVisible()

  await page.getByRole('button', { name: 'Open Hassan Al-Amri simulated case' }).click()
  await expect(page.getByRole('heading', { name: 'Hassan Al-Amri', exact: true })).toBeVisible()
  await expect(page.getByRole('heading', { name: 'Decision', exact: true })).toBeVisible()
  await expect(page.getByText('Case record', { exact: true })).toBeVisible()
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true)
  expect((await new AxeBuilder({ page }).include('[data-patient-journey]').withTags(['wcag2a','wcag2aa','wcag21aa']).analyze()).violations).toEqual([])

  await page.getByRole('button', { name: 'Close', exact: true }).click()
  await expect(page.getByRole('heading', { name: 'Ward Simulation', exact: true })).toBeVisible()

  await page.getByRole('navigation', { name: 'Primary' }).getByRole('button', { name: 'Explore', exact: true }).click()
  await expect(page.getByRole('heading', { name: 'Explore', exact: true })).toBeVisible()
  await expect(page.getByText('Clinical Reference', { exact: true })).toBeVisible()
  await expect(page.getByText('Cardiology Operations', { exact: true })).toBeVisible()
  await expect(page.getByText('Resuscitation', { exact: true })).toBeVisible()
  await expect(page.getByText('Pathway Replay', { exact: true })).toBeVisible()
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true)
  expect((await new AxeBuilder({ page }).include('[data-commercial-surface="explore"]').withTags(['wcag2a','wcag2aa','wcag21aa']).analyze()).violations).toEqual([])
  await page.screenshot({ path: info.outputPath('unified-learn-ward-explore.png'), fullPage: true })

  await page.getByRole('navigation', { name: 'Primary' }).getByRole('button', { name: 'Learn', exact: true }).click()
  await page.getByRole('button', { name: /DECIDE.*Ward/s }).click()
  await expect(page.getByRole('heading', { name: 'Ward Simulation', exact: true })).toBeVisible()

  expect(writes).toEqual([])
})
