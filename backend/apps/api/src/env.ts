import { validateApiEnv, validateApiPublicEnv } from "@amore/env/api/validation";

/**
 * Select only application bindings before validation. Cloudflare's generated interface is exact
 * and deliberately has no arbitrary string index signature.
 */
export function loadApiEnv(bindings: CloudflareBindings) {
  return validateApiEnv({
    APP_ENV: bindings.APP_ENV,
    API_URL: bindings.API_URL,
    LANDING_URL: bindings.LANDING_URL,
    STORE_URL: bindings.STORE_URL,
    ADMIN_URL: bindings.ADMIN_URL,
    DATABASE_URL: bindings.DATABASE_URL,
    BETTER_AUTH_SECRET: bindings.BETTER_AUTH_SECRET,
  });
}

/** Validate browser-safe routing values without requiring database or authentication secrets. */
export function loadApiPublicEnv(bindings: CloudflareBindings) {
  return validateApiPublicEnv({
    APP_ENV: bindings.APP_ENV,
    API_URL: bindings.API_URL,
    LANDING_URL: bindings.LANDING_URL,
    STORE_URL: bindings.STORE_URL,
    ADMIN_URL: bindings.ADMIN_URL,
  });
}

/** Trust only the three configured browser application origins. */
export function getTrustedOrigins(env: ReturnType<typeof loadApiPublicEnv>) {
  return [env.LANDING_URL, env.STORE_URL, env.ADMIN_URL];
}
