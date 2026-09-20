import { loadStoreEnv } from "@amore/env/store/validation";
import { isSentryEnabled } from "@amore/observability/sentry";
import { withSentryConfig } from "@sentry/nextjs/config";
import type { NextConfig } from "next";

// Next loads the app's .env files before evaluating this config. Fail before serving or building.
// Environment loading stays behind @amore/env instead of leaking platform globals into config.
const env = loadStoreEnv();

const nextConfig: NextConfig = {
  allowedDevOrigins: ["store.localhost"],
  // Compile workspace source in the app build; packages publish TypeScript directly for fast local iteration.
  transpilePackages: [
    "@amore/analytics",
    "@amore/contracts",
    "@amore/env",
    "@amore/observability",
    "@amore/ui",
  ],
  poweredByHeader: false,
};

const sentryEnabled = isSentryEnabled({
  appEnvironment: env.NEXT_PUBLIC_APP_ENV,
  dsn: env.NEXT_PUBLIC_SENTRY_DSN,
});

// Source-map upload is opt-in: runtime reporting needs a DSN, while uploads also need a token.
export default sentryEnabled
  ? withSentryConfig(nextConfig, {
      ...(env.SENTRY_AUTH_TOKEN ? { authToken: env.SENTRY_AUTH_TOKEN } : {}),
      ...(env.SENTRY_ORG ? { org: env.SENTRY_ORG } : {}),
      ...(env.SENTRY_PROJECT ? { project: env.SENTRY_PROJECT } : {}),
      silent: true,
      sourcemaps: { disable: !env.SENTRY_AUTH_TOKEN },
    })
  : nextConfig;
