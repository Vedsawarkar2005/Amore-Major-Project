import { configDefaults, defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    // One root runner discovers colocated unit tests across apps and packages.
    // Import test helpers from "vitest"; browser suites belong to Playwright.
    environment: "node",
    include: ["{apps,packages,tests}/**/*.{test,spec}.{ts,tsx,js,jsx,mts,mjs}"],
    exclude: [
      ...configDefaults.exclude,
      "**/e2e/**",
      "**/*.e2e.*",
      "**/dist/**",
      "**/build/**",
      "**/.next/**",
      // React Email's generated preview app includes its own upstream test fixtures.
      "**/.react-email/**",
    ],
    allowOnly: !process.env.CI,
    restoreMocks: true,
    coverage: {
      provider: "v8",
      reporter: ["text", "html", "lcov"],
      reportsDirectory: "./coverage",
      // Include untested source files in coverage once workspaces exist.
      include: ["{apps,packages}/*/src/**/*.{ts,tsx,js,jsx}"],
      exclude: ["**/*.d.ts", "**/*.{test,spec}.*", "**/e2e/**"],
    },
  },
});
