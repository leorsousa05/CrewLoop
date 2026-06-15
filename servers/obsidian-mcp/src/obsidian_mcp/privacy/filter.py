import re

from obsidian_mcp.config import Config


class PrivacyFilter:
    def __init__(self, config: Config | None = None):
        self.config = config or Config()
        self.patterns = [re.compile(p, re.IGNORECASE) for p in self.config.sensitive_patterns]

    def is_safe(self, text: str) -> bool:
        return not any(p.search(text) for p in self.patterns)

    def validate(self, text: str) -> None:
        if not self.is_safe(text):
            raise ValueError("content blocked by privacy filter: sensitive data detected")
