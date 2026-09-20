import { apiRoutes } from "@amore/config/service";
import { createTRPCClient, httpBatchLink } from "@trpc/client";
import type { AppRouter } from "../server/root.ts";

export type ApiClientOptions = {
  /** Absolute API origin, such as https://api.amorecosmetics.in. */
  baseUrl: string;
};

export function createApiClient({ baseUrl }: ApiClientOptions) {
  const origin = baseUrl.replace(/\/$/, "");

  return createTRPCClient<AppRouter>({
    links: [
      httpBatchLink({
        url: `${origin}${apiRoutes.trpc}`,
        // Cross-origin Better Auth sessions require the browser to send secure cookies.
        fetch: (url, options) => fetch(url, { ...options, credentials: "include" } as RequestInit),
      }),
    ],
  });
}
