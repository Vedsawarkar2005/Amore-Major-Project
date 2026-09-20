import { type AmoreAuth, createDrizzleAuth } from "@amore/auth/server";
import { createDatabase, type Database } from "@amore/database";
import { getTrustedOrigins, loadApiEnv } from "./env.ts";

export type RuntimeServices = {
  auth: AmoreAuth;
  db: Database;
};

let cachedServices: RuntimeServices | undefined;

/**
 * Build expensive clients once per Worker isolate. Bindings are deployment-scoped and immutable,
 * so a warm isolate can safely reuse the Neon HTTP client and Better Auth instance.
 */
export function getRuntimeServices(bindings: CloudflareBindings): RuntimeServices {
  if (cachedServices) {
    return cachedServices;
  }

  const env = loadApiEnv(bindings);
  const db = createDatabase({ url: env.DATABASE_URL });

  cachedServices = {
    db,
    auth: createDrizzleAuth({
      baseURL: env.API_URL,
      database: db,
      secret: env.BETTER_AUTH_SECRET,
      trustedOrigins: getTrustedOrigins(env),
    }),
  };

  return cachedServices;
}
