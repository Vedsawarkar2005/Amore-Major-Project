import { initializeAnalytics } from "@amore/analytics";
import { clientEnv } from "@amore/env/store/client";
import { createSentryRuntimeOptions } from "@amore/observability/sentry";
import * as Sentry from "@sentry/nextjs";

const isProduction = clientEnv.NEXT_PUBLIC_APP_ENV === "production";

// Next runs this module before hydration, which avoids missed early errors and analytics races.
Sentry.init(
  createSentryRuntimeOptions({
    appEnvironment: clientEnv.NEXT_PUBLIC_APP_ENV,
    dsn: clientEnv.NEXT_PUBLIC_SENTRY_DSN,
  }),
);

initializeAnalytics({
  posthog: {
    enabled: isProduction,
    key: clientEnv.NEXT_PUBLIC_POSTHOG_KEY,
    host: clientEnv.NEXT_PUBLIC_POSTHOG_HOST,
  },
  ga4: {
    enabled: isProduction && Boolean(clientEnv.NEXT_PUBLIC_GA_MEASUREMENT_ID),
  },
});

// Required by Sentry's App Router navigation instrumentation.
export const onRouterTransitionStart = Sentry.captureRouterTransitionStart;
