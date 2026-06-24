import logging
import re

from obsidian_mcp.config import Config

logger = logging.getLogger(__name__)


class PrivacyFilter:
    _RULES = {
        "api_keys": [
            r"\b(API_KEY|SECRET|TOKEN|PASSWORD)\s*[=:]\s*\S+",
            r"\b(?:sk|ghp|gho|ghu|ghs|ghr|pat|np|openai|anthropic)-[A-Za-z0-9_\-]{10,}\b",
        ],
        "private_keys": [
            r"\bPRIVATE_KEY\b",
            r"-----BEGIN",
        ],
        "env_files": [
            r"\.env",
        ],
        "emails": [
            r"\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}\b",
        ],
        "credit_cards": [
            r"\b\d{4}[ -]\d{4}[ -]\d{4}[ -]\d{4}\b",
        ],
    }

    def __init__(self, config: Config | None = None):
        self.config = config or Config()
        self.privacy = self.config.privacy
        self.patterns = self._compile_patterns()

    def _compile_patterns(self) -> list[re.Pattern]:
        raw_patterns: list[str] = []
        if self.privacy.block_api_keys:
            raw_patterns.extend(self._RULES["api_keys"])
        if self.privacy.block_private_keys:
            raw_patterns.extend(self._RULES["private_keys"])
        if self.privacy.block_env_files:
            raw_patterns.extend(self._RULES["env_files"])
        if self.privacy.block_emails:
            raw_patterns.extend(self._RULES["emails"])
        if self.privacy.block_credit_cards:
            raw_patterns.extend(self._RULES["credit_cards"])
        if self.config.sensitive_patterns:
            raw_patterns.extend(self.config.sensitive_patterns)
        return [re.compile(p, re.IGNORECASE) for p in raw_patterns]

    def _allowed(self, text: str) -> bool:
        return any(allowed in text for allowed in self.privacy.allowed_strings)

    def is_safe(self, text: str) -> bool:
        if not self.privacy.enabled:
            return True
        if self._allowed(text):
            return True
        return not any(pattern.search(text) for pattern in self.patterns)

    def validate(self, text: str) -> None:
        if not self.privacy.enabled:
            return
        if self._allowed(text):
            return
        if not self.is_safe(text):
            logger.warning("privacy filter blocked content")
            raise ValueError("content blocked by privacy filter: sensitive data detected")
