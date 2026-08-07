import importlib.util
import tempfile
import unittest
from pathlib import Path

import yaml


SCRIPT = Path(__file__).resolve().parents[1] / "validate-skills.py"
SPEC = importlib.util.spec_from_file_location("validate_skills", SCRIPT)
assert SPEC and SPEC.loader
validate_skills = importlib.util.module_from_spec(SPEC)
SPEC.loader.exec_module(validate_skills)


CONTRACT = {
    "kind": "supporting",
    "prefix": "> 🧪 **Example**",
    "default_invoker": "crewloop:plan",
    "return_strategy": "invoker",
    "interactive": False,
    "direct_target": "crewloop:plan",
    "afk_target": "crewloop:plan",
}


def valid_content(extra: str = "") -> str:
    return f'''---
name: example
description: Example skill description long enough to pass validation.
---

# Example

## TRANSITION CONTRACT

- **Role prefix:** `> 🧪 **Example**`
- **Default invoker:** `crewloop:plan`
- **Invoker rule:** outside AFK, return to the actual invoking skill.
- **Direct route:** `crewloop:plan`
- **AFK route:** skip the menu and return to `crewloop:plan`; the Plan skill evaluates state and loads the next phase.
{extra}
'''


class ValidateSkillsTest(unittest.TestCase):
    def create_skill(self, content: str) -> tuple[tempfile.TemporaryDirectory, Path]:
        temp = tempfile.TemporaryDirectory()
        skill_dir = Path(temp.name) / "example"
        skill_dir.mkdir()
        (skill_dir / "SKILL.md").write_text(content, encoding="utf-8")
        return temp, skill_dir

    def test_accepts_valid_skill_contract(self) -> None:
        temp, skill_dir = self.create_skill(valid_content())
        self.addCleanup(temp.cleanup)
        self.assertEqual(validate_skills.validate_skill(skill_dir, CONTRACT), [])

    def test_rejects_non_string_description(self) -> None:
        content = valid_content().replace(
            "description: Example skill description long enough to pass validation.",
            "description: 42",
        )
        temp, skill_dir = self.create_skill(content)
        self.addCleanup(temp.cleanup)
        self.assertIn("Frontmatter description must be a string", validate_skills.validate_skill(skill_dir, CONTRACT))

    def test_rejects_unbalanced_markdown_fence(self) -> None:
        temp, skill_dir = self.create_skill(valid_content("\n```text\nunclosed\n"))
        self.addCleanup(temp.cleanup)
        self.assertIn("Markdown code fences are not balanced", validate_skills.validate_skill(skill_dir, CONTRACT))

    def test_rejects_broken_relative_link(self) -> None:
        temp, skill_dir = self.create_skill(valid_content("\n[missing](references/missing.md)\n"))
        self.addCleanup(temp.cleanup)
        errors = validate_skills.validate_skill(skill_dir, CONTRACT)
        self.assertIn("Broken relative link: references/missing.md", errors)

    def test_rejects_wrong_prefix(self) -> None:
        temp, skill_dir = self.create_skill(valid_content().replace("> 🧪 **Example**", "> Wrong"))
        self.addCleanup(temp.cleanup)
        errors = validate_skills.validate_skill(skill_dir, CONTRACT)
        self.assertIn("TRANSITION CONTRACT lines do not exactly match the manifest", errors)

    def test_rejects_wrong_afk_target(self) -> None:
        expected = "- **AFK route:** skip the menu and return to `crewloop:plan`; the Plan skill evaluates state and loads the next phase."
        content = valid_content().replace(expected, "- **AFK route:** go directly to `crewloop:code`.")
        temp, skill_dir = self.create_skill(content)
        self.addCleanup(temp.cleanup)
        errors = validate_skills.validate_skill(skill_dir, CONTRACT)
        self.assertIn("TRANSITION CONTRACT lines do not exactly match the manifest", errors)

    def test_rejects_invalid_direct_target(self) -> None:
        with tempfile.TemporaryDirectory() as temp:
            contracts = Path(temp) / "contracts.yaml"
            invalid = {
                "version": 3,
                "skills": {
                    "example": {
                        **CONTRACT,
                        "default_invoker": "example",
                        "direct_target": "crewloop:hub",
                    }
                },
            }
            contracts.write_text(yaml.safe_dump(invalid, allow_unicode=True), encoding="utf-8")
            with self.assertRaisesRegex(ValueError, "unknown direct target"):
                validate_skills.load_contracts(contracts)

    def test_rejects_non_plan_afk_bypass(self) -> None:
        with tempfile.TemporaryDirectory() as temp:
            contracts = Path(temp) / "contracts.yaml"
            invalid = {
                "version": 3,
                "skills": {"example": {**CONTRACT, "default_invoker": "example", "afk_target": "crewloop:code"}},
            }
            contracts.write_text(yaml.safe_dump(invalid, allow_unicode=True), encoding="utf-8")
            with self.assertRaisesRegex(ValueError, "must return to crewloop:plan"):
                validate_skills.load_contracts(contracts)

    def test_repository_requires_exact_contract_inventory(self) -> None:
        with tempfile.TemporaryDirectory() as temp:
            root = Path(temp)
            skills_dir = root / "skills"
            skills_dir.mkdir()
            skill_dir = skills_dir / "example"
            skill_dir.mkdir()
            (skill_dir / "SKILL.md").write_text(valid_content(), encoding="utf-8")
            contracts = root / "contracts.yaml"
            repository_contract = {**CONTRACT, "default_invoker": "example"}
            plan_contract = {
                "kind": "core",
                "prefix": "> Plan",
                "interactive": False,
                "direct_target": "example",
                "afk_target": "crewloop:plan",
            }
            contracts.write_text(
                yaml.safe_dump(
                    {"version": 3, "skills": {"example": repository_contract, "crewloop:plan": plan_contract}},
                    allow_unicode=True,
                ),
                encoding="utf-8",
            )
            errors = validate_skills.validate_repository(skills_dir, contracts)
            self.assertIn("Expected 6 skill contracts, found 2", errors)

    def test_repository_manifest_contains_all_current_skills(self) -> None:
        repository_root = Path(__file__).resolve().parents[2]
        contracts = validate_skills.load_contracts(repository_root / "references" / "skill-contracts.yaml")
        self.assertEqual(len(contracts), 6)
        self.assertEqual(
            {validate_skills.expected_dir_name(n) for n in contracts},
            {path.name for path in (repository_root / "skills").iterdir() if path.is_dir()},
        )
        self.assertEqual(
            validate_skills.validate_repository(
                repository_root / "skills",
                repository_root / "references" / "skill-contracts.yaml",
            ),
            [],
        )

    def test_rejects_later_mandatory_route_that_bypasses_afk(self) -> None:
        content = valid_content(
            "\n## HANDOFF\n\n*Mandatory: Handoff directly to Engineer without requiring any typed command.*\n"
        )
        temp, skill_dir = self.create_skill(content)
        self.addCleanup(temp.cleanup)
        errors = validate_skills.validate_skill(skill_dir, CONTRACT)
        self.assertTrue(any("AFK precedence" in error for error in errors))

    def test_rejects_unqualified_menu_wait_instruction(self) -> None:
        content = valid_content("\n## NAVIGATION\n\nPresent the navigation menu and WAIT for user choice:\n")
        temp, skill_dir = self.create_skill(content)
        self.addCleanup(temp.cleanup)
        errors = validate_skills.validate_skill(skill_dir, CONTRACT)
        self.assertTrue(any("not scoped outside AFK" in error for error in errors))

    def test_frontmatter_delimiters_must_be_standalone(self) -> None:
        temp, skill_dir = self.create_skill(valid_content().replace("---\n", "---invalid\n", 1))
        self.addCleanup(temp.cleanup)
        errors = validate_skills.validate_skill(skill_dir, CONTRACT)
        self.assertTrue(any("Missing frontmatter fields" in error for error in errors))

    def test_supports_tilde_and_longer_fences(self) -> None:
        content = valid_content("\n~~~~markdown\n```literal\n~~~~\n")
        temp, skill_dir = self.create_skill(content)
        self.addCleanup(temp.cleanup)
        self.assertNotIn("Markdown code fences are not balanced", validate_skills.validate_skill(skill_dir, CONTRACT))

    def test_rejects_unexpected_transition_contract_content(self) -> None:
        content = valid_content().replace(
            "- **Direct route:**",
            "Contradictory transition prose.\n- **Direct route:**",
        )
        temp, skill_dir = self.create_skill(content)
        self.addCleanup(temp.cleanup)
        self.assertIn(
            "TRANSITION CONTRACT lines do not exactly match the manifest",
            validate_skills.validate_skill(skill_dir, CONTRACT),
        )

    def test_accepts_conditional_direct_targets(self) -> None:
        with tempfile.TemporaryDirectory() as temp:
            contracts = Path(temp) / "contracts.yaml"
            plan_contract = {
                "kind": "core",
                "prefix": "> Plan",
                "interactive": False,
                "direct_target": "conditional-crewloop:design-or-crewloop:code",
                "afk_target": "crewloop:plan",
            }
            contracts.write_text(
                yaml.safe_dump({"version": 3, "skills": {"crewloop:plan": plan_contract}}, allow_unicode=True),
                encoding="utf-8",
            )
            loaded = validate_skills.load_contracts(contracts)
            self.assertEqual(loaded["crewloop:plan"]["direct_target"], "conditional-crewloop:design-or-crewloop:code")

    def test_ignores_transition_heading_inside_fenced_code(self) -> None:
        content = valid_content("\n## NOTES\n\n```markdown\n## TRANSITION CONTRACT\n---\n```\n")
        temp, skill_dir = self.create_skill(content)
        self.addCleanup(temp.cleanup)
        self.assertEqual(validate_skills.validate_skill(skill_dir, CONTRACT), [])


if __name__ == "__main__":
    unittest.main()
