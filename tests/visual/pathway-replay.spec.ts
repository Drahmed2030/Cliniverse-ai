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

test('Clinical Studio completes the licensed real A4C lesson with reduced motion', async ({ page }, testInfo) => {
  await page.goto('/labs/pathway-replay', { waitUntil: 'networkidle' })
  await page.getByRole('button', { name: 'Open Code Lab ECG drill' }).click()
  await page.getByRole('button', { name: 'Open Clinical Studio' }).click()

  await expect(page.getByRole('heading', { level: 2, name: 'Recognize the A4C view without over-interpreting a short loop' })).toBeVisible()
  await expect(page.getByLabel('Licensed real apical four-chamber echocardiography cine')).toBeVisible()
  await expect(page.getByText('Licensed cine · rights verified')).toBeVisible()
  await expect(page.getByText('Reduced Motion active', { exact: false })).toBeVisible()

  await page.getByRole('button', { name: 'Apical four-chamber (A4C)' }).click()
  await page.getByRole('button', { name: 'Four chambers, AV valve planes and septa' }).click()
  await page.getByRole('button', { name: 'Use the source-labelled normal cine for view recognition only' }).click()
  await page.getByRole('button', { name: 'Check all three answers' }).click()
  await expect(page.getByText('A4C check passed')).toBeVisible()
  await expect(page.getByLabel('Unified completion receipt')).toBeVisible()

  const sourceRecord = page.locator('details').filter({ hasText: 'CardioNetworks / Vdbilt · CC BY-SA 3.0' })
  await sourceRecord.locator('summary').click()
  await expect(page.getByRole('link', { name: 'Source file page' })).toBeVisible()

  const accessibility = await new AxeBuilder({ page })
    .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
    .analyze()

  expect(accessibility.violations, JSON.stringify(accessibility.violations, null, 2)).toEqual([])

  await page.screenshot({
    path: testInfo.outputPath(`a4c-cine-lesson-${testInfo.project.name}.png`),
    fullPage: true,
    animations: 'disabled',
  })
})

test('Clinical Studio contains every export canvas inside the active device viewport', async ({ page }) => {
  await page.goto('/labs/pathway-replay', { waitUntil: 'networkidle' })
  await page.getByRole('button', { name: 'Open Code Lab ECG drill' }).click()
  await page.getByRole('button', { name: 'Open Clinical Studio' }).click()

  const preview = page.getByTestId('clinical-media-preview')
  const stage = page.getByTestId('clinical-media-stage')
  const playerViewport = page.getByTestId('clinical-media-player-viewport')

  for (const target of [
    { label: '16:9', format: 'landscape' },
    { label: '9:16', format: 'portrait' },
    { label: '1:1', format: 'square' },
  ]) {
    await page.getByRole('button', { name: target.label, exact: true }).click()
    await expect(playerViewport).toHaveAttribute('data-export-format', target.format)

    const stageBox = await stage.boundingBox()
    const playerBox = await playerViewport.boundingBox()
    expect(stageBox).not.toBeNull()
    expect(playerBox).not.toBeNull()
    expect(playerBox!.x).toBeGreaterThanOrEqual(stageBox!.x - 1)
    expect(playerBox!.x + playerBox!.width).toBeLessThanOrEqual(stageBox!.x + stageBox!.width + 1)

    const stageWidths = await stage.evaluate(element => ({
      clientWidth: element.clientWidth,
      scrollWidth: element.scrollWidth,
    }))
    expect(stageWidths.scrollWidth).toBeLessThanOrEqual(stageWidths.clientWidth + 1)
  }

  const previewWidths = await preview.evaluate(element => ({
    clientWidth: element.clientWidth,
    scrollWidth: element.scrollWidth,
  }))
  expect(previewWidths.scrollWidth).toBeLessThanOrEqual(previewWidths.clientWidth + 1)
  await expect(page.getByLabel('Licensed real apical four-chamber echocardiography cine')).toHaveCSS('object-fit', 'contain')

  for (const button of await page.getByRole('group', { name: 'Export format' }).getByRole('button').all()) {
    const box = await button.boundingBox()
    expect(box).not.toBeNull()
    expect(box!.height).toBeGreaterThanOrEqual(44)
  }
})
