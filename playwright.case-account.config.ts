import { defineConfig } from '@playwright/test'

// Deliberately local-only: this suite must never use a real account or preview URL.
export default defineConfig({
  testDir: './tests/visual', testMatch: /(?:case-account-progress|ward-atlas-connections)\.spec\.ts/,
  workers: 1, retries: 0, timeout: 90_000, maxFailures: 1,
  outputDir: 'test-results/case-account',
  reporter: [['list'], ['html', { outputFolder: 'playwright-report/case-account', open: 'never' }]],
  use: { baseURL: 'http://127.0.0.1:3101', serviceWorkers: 'block',
    trace: 'retain-on-failure', screenshot: 'only-on-failure', storageState: { cookies: [], origins: [] } },
  projects: [375, 768, 1280].flatMap(width => ['light', 'dark'].map(mode => ({
    name: `${width}-${mode}`,
    use: { viewport: { width, height: width === 375 ? 812 : 1000 },
      colorScheme: mode as 'light' | 'dark', reducedMotion: 'reduce' as const,
      hasTouch: width === 375 },
  }))),
  webServer: {
    command: 'npm run dev -- --hostname 127.0.0.1 --port 3101 --webpack',
    env: { CASE_ACCOUNT_PREVIEW_ENABLED: 'true', NEXT_TELEMETRY_DISABLED: '1' },
    url: 'http://127.0.0.1:3101/labs/case-batch-preview',
    reuseExistingServer: false, timeout: 120_000,
  },
})
