import { createEnv } from "@t3-oss/env-core";
import { z } from "zod";
import { serverEnvSchema } from "../server-schema.ts";
import { nodeEnvSchema, onValidationError, type RuntimeEnv } from "../shared.ts";
import { readAdminNodeRuntimeEnv } from "./runtime-node.ts";
import { adminClientSchema } from "./schema.ts";

/** Validate a complete admin environment in server/config contexts. */
export function validateAdminEnv(runtimeEnv: RuntimeEnv) {
  return createEnv({
    clientPrefix: "NEXT_PUBLIC_",
    client: adminClientSchema,
    server: serverEnvSchema,
    shared: { NODE_ENV: nodeEnvSchema },
    runtimeEnv,
    createFinalSchema: (shape) =>
      z.object(shape).superRefine((env, context) => {
        const sentryFields =
          env.NEXT_PUBLIC_APP_ENV === "production"
            ? (["NEXT_PUBLIC_SENTRY_DSN", "SENTRY_ORG", "SENTRY_PROJECT"] as const)
            : env.NEXT_PUBLIC_APP_ENV === "preview"
              ? (["NEXT_PUBLIC_SENTRY_DSN"] as const)
              : [];

        for (const field of sentryFields) {
          if (!env[field]) {
            context.addIssue({
              code: "custom",
              path: [field],
              message: `${field} is required in ${env.NEXT_PUBLIC_APP_ENV}`,
            });
          }
        }

        // Source-map upload cannot resolve its destination without both Sentry slugs.
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

        // Supplying either admin PostHog value explicitly enables analytics, so require the pair.
        if (env.NEXT_PUBLIC_APP_ENV === "production") {
          const posthogFields = ["NEXT_PUBLIC_POSTHOG_KEY", "NEXT_PUBLIC_POSTHOG_HOST"] as const;
          if (posthogFields.some((field) => Boolean(env[field]))) {
            for (const field of posthogFields) {
              if (!env[field]) {
                context.addIssue({
                  code: "custom",
                  path: [field],
                  message: `${field} is required when admin PostHog is configured`,
                });
              }
            }
          }
        }
      }),
    emptyStringAsUndefined: true,
    isServer: true,
    onValidationError,
  });
}

/** Validate the current Next.js/Node environment; other platforms inject their own bindings. */
export function loadAdminEnv() {
  return validateAdminEnv(readAdminNodeRuntimeEnv());
}
