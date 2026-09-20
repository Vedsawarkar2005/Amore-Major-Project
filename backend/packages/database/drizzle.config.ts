import "dotenv/config";
import { defineConfig } from "drizzle-kit";

/**
 * Drizzle Kit uses the direct Neon URL for migrations when available.
 * Keep DATABASE_URL pooled for application queries and set DATABASE_URL_UNPOOLED for CLI work.
 */
export default defineConfig({
  dialect: "postgresql",
  schema: "./src/schema/**/*.ts",
  out: "./migrations",
  strict: true,
  verbose: true,
  dbCredentials: {
    url: process.env.DATABASE_URL_UNPOOLED ?? process.env.DATABASE_URL ?? "",
  },
});
