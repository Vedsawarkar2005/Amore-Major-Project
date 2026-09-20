# Amore Cosmetics

This is a proprietary Bun/Turborepo monorepo. Preserve existing user changes and inspect the
affected workspace before editing it.

## Repository boundaries

- `apps/store` is one Vercel deployment named `@amore/store`. The apex domain and bare localhost
  render the landing page; `store.amorecosmetics.in` and `store.localhost:3000` render `/store/*`
  through hostname rewrites. Vercel previews expose the landing page at `/` and shop at `/store`.
- `apps/admin` is the Vercel administration application.
- `apps/api` is the Hono API hosted on Cloudflare Workers.
- `packages/contracts` separates tRPC exports into `server`, `client`, and `react` entry points.
- Shared visual primitives belong in `packages/ui`; business components remain in their app.
- Environment access belongs in `packages/env`; application modules consume validated exports.
- Documentation belongs in GitBook. Keep only essential setup and operational guidance in README files.

## Development conventions

- Use Bun for dependency management and scripts, and Turbo for workspace orchestration.
- Use TypeScript, Biome, Vitest, and Playwright. Do not introduce ESLint or Prettier.
- Avoid direct `process.env` access outside the dedicated runtime adapters in `packages/env`.
- Add comments for non-obvious intent, runtime boundaries, and operational constraints. Do not
  narrate self-explanatory code.
- Keep server-only dependencies out of browser entry points and preserve package subpath boundaries.
- Run `bun run check`, `bun run typecheck`, and relevant tests after meaningful changes.

## Shared agent skills

`.agents/skills` is the canonical, tool-neutral source. Tool-specific skill directories must link
to it instead of copying its contents. Create, update, or remove skills only through
`.agents/skills`.
