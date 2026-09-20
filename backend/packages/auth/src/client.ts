import { apiRoutes } from "@amore/config/service";
import { createAuthClient } from "better-auth/react";

/** Client-safe settings; never pass the server secret to this factory. */
export type AuthClientConfig = {
  /** The auth server origin. Omit when the client and auth API share an origin. */
  baseURL?: string;
};

/** Create a typed React client for the host application. */
export function createAmoreAuthClient(config: AuthClientConfig = {}) {
  return createAuthClient({
    ...(config.baseURL ? { baseURL: config.baseURL } : {}),
    basePath: apiRoutes.auth,
    fetchOptions: { credentials: "include" },
  });
}
