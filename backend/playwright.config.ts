import { defineConfig, devices } from "@playwright/test";

const applications = [
  { name: "store", url: "http://localhost:3000" },
  { name: "admin", url: "http://localhost:3001" },
] as const;

const sites = [
  { name: "landing", app: "store", url: "http://localhost:3000" },
  { name: "store", app: "store", url: "http://store.localhost:3000" },
  { name: "admin", app: "admin", url: "http://localhost:3001" },
] as const;

export default defineConfig({
  // Browser suites can live in root e2e/ or an app's e2e/ directory.
  testDir: ".",
  testMatch: "{e2e,apps/*/e2e}/**/*.spec.ts",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : "50%",
  reporter: [["list"], ["html", { open: "never" }]],
  outputDir: "test-results",
  use: {
    trace: "on-first-retry",
    screenshot: "only-on-failure",
  },
  // Common smoke tests run against both apps; app-local suites stay with their own app.
  projects: sites.map((site) => ({
    name: `${site.name}-chromium`,
    testMatch: [`e2e/**/*.spec.ts`, `apps/${site.app}/e2e/**/*.spec.ts`],
    use: { ...devices["Desktop Chrome"], baseURL: site.url },
  })),
  webServer: applications.map((app) => ({
    // CI builds both apps before launching production servers; local runs use dev servers.
    command: process.env.CI ? `bun run --cwd apps/${app.name} start` : `bun run dev:${app.name}`,
    url: app.url,
    reuseExistingServer: !process.env.CI,
    // Let Next and Turbo terminate their child processes before Playwright releases the ports.
    gracefulShutdown: { signal: "SIGTERM", timeout: 5_000 },
    timeout: 120_000,
    env: {
      NEXT_PUBLIC_APP_ENV: "test",
      NEXT_PUBLIC_APP_URL: app.url,
      NEXT_PUBLIC_API_URL: "http://127.0.0.1:8787",
    },
  })),
});
