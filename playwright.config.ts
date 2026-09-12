import { defineConfig } from '@playwright/test'

const externalBaseURL = process.env.CLINIVERSE_VISUAL_BASE_URL
const storageState = process.env.CLINIVERSE_VISUAL_STORAGE_STATE

export default defineConfig({
  testDir: './tests/visual',
  timeout: 45_000,
  expect: { timeout: 7_500 },
  retries: process.env.CI ? 1 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: process.env.CI ? [['line'], ['html', { open: 'never' }]] : 'list',
  use: {
    baseURL: externalBaseURL ?? 'http://127.0.0.1:3000',
    browserName: 'chromium',
    reducedMotion: 'reduce',
    colorScheme: 'dark',
    locale: 'en-US',
    screenshot: 'only-on-failure',
    trace: 'retain-on-failure',
    storageState: storageState || undefined,
  },
  webServer: externalBaseURL
    ? undefined
    : {
        command: 'npm run dev -- --hostname 127.0.0.1',
        url: 'http://127.0.0.1:3000',
        reuseExistingServer: !process.env.CI,
        timeout: 120_000,
      },
  projects: [
    {
      name: 'iphone',
      use: { viewport: { width: 390, height: 844 }, deviceScaleFactor: 1, isMobile: true, hasTouch: true },
    },
    {
      name: 'ipad',
      use: { viewport: { width: 820, height: 1180 }, deviceScaleFactor: 1, isMobile: true, hasTouch: true },
    },
  ],
})
