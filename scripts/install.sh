#!/usr/bin/env bash
# Install Loop Engineering Agents skills into the agent's skills directory.
# Usage: ./scripts/install.sh [target-dir]
# Default target: ~/.agents/skills/

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "${SCRIPT_DIR}/.." && pwd)"
SKILLS_DIR="${PROJECT_ROOT}/skills"
TARGET_DIR="${1:-${HOME}/.agents/skills}"

echo "Installing Loop Engineering Agents skills to: ${TARGET_DIR}"
mkdir -p "${TARGET_DIR}"

for skill_path in "${SKILLS_DIR}"/*; do
  if [ -d "${skill_path}" ]; then
    skill_name="$(basename "${skill_path}")"
    target_skill_path="${TARGET_DIR}/${skill_name}"

    echo "  → ${skill_name}"
    rm -rf "${target_skill_path}"
    mkdir -p "${target_skill_path}"
    cp -r "${skill_path}"/. "${target_skill_path}/"
  fi
done

echo "Done. Installed $(find "${SKILLS_DIR}" -mindepth 1 -maxdepth 1 -type d | wc -l) skills."
