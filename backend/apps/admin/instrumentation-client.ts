import { initializeAnalytics } from "@amore/analytics";
import { clientEnv } from "@amore/env/admin/client";
import { createSentryRuntimeOptions } from "@amore/observability/sentry";
import * as Sentry from "@sentry/nextjs";

const hasPostHogConfig = Boolean(
  clientEnv.NEXT_PUBLIC_POSTHOG_KEY && clientEnv.NEXT_PUBLIC_POSTHOG_HOST,
);

Sentry.init(
  createSentryRuntimeOptions({
    appEnvironment: clientEnv.NEXT_PUBLIC_APP_ENV,
    dsn: clientEnv.NEXT_PUBLIC_SENTRY_DSN,
  }),
);

// Admin analytics is explicit opt-in: production mode plus a complete key/host pair.
initializeAnalytics({
  posthog: {
    enabled: clientEnv.NEXT_PUBLIC_APP_ENV === "production" && hasPostHogConfig,
    key: clientEnv.NEXT_PUBLIC_POSTHOG_KEY,
    host: clientEnv.NEXT_PUBLIC_POSTHOG_HOST,
  },
  ga4: { enabled: false },
});

export const onRouterTransitionStart = Sentry.captureRouterTransitionStart;
