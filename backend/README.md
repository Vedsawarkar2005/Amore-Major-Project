# Amore Cosmetics

Proprietary application repository for authorized Amore Cosmetics developers.
See [LICENSE](LICENSE.md) for terms of use.

Bun workspaces and Turborepo manage two Next.js App Router applications, a Hono Worker API, and
shared platform packages. Biome, Vitest, Playwright, Storybook, React Email, Commitlint, and Lefthook
provide code checks, testing, component development, email previews, and local Git hooks.

## Documentation

Application documentation will be maintained in GitBook; the team space URL has not yet
been supplied. This README provides the setup and environment reference until it is available.

## Requirements

- Bun 1.4.1, pinned in `package.json`
- Node.js 24 (used in CI) or 26 for Next.js, native TypeScript config loading, and test tooling
- Git

## Structure

```text
apps/
├── api/                  @amore/api-worker — Hono/Cloudflare host, port 8787
├── store/                @amore/store — landing page + storefront, port 3000
│   ├── .env.example      Trackable placeholders; copy to ignored .env.local
│   ├── next.config.ts    Startup and build validation
│   └── src/
│       ├── app/          App Router pages, layout, and error boundaries
│       └── lib/env/      Client/server convenience imports
└── admin/                @amore/admin — admin scaffold, port 3001
    ├── .env.example
    ├── next.config.ts
    └── src/
        ├── app/
        └── lib/env/
packages/
├── analytics/            @amore/analytics — typed PostHog and GA4 adapters
├── contracts/            @amore/contracts — tRPC contracts, transport, and React Query adapter
├── auth/                 @amore/auth — Better Auth factories and framework adapters
├── config/               @amore/config — shared brand, site, and service identity
├── database/             @amore/database — Neon HTTP client, Drizzle schema, and migrations
├── emails/               @amore/emails — React Email templates, renderer, and previews
├── env/                  @amore/env — framework-neutral T3 Env schemas and typed values
├── observability/        @amore/observability — framework-neutral Sentry policy and reporters
└── ui/                   @amore/ui — shadcn primitives, semantic themes, and Storybook
e2e/                      Browser smoke tests for both apps
.github/                  CI and internal issue/PR templates
```

The pages are intentionally minimal. Authentication, database, Sentry, PostHog, GA4, and Vercel
integration boundaries are configured; real service credentials still belong in each deployment
platform. The admin app does not yet enforce route authorization and must not expose private
business data until those guards are implemented.

## Local setup

```sh
bun install --frozen-lockfile
cp apps/store/.env.example apps/store/.env.local
cp apps/admin/.env.example apps/admin/.env.local
cp apps/api/.env.example apps/api/.env.local
bun run dev
```

Open `http://localhost:3000` for the landing page, `http://store.localhost:3000` for the storefront,
`http://admin.localhost:3000` for admin, and
`http://127.0.0.1:8787/health` for the API.
The local-only proxy routes these hosts to loopback app servers on ports 3100 and 3101,
including hot-reload WebSockets. Stop existing dev servers before starting it.
The app `dev:local` scripts override app environment and app/auth URLs in their processes only;
it never edits `.env.local` or changes production build/start commands.
The example files contain no credentials. Copy them yourself; the scaffold does not create
local environment files automatically.

Run an individual application with `bun run dev:store`, `bun run dev:admin`, or `bun run dev:api`.
These direct commands retain ports 3000 and 3001 respectively and use the app's saved env.
Do not run them alongside the proxy launcher. Playwright continues using direct app servers.

On Vercel, import the repository twice and set the projects' Root Directories to `apps/store` and
`apps/admin`. Assign both `amorecosmetics.in` and `store.amorecosmetics.in` to the `apps/store`
project, and assign `admin.amorecosmetics.in` to admin. The store project's hostname router serves
the landing page on the apex domain and maps the store subdomain into its internal `/store` route
namespace without exposing that prefix in public URLs. Enable access to files outside the Root
Directory so the shared packages are included. Each app's `vercel.json` selects Next.js, installs
with the frozen Bun lockfile, and runs that app's build. Node 24 is pinned in both app manifests
and `.node-version`. Keep the framework's default output directory. Configure variables independently for Preview and
Production because public values are embedded during each build. The local proxy and local env files
are not part of either deployment.

