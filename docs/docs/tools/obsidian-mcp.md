---
sidebar_position: 3
---

# Obsidian MCP

The CrewLoop Obsidian MCP server is a Python [Model Context Protocol](https://modelcontextprotocol.io/) server that bridges CrewLoop skills with an [Obsidian](https://obsidian.md/) vault.

## What it does

With the MCP server running, CrewLoop skills can read from and write to your Obsidian vault, treating it as a persistent second brain for project memory, decision records, and knowledge accumulation across sessions.

## Location

The server lives in `servers/obsidian-mcp/src/obsidian_mcp/`.

## Status

:::caution
The Obsidian MCP server is experimental and under active development. Refer to the source directory for the latest setup instructions.
:::

## What is MCP?

The [Model Context Protocol](https://modelcontextprotocol.io/) is an open standard that allows AI assistants to connect to external data sources and tools. By running this MCP server, CrewLoop skills can interact with your Obsidian vault through a standardized interface.
