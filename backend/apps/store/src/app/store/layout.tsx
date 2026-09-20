import { storeSiteConfig } from "@amore/config/site";
import type { Metadata } from "next";
import type { ReactNode } from "react";

// Preview deployments expose /store directly, so metadata must also follow the route namespace.
export const metadata: Metadata = {
  title: { absolute: storeSiteConfig.title },
  applicationName: storeSiteConfig.name,
  description: storeSiteConfig.description,
};

export default function StoreLayout({ children }: { children: ReactNode }) {
  return children;
}
