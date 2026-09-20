import "server-only";

import { createSentryRuntimeOptions } from "@amore/observability/sentry";
import * as Sentry from "@sentry/nextjs";
import { serverEnv } from "@/lib/env/server";

// Next selects the appropriate Sentry implementation when bundling Node and Edge runtimes.
Sentry.init(
  createSentryRuntimeOptions({
    appEnvironment: serverEnv.NEXT_PUBLIC_APP_ENV,
    dsn: serverEnv.NEXT_PUBLIC_SENTRY_DSN,
  }),
);
