import { landingSiteConfig, storeSiteConfig } from "@amore/config/site";

export type PublicSite = "landing" | "store";

const storefrontHosts = new Set([
  new URL(storeSiteConfig.productionUrl).hostname,
  "store.localhost",
]);

export function hostnameFromHost(host: string): string {
  return new URL(`http://${host}`).hostname.toLowerCase();
}

export function isLocalHostname(hostname: string): boolean {
  return ["localhost", "127.0.0.1", "store.localhost", "admin.localhost"].includes(hostname);
}

export function isLandingHostname(hostname: string): boolean {
  return (
    hostname === new URL(landingSiteConfig.productionUrl).hostname || isLocalHostname(hostname)
  );
}

/** Resolve the public site from a hostname. Preview hosts default to the landing page. */
export function publicSiteForHostname(hostname: string): PublicSite {
  return storefrontHosts.has(hostname.toLowerCase()) ? "store" : "landing";
}

/** Return the externally visible store origin paired with the incoming environment. */
export function storeOriginForHostname(hostname: string): string {
  return isLocalHostname(hostname) ? "http://store.localhost:3000" : storeSiteConfig.productionUrl;
}
