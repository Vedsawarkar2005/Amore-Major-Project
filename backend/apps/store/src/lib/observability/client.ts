"use client";

import { clientEnv } from "@amore/env/store/client";
import { createSentryReporter, isSentryEnabled } from "@amore/observability/sentry";
import * as Sentry from "@sentry/nextjs";

// UI boundaries use this adapter instead of coupling application components to Sentry.
export const clientErrorReporter = createSentryReporter(
  isSentryEnabled({
    appEnvironment: clientEnv.NEXT_PUBLIC_APP_ENV,
    dsn: clientEnv.NEXT_PUBLIC_SENTRY_DSN,
  }),
  Sentry.captureException,
);
