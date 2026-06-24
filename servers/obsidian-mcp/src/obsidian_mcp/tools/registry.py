import asyncio

from obsidian_mcp.config import Config
from obsidian_mcp.tools.create import handle_create_note
from obsidian_mcp.tools.delete import handle_delete_note
from obsidian_mcp.tools.learn import handle_learn_from_text
from obsidian_mcp.tools.list import handle_list_notes
from obsidian_mcp.tools.read import handle_read_note
from obsidian_mcp.tools.related import handle_get_related_notes
from obsidian_mcp.tools.search import handle_search_notes
from obsidian_mcp.tools.sync import handle_sync_from_bundle
from obsidian_mcp.tools.update import handle_update_note


TOOLS = {
    "read_note": {
        "description": "Read a note from the Obsidian vault.",
        "input_schema": {
            "type": "object",
            "properties": {"path": {"type": "string"}},
            "required": ["path"],
        },
        "handler": handle_read_note,
    },
    "search_notes": {
        "description": "Search notes by text, vector, graph or hybrid.",
        "input_schema": {
            "type": "object",
            "properties": {
                "query": {"type": "string"},
                "mode": {"type": "string", "enum": ["text", "vector", "graph", "hybrid"]},
                "limit": {"type": "integer", "default": 10},
            },
            "required": ["query"],
        },
        "handler": handle_search_notes,
    },
    "create_note": {
        "description": "Create a new note in the vault.",
        "input_schema": {
            "type": "object",
            "properties": {
                "path": {"type": "string"},
                "content": {"type": "string"},
                "title": {"type": "string"},
                "tags": {"type": "array", "items": {"type": "string"}},
                "overwrite": {"type": "boolean", "default": False},
            },
            "required": ["path"],
        },
        "handler": handle_create_note,
    },
    "update_note": {
        "description": "Update or append content to an existing note.",
        "input_schema": {
            "type": "object",
            "properties": {
                "path": {"type": "string"},
                "content": {"type": "string"},
                "append": {"type": "string"},
                "tags": {"type": "array", "items": {"type": "string"}},
            },
            "required": ["path"],
        },
        "handler": handle_update_note,
    },
    "delete_note": {
        "description": "Delete a note from the vault.",
        "input_schema": {
            "type": "object",
            "properties": {"path": {"type": "string"}},
            "required": ["path"],
        },
        "handler": handle_delete_note,
    },
    "list_notes": {
        "description": "List notes in the vault.",
        "input_schema": {
            "type": "object",
            "properties": {"folder": {"type": "string"}},
        },
        "handler": handle_list_notes,
    },
    "get_related_notes": {
        "description": "Get notes related by links and graph traversal.",
        "input_schema": {
            "type": "object",
            "properties": {
                "path": {"type": "string"},
                "depth": {"type": "integer", "default": 1},
            },
            "required": ["path"],
        },
        "handler": handle_get_related_notes,
    },
    "sync_from_bundle": {
        "description": "Re-index the loop-engineering-agents bundle and local vault.",
        "input_schema": {
            "type": "object",
            "properties": {"force": {"type": "boolean", "default": False}},
        },
        "handler": handle_sync_from_bundle,
    },
    "learn_from_text": {
        "description": "Detect learnings in text and create notes automatically.",
        "input_schema": {
            "type": "object",
            "properties": {"text": {"type": "string"}},
            "required": ["text"],
        },
        "handler": handle_learn_from_text,
    },
}


def dispatch(name: str, arguments: dict, config: Config):
    tool = TOOLS.get(name)
    if tool is None:
        raise ValueError(f"unknown tool: {name}")
    return tool["handler"](arguments, config)


async def dispatch_async(name: str, arguments: dict, config: Config):
    tool = TOOLS.get(name)
    if tool is None:
        raise ValueError(f"unknown tool: {name}")
    handler = tool["handler"]
    if asyncio.iscoroutinefunction(handler):
        return await handler(arguments, config)
    return await asyncio.to_thread(handler, arguments, config)