For Preview, set `NEXT_PUBLIC_APP_ENV=preview`, the preview deployment's public URL,
`NEXT_PUBLIC_API_URL`, and a Sentry DSN. For Production, set `NEXT_PUBLIC_APP_ENV=production`, the
canonical store URL (`https://store.amorecosmetics.in`), and
`NEXT_PUBLIC_API_URL=https://api.amorecosmetics.in`. Production store
also requires the PostHog key/host and GA4 measurement ID. Production admin enables PostHog only when
both values are supplied. Set `SENTRY_AUTH_TOKEN` only when source-map upload is wanted; the matching
Sentry org and project must then also be configured.

Enable Web Analytics once in each Vercel project's Analytics dashboard. Both root layouts include
Vercel's maintained Next.js component; it needs no repository environment variable and does not send
development traffic.

### Deployment configuration

| Deployment | Root Directory | Production domains | `NEXT_PUBLIC_APP_URL` |
| --- | --- | --- | --- |
| Vercel store | `apps/store` | `amorecosmetics.in`, `store.amorecosmetics.in` | `https://store.amorecosmetics.in` |
| Vercel admin | `apps/admin` | `admin.amorecosmetics.in` | `https://admin.amorecosmetics.in` |
| Cloudflare Worker | repository root; config `apps/api/wrangler.jsonc` | `api.amorecosmetics.in` | Not used |

Both Vercel projects require `NEXT_PUBLIC_APP_ENV=production`,
`NEXT_PUBLIC_API_URL=https://api.amorecosmetics.in`, `NEXT_PUBLIC_SENTRY_DSN`, `SENTRY_ORG`, and
`SENTRY_PROJECT`. Store also requires `NEXT_PUBLIC_POSTHOG_KEY`, `NEXT_PUBLIC_POSTHOG_HOST`, and
`NEXT_PUBLIC_GA_MEASUREMENT_ID`. `SENTRY_AUTH_TOKEN` is optional. Database credentials and
`BETTER_AUTH_SECRET` belong to the Worker, not the Vercel applications.

For Vercel previews, set the app URL to the deployment's HTTPS URL and use `NEXT_PUBLIC_APP_ENV=preview`.
The landing page is at `/` and the shop is at `/store`; the shopping link stays in the preview.
Preview metadata and robots disable indexing. The production API intentionally trusts only the
three production browser origins. Authenticated previews need an isolated API with their exact
origins configured; do not add a wildcard for every `vercel.app` site.

Use the DNS records supplied by Vercel for its three domains. The API hostname is a Worker Custom
Domain managed by Cloudflare; the zone must be active in the account used to deploy the Worker.
For Cloudflare Workers Builds, use repository root, `bun run build:api` as the build command, and
`bun run deploy:api` as the deploy command. For CLI deployment, set the Cloudflare account/token
in the shell or CI secret store and run `bun run deploy:api` from the root.

Before publishing, set the Worker's production secrets using [the API setup](apps/api/README.md),
apply the committed database migrations using a direct database URL, and run `bun run check`,
`bun run typecheck`, `bun run test`, and `bun run build`. Next builds need the respective app's env
values, either in its local file or supplied by the hosting platform. Run `bun run test:e2e` for
landing/store/admin browser checks; CI validates production builds with telemetry disabled.

### Release workflow

This monorepo uses Changesets for release intent and changelog generation. Add a changeset with
`bun run changeset` when a change should be recorded, then select the affected workspaces and a
semver bump. A GitHub Actions workflow opens a reviewed release PR on `main`; merging it updates
private workspace versions and changelogs without publishing packages to npm. Vercel and Cloudflare
deployment pipelines remain independent from package versioning.

After publishing, verify each domain and `https://api.amorecosmetics.in/health`.
`/auth/ok` checks auth initialization; a real sign-in is still needed to verify the production
database and browser session. Current pages remain scaffolds: the admin dashboard has no role-based
authorization yet and must not serve private business data until that feature is implemented.

## Commands

