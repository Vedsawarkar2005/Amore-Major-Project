import { brandConfig } from "./brand.ts";

/** Canonical paths exposed directly from the API host. */
export const apiRoutes = {
  auth: "/auth",
  health: "/health",
  integrations: "/v1",
  trpc: "/trpc",
} as const;

/** Non-visual service identity shared by deployment configuration and runtime responses. */
export const apiServiceConfig = {
  id: "api",
  name: `${brandConfig.name} API`,
  productionUrl: `https://api.${brandConfig.domain}`,
  routes: apiRoutes,
} as const;

export type ApiRoute = (typeof apiRoutes)[keyof typeof apiRoutes];
export type ApiServiceConfig = typeof apiServiceConfig;
