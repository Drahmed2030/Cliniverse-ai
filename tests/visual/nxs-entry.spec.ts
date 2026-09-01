import { expect, test } from '@playwright/test'
import AxeBuilder from '@axe-core/playwright'

const surfaces = [
  { name: 'login-en', path: '/', dir: 'ltr' },
]

for (const surface of surfaces) {
  test(`${surface.name} is accessible and baseline-ready`, async ({ page }, testInfo) => {
    await page.goto(surface.path, { waitUntil: 'networkidle' })

    await expect(page.getByText('Welcome back to Cliniverse.')).toBeVisible()
    await expect(page.getByRole('link', { name: 'Terms' })).toBeVisible()
    await expect(page.getByRole('link', { name: 'Privacy' })).toBeVisible()

    const accessibility = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
      .analyze()

    expect(accessibility.violations, JSON.stringify(accessibility.violations, null, 2)).toEqual([])

    await page.screenshot({
      path: testInfo.outputPath(`${surface.name}-${testInfo.project.name}.png`),
      fullPage: true,
      animations: 'disabled',
    })
  })
}