| Command | Purpose |
| --- | --- |
| `bun run dev` | Start apps and proxy in Turbo's interactive task/log viewer |
| `bun run dev:stream` | Same local setup with package/task-prefixed streaming logs |
| `bun run clean` | Remove all generated artifacts and every `node_modules` directory |
| `bun run clean:artifacts` | Remove builds, caches, coverage, and test output only |
| `bun run clean:dependencies` | Remove root and workspace dependencies; reinstall afterward |
| `bun run dev:store` / `bun run dev:admin` / `bun run dev:api` | Start one deployable workspace |
| `bun run build` | Build all deployable workspaces |
| `bun run build:store` / `bun run build:admin` / `bun run build:api` | Build one workspace |
| `bun run typecheck` | Check root tooling and every workspace |
| `bun run typecheck:store` / `bun run typecheck:admin` / `bun run typecheck:api` | Check one service and its dependencies |
| `bun run check` / `bun run check:ci` | Check formatting, lint rules, and imports |
| `bun run check:write` | Apply formatting and safe fixes |
| `bun run lint` | Run Biome linting across the repository |
| `bun run test` | Run unit tests once |
| `bun run test:watch` | Watch unit tests with Vitest |
| `bun run test:coverage` | Generate V8 text, HTML, and LCOV coverage |
| `bun run test:e2e` | Start both apps and run Chromium smoke tests |
| `bun run test:e2e:ui` | Open Playwright's interactive runner |
| `bun run test:e2e:report` | View the last browser report |
| `bun run storybook` | Open the shared UI workbench on port 6006 |
| `bun run storybook:build` | Validate and build static Storybook output |
| `bun run email:dev` | Open React Email previews on port 3002 |
| `bun run email:build` | Validate and build the email preview application |
| `bun run changeset` | Create a release note and semver bump request |
| `bun run changeset:status` | Show pending Changesets and calculated bumps |
| `bun run release:version` | Apply pending Changesets locally |

Use `bun run test`, not Bun's built-in `bun test`, for the configured Vitest suites.

### Development logs

Turbo checks ports 3000, 3100, 3101, and 8787 before starting any servers. If a port is occupied,
stop the existing server and retry; the setup never terminates someone else's process.
Turbo then manages four persistent, uncached tasks: `@amore/store:dev:local`,
`@amore/admin:dev:local`, `@amore/api-worker:dev:local`, and the root `dev:proxy`. In an interactive terminal,
use the arrow keys to select an app's logs and `m` to show keyboard shortcuts.
Each app prints its browser-facing URL above Next's internal server address.
The small `scripts/dev-env.ts` preload keeps URL overrides out of the echoed command;
Next still runs directly under Turbo without a custom process manager or filtered logs.
Use `bun run dev:stream` for a plain terminal with task prefixes on log lines.
Keep full development logs to see request failures and warnings; builds use `new-only`
to avoid replaying logs from cache hits. The proxy can briefly return a gateway error
while an app is starting; wait for both app tasks to report ready.

The `with` task relationship starts the proxy alongside local app tasks (persistent tasks
cannot be startup dependencies). The finite preflight task is their shared dependency.
Local integration variables are explicitly passed through Turbo's strict environment filter;
app/auth URLs and the development mode are always overridden by `dev:local` scripts.
Build caching excludes `.next/dev` so development artifacts cannot enter production cache outputs.
Proxy forwarding tests use temporary ports and do not require running the apps.

The shared env package also exposes a workspace test task for `bunx --no-install turbo run test`.

## Styling and shared UI

Both apps use Tailwind CSS v4 with an app-local `postcss.config.ts` and thin
`src/styles/globals.css`, imported once in the root layout. `@amore/ui/styles.css` owns Tailwind's
semantic color, radius, and typography tokens; app stylesheets add only app-specific sources and
overrides. Use semantic utilities such as `bg-primary`, never raw Amore color values in components.
No JavaScript Tailwind config or separate Autoprefixer plugin is required.

Shared shadcn primitives use Base UI (`base-nova`) and live only in `packages/ui/src/components/primitives`. The category barrels
organize forms, data display, feedback, and layout without moving product, checkout, order, or admin
business logic out of its owning app. Run shadcn from a workspace with its checked-in
`components.json`; all configs route shared primitives to `@amore/ui`.

The stable `@wrksz/themes` 1.2 release provides typed hooks and factory APIs, so no beta or
`next-themes` dependency is needed. The package uses the Next-aware provider and typed Amore hook
wrappers against the same context. Public identifiers are exactly `amore` and `amore-dark`, with
`amore` as the default. Import the server provider from `@amore/ui/theme`; Client Components can
use the typed helpers from `@amore/ui/theme/client`. Storybook previews both themes and runs its
accessibility addon; Playwright also checks both application home pages with axe.

Install the recommended Tailwind CSS IntelliSense extension in VS Code for completions.
Biome checks JSX `class`/`className` ordering with `useSortedClasses`.
It also recognizes class strings passed to `cn`, `clsx`, `cva`, and `tw` helpers.
Run `bun run sort:classes` to apply only class-sorting fixes. This nursery rule has an
unsafe fix, so normal formatting and safe fix-on-save do not apply it automatically.
It does not fully support custom Tailwind utilities, variants, or theme configuration.
TypeScript PostCSS configuration requires Next.js 16.2+ with Turbopack (the default here);
the Webpack config loader does not discover `.ts` PostCSS configs.

