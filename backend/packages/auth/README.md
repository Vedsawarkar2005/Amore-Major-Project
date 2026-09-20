# @amore/auth

Shared Better Auth configuration for Amore Cosmetics applications.

## Usage

Create an auth instance in the host runtime with validated environment values:

```ts
import { createAuth } from "@amore/auth/server";

export const auth = createAuth({
  secret: env.BETTER_AUTH_SECRET,
  baseURL: env.BETTER_AUTH_URL,
  // Add the host's database adapter when persistence is configured.
});
```

The production architecture creates this instance in `apps/api` and mounts it at `/auth/*`.
Browser clients in both Next.js applications point to that API origin. The optional Next.js adapter
remains available for a future standalone app that deliberately owns its auth route:

```ts
import { createNextAuthHandler } from "@amore/auth/next";
import { auth } from "@/lib/auth/server";

export const { GET, POST } = createNextAuthHandler(auth);
```

The package does not read `process.env` and does not select a database driver. This keeps the
same auth contract usable from Next.js on Vercel and a future Worker with injected bindings.
Configure a persistent Better Auth database adapter before enabling production sign-up flows.
