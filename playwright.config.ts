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
  reporter: [["list"]],
  use: {
    baseURL: "http://localhost:8080",
    trace: "retain-on-failure",
    // In CI / sandbox environments where the bundled chromium-headless-shell
    // is missing system libs, point at a full chromium if PLAYWRIGHT_CHROMIUM_PATH is set.
    ...(process.env.PLAYWRIGHT_CHROMIUM_PATH
      ? { launchOptions: { executablePath: process.env.PLAYWRIGHT_CHROMIUM_PATH } }
      : {}),
  },
  projects: [
    { name: "desktop", use: { ...devices["Desktop Chrome"], viewport: { width: 1440, height: 900 } } },
    { name: "tablet", use: { ...devices["Desktop Chrome"], viewport: { width: 834, height: 1112 } } },
    { name: "mobile", use: { ...devices["iPhone 13"] } },
  ],
  webServer: {
    command: "bun run dev",
    url: "http://localhost:8080",
    reuseExistingServer: true,
    timeout: 60_000,
  },
});
