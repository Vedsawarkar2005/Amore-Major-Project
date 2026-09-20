# `@amore/contracts`

Shared tRPC contracts, transport, and TanStack Query integration for Amore applications. Subpath
exports keep runtime responsibilities explicit and prevent server dependencies from entering client
bundles.

- `@amore/contracts` exports contract types only.
- `@amore/contracts/server` exports routers and procedure builders for API hosts.
- `@amore/contracts/client` exports the framework-neutral tRPC transport.
- `@amore/contracts/react` exports the React provider, typed tRPC hooks, and Query Client factory.

Add feature routers under `src/server/routers` and compose them in `src/server/root.ts`. Procedures
receive the request, lazy session lookup, and typed Drizzle client through `TRPCContext`. Keep
Cloudflare and Hono integration in `apps/api`.

Components access generated query options without hand-written keys:

```tsx
import { useTRPC } from "@amore/contracts/react";
import { useQuery } from "@tanstack/react-query";

const trpc = useTRPC();
const health = useQuery(trpc.system.health.queryOptions());
```

The browser transport sends credentials to the configured API origin. Keep that origin in the API
Worker CORS allowlist and Better Auth trusted origins.
