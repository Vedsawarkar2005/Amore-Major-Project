import { apiServiceConfig } from "@amore/config/service";
import { createTRPCRouter, publicProcedure } from "../trpc.ts";

export const systemRouter = createTRPCRouter({
  health: publicProcedure.query(() => ({
    service: apiServiceConfig.name,
    status: "ok" as const,
  })),
});
