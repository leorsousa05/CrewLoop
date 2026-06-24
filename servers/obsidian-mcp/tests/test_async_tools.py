import asyncio
import threading
import time

import pytest

from obsidian_mcp.config import Config
from obsidian_mcp.tools.registry import TOOLS, dispatch_async
from obsidian_mcp.vault.repository import VaultRepository


def test_dispatch_async_runs_sync_handler_in_thread(monkeypatch):
    events = []

    def slow_handler(arguments, config):
        events.append(("start", threading.current_thread().name))
        time.sleep(0.1)
        events.append(("end", threading.current_thread().name))
        return "slow-result"

    monkeypatch.setitem(TOOLS, "slow_tool", {
        "description": "Slow tool",
        "input_schema": {"type": "object"},
        "handler": slow_handler,
    })

    async def _run():
        start = time.monotonic()
        result = await dispatch_async("slow_tool", {}, Config())
        elapsed = time.monotonic() - start
        return result, elapsed

    result, elapsed = asyncio.run(_run())
    assert result == "slow-result"
    assert elapsed >= 0.05
    assert any("start" in e[0] for e in events)


def test_dispatch_async_awaits_async_handler(monkeypatch):
    async def async_handler(arguments, config):
        await asyncio.sleep(0.01)
        return "async-result"

    monkeypatch.setitem(TOOLS, "async_tool", {
        "description": "Async tool",
        "input_schema": {"type": "object"},
        "handler": async_handler,
    })

    async def _run():
        return await dispatch_async("async_tool", {}, Config())

    result = asyncio.run(_run())
    assert result == "async-result"


def test_dispatch_async_does_not_block_event_loop(monkeypatch):
    async def background_task():
        await asyncio.sleep(0.05)
        return "background-done"

    def slow_handler(arguments, config):
        time.sleep(0.15)
        return "done"

    monkeypatch.setitem(TOOLS, "slow_tool2", {
        "description": "Slow tool",
        "input_schema": {"type": "object"},
        "handler": slow_handler,
    })

    async def _run():
        task = asyncio.create_task(background_task())
        result = await dispatch_async("slow_tool2", {}, Config())
        background_result = await task
        return result, background_result

    result, background_result = asyncio.run(_run())
    assert result == "done"
    assert background_result == "background-done"


def test_dispatch_stays_synchronous(config):
    VaultRepository(config)
    from obsidian_mcp.tools.registry import dispatch
    result = dispatch("create_note", {"path": "sync.md", "content": "hello"}, config)
    assert result["status"] == "created"
