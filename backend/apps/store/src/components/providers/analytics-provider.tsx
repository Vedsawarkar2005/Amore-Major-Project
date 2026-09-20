import { GoogleAnalytics } from "@next/third-parties/google";
import type { ReactNode } from "react";
import { serverEnv } from "@/lib/env/server";

/** Render the GA4 loader only for the production storefront. PostHog starts earlier in instrumentation. */
export function AnalyticsProvider({ children }: { children: ReactNode }) {
  const gaId =
    serverEnv.NEXT_PUBLIC_APP_ENV === "production"
      ? serverEnv.NEXT_PUBLIC_GA_MEASUREMENT_ID
      : undefined;

  return (
    <>
      {children}
      {gaId ? <GoogleAnalytics gaId={gaId} /> : null}
    </>
  );
}
