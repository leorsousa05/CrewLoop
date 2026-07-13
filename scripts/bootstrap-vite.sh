#!/usr/bin/env bash
set -euo pipefail

usage() {
  cat <<'EOF'
Usage: bootstrap-vite.sh <target-dir> [--template TEMPLATE] [--package-manager npm|pnpm|yarn|bun] [--install]

Options:
  --template TEMPLATE         Vite template to scaffold (default: react-ts)
  --package-manager NAME      npm, pnpm, yarn, or bun (default: npm)
  --install                   Install dependencies after scaffolding
  -h, --help                  Show this help message

Use this helper only when the user explicitly wants a new Vite starter.
Skip it when the project already exists, when you are modifying an existing app,
or when the scaffold should be created by a different tool or template.
EOF
}

die() {
  printf 'Error: %s\n' "$1" >&2
  exit 1
}

TARGET_DIR=""
TEMPLATE="react-ts"
PACKAGE_MANAGER="npm"
INSTALL=false

while (($#)); do
  case "$1" in
    -h|--help)
      usage
      exit 0
      ;;
    --template)
      [[ $# -ge 2 ]] || die "Missing value for --template"
      TEMPLATE="$2"
      shift 2
      ;;
    --package-manager)
      [[ $# -ge 2 ]] || die "Missing value for --package-manager"
      PACKAGE_MANAGER="$2"
      shift 2
      ;;
    --install)
      INSTALL=true
      shift
      ;;
    --)
      shift
      break
      ;;
    -*)
      die "Unknown option: $1"
      ;;
    *)
      if [[ -z "$TARGET_DIR" ]]; then
        TARGET_DIR="$1"
      else
        die "Unexpected argument: $1"
      fi
      shift
      ;;
  esac
done

if [[ $# -gt 0 ]]; then
  die "Unexpected trailing arguments: $*"
fi

[[ -n "$TARGET_DIR" ]] || die "Missing target directory"

if [[ -e "$TARGET_DIR" && ! -d "$TARGET_DIR" ]]; then
  die "Target exists and is not a directory: $TARGET_DIR"
fi

if [[ -d "$TARGET_DIR" ]]; then
  if [[ -n "$(find "$TARGET_DIR" -mindepth 1 -maxdepth 1 -print -quit)" ]]; then
    die "Target directory is not empty: $TARGET_DIR"
  fi
else
  mkdir -p "$TARGET_DIR"
fi

case "$PACKAGE_MANAGER" in
  npm)
    CREATE_CMD=(npm create vite@latest "$TARGET_DIR" -- --template "$TEMPLATE")
    INSTALL_CMD=(npm install)
    ;;
  pnpm)
    CREATE_CMD=(pnpm create vite "$TARGET_DIR" --template "$TEMPLATE")
    INSTALL_CMD=(pnpm install)
    ;;
  yarn)
    CREATE_CMD=(yarn create vite "$TARGET_DIR" --template "$TEMPLATE")
    INSTALL_CMD=(yarn install)
    ;;
  bun)
    CREATE_CMD=(bun create vite "$TARGET_DIR" --template "$TEMPLATE")
    INSTALL_CMD=(bun install)
    ;;
  *)
    die "Unsupported package manager: $PACKAGE_MANAGER"
    ;;
esac

printf 'Scaffolding Vite project\n'
printf '  target: %s\n' "$TARGET_DIR"
printf '  template: %s\n' "$TEMPLATE"
printf '  package-manager: %s\n' "$PACKAGE_MANAGER"

"${CREATE_CMD[@]}"

if $INSTALL; then
  printf 'Installing dependencies\n'
  (
    cd "$TARGET_DIR"
    "${INSTALL_CMD[@]}"
  )
else
  printf 'Skipping dependency install\n'
fi

printf 'Done\n'
