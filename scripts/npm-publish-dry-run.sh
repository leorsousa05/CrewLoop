#!/usr/bin/env bash
set -euo pipefail

cd "$(dirname "$0")/.."

echo "==> Dry-run publish @archznn/crewloop-skills"
npm publish --dry-run

echo ""
echo "==> Dry-run publish @archznn/crewloop-cli"
npm run build --workspace=@archznn/crewloop-cli
npm publish --workspace=@archznn/crewloop-cli --dry-run

echo ""
echo "==> Dry-run complete"
