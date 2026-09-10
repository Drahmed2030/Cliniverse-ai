import { expect, test, type Page } from '@playwright/test'
import AxeBuilder from '@axe-core/playwright'

const scenarios = [
  { id: 'compact-390x844-light', width: 390, height: 844, colorScheme: 'light' as const, contrast: 'no-preference' as const, reducedMotion: 'no-preference' as const, textScale: 1 },
  { id: 'compact-430x932-large-dark', width: 430, height: 932, colorScheme: 'dark' as const, contrast: 'more' as const, reducedMotion: 'reduce' as const, textScale: 1.25 },
  { id: 'expanded-820x1180-light', width: 820, height: 1180, colorScheme: 'light' as const, contrast: 'no-preference' as const, reducedMotion: 'no-preference' as const, textScale: 1 },
  { id: 'expanded-1180x820-dark', width: 1180, height: 820, colorScheme: 'dark' as const, contrast: 'more' as const, reducedMotion: 'reduce' as const, textScale: 1 },
  { id: 'wide-1440x1000-light', width: 1440, height: 1000, colorScheme: 'light' as const, contrast: 'no-preference' as const, reducedMotion: 'no-preference' as const, textScale: 1 },
] as const

const tabs = ['Today', 'Learn', 'Progress', 'Explore', 'Me'] as const

async function ensureAuthenticated(page: Page) {
  await page.goto('/', { waitUntil: 'networkidle' })

  if (await page.locator('[data-commercial-shell]').isVisible().catch(() => false)) return

  const email = process.env.CLINIVERSE_VISUAL_EMAIL?.trim()
  const password = process.env.CLINIVERSE_VISUAL_PASSWORD?.trim()
  test.skip(!email || !password, 'Provide CLINIVERSE_VISUAL_EMAIL and CLINIVERSE_VISUAL_PASSWORD, or CLINIVERSE_VISUAL_STORAGE_STATE, for authenticated commercial visual QA.')

  await page.getByRole('button', { name: 'Continue with email' }).click()
  await page.getByLabel('Email').fill(email!)
  await page.getByLabel('Password').fill(password!)
  await page.getByRole('button', { name: 'Sign in' }).click()
  await expect(page.locator('[data-commercial-shell]')).toBeVisible()
}

async function assertNoHorizontalOverflow(page: Page) {
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth)
  expect(overflow).toBeLessThanOrEqual(1)
}

async function assertNavigationMode(page: Page, width: number) {
  const nav = page.locator('[data-commercial-navigation]')
  const box = await nav.boundingBox()
  expect(box).not.toBeNull()

  if (width < 700) {
    expect(box!.width).toBeGreaterThan(250)
    expect(box!.height).toBeLessThan(100)
  } else {
    expect(box!.width).toBeLessThanOrEqual(width >= 1280 ? 100 : 80)
    expect(box!.height).toBeGreaterThan(250)
  }
}

for (const scenario of scenarios) {
  test(`${scenario.id} renders the commercial shell without responsive regressions`, async ({ page }, testInfo) => {
    await page.setViewportSize({ width: scenario.width, height: scenario.height })
    await page.emulateMedia({
      colorScheme: scenario.colorScheme,
      contrast: scenario.contrast,
      reducedMotion: scenario.reducedMotion,
    })

    await ensureAuthenticated(page)

    if (scenario.textScale > 1) {
      await page.addStyleTag({ content: `html { font-size: ${scenario.textScale * 100}% !important; }` })
    }

    const nav = page.getByRole('navigation', { name: 'Primary' })
    await expect(nav).toBeVisible()
    for (const tab of tabs) await expect(nav.getByRole('button', { name: tab })).toBeVisible()
    await expect(nav.getByRole('button', { name: 'Intelligence' })).toHaveCount(0)

    await assertNavigationMode(page, scenario.width)
    await assertNoHorizontalOverflow(page)

    for (const tab of tabs) {
      await nav.getByRole('button', { name: tab }).click()
      await expect(nav.getByRole('button', { name: tab })).toHaveAttribute('aria-current', 'page')
      await assertNoHorizontalOverflow(page)
    }

    await nav.getByRole('button', { name: 'Learn' }).click()
    await expect(page.locator('[data-commercial-learn-surface]')).toBeVisible()
    await expect(page.getByRole('button', { name: /^Ward Simulation/ })).toBeVisible()

    const accessibility = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
      .analyze()
    expect(accessibility.violations, JSON.stringify(accessibility.violations, null, 2)).toEqual([])

    await page.keyboard.press('Tab')
    const focusedOutline = await page.evaluate(() => {
      const active = document.activeElement
      if (!(active instanceof HTMLElement)) return 'none'
      return getComputedStyle(active).outlineStyle
    })
    expect(focusedOutline).not.toBe('none')

    await page.screenshot({
      path: testInfo.outputPath(`${scenario.id}.png`),
      fullPage: true,
      animations: 'disabled',
    })
  })
}
