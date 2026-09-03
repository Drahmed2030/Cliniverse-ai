import { expect, test } from '@playwright/test'
import AxeBuilder from '@axe-core/playwright'

test('Pathway Replay completes the governed learning loop', async ({ page }, testInfo) => {
  await page.goto('/labs/pathway-replay', { waitUntil: 'networkidle' })

  await expect(page.getByRole('heading', { level: 1, name: 'STEMI Pathway Replay' })).toBeVisible()
  await expect(page.getByRole('button', { name: /Review brief/ })).toBeDisabled()
  await page.getByRole('button', { name: 'Open ECG drill' }).click()

  await expect(page.getByRole('heading', { level: 1, name: 'Door-to-ECG acquisition drill' })).toBeVisible()
  await page.getByRole('button', { name: /Synthetic V2 strip/ }).click()
  await page.getByRole('button', { name: /Synthetic V3 strip/ }).click()
  await page.getByRole('button', { name: /Synthetic V4 strip/ }).click()
  await page.getByRole('button', { name: 'Check selection' }).click()

  await expect(page.getByText('Configured marker found')).toBeVisible()
  await page.getByRole('button', { name: 'Open reassessment' }).click()
  await expect(page.getByRole('heading', { level: 1, name: 'Re-run the same operational competency' })).toBeVisible()
  await page.getByRole('button', { name: 'Create review brief' }).click()

  await expect(page.getByRole('heading', { level: 1, name: 'One reviewable pathway record' })).toBeVisible()
  await expect(page.getByText('Brief compiled; closure not granted')).toBeVisible()
  await expect(page.getByText('A licensed human reviewer still owns classification, evidence acceptance and final closure.')).toBeVisible()

  const accessibility = await new AxeBuilder({ page })
    .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
    .analyze()

  expect(accessibility.violations, JSON.stringify(accessibility.violations, null, 2)).toEqual([])

  await page.screenshot({
    path: testInfo.outputPath(`pathway-closure-${testInfo.project.name}.png`),
    fullPage: true,
    animations: 'disabled',
  })
})
