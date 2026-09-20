import { PostHog } from "posthog-node";
import type { AnalyticsEvent } from "../types.ts";

export interface PostHogServerConfig {
  enabled: boolean;
  host?: string | undefined;
  key?: string | undefined;
}

/** Return null in disabled environments so server code cannot accidentally emit test traffic. */
export function createPostHogServer(config: PostHogServerConfig): PostHog | null {
  if (!config.enabled || !config.key || !config.host) return null;

  // Serverless requests should flush immediately; callers must still call shutdown().
  return new PostHog(config.key, { host: config.host, flushAt: 1, flushInterval: 0 });
}

/** Capture through the shared event contract while retaining PostHog's required distinct ID. */
export function capturePostHogServerEvent(
  client: PostHog | null,
  distinctId: string,
  event: AnalyticsEvent,
): void {
  if (!client) return;

  const message = event.properties
    ? { distinctId, event: event.name, properties: event.properties }
    : { distinctId, event: event.name };
  client.capture(message);
}
