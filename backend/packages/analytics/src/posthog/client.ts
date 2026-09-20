import posthog from "posthog-js";
import type { AnalyticsEvent } from "../types.ts";

export interface PostHogBrowserConfig {
  enabled: boolean;
  host?: string | undefined;
  key?: string | undefined;
}

let isEnabled = false;

/** Initialize once, before React hydrates. Disabled modes never contact PostHog. */
export function initializePostHog(config: PostHogBrowserConfig): void {
  if (!config.enabled || !config.key || !config.host || typeof window === "undefined") return;

  posthog.init(config.key, {
    api_host: config.host,
    // Pin behavior changes to the current PostHog defaults reviewed during setup.
    defaults: "2026-05-30",
    person_profiles: "identified_only",
  });
  isEnabled = true;
}

/** Internal adapter used by the public analytics facade. */
export function capturePostHogEvent(event: AnalyticsEvent): void {
  if (isEnabled) posthog.capture(event.name, event.properties);
}

/** Reset identity on sign-out so another browser user cannot inherit it. */
export function resetPostHogIdentity(): void {
  if (isEnabled) posthog.reset();
}
