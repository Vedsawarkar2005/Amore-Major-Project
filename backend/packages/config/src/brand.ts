/** Stable brand values shared by applications, authentication, and future services. */
export const brandConfig = {
  name: "Amore Cosmetics",
  legalName: "Amore Cosmetics",
  domain: "amorecosmetics.in",
  locale: "en-IN",
  language: "en",
} as const;

export type BrandConfig = typeof brandConfig;
