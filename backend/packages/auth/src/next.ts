import { toNextJsHandler } from "better-auth/next-js";
import type { AmoreAuth } from "./server.ts";

/**
 * Adapt a shared auth instance to a Next.js App Router catch-all route.
 * Hosts should export the returned GET and POST handlers from `/auth/[...all]/route.ts`.
 */
export function createNextAuthHandler(auth: AmoreAuth) {
  return toNextJsHandler(auth);
}
