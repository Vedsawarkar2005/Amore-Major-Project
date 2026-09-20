import { lstat, readdir, realpath } from "node:fs/promises";
import { join } from "node:path";
import { fileURLToPath } from "node:url";

const repositoryRoot = fileURLToPath(new URL("../", import.meta.url));
const canonicalInstructionsFile = join(repositoryRoot, ".agents", "AGENTS.md");
const canonicalSkillsDirectory = join(repositoryRoot, ".agents", "skills");
const rootInstructionsFile = join(repositoryRoot, "AGENTS.md");
const claudeInstructionsFile = join(repositoryRoot, ".claude", "CLAUDE.md");
const claudeSkillsDirectory = join(repositoryRoot, ".claude", "skills");

/** Require tool adapters to resolve to one canonical file or directory instead of copied content. */
async function assertCanonicalLink(linkPath: string, canonicalPath: string, label: string) {
  const linkEntry = await lstat(linkPath);

  if (!linkEntry.isSymbolicLink()) {
    throw new Error(`${label} must be a symbolic link`);
  }

  const [canonicalRealPath, linkRealPath] = await Promise.all([
    realpath(canonicalPath),
    realpath(linkPath),
  ]);

  if (canonicalRealPath !== linkRealPath) {
    throw new Error(`${label} does not resolve to ${canonicalPath}`);
  }
}

/** Fail CI when tool-specific agent configuration could drift from the canonical `.agents` source. */
async function validateAgentConfiguration() {
  await Promise.all([
    assertCanonicalLink(rootInstructionsFile, canonicalInstructionsFile, "AGENTS.md"),
    assertCanonicalLink(claudeInstructionsFile, canonicalInstructionsFile, ".claude/CLAUDE.md"),
    assertCanonicalLink(claudeSkillsDirectory, canonicalSkillsDirectory, ".claude/skills"),
  ]);

  const skills = await readdir(canonicalSkillsDirectory, { withFileTypes: true });
  const skillDirectories = skills.filter((entry) => entry.isDirectory());

  await Promise.all(
    skillDirectories.map((entry) => lstat(join(canonicalSkillsDirectory, entry.name, "SKILL.md"))),
  );

  console.log(`Agent configuration valid: ${skillDirectories.length} shared skills`);
}

await validateAgentConfiguration();
