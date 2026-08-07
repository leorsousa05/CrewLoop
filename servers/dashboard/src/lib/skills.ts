/**
 * Convert a skill directory name to its canonical skill name.
 * CrewLoop skill directories follow the pattern `crewloop-<slug>` and the
 * canonical name used in SKILL.md frontmatter is `crewloop:<slug>`.
 */
export function canonicalSkillName(directoryName: string): string {
  const match = directoryName.match(/^crewloop-([a-z0-9-]+)$/);
  return match ? `crewloop:${match[1]}` : directoryName;
}
