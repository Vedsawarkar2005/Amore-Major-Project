import { createEnv } from "@t3-oss/env-core";
import { z } from "zod";
import { serverEnvSchema } from "../server-schema.ts";
import { nodeEnvSchema, onValidationError, type RuntimeEnv } from "../shared.ts";
import { readStoreNodeRuntimeEnv } from "./runtime-node.ts";
import { storeClientSchema } from "./schema.ts";

/** Validate a complete storefront environment in server/config contexts. */
export function validateStoreEnv(runtimeEnv: RuntimeEnv) {
  return createEnv({
    clientPrefix: "NEXT_PUBLIC_",
    client: storeClientSchema,
    server: serverEnvSchema,
    shared: { NODE_ENV: nodeEnvSchema },
    runtimeEnv,
    // Cross-field rules belong in the combined server schema, not in browser-only modules.
    createFinalSchema: (shape) =>
      z.object(shape).superRefine((env, context) => {
        const requiredFields =
          env.NEXT_PUBLIC_APP_ENV === "production"
            ? ([
                "NEXT_PUBLIC_SENTRY_DSN",
                "SENTRY_ORG",
                "SENTRY_PROJECT",
                "NEXT_PUBLIC_POSTHOG_KEY",
                "NEXT_PUBLIC_POSTHOG_HOST",
                "NEXT_PUBLIC_GA_MEASUREMENT_ID",
              ] as const)
            : env.NEXT_PUBLIC_APP_ENV === "preview"
              ? (["NEXT_PUBLIC_SENTRY_DSN"] as const)
              : [];

        for (const field of requiredFields) {
          if (!env[field]) {
            context.addIssue({
              code: "custom",
              path: [field],
              message: `${field} is required in ${env.NEXT_PUBLIC_APP_ENV}`,
            });
          }
        }

        // An upload token activates build-time source maps and therefore needs their target.
        if (env.SENTRY_AUTH_TOKEN) {
          for (const field of ["SENTRY_ORG", "SENTRY_PROJECT"] as const) {
            if (!env[field]) {
              context.addIssue({
                code: "custom",
                path: [field],
                message: `${field} is required when SENTRY_AUTH_TOKEN is configured`,
              });
            }
          }
        }
      }),
    emptyStringAsUndefined: true,
    isServer: true,
    onValidationError,
  });
}

/** Validate the current Next.js/Node environment; other platforms call validateStoreEnv directly. */
export function loadStoreEnv() {
  return validateStoreEnv(readStoreNodeRuntimeEnv());
}
