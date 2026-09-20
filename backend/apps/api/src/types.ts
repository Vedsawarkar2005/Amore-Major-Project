import type { Database } from "@amore/database";

/** Shared Hono context contract for Worker bindings and request-scoped services. */
export type ApiContext = {
  Bindings: CloudflareBindings;
  Variables: {
    db: Database;
  };
};
