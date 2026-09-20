# `@amore/api-worker`

Hono API deployed as a Cloudflare Worker at `api.amorecosmetics.in`. It uses explicit Worker
bindings, Neon over HTTP, and the shared Better Auth Drizzle adapter. It does not read
`process.env`.

## Local development

Copy `.env.example` to `.env.local` and replace its dummy values when a real local database is
needed. The tracked example contains safe placeholders; the ignored local file is not supplied
by a fresh clone. Wrangler merges dotenv files using its standard precedence, with `.env.local`
overriding `.env`.

```sh
bun run dev:api
```

The health endpoint is available at `http://127.0.0.1:8787/health`. Better Auth is mounted at
`/auth/*`, and the shared tRPC router is mounted at `/trpc/*`. Database-backed REST routes,
when interoperability requires them, belong under `/v1/*`; the shared middleware makes the
typed Drizzle client available through `context.get("db")`.

Application procedures and their inferred contract live under the runtime-neutral
`@amore/contracts/server` export. This Worker is only the Cloudflare transport host, so the contract
can also be exercised in tests or hosted by another runtime without importing Cloudflare or Hono
types.

## Cloudflare configuration

Create production secrets without placing them in `wrangler.jsonc`:

```sh
cd apps/api
bunx wrangler secret put DATABASE_URL --env production
bunx wrangler secret put BETTER_AUTH_SECRET --env production
```

Run `bun run typecheck:api` after changing bindings so Wrangler refreshes
`worker-configuration.d.ts`. Use `bun run build:api` for a local deployment bundle and
`bun run deploy:api` for the explicitly configured production environment.

Production routing variables are declared in `wrangler.jsonc`: `API_URL`, `LANDING_URL`,
`STORE_URL`, and `ADMIN_URL`. CORS and Better Auth share exactly those three browser origins.
Cookies belong to the API host; browser clients send credentialed requests to the API over HTTPS.
No cross-subdomain cookie setting is required merely to use the same API from store and admin.

Apply the committed migrations before enabling real sign-ins. From the repository root, provide
`DATABASE_URL_UNPOOLED` through your shell/CI secret store, then run:

```sh
bun run --cwd packages/database db:migrate
```

This changes the target database. It is an explicit release step, never part of Vercel builds or
PR checks. Back up the target and review generated SQL before applying migrations.

## Frontend auth and database access

Both Next.js apps expose `@/lib/auth/client` and `@/lib/api/client` for Client Components.
They use the validated `NEXT_PUBLIC_API_URL`; only the Worker needs database credentials.

```ts
import { authClient } from "@/lib/auth/client";
import { apiClient } from "@/lib/api/client";

const result = await authClient.signIn.email({ email, password });
if (result.error) throw new Error(result.error.message ?? "Sign-in failed");

const profile = await apiClient.account.profile.query();
await authClient.signOut();
```

`authClient.signUp.email({ name, email, password })` creates a customer account.
`authClient.useSession()` supplies session state inside React components.
`account.profile` reads the current user's database record using the verified session ID;
it accepts no user ID and returns only profile fields. Missing sessions receive UNAUTHORIZED.
Use Better Auth methods for profile/auth changes so its session cache stays consistent.
Creating an account does not grant admin permissions.

The existing `ApiProvider` also exposes `useTRPC` from `@amore/contracts/react` for TanStack
Query integration. Clear private query data on sign-out/account changes before rendering a
different account. These browser helpers are not server-component session helpers: API-host
cookies are not sent to the Next.js host automatically.

Use a real Neon development database for sign-in testing; the example localhost connection
string is a placeholder, not a database provisioner. The Neon HTTP driver needs a compatible
HTTP endpoint and cannot connect to a plain local Postgres TCP server. Browser cookie policies
also distinguish `localhost` from `127.0.0.1`. Use `bun run dev` for browser auth testing:
the local proxy forwards `/auth/*`, `/trpc/*`, `/health`, and `/v1/*` to the Worker while app
clients use the proxied app origin.
Local store and admin cookies are separate; production clients share the API-host session.
The individual `dev:store` / `dev:admin` commands do not start this proxy.
