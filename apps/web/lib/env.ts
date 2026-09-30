import { createEnv } from "@t3-oss/env-nextjs";
import { z } from "zod";

/*
 * Typed, validated environment variables. Read them from `env`, never
 * `process.env`. Server vars throw if imported into client code. Imported by
 * next.config.ts, so a bad value fails `next dev` / `next build` up front.
 * Document new vars in .env.local.
 */
export const env = createEnv({
  server: {
    /** Newsletter sign-ups are POSTed here. Unset logs them in development. */
    NEWSLETTER_WEBHOOK_URL: z.url().optional(),
  },
  client: {
    /** Express + Neon API base URL, e.g. https://api.amorecosmetics.in */
    NEXT_PUBLIC_API_URL: z.string().url().optional(),
  },
  experimental__runtimeEnv: {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL,
  },
  // `FOO=` in .env files counts as unset.
  emptyStringAsUndefined: true,
  // For CI steps (lint, Docker) that build without real secrets.
  skipValidation: !!process.env.SKIP_ENV_VALIDATION,
});
