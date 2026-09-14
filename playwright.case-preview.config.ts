import { defineConfig } from '@playwright/test'
export default defineConfig({
  testDir: './tests/visual', testMatch: /case-batch-preview\.spec\.ts/,
  workers: 1, retries: 0, timeout: 60_000,
  reporter: [['list'], ['html', { open: 'never' }]],
  use: { baseURL: 'http://127.0.0.1:3100', trace: 'retain-on-failure' },
  webServer: { command: 'npm run dev -- --hostname 127.0.0.1 --port 3100 --webpack', url: 'http://127.0.0.1:3100/labs/case-batch-preview', reuseExistingServer: !process.env.CI, timeout: 120_000 },
})
