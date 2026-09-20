# Shared agent configuration

`AGENTS.md` and the `skills` directory are the canonical sources for project instructions and
repository-scoped Agent Skills. Tool-specific paths reference these files instead of copying them;
this prevents instructions and supporting resources from drifting between AI development tools.

The root `AGENTS.md` and Claude Code's `.claude/CLAUDE.md` both link to `.agents/AGENTS.md`. Claude
discovers skills through `.claude/skills`, which links to `.agents/skills`. Run
`bun run check:agents` after changing this structure.
