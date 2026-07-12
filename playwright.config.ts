import { defineConfig, devices } from "@playwright/test";

/**
 * Playwright config for a11y + visual-regression on the culture surface.
 * Runs against the local Vite dev server on :8080 (already running in Lovable sandbox;
 * `webServer` boots it locally / in CI).
 */
export default defineConfig({
  testDir: "./tests/e2e",
  timeout: 30_000,
  expect: {
    // Allow tiny anti-alias jitter; fail on real visual changes.
    toHaveScreenshot: { maxDiffPixelRatio: 0.02, threshold: 0.2 },
  },
  fullyParallel: true,
  reporter: process.env.CI
    ? [["list"], ["html", { open: "never", outputFolder: "playwright-report" }]]
    : [["list"]],
  use: {
    baseURL: "http://localhost:8080",
    trace: "retain-on-failure",
    screenshot: "only-on-failure",
    video: "retain-on-failure",
    // In CI / sandbox environments where the bundled chromium-headless-shell
    // is missing system libs, point at a full chromium if PLAYWRIGHT_CHROMIUM_PATH is set.
    ...(process.env.PLAYWRIGHT_CHROMIUM_PATH
      ? { launchOptions: { executablePath: process.env.PLAYWRIGHT_CHROMIUM_PATH } }
      : {}),
  },
  projects: [
    // Default surface: Chromium at desktop/tablet/mobile viewports.
    { name: "desktop", use: { ...devices["Desktop Chrome"], viewport: { width: 1440, height: 900 } } },
    { name: "tablet", use: { ...devices["Desktop Chrome"], viewport: { width: 834, height: 1112 } } },
    { name: "mobile", use: { ...devices["iPhone 13"] } },
    { name: "mobile-small", use: { ...devices["iPhone SE"] } },
    { name: "mobile-android", use: { ...devices["Pixel 5"] } },
    { name: "mobile-large", use: { ...devices["iPhone 13 Pro Max"] } },

    // Cross-browser matrix scoped to pricing-rows-a11y only (desktop + mobile).
    // Filter runs with `--project=pricing-*` to execute the cross-browser sweep.
    {
      name: "pricing-chromium-desktop",
      testMatch: /pricing-rows-a11y\.spec\.ts/,
      use: { ...devices["Desktop Chrome"], viewport: { width: 1440, height: 900 } },
    },
    {
      name: "pricing-chromium-mobile",
      testMatch: /pricing-rows-a11y\.spec\.ts/,
      use: { ...devices["Pixel 5"] },
    },
    {
      name: "pricing-firefox-desktop",
      testMatch: /pricing-rows-a11y\.spec\.ts/,
      use: { ...devices["Desktop Firefox"], viewport: { width: 1440, height: 900 } },
    },
    {
      name: "pricing-firefox-mobile",
      testMatch: /pricing-rows-a11y\.spec\.ts/,
      use: { ...devices["Desktop Firefox"], viewport: { width: 390, height: 844 } },
    },
    {
      name: "pricing-webkit-desktop",
      testMatch: /pricing-rows-a11y\.spec\.ts/,
      use: { ...devices["Desktop Safari"], viewport: { width: 1440, height: 900 } },
    },
    {
      name: "pricing-webkit-mobile",
      testMatch: /pricing-rows-a11y\.spec\.ts/,
      use: { ...devices["iPhone 13"] },
    },

    // Cross-browser matrix scoped to Gateway e2e + visual specs (desktop + mobile).
    // Filter runs with `--project=gateway-*` to execute the cross-browser sweep.
    {
      name: "gateway-chromium-desktop",
      testMatch: /gateway-coming-soon.*\.spec\.ts/,
      use: { ...devices["Desktop Chrome"], viewport: { width: 1440, height: 900 } },
    },
    {
      name: "gateway-chromium-mobile",
      testMatch: /gateway-coming-soon.*\.spec\.ts/,
      use: { ...devices["Pixel 5"] },
    },
    {
      name: "gateway-firefox-desktop",
      testMatch: /gateway-coming-soon.*\.spec\.ts/,
      use: { ...devices["Desktop Firefox"], viewport: { width: 1440, height: 900 } },
    },
    {
      name: "gateway-firefox-mobile",
      testMatch: /gateway-coming-soon.*\.spec\.ts/,
      use: { ...devices["Desktop Firefox"], viewport: { width: 390, height: 844 } },
    },
    {
      name: "gateway-webkit-desktop",
      testMatch: /gateway-coming-soon.*\.spec\.ts/,
      use: { ...devices["Desktop Safari"], viewport: { width: 1440, height: 900 } },
    },
    {
      name: "gateway-webkit-mobile",
      testMatch: /gateway-coming-soon.*\.spec\.ts/,
      use: { ...devices["iPhone 13"] },
    },
  ],
  webServer: {
    command: "bun run dev",
    url: "http://localhost:8080",
    reuseExistingServer: true,
    timeout: 60_000,
  },
});
