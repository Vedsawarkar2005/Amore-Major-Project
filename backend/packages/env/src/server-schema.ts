import { z } from "zod";
import {
  optionalNonEmptyStringSchema,
  optionalSecretSchema,
  optionalUrlSchema,
  optionalValue,
} from "./shared.ts";

// Kept separate from public schemas so client entry points never reference private field names.
export const serverEnvSchema = {
  DATABASE_URL: optionalValue(z.url({ protocol: /^postgres(?:ql)?$/ })),
  DATABASE_URL_UNPOOLED: optionalValue(z.url({ protocol: /^postgres(?:ql)?$/ })),
  BETTER_AUTH_SECRET: optionalSecretSchema,
  BETTER_AUTH_URL: optionalUrlSchema,
  SENTRY_AUTH_TOKEN: optionalNonEmptyStringSchema,
  SENTRY_ORG: optionalNonEmptyStringSchema,
  SENTRY_PROJECT: optionalNonEmptyStringSchema,
} satisfies Record<string, z.ZodType>;
