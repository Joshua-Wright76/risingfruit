import { defineConfig, devices } from '@playwright/test';

/**
 * Playwright configuration for Rising Fruit E2E tests
 * @see https://playwright.dev/docs/test-configuration
 */
export default defineConfig({
  testDir: './e2e',
  /* Run tests in files in parallel */
  fullyParallel: true,
  /* Fail the build on CI if you accidentally left test.only in the source code */
  forbidOnly: !!process.env.CI,
  /* Retry on CI only - reduced from 2 to 1 for faster builds */
  retries: process.env.CI ? 1 : 0,
  /* Use 1 worker to avoid overwhelming the dev server and Mapbox */
  workers: 1,
  /* Reporter to use */
  reporter: process.env.CI ? 'github' : 'html',
  /* Global timeout for each test - 60 seconds max */
  timeout: 60000,
  /* Expect timeout - 5 seconds for assertions */
  expect: {
    timeout: 5000,
  },
  /* Shared settings for all the projects below */
  use: {
    /* Base URL to use in actions like `await page.goto('/')` */
    baseURL: 'http://localhost:5173',
    /* Collect trace only on retry to save time */
    trace: 'on-first-retry',
    /* Screenshot on failure */
    screenshot: 'only-on-failure',
    /* Reduce action timeout */
    actionTimeout: 10000,
    /* Reduce navigation timeout */
    navigationTimeout: 15000,
  },

  /* Configure projects for major browsers */
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],

  /* Run your local dev server before starting the tests */
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:5173',
    reuseExistingServer: !process.env.CI,
    timeout: 60 * 1000, // Reduced from 120s to 60s
  },
});
