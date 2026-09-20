import type { UserConfig } from "@commitlint/types";

const config: UserConfig = {
  // Enforces messages such as `feat(shop): add product filters`.
  // Add project-specific overrides under `rules` when the team needs them.
  extends: ["@commitlint/config-conventional"],
};

export default config;
