import { afterEach, describe, expect, expectTypeOf, it, vi } from "vitest";
import { adminClientSchema } from "./admin/schema.ts";
import { validateAdminEnv } from "./admin/validation.ts";
import { validateApiEnv } from "./api/validation.ts";
import {
  appEnvSchema,
  gaMeasurementIdSchema,
  nodeEnvSchema,
  secretSchema,
  urlSchema,
} from "./shared.ts";
import { validateStoreEnv } from "./store/validation.ts";
import type { AdminClientEnv, StoreClientEnv } from "./types.ts";

// Synthetic values exercise validation only; tests never contact external services.
const minimalEnv = {
  NODE_ENV: "production",
  NEXT_PUBLIC_APP_ENV: "preview",
  NEXT_PUBLIC_APP_URL: "https://preview.amorecosmetics.in",
  NEXT_PUBLIC_API_URL: "https://api.amorecosmetics.in",
  NEXT_PUBLIC_SENTRY_DSN: "https://public@sentry.example.invalid/1",
};

const apiEnv = {
  APP_ENV: "development",
  API_URL: "http://127.0.0.1:8787",
  LANDING_URL: "http://localhost:3000",
  STORE_URL: "http://store.localhost:3000",
  ADMIN_URL: "http://admin.localhost:3000",
  DATABASE_URL: "postgresql://amore:amore@localhost:5432/amore",
  BETTER_AUTH_SECRET: "development-only-secret-change-before-production",
};

describe("shared schema fragments", () => {
  it.each(["development", "test", "preview", "production"])("accepts app mode %s", (mode) => {
    expect(appEnvSchema.parse(mode)).toBe(mode);
  });

  it.each(["development", "test", "production"])("accepts Node mode %s", (mode) => {
    expect(nodeEnvSchema.parse(mode)).toBe(mode);
  });

  it.each(["http://localhost:3000", "http://store.localhost:3000"])(
    "accepts local URL %s",
    (url) => {
      expect(urlSchema.safeParse(url).success).toBe(true);
    },
  );

  it.each(["not-a-url", "/relative", "javascript:alert(1)", "ftp://example.com"])(
    "rejects unsafe URL %s",
    (url) => expect(urlSchema.safeParse(url).success).toBe(false),
  );

  it("validates secrets and GA4 identifiers", () => {
    expect(secretSchema.safeParse("x".repeat(31)).success).toBe(false);
    expect(secretSchema.safeParse("x".repeat(32)).success).toBe(true);
    expect(gaMeasurementIdSchema.safeParse("G-ABC1234567").success).toBe(true);
    expect(gaMeasurementIdSchema.safeParse("UA-123456-1").success).toBe(false);
  });
});

describe.each([
  ["store", validateStoreEnv],
  ["admin", validateAdminEnv],
] as const)("%s T3 environment", (_app, validate) => {
  it("validates a minimal environment", () => {
    expect(validate(minimalEnv)).toMatchObject(minimalEnv);
  });

  it("uses T3 Env's recommended empty-string normalization", () => {
    const env = validate({ ...minimalEnv, DATABASE_URL: "", BETTER_AUTH_SECRET: "" });
    expect(env.DATABASE_URL).toBeUndefined();
    expect(env.BETTER_AUTH_SECRET).toBeUndefined();
  });

  it.each(["NEXT_PUBLIC_APP_ENV", "NEXT_PUBLIC_APP_URL", "NEXT_PUBLIC_API_URL", "NODE_ENV"])(
    "requires %s",
    (key) => {
      expect(() => validate({ ...minimalEnv, [key]: undefined })).toThrow(key);
    },
  );

  it.each([
    ["NEXT_PUBLIC_APP_URL", "invalid-url"],
    ["DATABASE_URL", "https://example.com"],
    ["BETTER_AUTH_SECRET", "too-short"],
  ])("rejects malformed %s", (key, value) => {
    expect(() => validate({ ...minimalEnv, [key]: value })).toThrow(key);
  });

  it("does not include invalid secret values in errors", () => {
    const secret = "private-test-value";
    expect(() => validate({ ...minimalEnv, DATABASE_URL: secret })).toThrowError(
      expect.objectContaining({ message: expect.not.stringContaining(secret) }),
    );
  });
});

describe("API Worker environment", () => {
  it("validates explicit Cloudflare bindings", () => {
    expect(validateApiEnv(apiEnv)).toMatchObject(apiEnv);
  });

  it.each([
    "API_URL",
    "LANDING_URL",
    "STORE_URL",
    "ADMIN_URL",
    "DATABASE_URL",
    "BETTER_AUTH_SECRET",
  ])("requires %s", (key) =>
    expect(() => validateApiEnv({ ...apiEnv, [key]: undefined })).toThrow(key),
  );

  it("redacts invalid database values", () => {
    const invalidDatabaseUrl = "private-database-value";
    expect(() => validateApiEnv({ ...apiEnv, DATABASE_URL: invalidDatabaseUrl })).toThrowError(
      expect.objectContaining({ message: expect.not.stringContaining(invalidDatabaseUrl) }),
    );
  });
});

