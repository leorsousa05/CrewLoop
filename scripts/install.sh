#!/usr/bin/env bash
# Install CrewLoop skills into the agent's skills directory.
# Usage: ./scripts/install.sh [target-dir]
# Default target: ~/.agents/skills/
#
# Prefer npm? Install via:
#   npm install -g @crewloop/cli
#   crewloop install

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "${SCRIPT_DIR}/.." && pwd)"
SKILLS_DIR="${PROJECT_ROOT}/skills"
TARGET_DIR="${1:-${HOME}/.agents/skills}"

echo "Installing CrewLoop skills to: ${TARGET_DIR}"
mkdir -p "${TARGET_DIR}"

for skill_path in "${SKILLS_DIR}"/*; do
  if [ -d "${skill_path}" ]; then
    skill_name="$(basename "${skill_path}")"
    target_skill_path="${TARGET_DIR}/${skill_name}"

    echo "  → ${skill_name}"
    rm -rf "${target_skill_path}"
    mkdir -p "${target_skill_path}"
    # Copy skill-specific files
    cp -r "${skill_path}"/. "${target_skill_path}/"

    # Merge shared/global references if they exist
    if [ -d "${PROJECT_ROOT}/references" ]; then
      mkdir -p "${target_skill_path}/references"
      cp -r "${PROJECT_ROOT}/references"/. "${target_skill_path}/references/"
    fi

    # Merge shared/global assets if they exist
    if [ -d "${PROJECT_ROOT}/assets" ]; then
      mkdir -p "${target_skill_path}/assets"
      cp -r "${PROJECT_ROOT}/assets"/. "${target_skill_path}/assets/"
    fi
  fi
done

echo "Done. Installed $(find "${SKILLS_DIR}" -mindepth 1 -maxdepth 1 -type d | wc -l) skills."

# Optional: install Obsidian MCP server
MCP_DIR="${PROJECT_ROOT}/servers/obsidian-mcp"
if [ -d "${MCP_DIR}" ]; then
  echo ""
  echo "Installing Obsidian MCP server from ${MCP_DIR}"
  if [ ! -d "${MCP_DIR}/.venv" ]; then
    python3 -m venv "${MCP_DIR}/.venv"
  fi
  "${MCP_DIR}/.venv/bin/pip" install -q -e "${MCP_DIR}"
  LOCAL_BIN="${HOME}/.local/bin"
  mkdir -p "${LOCAL_BIN}"
  ln -sf "${MCP_DIR}/.venv/bin/obsidian-mcp" "${LOCAL_BIN}/obsidian-mcp"
  echo "Linked obsidian-mcp to ${LOCAL_BIN}/obsidian-mcp"
  echo "Make sure ${LOCAL_BIN} is on your PATH."
fi