## Environment configuration

Each deployable app owns its values in `apps/<app>/.env.local` locally or in its deployment
platform configuration. There is no root application env file. Shared validation lives in
`packages/env`; values and secrets never belong in that package. It uses `@t3-oss/env-core`
so future Node, Vite, worker, or other apps are not coupled to Next.js.

`NODE_ENV` describes the runtime/build mode: development, test, or production. Next.js sets it
automatically. `NEXT_PUBLIC_APP_ENV` describes the logical deployment: development, test,
preview, or production. A production-mode build with `NEXT_PUBLIC_APP_ENV=preview` is valid.

| Variable | store | admin | Validation |
| --- | --- | --- | --- |
| `NEXT_PUBLIC_APP_ENV` | Required | Required | development, test, preview, production |
| `NEXT_PUBLIC_APP_URL` | Required | Required | HTTP(S) URL |
| `NEXT_PUBLIC_SENTRY_DSN` | Preview/production | Preview/production | HTTP(S) URL |
| `NEXT_PUBLIC_POSTHOG_KEY` | Production | Optional production opt-in | Non-empty string |
| `NEXT_PUBLIC_POSTHOG_HOST` | Production | Optional production opt-in | HTTP(S) URL |
| `NEXT_PUBLIC_GA_MEASUREMENT_ID` | Production | Not supported | `G-` plus 10 uppercase letters/digits |
| `NODE_ENV` | Required; set by Next | Required; set by Next | development, test, production |
| `DATABASE_URL` | Optional | Optional | PostgreSQL URL (`postgres://` or `postgresql://`) |
| `BETTER_AUTH_SECRET` | Optional | Optional | At least 32 characters |
| `BETTER_AUTH_URL` | Optional | Optional | HTTP(S) URL |
| `SENTRY_AUTH_TOKEN` | Optional | Optional | Server-only; enables source-map upload |
| `SENTRY_ORG` | Production or token set | Production or token set | Non-empty string |
| `SENTRY_PROJECT` | Production or token set | Production or token set | Non-empty string |

Blank optional example values are treated as unset with T3 Env's recommended
`emptyStringAsUndefined` option. Invalid configured values fail early in Next config loading,
including during type generation. Errors list field names without including input values.

Example values are placeholders, never service credentials. Sentry reports in preview and production;
PostHog and GA4 run only in production, so localhost and preview visits cannot pollute product
analytics. GA4 exists only in the store schema. Better Auth and database variables are preserved for
their future integrations.

### Analytics and observability

Client instrumentation initializes Sentry before hydration in both apps and PostHog only where the
environment policy permits it. The store root provider renders Next.js's optimized GA4 component only
in production. Both apps render Vercel Web Analytics directly in their root layout because it is a
hosting-platform integration, not a product-event adapter. Next error boundaries report through
`@amore/observability`, while Next-specific SDK hooks remain inside each application.

Application components should send vendor-neutral events through the typed facade:

```ts
import { analytics, defineAnalyticsEvent } from "@amore/analytics";

analytics.track(defineAnalyticsEvent("product_viewed", { productId: "sku-123" }));
```

For server-side PostHog, import `@amore/analytics/posthog/server`, supply a stable authenticated user
ID, and always call `shutdown()` before a serverless invocation ends. On sign-out, call the exported
client reset helper so the next user cannot inherit the previous identity. Do not put email addresses,
credentials, or other sensitive values in event properties.

### Client/server boundary

Use the app's explicit entry point in a Client Component:

```ts
import { clientEnv } from "@amore/env/store/client";

const appUrl = clientEnv.NEXT_PUBLIC_APP_URL;
```

Use the server entry point only in server-side code:

```ts
import { serverEnv } from "@amore/env/store/server";

// Undefined until database configuration is supplied; no database client is installed.
const databaseUrl = serverEnv.DATABASE_URL;
```

Replace `store` with `admin` for admin imports. App-local code can also import from
`@/lib/env/client` or `@/lib/env/server`. The root `@amore/env` export contains types only.
Client modules cannot export database URLs, authentication secrets, or Sentry auth tokens.
Server modules import `server-only`, so Next rejects their use from Client Components.

Next statically embeds `NEXT_PUBLIC_*` values in browser bundles during builds. The required literal
reads are isolated in `packages/env/src/*/runtime-client.ts`; Node reads are isolated in
`runtime-node.ts`. Application code, Next config, and Sentry modules consume validated exports rather
than reading `process.env`. Rebuild when public values change. Never place secrets in public
variables, Next's `env` config option, client props, or logs.

