import { apiRoutes } from "@amore/config/service";
import { appRouter } from "@amore/contracts/server";
import { fetchRequestHandler } from "@trpc/server/adapters/fetch";
import type { Context } from "hono";
import { getRuntimeServices } from "../runtime.ts";
import type { ApiContext } from "../types.ts";

/** Adapt the portable tRPC router to the Worker's Web Standard request lifecycle. */
export function handleTrpcRequest(context: Context<ApiContext>) {
  const { auth, db } = getRuntimeServices(context.env);

  return fetchRequestHandler({
    endpoint: apiRoutes.trpc,
    req: context.req.raw,
    router: appRouter,
    createContext: () => ({
      db,
      request: context.req.raw,
      // Session lookup stays lazy so public procedures do not perform authentication work.
      getSession: () => auth.api.getSession({ headers: context.req.raw.headers }),
    }),
    onError: ({ error, path }) => {
      console.error("tRPC request failed", { code: error.code, path });
    },
  });
}
