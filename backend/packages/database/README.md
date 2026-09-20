# @amore/database

Shared Drizzle ORM and Neon PostgreSQL client for Amore Cosmetics.

## Runtime usage

```ts
import { createDatabase } from "@amore/database";

export const db = createDatabase({
  // Use Neon's pooled URL for request-time queries on Vercel/serverless runtimes.
  url: env.DATABASE_URL,
});
```

The package uses `@neondatabase/serverless` over HTTP, so it does not create a persistent TCP
connection per request and remains compatible with Vercel edge-compatible runtimes.

## Schema and migrations

Tables live under `src/schema/` and are exported from `src/schema/index.ts`. Better Auth's generated
PostgreSQL tables are included in `src/schema/auth.ts`.

Use the direct, unpooled Neon URL for migration commands:

```bash
bun run db:generate
bun run db:migrate
```

Use `db:push` only for local prototyping. Commit generated `migrations/` and apply them in
CI or deployment with `db:migrate`.
