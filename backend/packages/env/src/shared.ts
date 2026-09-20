import type { StandardSchemaV1 } from "@t3-oss/env-core";
import { z } from "zod";

// Build mode and deployment environment are independent: production builds also run in preview.
export const nodeEnvSchema = z.enum(["development", "test", "production"]);
export const appEnvSchema = z.enum(["development", "test", "preview", "production"]);

export const nonEmptyStringSchema = z.string().trim().min(1);
export const urlSchema = z.url({ protocol: /^https?$/ });
export const secretSchema = z.string().min(32);

// Empty example-file entries mean "not configured"; non-empty values still require validation.
export function optionalValue<T extends z.ZodType>(schema: T) {
  return z.preprocess(
    (value) => (typeof value === "string" && value.trim() === "" ? undefined : value),
    schema.optional(),
  );
}

export const optionalNonEmptyStringSchema = optionalValue(nonEmptyStringSchema);
export const optionalUrlSchema = optionalValue(urlSchema);
export const optionalSecretSchema = optionalValue(secretSchema);
export const gaMeasurementIdSchema = z.string().regex(/^G-[A-Z0-9]{10}$/);

// T3 Env consumes schema dictionaries rather than one pre-composed Zod object.
// Keep this dictionary public-only so it is safe to reuse in browser entry points.
export const publicEnvSchema = {
  NEXT_PUBLIC_APP_ENV: appEnvSchema,
  NEXT_PUBLIC_APP_URL: urlSchema,
  NEXT_PUBLIC_API_URL: urlSchema,
  NEXT_PUBLIC_SENTRY_DSN: optionalUrlSchema,
  NEXT_PUBLIC_POSTHOG_KEY: optionalNonEmptyStringSchema,
  NEXT_PUBLIC_POSTHOG_HOST: optionalUrlSchema,
} satisfies Record<string, z.ZodType>;

/** Runtime values accepted by the framework-neutral environment factories. */
export type RuntimeEnv = Record<string, string | boolean | number | undefined>;

/** Report variable names without including secret input values in thrown errors. */
export function onValidationError(issues: readonly StandardSchemaV1.Issue[]): never {
  const fields = issues.map((issue) => String(issue.path?.join(".") || "Environment")).join(", ");
  throw new Error(`Invalid environment configuration: ${fields}`);
}
