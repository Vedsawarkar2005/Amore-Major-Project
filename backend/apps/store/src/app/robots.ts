import { landingSiteConfig, storeSiteConfig } from "@amore/config/site";
import type { MetadataRoute } from "next";
import { headers } from "next/headers";
import { hostnameFromHost, publicSiteForHostname } from "@/lib/domain-routing";
import { serverEnv } from "@/lib/env/server";

export const dynamic = "force-dynamic";

export default async function robots(): Promise<MetadataRoute.Robots> {
  if (serverEnv.NEXT_PUBLIC_APP_ENV !== "production") {
    return { rules: { userAgent: "*", disallow: "/" } };
  }
  const hostname = hostnameFromHost((await headers()).get("host") ?? "amorecosmetics.in");
  const site = publicSiteForHostname(hostname) === "store" ? storeSiteConfig : landingSiteConfig;
  return {
    rules: { userAgent: "*", allow: "/", disallow: ["/store", "/api/"] },
    sitemap: `${site.productionUrl}/sitemap.xml`,
  };
}
