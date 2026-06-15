import asyncio
import json
import logging

from mcp import ErrorData, McpError
from mcp.server import Server
from mcp.server.stdio import stdio_server
from mcp.types import TextContent, Tool

from obsidian_mcp.config import Config
from obsidian_mcp.tools.registry import TOOLS, dispatch

logger = logging.getLogger(__name__)


def _error_code_for(exc: Exception) -> int:
    if isinstance(exc, (ValueError, FileExistsError)):
        return -32600
    if isinstance(exc, FileNotFoundError):
        return -32602
    return -32603


async def serve(config: Config | None = None):
    config = config or Config()
    server = Server("obsidian-mcp")

    @server.list_tools()
    async def list_tools() -> list[Tool]:
        return [
            Tool(name=name, description=meta["description"], inputSchema=meta["input_schema"])
            for name, meta in TOOLS.items()
        ]

    @server.call_tool()
    async def call_tool(name: str, arguments: dict | None) -> list[TextContent]:
        arguments = arguments or {}
        try:
            result = dispatch(name, arguments, config)
            if isinstance(result, str):
                return [TextContent(type="text", text=result)]
            return [TextContent(type="text", text=json.dumps(result, ensure_ascii=False, indent=2))]
        except Exception as exc:
            logger.exception("tool error")
            raise McpError(
                ErrorData(code=_error_code_for(exc), message=str(exc))
            ) from exc

    async with stdio_server() as (read_stream, write_stream):
        await server.run(read_stream, write_stream, server.create_initialization_options())


def main():
    logging.basicConfig(level=logging.INFO)
    asyncio.run(serve())
