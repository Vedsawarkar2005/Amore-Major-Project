import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    // Fast contract tests use Hono's standards-based request helper without opening a port.
    environment: "node",
    include: ["apps/api/src/**/*.test.ts"],
    restoreMocks: true,
  },
});
