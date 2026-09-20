import { landingSiteConfig, storeSiteConfig } from "@amore/config/site";
import { ApiProvider } from "@amore/contracts/react";
import { Toaster } from "@amore/ui/components/feedback";
import { TooltipProvider } from "@amore/ui/components/primitives/tooltip";
import { AmoreThemeProvider } from "@amore/ui/theme";
import { Analytics as VercelAnalytics } from "@vercel/analytics/next";
import type { Metadata } from "next";
import { headers } from "next/headers";
import type { ReactNode } from "react";
import { AnalyticsProvider } from "@/components/providers/analytics-provider";
import { hostnameFromHost, isLocalHostname, publicSiteForHostname } from "@/lib/domain-routing";
import { serverEnv } from "@/lib/env/server";
import "../styles/globals.css";

export async function generateMetadata(): Promise<Metadata> {
  const host = (await headers()).get("host") ?? new URL(serverEnv.NEXT_PUBLIC_APP_URL).host;
  const hostname = hostnameFromHost(host);
  const site = publicSiteForHostname(hostname) === "store" ? storeSiteConfig : landingSiteConfig;

  return {
    applicationName: site.name,
    title: { default: site.title, template: site.titleTemplate },
    description: site.description,
    metadataBase: new URL(
      serverEnv.NEXT_PUBLIC_APP_ENV === "production"
        ? site.productionUrl
        : isLocalHostname(hostname)
          ? `http://${host}`
          : serverEnv.NEXT_PUBLIC_APP_URL,
    ),
    robots:
      serverEnv.NEXT_PUBLIC_APP_ENV === "production"
        ? site.robots
        : { index: false, follow: false },
  };
}

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang={landingSiteConfig.language} suppressHydrationWarning>
      <body>
        {/* One provider controls the document class for every shared semantic token. */}
        <AmoreThemeProvider>
          <ApiProvider apiUrl={serverEnv.NEXT_PUBLIC_API_URL}>
            <TooltipProvider>
              <AnalyticsProvider>{children}</AnalyticsProvider>
            </TooltipProvider>
          </ApiProvider>
          <Toaster />
        </AmoreThemeProvider>
        {/* Vercel owns page-view collection; product events remain in @amore/analytics. */}
        <VercelAnalytics />
      </body>
    </html>
  );
}
