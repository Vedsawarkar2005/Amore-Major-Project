import { captureGa4Event, configureGa4 } from "./ga4/client.ts";
import { capturePostHogEvent, initializePostHog } from "./posthog/client.ts";
import type { AnalyticsEvent } from "./types.ts";

export { defineAnalyticsEvent } from "./events.ts";
export type { AnalyticsEvent, AnalyticsProperties, AnalyticsValue } from "./types.ts";

export interface BrowserAnalyticsConfig {
  ga4: { enabled: boolean };
  posthog: { enabled: boolean; host?: string | undefined; key?: string | undefined };
}

/** Configure vendor adapters once from an application's client instrumentation entry point. */
export function initializeAnalytics(config: BrowserAnalyticsConfig): void {
  initializePostHog(config.posthog);
  configureGa4(config.ga4.enabled);
}

/** Application code tracks one typed event; enabled adapters receive it independently. */
export const analytics = {
  track(event: AnalyticsEvent): void {
    capturePostHogEvent(event);
    captureGa4Event(event);
  },
};
