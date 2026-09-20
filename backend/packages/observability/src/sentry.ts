export type AppEnvironment = "development" | "test" | "preview" | "production";

export interface SentryRuntimeConfig {
  appEnvironment: AppEnvironment;
  // Required key, optional value: callers make the absence explicit under exact optional types.
  dsn: string | undefined;
}

export interface SentryReporter {
  captureException(error: unknown): void;
}

/** Common runtime options consumed by each framework-specific Sentry SDK initialization. */
export function createSentryRuntimeOptions(config: SentryRuntimeConfig) {
  return {
    dsn: config.dsn,
    enabled: isSentryEnabled(config),
    environment: config.appEnvironment,
  } as const;
}

/** Sentry is intentionally quiet in local development and automated tests. */
export function isSentryEnabled(config: SentryRuntimeConfig): boolean {
  return (
    (config.appEnvironment === "preview" || config.appEnvironment === "production") &&
    Boolean(config.dsn)
  );
}

/**
 * Adapt a framework SDK's capture function without making this shared package depend on Next.js.
 * The enabled gate also keeps error boundaries safe when an SDK is installed but not configured.
 */
export function createSentryReporter(
  enabled: boolean,
  captureException: (error: unknown) => unknown,
): SentryReporter {
  return {
    captureException(error) {
      if (enabled) captureException(error);
    },
  };
}
