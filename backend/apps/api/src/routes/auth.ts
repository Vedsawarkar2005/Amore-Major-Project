import { Hono } from "hono";
import { getRuntimeServices } from "../runtime.ts";
import type { ApiContext } from "../types.ts";

export const authRoutes = new Hono<ApiContext>();

// Better Auth and Hono both use Web Standard requests, so no runtime adapter is necessary.
authRoutes.all("/*", (context) => getRuntimeServices(context.env).auth.handler(context.req.raw));
