"""Regression tests for CrewLoop's non-blocking Plan/Design workflow."""

from pathlib import Path
import unittest


ROOT = Path(__file__).resolve().parents[2]
PLAN_SKILL = ROOT / "skills" / "crewloop-plan" / "SKILL.md"
DESIGN_SKILL = ROOT / "skills" / "crewloop-design" / "SKILL.md"
CODE_SKILL = ROOT / "skills" / "crewloop-code" / "SKILL.md"
REVIEW_SKILL = ROOT / "skills" / "crewloop-review" / "SKILL.md"
SHIP_SKILL = ROOT / "skills" / "crewloop-ship" / "SKILL.md"
WORKFLOW_REFERENCE = ROOT / "references" / "workflow.md"
CONVENTIONS = ROOT / "references" / "conventions.md"
CONTINUOUS_OPTIMIZATION = ROOT / "references" / "continuous-optimization.md"
VALIDATION_WORKFLOW = ROOT / ".github" / "workflows" / "validate.yml"


class AutomatedWorkflowTest(unittest.TestCase):
    @classmethod
    def setUpClass(cls) -> None:
        cls.plan = PLAN_SKILL.read_text(encoding="utf-8")
        cls.design = DESIGN_SKILL.read_text(encoding="utf-8")
        cls.code = CODE_SKILL.read_text(encoding="utf-8")
        cls.review = REVIEW_SKILL.read_text(encoding="utf-8")
        cls.ship = SHIP_SKILL.read_text(encoding="utf-8")
        cls.workflow = WORKFLOW_REFERENCE.read_text(encoding="utf-8")
        cls.conventions = CONVENTIONS.read_text(encoding="utf-8")
        cls.continuous_optimization = CONTINUOUS_OPTIMIZATION.read_text(encoding="utf-8")
        cls.validation_workflow = VALIDATION_WORKFLOW.read_text(encoding="utf-8")

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

    def test_execution_record_handoff_is_boundary_scoped_and_provider_neutral(self) -> None:
        for content in (
            self.plan,
            self.code,
            self.review,
            self.ship,
            self.continuous_optimization,
        ):
            self.assertIn("TaskExecutionRecord", content)
            self.assertIn("unavailable", content)
            self.assertIn("prompts", content)
            self.assertIn("credentials", content)

        self.assertIn("only at the task or benchmark boundary", self.continuous_optimization)
        self.assertIn("never once per turn", self.code)
        self.assertIn("execution_record_unavailable", self.review)
        self.assertIn("never activate a policy", self.ship)

    def test_ci_runs_dataset_and_execution_record_benchmarks(self) -> None:
        dataset_step = self.validation_workflow.index("name: Run continuous token benchmark")
        record_step = self.validation_workflow.index("name: Run execution-record token benchmark")
        skill_step = self.validation_workflow.index("name: Validate skills")

        self.assertLess(dataset_step, record_step)
        self.assertLess(record_step, skill_step)
        self.assertIn("--baseline src/telemetry/fixtures/baseline.json", self.validation_workflow)
        self.assertIn("--candidate src/telemetry/fixtures/candidate.json", self.validation_workflow)
        self.assertIn(
            "--baseline-records src/telemetry/fixtures/execution-baseline.json",
            self.validation_workflow,
        )
        self.assertIn(
            "--candidate-records src/telemetry/fixtures/execution-candidate.json",
            self.validation_workflow,
        )
        self.assertEqual(self.validation_workflow.count("--format markdown"), 2)


if __name__ == "__main__":
    unittest.main()
