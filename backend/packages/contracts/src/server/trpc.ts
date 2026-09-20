import { initTRPC, TRPCError } from "@trpc/server";
import type { TRPCContext } from "./context.ts";

const trpc = initTRPC.context<TRPCContext>().create();

export const createTRPCRouter = trpc.router;
export const createCallerFactory = trpc.createCallerFactory;
export const publicProcedure = trpc.procedure;

const requireSession = trpc.middleware(async ({ ctx, next }) => {
  const session = await ctx.getSession();
  if (!session) {
    throw new TRPCError({ code: "UNAUTHORIZED" });
  }

  return next({ ctx: { session } });
});

/** Use for procedures that require a verified Better Auth session. */
export const protectedProcedure = trpc.procedure.use(requireSession);
