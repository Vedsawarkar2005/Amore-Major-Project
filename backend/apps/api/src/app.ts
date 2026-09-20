import { apiRoutes } from "@amore/config/service";
import { Hono } from "hono";
import { secureHeaders } from "hono/secure-headers";
import { withCors, withDatabase, withNoStore } from "./middleware.ts";
import { authRoutes } from "./routes/auth.ts";
import { healthRoutes } from "./routes/health.ts";
import { handleTrpcRequest } from "./routes/trpc.ts";
import type { ApiContext } from "./types.ts";

export const app = new Hono<ApiContext>();

// Apply safe browser-facing response defaults to every API route, including error responses.
app.use("*", secureHeaders());

app.route(apiRoutes.health, healthRoutes);

// Cross-origin policy applies to auth and all future browser-facing business endpoints.
app.use(`${apiRoutes.auth}/*`, withNoStore, withCors);
app.route(apiRoutes.auth, authRoutes);
app.use(`${apiRoutes.trpc}/*`, withNoStore, withCors);
app.all(`${apiRoutes.trpc}/*`, handleTrpcRequest);
// REST endpoints remain available for webhooks or integrations that cannot use tRPC.
app.use(`${apiRoutes.integrations}/*`, withCors, withDatabase);

app.notFound((context) => context.json({ error: "Not found" }, 404));

app.onError((error, context) => {
  // Keep operational detail in Worker logs without returning stack traces to clients.
  console.error("Unhandled API error", error);
  return context.json({ error: "Internal server error" }, 500);
});
