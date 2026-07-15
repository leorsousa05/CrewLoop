#!/usr/bin/env python3
"""Validate CrewLoop skill structure, Markdown, and transition contracts."""

from __future__ import annotations

import re
import sys
from pathlib import Path
from typing import Any

import yaml


REQUIRED_FIELDS = {"name", "description"}
ROOT = Path(__file__).resolve().parent.parent
SKILLS_DIR = ROOT / "skills"
CONTRACTS_PATH = ROOT / "references" / "skill-contracts.yaml"
KEBAB_CASE = re.compile(r"^[a-z0-9]+(?:-[a-z0-9]+)*$")
MARKDOWN_LINK = re.compile(r"\[[^\]]*\]\(([^)]+)\)")
CANONICAL_SKILLS = {
    "accessibility-auditor", "architect", "crewloop-hub", "designer", "devops-specialist",
    "diamondblock", "docs-writer", "engineer", "frontend-architect", "long-term-manager",
    "maintainer", "product-manager", "project-brainstorm", "researcher", "reviewer",
    "schema-designer", "security-guard", "shipper", "tester",
}


def parse_frontmatter(content: str) -> dict[str, Any] | None:
    lines = content.splitlines()
    if not lines or lines[0] != "---":
        return {}

    try:
        end = lines.index("---", 1)
    except ValueError:
        return None

    try:
        parsed = yaml.safe_load("\n".join(lines[1:end]))
        return parsed if isinstance(parsed, dict) else {}
    except yaml.YAMLError:
        return None


def validate_fences(content: str) -> list[str]:
    active: tuple[str, int] | None = None
    for line in content.splitlines():
        match = re.match(r"^\s*(`{3,}|~{3,})(.*)$", line)
        if not match:
            continue
        marker, suffix = match.groups()
        char = marker[0]
        if active is None:
            active = (char, len(marker))
        elif char == active[0] and len(marker) >= active[1] and not suffix.strip():
            active = None
    return [] if active is None else ["Markdown code fences are not balanced"]


def content_without_fenced_code(content: str) -> str:
    output: list[str] = []
    active: tuple[str, int] | None = None
    for line in content.splitlines():
        match = re.match(r"^\s*(`{3,}|~{3,})(.*)$", line)
        if match:
            marker, suffix = match.groups()
            char = marker[0]
            if active is None:
                active = (char, len(marker))
                continue
            if char == active[0] and len(marker) >= active[1] and not suffix.strip():
                active = None
                continue
        if active is None:
            output.append(line)
    return "\n".join(output)


def structural_markdown_lines(content: str) -> list[tuple[int, str]]:
    output: list[tuple[int, str]] = []
    active: tuple[str, int] | None = None
    for index, line in enumerate(content.splitlines()):
        match = re.match(r"^\s*(`{3,}|~{3,})(.*)$", line)
        if match:
            marker, suffix = match.groups()
            char = marker[0]
            if active is None:
                active = (char, len(marker))
                continue
            if char == active[0] and len(marker) >= active[1] and not suffix.strip():
                active = None
                continue
        if active is None:
            output.append((index, line))
    return output


def validate_markdown_links(markdown_file: Path, content: str) -> list[str]:
    errors: list[str] = []
    for raw_target in MARKDOWN_LINK.findall(content_without_fenced_code(content)):
        target = raw_target.strip().split(maxsplit=1)[0].strip("<>")
        if not target or target.startswith(("http://", "https://", "mailto:", "#")):
            continue

        relative_target = target.split("#", 1)[0]
        if not relative_target:
            continue

        resolved = (markdown_file.parent / relative_target).resolve()
        if not resolved.exists():
            errors.append(f"Broken relative link: {target}")
    return errors


