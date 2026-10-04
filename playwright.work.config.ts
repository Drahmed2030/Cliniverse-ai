import { defineConfig } from '@playwright/test'
export default defineConfig({
  testDir: './tests/visual', testMatch: /work-(review|cache-upgrade)\.spec\.ts/,
  timeout: 45000, retries: 0, workers: 1, reporter: 'list',
  use: { baseURL: 'http://127.0.0.1:3107', browserName: 'chromium', reducedMotion: 'reduce', screenshot: 'only-on-failure' },
  webServer: { command: 'npm run dev -- --hostname 127.0.0.1 --port 3107', url: 'http://127.0.0.1:3107/manifest.json', reuseExistingServer: true, timeout: 120000 },
  projects: [
    { name: 'phone', use: { viewport: { width: 390, height: 844 }, colorScheme: 'light' } },
    { name: 'large-text', use: { viewport: { width: 430, height: 932 }, colorScheme: 'dark' } },
    { name: 'tablet', use: { viewport: { width: 820, height: 1180 }, colorScheme: 'light' } },
    { name: 'landscape', use: { viewport: { width: 1180, height: 820 }, colorScheme: 'dark' } },
    { name: 'desktop', use: { viewport: { width: 1440, height: 1000 }, colorScheme: 'light' } },
  ],
})
