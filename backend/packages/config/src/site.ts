import { brandConfig } from "./brand.ts";

export type SiteId = "landing" | "store" | "admin";

export type SiteConfig = {
  id: SiteId;
  name: string;
  title: string;
  titleTemplate: string;
  description: string;
  productionUrl: `https://${string}`;
  locale: string;
  language: string;
  robots: {
    index: boolean;
    follow: boolean;
  };
};

const common = {
  locale: brandConfig.locale,
  language: brandConfig.language,
} as const;

/**
 * Site records contain deploy-independent identity only. Runtime origins still come from
 * validated environment variables so localhost and Vercel preview metadata remain correct.
 */
export const siteConfig = {
  landing: {
    ...common,
    id: "landing",
    name: brandConfig.name,
    title: brandConfig.name,
    titleTemplate: `%s | ${brandConfig.name}`,
    description: "Discover Amore Cosmetics and our approach to thoughtfully selected beauty.",
    productionUrl: `https://${brandConfig.domain}`,
    robots: { index: true, follow: true },
  },
  store: {
    ...common,
    id: "store",
    name: `${brandConfig.name} Store`,
    title: `${brandConfig.name} Store`,
    titleTemplate: `%s | ${brandConfig.name}`,
    description:
      "Discover thoughtfully selected cosmetics and beauty essentials from Amore Cosmetics.",
    productionUrl: `https://store.${brandConfig.domain}`,
    robots: { index: true, follow: true },
  },
  admin: {
    ...common,
    id: "admin",
    name: `${brandConfig.name} Admin`,
    title: `${brandConfig.name} Admin`,
    titleTemplate: `%s | ${brandConfig.name} Admin`,
    description: "Secure administration workspace for Amore Cosmetics.",
    productionUrl: `https://admin.${brandConfig.domain}`,
    // Administration routes should never be discoverable through search engines.
    robots: { index: false, follow: false },
  },
} as const satisfies Record<SiteId, SiteConfig>;

export const landingSiteConfig = siteConfig.landing;
export const storeSiteConfig = siteConfig.store;
export const adminSiteConfig = siteConfig.admin;
