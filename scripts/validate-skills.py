#!/usr/bin/env python3
"""Validate all SKILL.md files in the skills/ directory.

Checks:
- File exists at skills/<name>/SKILL.md
- YAML frontmatter is present and parseable
- Required fields: name, description
- name matches the directory name
"""

import sys
from pathlib import Path

import yaml

REQUIRED_FIELDS = {"name", "description"}
SKILLS_DIR = Path(__file__).resolve().parent.parent / "skills"


def parse_frontmatter(content: str) -> dict | None:
    if not content.startswith("---"):
        return {}

    end = content.find("---", 3)
    if end == -1:
        return None

    frontmatter = content[3:end].strip()
    try:
        parsed = yaml.safe_load(frontmatter)
        return parsed if isinstance(parsed, dict) else {}
    except yaml.YAMLError:
        return None


def validate_skill(skill_dir: Path) -> list[str]:
    errors = []
    skill_name = skill_dir.name
    skill_file = skill_dir / "SKILL.md"

    if not skill_file.exists():
        errors.append(f"Missing {skill_file}")
        return errors

    content = skill_file.read_text(encoding="utf-8")
    frontmatter = parse_frontmatter(content)

    if frontmatter is None:
        errors.append("Frontmatter is present but is not valid YAML")
        return errors

    missing = REQUIRED_FIELDS - set(frontmatter.keys())
    if missing:
        errors.append(f"Missing frontmatter fields: {', '.join(sorted(missing))}")

    if "name" in frontmatter and frontmatter["name"] != skill_name:
        errors.append(
            f"Frontmatter name '{frontmatter['name']}' does not match directory '{skill_name}'"
        )

    if "description" in frontmatter and len(frontmatter["description"]) < 20:
        errors.append("Description is too short (< 20 characters)")

    return errors


def main() -> int:
    if not SKILLS_DIR.exists():
        print(f"Skills directory not found: {SKILLS_DIR}", file=sys.stderr)
        return 1

    skill_dirs = [d for d in SKILLS_DIR.iterdir() if d.is_dir()]
    if not skill_dirs:
        print(f"No skills found in {SKILLS_DIR}", file=sys.stderr)
        return 1

    all_ok = True
    for skill_dir in sorted(skill_dirs):
        errors = validate_skill(skill_dir)
        if errors:
            all_ok = False
            print(f"FAIL {skill_dir.name}")
            for error in errors:
                print(f"   - {error}")
        else:
            print(f"PASS {skill_dir.name}")

    return 0 if all_ok else 1


if __name__ == "__main__":
    sys.exit(main())
