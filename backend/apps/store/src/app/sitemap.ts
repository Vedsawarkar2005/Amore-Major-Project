import { landingSiteConfig, storeSiteConfig } from "@amore/config/site";
import type { MetadataRoute } from "next";
import { headers } from "next/headers";
import { hostnameFromHost, publicSiteForHostname } from "@/lib/domain-routing";
import { serverEnv } from "@/lib/env/server";

export const dynamic = "force-dynamic";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  if (serverEnv.NEXT_PUBLIC_APP_ENV !== "production") return [];
  const hostname = hostnameFromHost((await headers()).get("host") ?? "amorecosmetics.in");
  const site = publicSiteForHostname(hostname) === "store" ? storeSiteConfig : landingSiteConfig;
  // Add public product URLs here as catalog routes are introduced; never emit the internal prefix.
  return [{ url: `${site.productionUrl}/` }];
}
