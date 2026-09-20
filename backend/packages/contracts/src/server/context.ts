import type { AmoreSession } from "@amore/auth/server";
import type { Database } from "@amore/database";

/** Services supplied by the deployment host for every tRPC request. */
export type TRPCContext = {
  db: Database;
  request: Request;
  /** Resolve authentication only when a protected procedure needs it. */
  getSession: () => Promise<AmoreSession | null>;
};
