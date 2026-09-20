import { TRPCError } from "@trpc/server";
import { createTRPCRouter, protectedProcedure } from "../trpc.ts";

export const accountRouter = createTRPCRouter({
  /** Return only the authenticated user record; session tokens remain server-side. */
  me: protectedProcedure.query(({ ctx }) => ctx.session.user),
  /** Read fresh profile data using the verified session identity, never a caller-supplied ID. */
  profile: protectedProcedure.query(async ({ ctx }) => {
    const profile = await ctx.db.query.user.findFirst({
      where: (user, { eq }) => eq(user.id, ctx.session.user.id),
      columns: { id: true, name: true, email: true, emailVerified: true, image: true },
    });
    if (!profile) {
      throw new TRPCError({ code: "NOT_FOUND", message: "Profile not found" });
    }
    return profile;
  }),
});
