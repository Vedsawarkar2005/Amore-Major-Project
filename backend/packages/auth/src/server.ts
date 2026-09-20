import { brandConfig } from "@amore/config/brand";
import { apiRoutes } from "@amore/config/service";
import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";

/** Values required by Better Auth, supplied by the host runtime instead of read globally. */
export type AuthRuntimeConfig = {
  /** High-entropy secret with at least 32 characters. */
  secret: string;
  /** Canonical origin for the auth server (for example, https://api.amorecosmetics.in). */
  baseURL: string;
  /** Optional database adapter; omit only for Better Auth's stateless mode. */
  database?: NonNullable<Parameters<typeof betterAuth>[0]>["database"];
  /** Origins allowed to send authenticated requests. */
  trustedOrigins?: string[];
};

/**
 * Build the shared Better Auth server instance.
 *
 * Keeping construction in a factory prevents import-time access to process.env and lets a
 * Cloudflare Worker pass bindings while Next.js passes validated Node runtime values.
 */
export function createAuth(config: AuthRuntimeConfig) {
  return betterAuth({
    appName: brandConfig.name,
    baseURL: config.baseURL,
    basePath: apiRoutes.auth,
    secret: config.secret,
    ...(config.database ? { database: config.database } : {}),
    ...(config.trustedOrigins ? { trustedOrigins: config.trustedOrigins } : {}),
    emailAndPassword: {
      enabled: true,
    },
    session: {
      expiresIn: 60 * 60 * 24 * 7,
      updateAge: 60 * 60 * 24,
      cookieCache: {
        enabled: true,
        maxAge: 60 * 5,
      },
    },
  });
}

/**
 * Configure Better Auth with a Drizzle database while keeping the database client owned by the
 * host package. The provider is fixed to PostgreSQL because this package targets Neon.
 */
export function createDrizzleAuth(
  config: AuthRuntimeConfig & {
    database: Parameters<typeof drizzleAdapter>[0];
  },
) {
  return createAuth({
    ...config,
    database: drizzleAdapter(config.database, { provider: "pg" }),
  });
}

export type AmoreAuth = ReturnType<typeof createAuth>;
export type AmoreSession = AmoreAuth["$Infer"]["Session"];
