import { accountRouter } from "./routers/account.ts";
import { systemRouter } from "./routers/system.ts";
import { createTRPCRouter } from "./trpc.ts";

/** Compose domain routers here to preserve stable, discoverable client namespaces. */
export const appRouter = createTRPCRouter({
  account: accountRouter,
  system: systemRouter,
});

export type AppRouter = typeof appRouter;