describe("client/server boundaries", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
    vi.resetModules();
  });

  it("keeps server keys out of client types", () => {
    type ServerKey = "DATABASE_URL" | "BETTER_AUTH_SECRET" | "SENTRY_AUTH_TOKEN" | "NODE_ENV";
    expectTypeOf<Extract<keyof StoreClientEnv, ServerKey>>().toEqualTypeOf<never>();
    expectTypeOf<Extract<keyof AdminClientEnv, ServerKey>>().toEqualTypeOf<never>();
    expectTypeOf<
      Extract<keyof AdminClientEnv, "NEXT_PUBLIC_GA_MEASUREMENT_ID">
    >().toEqualTypeOf<never>();
  });

  it("keeps storefront-only GA4 out of admin", () => {
    expect(validateStoreEnv(minimalEnv).NEXT_PUBLIC_GA_MEASUREMENT_ID).toBeUndefined();
    expect(
      validateAdminEnv({ ...minimalEnv, NEXT_PUBLIC_GA_MEASUREMENT_ID: "bad" }),
    ).not.toHaveProperty("NEXT_PUBLIC_GA_MEASUREMENT_ID");
    expect(Object.keys(adminClientSchema)).not.toContain("NEXT_PUBLIC_GA_MEASUREMENT_ID");
  });

  it("exports only public values from browser entry points", async () => {
    vi.stubEnv("NEXT_PUBLIC_APP_ENV", "test");
    vi.stubEnv("NEXT_PUBLIC_APP_URL", "http://store.localhost:3000");
    vi.stubEnv("NEXT_PUBLIC_API_URL", "http://127.0.0.1:8787");
    vi.stubEnv("DATABASE_URL", "private-runtime-sentinel");
    const modules = [await import("./store/client.ts"), await import("./admin/client.ts")];
    for (const module of modules) {
      expect(Object.keys(module)).toEqual(["clientEnv"]);
      expect(JSON.stringify(module)).not.toContain("private-runtime-sentinel");
    }
  });
});

describe("integration requirements", () => {
  const productionBase = {
    NODE_ENV: "production",
    NEXT_PUBLIC_APP_ENV: "production",
    NEXT_PUBLIC_APP_URL: "https://store.amorecosmetics.in",
    NEXT_PUBLIC_API_URL: "https://api.amorecosmetics.in",
    NEXT_PUBLIC_SENTRY_DSN: "https://public@sentry.example.invalid/1",
    SENTRY_ORG: "amore-cosmetics",
    SENTRY_PROJECT: "storefront",
  };

  it("requires storefront analytics only in production", () => {
    expect(() => validateStoreEnv(productionBase)).toThrow("NEXT_PUBLIC_POSTHOG_KEY");
    expect(
      validateStoreEnv({
        ...productionBase,
        NEXT_PUBLIC_POSTHOG_KEY: "phc_test",
        NEXT_PUBLIC_POSTHOG_HOST: "https://us.i.posthog.com",
        NEXT_PUBLIC_GA_MEASUREMENT_ID: "G-ABC1234567",
      }),
    ).toMatchObject(productionBase);
  });

  it("allows admin PostHog to remain disabled in production", () => {
    expect(validateAdminEnv(productionBase)).toMatchObject(productionBase);
  });

  it("requires both admin PostHog values when either is configured", () => {
    expect(() =>
      validateAdminEnv({ ...productionBase, NEXT_PUBLIC_POSTHOG_KEY: "phc_test" }),
    ).toThrow("NEXT_PUBLIC_POSTHOG_HOST");
  });

  it("requires only a Sentry DSN for preview telemetry", () => {
    expect(() => validateStoreEnv({ ...minimalEnv, NEXT_PUBLIC_SENTRY_DSN: undefined })).toThrow(
      "NEXT_PUBLIC_SENTRY_DSN",
    );
    expect(validateStoreEnv(minimalEnv).SENTRY_ORG).toBeUndefined();
  });

  it("requires a Sentry target only when source-map upload is configured", () => {
    expect(() => validateStoreEnv({ ...minimalEnv, SENTRY_AUTH_TOKEN: "upload-token" })).toThrow(
      "SENTRY_ORG",
    );
  });

  it("does not require integration credentials in development or test", () => {
    for (const appEnvironment of ["development", "test"] as const) {
      expect(
        validateStoreEnv({
          NODE_ENV: appEnvironment,
          NEXT_PUBLIC_APP_ENV: appEnvironment,
          NEXT_PUBLIC_APP_URL: "http://store.localhost:3000",
          NEXT_PUBLIC_API_URL: "http://127.0.0.1:8787",
        }),
      ).toMatchObject({ NEXT_PUBLIC_APP_ENV: appEnvironment });
    }
  });
});