def load_contracts(path: Path) -> dict[str, dict[str, Any]]:
    try:
        parsed = yaml.safe_load(path.read_text(encoding="utf-8"))
    except (OSError, yaml.YAMLError) as error:
        raise ValueError(f"Cannot load skill contracts: {error}") from error

    if not isinstance(parsed, dict) or parsed.get("version") != 1:
        raise ValueError("Skill contracts must be a version 1 mapping")
    skills = parsed.get("skills")
    if not isinstance(skills, dict):
        raise ValueError("Skill contracts must define a skills mapping")

    allowed_recommendations = {"always", "conditional", "never"}
    allowed_strategies = {"invoker", "architect-after-triage", "architect-after-brief"}
    for name, contract in skills.items():
        if not isinstance(name, str) or not isinstance(contract, dict):
            raise ValueError("Each skill contract must be a named mapping")
        if contract.get("kind") not in {"core", "supporting"}:
            raise ValueError(f"Contract {name} has an invalid kind")
        if not isinstance(contract.get("prefix"), str):
            raise ValueError(f"Contract {name} must define a string prefix")
        if not isinstance(contract.get("interactive"), bool):
            raise ValueError(f"Contract {name} must define interactive as a boolean")
        if not isinstance(contract.get("afk_target"), str):
            raise ValueError(f"Contract {name} must define an AFK target")
        menu = contract.get("menu")
        direct_target = contract.get("direct_target")
        if contract["interactive"]:
            if not isinstance(menu, dict) or not menu:
                raise ValueError(f"Interactive contract {name} must define a menu")
            always_count = 0
            conditions: set[str] = set()
            for key, route in menu.items():
                if not isinstance(key, str) or not re.fullmatch(r"[A-Z]", key):
                    raise ValueError(f"Contract {name} has an invalid menu key")
                if not isinstance(route, dict) or not isinstance(route.get("target"), str):
                    raise ValueError(f"Contract {name} has an invalid menu route")
                recommendation = route.get("recommended")
                if recommendation not in allowed_recommendations:
                    raise ValueError(f"Contract {name} has an invalid recommendation")
                if recommendation == "always":
                    always_count += 1
                if recommendation == "conditional":
                    condition = route.get("condition")
                    if not isinstance(condition, str) or not condition:
                        raise ValueError(f"Contract {name} has a conditional route without a condition")
                    if condition in conditions:
                        raise ValueError(f"Contract {name} has a duplicate recommendation condition")
                    conditions.add(condition)
            if always_count > 1:
                raise ValueError(f"Contract {name} has multiple always-recommended routes")
        elif not isinstance(direct_target, str):
            raise ValueError(f"Non-interactive contract {name} must define a direct target")
        if name != "crewloop-hub" and contract["afk_target"] != "crewloop-hub":
            raise ValueError(f"Contract {name} must return to crewloop-hub in AFK mode")
        if contract["kind"] == "supporting":
            if not isinstance(contract.get("default_invoker"), str):
                raise ValueError(f"Supporting contract {name} must define a default invoker")
            if contract.get("return_strategy") not in allowed_strategies:
                raise ValueError(f"Supporting contract {name} has an invalid return strategy")

    contract_names = set(skills)
    if contract_names == CANONICAL_SKILLS:
        if skills["crewloop-hub"].get("afk_target") != "architect":
            raise ValueError("CrewLoop Hub must route task-entry AFK work to architect")
        if skills["architect"].get("interactive") or skills["architect"].get("direct_target") != "conditional-designer-or-engineer":
            raise ValueError("Architect must be non-interactive with its conditional direct route")
        if skills["designer"].get("interactive") or skills["designer"].get("direct_target") != "engineer":
            raise ValueError("Designer must be non-interactive and route directly to engineer")
    for name, contract in skills.items():
        invoker = contract.get("default_invoker")
        if invoker is not None and invoker not in contract_names:
            raise ValueError(f"Contract {name} has an unknown default invoker: {invoker}")
        allowed_targets = contract_names | {"invoker", "continue", "done"}
        for route in (contract.get("menu") or {}).values():
            if route["target"] not in allowed_targets:
                raise ValueError(f"Contract {name} has an unknown menu target: {route['target']}")
        direct_target = contract.get("direct_target")
        if direct_target is not None and direct_target not in allowed_targets | {"conditional-designer-or-engineer"}:
            raise ValueError(f"Contract {name} has an unknown direct target: {direct_target}")
        if contract["afk_target"] not in contract_names:
            raise ValueError(f"Contract {name} has an unknown AFK target: {contract['afk_target']}")
        if contract.get("return_strategy") == "invoker":
            if "invoker" not in {route["target"] for route in (contract.get("menu") or {}).values()}:
                raise ValueError(f"Contract {name} must provide an invoker route")
        if contract.get("return_strategy") in {"architect-after-triage", "architect-after-brief"}:
            if name not in {"maintainer", "project-brainstorm"}:
                raise ValueError(f"Contract {name} cannot use an Architect-bound return strategy")
            if "architect" not in {route["target"] for route in (contract.get("menu") or {}).values()}:
                raise ValueError(f"Contract {name} must provide an architect route")

    return skills


