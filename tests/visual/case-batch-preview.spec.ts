import { test, expect } from '@playwright/test'
import AxeBuilder from '@axe-core/playwright'

const sizes = [
  { name: 'small-phone', width: 375, height: 812, large: false },
  { name: 'phone', width: 390, height: 844, large: false },
  { name: 'large-text-dark', width: 430, height: 932, large: true },
  { name: 'tablet-portrait', width: 820, height: 1180, large: false },
  { name: 'tablet-landscape', width: 1180, height: 820, large: false },
  { name: 'desktop', width: 1440, height: 1000, large: false },
]
for (const size of sizes) test(`case flow / ${size.name}`, async ({ page }, testInfo) => {
  await page.setViewportSize(size)
  await page.emulateMedia({ colorScheme: size.large ? 'dark' : 'light', reducedMotion: 'reduce' })
  const errors: string[] = []
  page.on('pageerror', error => errors.push(error.message))
  await page.goto('/labs/case-batch-preview')
  if (size.large) await page.addStyleTag({ content: 'html { font-size: 200% !important; }' })
  await expect(page.getByRole('button', { name: /Explore draft/ })).toHaveCount(20)
  async function checkLayout(label: string) {
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true)
    const overflowing = await page.locator('main article, main section, dialog[open]').evaluateAll(nodes => nodes.filter(n => n.scrollWidth > n.clientWidth + 1).length)
    expect(overflowing).toBe(0)
    expect((await new AxeBuilder({ page }).include('main').withTags(['wcag2a','wcag2aa','wcag21aa']).analyze()).violations).toEqual([])
    await page.screenshot({ path: testInfo.outputPath(`${label}.png`), fullPage: true })
  }
  await checkLayout('catalogue')
  await page.getByRole('button', { name: 'ECG', exact: true }).click()
  const first = page.getByRole('button', { name: /Explore draft: Anterior STEMI/ })
  await first.click()
  await expect(page.getByRole('heading', { level: 1 })).toBeFocused()
  await page.getByRole('button', { name: 'Continue to question' }).click()
  await expect(page.getByRole('button', { name: 'Review explanation', exact: true })).toBeDisabled()
  await page.getByRole('radio').nth(1).check()
  await page.getByRole('button', { name: 'Review explanation', exact: true }).click()
  await expect(page.getByRole('heading', { name: 'Understand the reasoning' })).toBeVisible()
  await checkLayout('explanation')
  await page.goBack()
  await expect(page.getByRole('radio').nth(1)).toBeChecked()
  const help = page.getByRole('button', { name: 'How this works' })
  await help.click()
  const modal = page.getByRole('dialog')
  await expect(modal).toBeVisible()
  await page.keyboard.press('Tab')
  expect(await modal.evaluate(n => n.contains(document.activeElement))).toBe(true)
  await checkLayout('dialog')
  await page.keyboard.press('Escape')
  await expect(modal).not.toBeVisible()
  await expect(help).toBeFocused()
  await page.getByRole('button', { name: '← Previous step' }).click()
  await page.getByRole('button', { name: '← Back to cases' }).click()
  await expect(first).toBeFocused()
  await expect(page.getByRole('button', { name: 'ECG', exact: true })).toHaveAttribute('aria-pressed', 'true')
  expect(errors).toEqual([])
})
