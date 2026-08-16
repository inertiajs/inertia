import { defineConfig, devices } from '@playwright/test'

export default defineConfig({
  testDir: './tests/Browser',
  fullyParallel: false,
  retries: process.env.CI ? 2 : 0,
  use: {
    baseURL: 'http://127.0.0.1:13722',
    trace: 'on-first-retry',
  },
  projects: [{ name: 'chromium', use: devices['Desktop Chrome'] }],
  webServer: [
    {
      command: 'node bootstrap/ssr/ssr.js',
      url: 'http://127.0.0.1:13714/health',
      reuseExistingServer: !process.env.CI,
    },
    {
      command: 'php artisan serve --host=127.0.0.1 --port=13722',
      url: 'http://127.0.0.1:13722',
      reuseExistingServer: !process.env.CI,
    },
  ],
})