### Adding a variable

1. Decide whether it is browser-safe or server-only.
2. Add its schema to the relevant app schema, or the shared public/server schema as appropriate.
3. Add the platform read only to the relevant `runtime-client.ts` or `runtime-node.ts` adapter.
4. Update the app's `.env.example` with a blank placeholder or safe local value.
5. Add the name to that app's build/dev/typecheck `env` lists in `apps/<app>/turbo.json`.
6. Add validation tests and update the GitBook documentation when available.

The pure `@amore/env/store/validation` and `@amore/env/admin/validation` exports validate supplied
objects in Next config and tests without reading runtime values. T3 Env's final Zod schema applies
environment-specific integration requirements keyed by `NEXT_PUBLIC_APP_ENV`.

Vercel project linking and credentials are intentionally not committed. Create one Vercel project
per app and configure their environment scopes as described in Local setup.

### API and data fetching

`packages/contracts` owns the runtime-neutral tRPC procedures, exported `AppRouter` type, browser
transport, and TanStack Query integration. Its subpath exports preserve hard runtime boundaries:
API hosts use `@amore/contracts/server`, React apps use `@amore/contracts/react`, and non-React
clients can use `@amore/contracts/client`.

`apps/api` hosts the server router through Hono's Cloudflare Worker entry point, alongside Better
Auth and any deliberately REST-shaped `/v1/*` integrations. Keeping the contract separate from
the host lets future runtimes reuse procedures without importing Cloudflare or Hono implementation
details.

Both Next.js apps install one `ApiProvider` from `@amore/contracts/react` at their root. It creates a
stable tRPC client and TanStack Query client per browser session, sends credentialed batched calls
to `NEXT_PUBLIC_API_URL/trpc`, and exposes `useTRPC()` for type-safe query and mutation options.
TanStack Query is the current package name for the library historically called React Query.

The Worker's input-driven T3 Env adapter validates Cloudflare bindings directly, and Wrangler
generates platform types from the pinned deployment configuration. Local secrets live in the
ignored `apps/api/.env.local`; production secrets belong in Cloudflare Wrangler Secrets.

Cloudflare's compatibility option is named `nodejs_compat` (not `nodejs_compact`). The Worker also
enables `nodejs_compat_do_not_populate_process_env`: dependencies receive required Node APIs while
application code continues using typed `context.env` bindings. See `apps/api/README.md` for
local development, secret provisioning, build, and deployment commands.

## Testing and CI

Environment tests cover deployment-specific requirements, valid/invalid values, blank optionals,
error redaction, and public export/type boundaries. Analytics and observability contracts also have
focused unit tests. Unit tests use the Node environment.

Install Chromium before the first local browser run:

```sh
bunx --no-install playwright install chromium
bun run test:e2e
```

Playwright manages store on port 3000 and admin on port 3001, using public test settings and no
service credentials. Local runs reuse running servers; CI starts production servers after
building each app. Shared smoke tests check home and not-found pages on both applications.
App-specific browser suites belong in `apps/<app>/e2e/`.

Generated coverage, browser reports, and artifacts go to `coverage/`, `playwright-report/`,
and `test-results/` respectively. Git ignores all three.

CI runs on pull requests, pushes to `main`, and manual dispatch. Linting, unit tests, and
typechecking run in parallel, followed by a build matrix and browser tests. Per-app public
URLs are provided explicitly; CI does not require integration secrets. Bun's frozen lockfile
keeps dependency installation reproducible. Dependabot proposes weekly dependency updates.

## Git hooks and editor

Lefthook is installed by `bun install`. It checks staged source files with Biome and validates
Conventional Commit messages with Commitlint, for example `feat(store): add product search`.
VS Code recommends Biome for formatting and safe fixes on save.

## AI development

Project instructions and skills live only in `.agents/AGENTS.md` and `.agents/skills`. The root
`AGENTS.md`, `.claude/CLAUDE.md`, and `.claude/skills` paths are relative symbolic links, allowing
generic agents and Claude Code to derive their configuration from the same source without duplicated
content. Update `.agents` and run `bun run check:agents` instead of editing tool adapters.

On Windows, enable Developer Mode or clone with Git symlink support so `.claude/skills` remains a
directory link. Personal Claude permissions belong in ignored `.claude/settings.local.json`, never
in shared repository settings.

## License

Copyright © 2026 Amore Cosmetics. All Rights Reserved.

Use, access, and distribution are governed by the [proprietary software license](LICENSE.md)
and applicable agreements. Third-party components remain subject to their respective licenses.