def expected_contract_lines(contract: dict[str, Any]) -> list[str]:
    lines = [f'- **Role prefix:** `{contract["prefix"]}`']
    default_invoker = contract.get("default_invoker")
    if default_invoker:
        lines.append(f'- **Default invoker:** `{default_invoker}`')
        strategy = contract.get("return_strategy")
        if strategy == "invoker":
            lines.append("- **Invoker rule:** outside AFK, return to the actual invoking skill.")
        elif strategy == "architect-after-triage":
            lines.append("- **Return strategy:** after confirmed triage, route to `architect` outside AFK.")
        elif strategy == "architect-after-brief":
            lines.append("- **Return strategy:** after a completed brief, route to `architect` outside AFK.")

    menu = contract.get("menu")
    direct_target = contract.get("direct_target")
    if isinstance(menu, dict):
        routes = "; ".join(f'`[{key}]` -> `{route["target"]}`' for key, route in menu.items())
        lines.append(f"- **Interactive routes:** {routes}")
        recommendations = "; ".join(
            f'`[{key}]` -> `{route["recommended"]}'
            f'{":" + route["condition"] if route["recommended"] == "conditional" else ""}`'
            for key, route in menu.items()
        )
        lines.append(f"- **Recommendation rules:** {recommendations}")
        lines.append(
            "- **Post-selection:** load the selected skill directly without asking for a typed command."
        )
    elif isinstance(direct_target, str):
        lines.append(f'- **Direct route:** `{direct_target}`')

    if contract.get("afk_target") == "crewloop-hub":
        lines.append(
            "- **AFK route:** skip the menu and return to `crewloop-hub`; only the Hub selects the next phase."
        )
    else:
        lines.append(
            f'- **AFK route:** load `{contract["afk_target"]}` at task entry, or the next phase from workflow state.'
        )
    return lines


def extract_transition_contract(content: str) -> list[str] | None:
    lines = content.splitlines()
    structural_lines = structural_markdown_lines(content)
    headings = [index for index, line in structural_lines if line.strip() == "## TRANSITION CONTRACT"]
    if len(headings) != 1:
        return None
    start = headings[0] + 1
    end = next(
        (
            index
            for index, line in structural_lines
            if index >= start and (line.startswith("## ") or line.strip() == "---")
        ),
        len(lines),
    )
    return [line for line in lines[start:end] if line.strip()]


def validate_instruction_precedence(content: str, contract: dict[str, Any]) -> list[str]:
    if contract.get("afk_target") != "crewloop-hub":
        if "**Next skill:** Architect." in content:
            return ["Hub AFK next-skill instruction must be phase-aware"]
        return []

    errors: list[str] = []
    for line in content.splitlines():
        lowered = line.lower()
        if "present the navigation menu and wait" in lowered and "outside afk" not in lowered:
            errors.append(f"Menu instruction is not scoped outside AFK: {line.strip()}")
        if "when done" in lowered and "navigation options" in lowered and "outside afk" not in lowered:
            errors.append(f"Navigation instruction is not scoped outside AFK: {line.strip()}")
        if "always show the menu" in lowered:
            errors.append(f"Menu instruction overrides AFK: {line.strip()}")
        if "mandatory:" in lowered and ("handoff directly" in lowered or "hand off directly" in lowered):
            if "outside afk" not in lowered or "in afk" not in lowered:
                errors.append(f"Mandatory handoff does not define AFK precedence: {line.strip()}")
        if (line.lstrip().startswith("When ") or line.lstrip().startswith("Once ")) and "hand off directly" in lowered:
            if "outside afk" not in lowered:
                errors.append(f"Direct handoff is not scoped outside AFK: {line.strip()}")
    return errors


