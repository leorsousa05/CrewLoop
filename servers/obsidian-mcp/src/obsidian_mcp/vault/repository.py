from pathlib import Path

from obsidian_mcp.config import Config
from obsidian_mcp.models import Note
from obsidian_mcp.vault.parser import parse_note
from obsidian_mcp.vault.writer import write_note


class VaultRepository:
    def __init__(self, config: Config):
        self.config = config
        self.root = config.vault_path
        self.root.mkdir(parents=True, exist_ok=True)

    def _resolve(self, path: str) -> Path:
        safe = path.lstrip("/")
        if ".." in safe.split("/"):
            raise ValueError(f"invalid note path: {path}")
        full = (self.root / safe).resolve()
        if full != self.root and self.root not in full.parents:
            raise ValueError(f"invalid note path: {path}")
        return full

    def _is_inside_vault(self, path: Path) -> bool:
        resolved = path.resolve()
        return resolved == self.root or self.root in resolved.parents

    def list_notes(self, folder: str | None = None) -> list[str]:
        base = self.root
        if folder:
            base = self._resolve(folder)
        paths = []
        for p in base.rglob("*.md"):
            if not self._is_inside_vault(p):
                continue
            rel = p.relative_to(self.root)
            if any(part.startswith(".") for part in rel.parts):
                continue
            paths.append(rel.as_posix())
        return sorted(paths)

    def read(self, path: str) -> Note:
        full = self._resolve(path)
        if not full.exists():
            raise FileNotFoundError(f"note not found: {path}")
        return parse_note(path, full)

    def read_all(self) -> list[Note]:
        return [self.read(p) for p in self.list_notes()]

    def exists(self, path: str) -> bool:
        return self._resolve(path).exists()

    def save(self, note: Note) -> None:
        full = self._resolve(note.path)
        write_note(full, note)

    def delete(self, path: str) -> None:
        full = self._resolve(path)
        if not full.exists():
            raise FileNotFoundError(f"note not found: {path}")
        full.unlink()
