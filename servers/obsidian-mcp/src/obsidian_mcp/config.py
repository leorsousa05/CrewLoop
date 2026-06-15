from dataclasses import dataclass, field
from pathlib import Path


@dataclass(frozen=True)
class Config:
    vault_path: Path = field(default_factory=lambda: Path.home() / ".lea")
    index_dir: Path = field(default_factory=lambda: Path.home() / ".lea" / ".index")
    bundle_path: Path = field(default_factory=lambda: Path(__file__).resolve().parents[4])
    embedding_model: str = "sentence-transformers/all-MiniLM-L6-v2"
    chunk_size: int = 512
    chunk_overlap: int = 64
    vector_limit: int = 20
    text_limit: int = 20
    graph_depth: int = 1
    sensitive_patterns: list[str] = field(default_factory=lambda: [
        r"\b(API_KEY|SECRET|TOKEN|PASSWORD)\s*[=:]\s*\S+",
        r"\bPRIVATE_KEY\b",
        r"-----BEGIN",
        r"\.env",
        r"\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}\b",
        r"\b(?:sk|ghp|gho|ghu|ghs|ghr|pat|np|openai|anthropic)-[A-Za-z0-9_\-]{10,}\b",
        r"\b\d{4}[ -]\d{4}[ -]\d{4}[ -]\d{4}\b",
    ])

    def __post_init__(self):
        object.__setattr__(self, "vault_path", Path(self.vault_path).expanduser().resolve())
        object.__setattr__(self, "index_dir", Path(self.index_dir).expanduser().resolve())
        object.__setattr__(self, "bundle_path", Path(self.bundle_path).expanduser().resolve())
