import { apiServiceConfig } from "@amore/config/service";
import { Hono } from "hono";
import type { ApiContext } from "../types.ts";

export const healthRoutes = new Hono<ApiContext>();

// Platform probes remain available without database connectivity or secret initialization.
healthRoutes.get("/", (context) =>
  context.json({
    service: apiServiceConfig.name,
    status: "ok",
  }),
);
