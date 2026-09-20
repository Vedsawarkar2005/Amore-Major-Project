import { createEnv } from "@t3-oss/env-core";
import { z } from "zod";
import {
  appEnvSchema,
  onValidationError,
  type RuntimeEnv,
  secretSchema,
  urlSchema,
} from "../shared.ts";

const apiPublicSchema = {
  APP_ENV: appEnvSchema,
  API_URL: urlSchema,
  LANDING_URL: urlSchema,
  STORE_URL: urlSchema,
  ADMIN_URL: urlSchema,
} satisfies Record<string, z.ZodType>;

const apiServerSchema = {
  ...apiPublicSchema,
  DATABASE_URL: z.url({ protocol: /^postgres(?:ql)?$/ }),
  BETTER_AUTH_SECRET: secretSchema,
} satisfies Record<string, z.ZodType>;

/** Validate only non-secret Worker bindings used by routing and CORS middleware. */
export function validateApiPublicEnv(runtimeEnv: RuntimeEnv) {
  return createEnv({
    server: apiPublicSchema,
    runtimeEnv,
    emptyStringAsUndefined: true,
    isServer: true,
    onValidationError,
  });
}

/** Validate explicit Worker bindings without relying on process.env or a Node-only module. */
export function validateApiEnv(runtimeEnv: RuntimeEnv) {
  return createEnv({
    server: apiServerSchema,
    runtimeEnv,
    emptyStringAsUndefined: true,
    isServer: true,
    onValidationError,
  });
}
