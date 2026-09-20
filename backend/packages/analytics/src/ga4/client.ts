import type { AnalyticsEvent } from "../types.ts";

declare global {
  interface Window {
    gtag?: (command: "event", name: string, properties?: AnalyticsEvent["properties"]) => void;
  }
}

let isEnabled = false;

/** GA4's script is rendered by the storefront; this gate controls custom event forwarding. */
export function configureGa4(enabled: boolean): void {
  isEnabled = enabled;
}

/** Internal adapter used by the public analytics facade. */
export function captureGa4Event(event: AnalyticsEvent): void {
  if (isEnabled) window.gtag?.("event", event.name, event.properties);
}
