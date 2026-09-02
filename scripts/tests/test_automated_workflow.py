"""Regression tests for CrewLoop's non-blocking Plan/Design workflow."""

from pathlib import Path
import unittest


ROOT = Path(__file__).resolve().parents[2]
PLAN_SKILL = ROOT / "skills" / "crewloop-plan" / "SKILL.md"
DESIGN_SKILL = ROOT / "skills" / "crewloop-design" / "SKILL.md"
WORKFLOW_REFERENCE = ROOT / "references" / "workflow.md"
CONVENTIONS = ROOT / "references" / "conventions.md"


class AutomatedWorkflowTest(unittest.TestCase):
    @classmethod
    def setUpClass(cls) -> None:
        cls.plan = PLAN_SKILL.read_text(encoding="utf-8")
        cls.design = DESIGN_SKILL.read_text(encoding="utf-8")
        cls.workflow = WORKFLOW_REFERENCE.read_text(encoding="utf-8")
        cls.conventions = CONVENTIONS.read_text(encoding="utf-8")

    def test_plan_resolves_discovery_without_questions(self) -> None:
        self.assertIn("resolves end-to-end context without blocking questions", self.plan)
        self.assertIn("Do not ask clarification questions or open a discovery questionnaire", self.plan)
        self.assertIn("repository-backed default", self.plan)
        self.assertNotIn("ask_question", self.plan)

    def test_design_resolves_visual_defaults_without_questionnaire(self) -> None:
        self.assertIn("Resolve without a questionnaire", self.design)
        self.assertIn("continue without asking discovery questions", self.design)
        self.assertNotIn("ask_question", self.design)

    def test_shared_workflow_documents_non_blocking_handoff(self) -> None:
        self.assertIn("does not block on a discovery questionnaire", self.workflow)
        self.assertIn("automated Plan/Design workflow does not open discovery questionnaires", self.conventions)


if __name__ == "__main__":
    unittest.main()
