import type { MiddlewareHandler } from "hono";
import { cors } from "hono/cors";
import { getTrustedOrigins, loadApiPublicEnv } from "./env.ts";
import { getRuntimeServices } from "./runtime.ts";
import type { ApiContext } from "./types.ts";

/** Allow credentialed browser requests only from the configured Amore applications. */
export const withCors: MiddlewareHandler<ApiContext> = async (context, next) => {
  const env = loadApiPublicEnv(context.env);
  return cors({
    credentials: true,
    maxAge: 86_400,
    origin: getTrustedOrigins(env),
  })(context, next);
};

/** Prevent authenticated or user-specific responses from entering browser and shared caches. */
export const withNoStore: MiddlewareHandler<ApiContext> = async (context, next) => {
  await next();
  context.header("Cache-Control", "no-store");
};

/** Attach the shared database to Hono's typed context for downstream business routes. */
export const withDatabase: MiddlewareHandler<ApiContext> = async (context, next) => {
  context.set("db", getRuntimeServices(context.env).db);
  await next();
};
