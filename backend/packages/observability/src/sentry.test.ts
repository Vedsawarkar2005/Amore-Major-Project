import { describe, expect, it, vi } from "vitest";
import { createSentryReporter, isSentryEnabled } from "./sentry.ts";

describe("Sentry policy", () => {
  it.each(["development", "test"] as const)("stays disabled in %s", (appEnvironment) => {
    expect(
      isSentryEnabled({ appEnvironment, dsn: "https://public@sentry.example.invalid/1" }),
    ).toBe(false);
  });

  it.each(["preview", "production"] as const)("requires a DSN in %s", (appEnvironment) => {
    expect(isSentryEnabled({ appEnvironment, dsn: undefined })).toBe(false);
    expect(
      isSentryEnabled({ appEnvironment, dsn: "https://public@sentry.example.invalid/1" }),
    ).toBe(true);
  });

  it("does not invoke the SDK through a disabled reporter", () => {
    const captureException = vi.fn();
    createSentryReporter(false, captureException).captureException(new Error("test"));
    expect(captureException).not.toHaveBeenCalled();
  });
});