def validate_contract(content: str, contract: dict[str, Any]) -> list[str]:
    errors: list[str] = []
    actual_lines = extract_transition_contract(content)
    if actual_lines is None:
        errors.append("Expected exactly one TRANSITION CONTRACT section")
        return errors
    expected_lines = expected_contract_lines(contract)
    if actual_lines != expected_lines:
        errors.append("TRANSITION CONTRACT lines do not exactly match the manifest")
    errors.extend(validate_instruction_precedence(content, contract))
    return errors


def validate_skill(skill_dir: Path, contract: dict[str, Any] | None = None) -> list[str]:
    errors: list[str] = []
    skill_name = skill_dir.name
    skill_file = skill_dir / "SKILL.md"

    if not skill_file.exists():
        return [f"Missing {skill_file}"]

    content = skill_file.read_text(encoding="utf-8")
    frontmatter = parse_frontmatter(content)
    if frontmatter is None:
        return ["Frontmatter is present but is not valid YAML"]

    missing = REQUIRED_FIELDS - set(frontmatter.keys())
    if missing:
        errors.append(f"Missing frontmatter fields: {', '.join(sorted(missing))}")

    name = frontmatter.get("name")
    if name is not None and not isinstance(name, str):
        errors.append("Frontmatter name must be a string")
    elif isinstance(name, str):
        if name != skill_name:
            errors.append(f"Frontmatter name '{name}' does not match directory '{skill_name}'")
        if not KEBAB_CASE.fullmatch(name):
            errors.append("Frontmatter name must be lowercase kebab-case")

    description = frontmatter.get("description")
    if description is not None and not isinstance(description, str):
        errors.append("Frontmatter description must be a string")
    elif isinstance(description, str) and len(description) < 20:
        errors.append("Description is too short (< 20 characters)")

    errors.extend(validate_fences(content))
    errors.extend(validate_markdown_links(skill_file, content))
    if contract is not None:
        errors.extend(validate_contract(content, contract))
    return errors


def validate_repository(skills_dir: Path, contracts_path: Path) -> list[str]:
    try:
        contracts = load_contracts(contracts_path)
    except ValueError as error:
        return [str(error)]

    if not skills_dir.exists():
        return [f"Skills directory not found: {skills_dir}"]

    skill_names = {path.name for path in skills_dir.iterdir() if path.is_dir()}
    contract_names = set(contracts)
    errors = [f"Expected 19 skill contracts, found {len(contract_names)}"] if len(contract_names) != 19 else []

    for name in sorted(skill_names - contract_names):
        errors.append(f"Skill has no contract: {name}")
    for name in sorted(contract_names - skill_names):
        errors.append(f"Contract has no skill directory: {name}")
    if skill_names != CANONICAL_SKILLS:
        errors.append("Skill directories do not match the canonical 19-skill inventory")
    for name in sorted(skill_names & contract_names):
        errors.extend(f"{name}: {error}" for error in validate_skill(skills_dir / name, contracts[name]))
    return errors


def main() -> int:
    if not SKILLS_DIR.exists():
        print(f"Skills directory not found: {SKILLS_DIR}", file=sys.stderr)
        return 1

    try:
        contracts = load_contracts(CONTRACTS_PATH)
    except ValueError as error:
        print(f"FAIL repository\n   - {error}")
        return 1

    skill_dirs = sorted((path for path in SKILLS_DIR.iterdir() if path.is_dir()), key=lambda path: path.name)
    inventory_errors = []
    if len(contracts) != 19:
        inventory_errors.append(f"Expected 19 skill contracts, found {len(contracts)}")
    if set(contracts) != CANONICAL_SKILLS:
        inventory_errors.append("Skill contracts do not match the canonical 19-skill inventory")
    if {path.name for path in skill_dirs} != CANONICAL_SKILLS:
        inventory_errors.append("Skill directories do not match the canonical 19-skill inventory")
    if {path.name for path in skill_dirs} != set(contracts):
        inventory_errors.append("Skill directories do not match the contract inventory")

    all_ok = not inventory_errors
    if inventory_errors:
        print("FAIL repository")
        for error in inventory_errors:
            print(f"   - {error}")

    for skill_dir in skill_dirs:
        errors = validate_skill(skill_dir, contracts.get(skill_dir.name))
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
