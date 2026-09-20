import { neon } from "@neondatabase/serverless";
import { drizzle, type NeonHttpDatabase } from "drizzle-orm/neon-http";
import * as schema from "./schema/index.ts";

export type Database = NeonHttpDatabase<typeof schema>;

/** Runtime input for database creation; callers provide validated environment values. */
export type DatabaseConfig = {
  /** Use the pooled Neon URL for application traffic. */
  url: string;
};

/**
 * Create a Neon HTTP Drizzle client.
 *
 * The client is intentionally created outside request handlers by each host and can be reused
 * across warm invocations. HTTP transport avoids opening TCP connections in serverless runtimes.
 */
export function createDatabase({ url }: DatabaseConfig): Database {
  if (!url) {
    throw new Error("DATABASE_URL is required to create the database client");
  }

  return drizzle({ client: neon(url), schema });
}
