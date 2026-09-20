# Changesets

Add one changeset for every user-facing change:

```sh
bun run changeset
```

Choose the affected workspace packages and a semver bump, then describe the
change in the generated Markdown file. The release workflow turns accumulated
changesets into version and changelog updates.

Applications and shared packages are private in this repository, so Changesets
versions them for release history without publishing them to npm.
