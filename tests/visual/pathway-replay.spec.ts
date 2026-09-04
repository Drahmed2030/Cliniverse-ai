import { expect, test } from '@playwright/test'
import AxeBuilder from '@axe-core/playwright'

test('Pathway Replay completes the governed learning loop', async ({ page }, testInfo) => {
  await page.goto('/labs/pathway-replay', { waitUntil: 'networkidle' })

  await expect(page.getByRole('heading', { level: 1, name: 'STEMI Pathway Replay' })).toBeVisible()
  await expect(page.getByRole('heading', { level: 2, name: 'Medical Operations Registry' })).toBeVisible()
  await expect(page.getByText('Clinical rule blocked')).toBeVisible()
  await expect(page.getByText('DEMO-PATHWAY-RULESET-V1', { exact: false }).first()).toBeVisible()
  await expect(page.getByRole('button', { name: /Review brief/ })).toBeDisabled()
  await page.getByRole('button', { name: 'Open Code Lab ECG drill' }).click()

  await expect(page.getByRole('heading', { level: 1, name: 'Door-to-ECG acquisition drill' })).toBeVisible()
  await expect(page.getByRole('heading', { level: 2, name: 'One activity, one governed return path' })).toBeVisible()
  await page.getByRole('button', { name: /Synthetic V2 strip/ }).click()
  await page.getByRole('button', { name: /Synthetic V3 strip/ }).click()
  await page.getByRole('button', { name: /Synthetic V4 strip/ }).click()
  await page.getByRole('button', { name: 'Check selection' }).click()

  await expect(page.getByText('Configured marker found')).toBeVisible()
  await expect(page.getByLabel('Code Lab completion receipt')).toBeVisible()
  await page.getByRole('button', { name: 'Open reassessment' }).click()
  await expect(page.getByRole('heading', { level: 1, name: 'Re-run the same operational competency' })).toBeVisible()
  await page.getByRole('button', { name: 'Create review brief' }).click()

  await expect(page.getByRole('heading', { level: 1, name: 'One reviewable pathway record' })).toBeVisible()
  await expect(page.getByText('Brief compiled; closure not granted')).toBeVisible()
  await expect(page.getByRole('heading', { level: 3, name: 'Medical Operations Registry' })).toBeVisible()
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

test('Clinical Studio completes the bilingual Echo cine lesson with reduced motion', async ({ page }, testInfo) => {
  await page.goto('/labs/pathway-replay', { waitUntil: 'networkidle' })
  await page.getByRole('button', { name: 'Open Code Lab ECG drill' }).click()
  await page.getByRole('button', { name: 'Open Clinical Studio' }).click()
  await page.getByRole('button', { name: 'ECHO' }).click()

  await expect(page.getByRole('heading', { level: 2, name: 'Recognize the scientific object and its safe boundary' })).toBeVisible()
  await expect(page.locator('canvas[role="img"]')).toHaveAttribute('aria-label', /Synthetic frame 23 of 90/)
  await expect(page.getByRole('button', { name: 'Play synthetic cine loop' })).toBeDisabled()
  await expect(page.getByText('Reduced motion is on.', { exact: false })).toBeVisible()

  await page.getByRole('button', { name: 'An ordered sequence of cine frames' }).click()
  await page.getByRole('button', { name: 'Describe the visible cyclical motion only' }).click()
  await page.getByRole('button', { name: 'Check both answers' }).click()
  await expect(page.getByText('Boundary check passed')).toBeVisible()
  await expect(page.getByLabel('Unified completion receipt')).toBeVisible()

  const accessibility = await new AxeBuilder({ page })
    .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
    .analyze()

  expect(accessibility.violations, JSON.stringify(accessibility.violations, null, 2)).toEqual([])

  await page.getByRole('button', { name: 'عربي' }).click()
  await expect(page.getByRole('heading', { level: 2, name: 'تعرّف إلى الكائن العلمي وحدوده الآمنة' })).toBeVisible()
  await expect(page.locator('canvas[role="img"]')).toHaveAttribute('aria-label', /الإطار الاصطناعي 23 من 90/)

  await page.screenshot({
    path: testInfo.outputPath(`echo-cine-lesson-${testInfo.project.name}.png`),
    fullPage: true,
    animations: 'disabled',
  })
})
