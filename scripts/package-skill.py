#!/usr/bin/env python3
"""Package a single skill into a .skill archive.

Usage: python scripts/package-skill.py <skill-name> [output-dir]
Example: python scripts/package-skill.py shipper
"""

import shutil
import sys
from pathlib import Path

SKILLS_DIR = Path(__file__).resolve().parent.parent / "skills"


def package_skill(skill_name: str, output_dir: Path | None = None) -> Path:
    skill_path = SKILLS_DIR / skill_name
    if not skill_path.exists():
        raise FileNotFoundError(f"Skill not found: {skill_path}")

    output_dir = output_dir or Path.cwd()
    output_dir.mkdir(parents=True, exist_ok=True)

    output_file = output_dir / f"{skill_name}.skill"
    if output_file.exists():
        output_file.unlink()

    archive_path = shutil.make_archive(
        base_name=str(output_dir / skill_name),
        format="zip",
        root_dir=skill_path,
    )

    zip_file = Path(archive_path)
    final_file = zip_file.with_suffix(".skill")
    zip_file.rename(final_file)

    return final_file


def main() -> int:
    if len(sys.argv) < 2:
        print(f"Usage: {sys.argv[0]} <skill-name> [output-dir]", file=sys.stderr)
        return 1

    skill_name = sys.argv[1]
    output_dir = Path(sys.argv[2]) if len(sys.argv) > 2 else None

    try:
        output_file = package_skill(skill_name, output_dir)
        print(f"Packaged skill to: {output_file}")
        return 0
    except Exception as e:
        print(f"Error: {e}", file=sys.stderr)
        return 1


if __name__ == "__main__":
    sys.exit(main())
