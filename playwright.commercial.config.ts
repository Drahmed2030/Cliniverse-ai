import { defineConfig } from '@playwright/test'

const externalBaseUrl = process.env.CLINIVERSE_VISUAL_BASE_URL?.trim()
const storageState = process.env.CLINIVERSE_VISUAL_STORAGE_STATE?.trim()

export default defineConfig({
  testDir: './tests/visual',
  testMatch: /commercial-visual-regression\.spec\.ts/,
  timeout: 45_000,
  expect: { timeout: 7_500 },
  retries: process.env.CI ? 1 : 0,
  workers: 1,
  reporter: process.env.CI ? [['line'], ['html', { open: 'never' }]] : 'list',
  use: {
    baseURL: externalBaseUrl || 'http://127.0.0.1:3000',
    browserName: 'chromium',
    locale: 'en-US',
    screenshot: 'only-on-failure',
    trace: 'retain-on-failure',
    ...(storageState ? { storageState } : {}),
  },
  ...(externalBaseUrl
    ? {}
    : {
        webServer: {
          command: 'npm run dev -- --hostname 127.0.0.1',
          url: 'http://127.0.0.1:3000',
          reuseExistingServer: !process.env.CI,
          timeout: 120_000,
        },
      }),
  projects: [
    {
      name: 'commercial-visual',
      use: { deviceScaleFactor: 1 },
    },
  ],
})
