import { adminSiteConfig } from "@amore/config/site";
import { ApiProvider } from "@amore/contracts/react";
import { Toaster } from "@amore/ui/components/feedback";
import { TooltipProvider } from "@amore/ui/components/primitives/tooltip";
import { AmoreThemeProvider } from "@amore/ui/theme";
import { Analytics as VercelAnalytics } from "@vercel/analytics/next";
import type { Metadata } from "next";
import type { ReactNode } from "react";
import { serverEnv } from "@/lib/env/server";
import "../styles/globals.css";

export const metadata: Metadata = {
  applicationName: adminSiteConfig.name,
  title: {
    default: adminSiteConfig.title,
    template: adminSiteConfig.titleTemplate,
  },
  description: adminSiteConfig.description,
  // Metadata needs the canonical origin for absolute Open Graph and icon URLs.
  // Read only the public URL here; never pass the server environment to client code.
  metadataBase: new URL(serverEnv.NEXT_PUBLIC_APP_URL),
  robots: adminSiteConfig.robots,
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang={adminSiteConfig.language} suppressHydrationWarning>
      <body>
        {/* One provider controls the document class for every shared semantic token. */}
        <AmoreThemeProvider>
          <ApiProvider apiUrl={serverEnv.NEXT_PUBLIC_API_URL}>
            <TooltipProvider>{children}</TooltipProvider>
          </ApiProvider>
          <Toaster />
        </AmoreThemeProvider>
        {/* This platform metric is separate from the admin's optional PostHog product events. */}
        <VercelAnalytics />
      </body>
    </html>
  );
}
