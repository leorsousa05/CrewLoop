from obsidian_mcp.config import Config
from obsidian_mcp.vault.repository import VaultRepository


def handle_list_notes(arguments: dict, config: Config) -> str:
    folder = arguments.get("folder")
    vault = VaultRepository(config)
    notes = vault.list_notes(folder)
    if not notes:
        return "No notes found."
    return "\n".join(f"- {n}" for n in notes)
