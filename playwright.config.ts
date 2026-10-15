import { defineConfig } from '@playwright/test'

// Smoke-tests the production build (run `npm run build` first). Chromium is
// forced onto SwiftShader everywhere — CI runners have no GPU, and using the
// same software renderer locally keeps results comparable.
export default defineConfig({
  testDir: 'e2e',
  timeout: 300_000,
  retries: process.env.CI ? 1 : 0,
  reporter: process.env.CI ? [['list'], ['html', { open: 'never' }]] : 'list',
  use: {
    baseURL: 'http://localhost:4173',
    viewport: { width: 1280, height: 800 },
    // Optional: PW_CHANNEL=chrome uses your installed Chrome instead of
    // downloading Playwright's Chromium.
    channel: process.env.PW_CHANNEL,
    launchOptions: { args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader'] },
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
  },
  webServer: {
    command: 'npm run preview -- --port 4173 --strictPort',
    url: 'http://localhost:4173',
    reuseExistingServer: !process.env.CI,
    timeout: 60_000,
  },
})
