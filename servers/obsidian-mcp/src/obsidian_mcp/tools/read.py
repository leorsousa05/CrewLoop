from obsidian_mcp.config import Config
from obsidian_mcp.vault.repository import VaultRepository


def _format_frontmatter_value(value: object) -> str:
    if isinstance(value, list):
        return ", ".join(str(item) for item in value)
    if isinstance(value, dict):
        return ", ".join(f"{k}={v}" for k, v in value.items())
    return str(value)


def handle_read_note(arguments: dict, config: Config) -> str:
    path = arguments.get("path")
    if not path:
        raise ValueError("path is required")
    vault = VaultRepository(config)
    note = vault.read(path)
    frontmatter = "\n".join(
        f"{k}: {_format_frontmatter_value(v)}"
        for k, v in note.frontmatter.items()
    )
    header = f"# {note.title}\n\n" if note.title else ""
    meta = f"**Tags:** {', '.join(note.tags)}\n\n" if note.tags else ""
    body = note.content
    if frontmatter:
        body = f"{frontmatter}\n\n{body}"
    return f"{header}{meta}{body}"
