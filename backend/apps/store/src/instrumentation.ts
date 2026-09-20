import * as Sentry from "@sentry/nextjs";

/** Load only the configuration for the active Next.js server runtime. */
export async function register() {
  // The shared options use only web-compatible primitives, so Node and Edge need no branching.
  await import("./lib/observability/server");
}

// Next invokes this hook for errors escaping server requests and Server Components.
export const onRequestError = Sentry.captureRequestError;
