import os
from dataclasses import dataclass, field
from pathlib import Path


def _default_bundle_path() -> Path:
    env_path = os.environ.get("CREWLOOP_BUNDLE_PATH")
    if env_path:
        return Path(env_path)
    return Path(__file__).resolve().parents[4]


@dataclass
class PrivacyConfig:
    enabled: bool = True
    block_api_keys: bool = True
    block_private_keys: bool = True
    block_env_files: bool = True
    block_emails: bool = True
    block_credit_cards: bool = True
    allowed_strings: list[str] = field(default_factory=list)


@dataclass(frozen=True)
class Config:
    vault_path: Path = field(default_factory=lambda: Path.home() / ".lea")
    index_dir: Path = field(default_factory=lambda: Path.home() / ".lea" / ".index")
    bundle_path: Path = field(default_factory=_default_bundle_path)
    embedding_model: str = "sentence-transformers/all-MiniLM-L6-v2"
    chunk_size: int = 512
    chunk_overlap: int = 64
    vector_limit: int = 20
    text_limit: int = 20
    graph_depth: int = 1
    sensitive_patterns: list[str] = field(default_factory=list)
    privacy: PrivacyConfig = field(default_factory=PrivacyConfig)

    def __post_init__(self):
        object.__setattr__(self, "vault_path", Path(self.vault_path).expanduser().resolve())
        object.__setattr__(self, "index_dir", Path(self.index_dir).expanduser().resolve())
        object.__setattr__(self, "bundle_path", Path(self.bundle_path).expanduser().resolve())
        privacy = self.privacy
        if isinstance(privacy, dict):
            privacy = PrivacyConfig(**privacy)
        elif not isinstance(privacy, PrivacyConfig):
            privacy = PrivacyConfig()
        object.__setattr__(self, "privacy", privacy)
