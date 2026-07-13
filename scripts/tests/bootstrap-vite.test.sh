#!/usr/bin/env bash
set -euo pipefail

repo_root="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
script="$repo_root/scripts/bootstrap-vite.sh"
tmpdir="$(mktemp -d)"
trap 'rm -rf "$tmpdir"' EXIT

assert_file() {
  [[ -f "$1" ]] || {
    printf 'Expected file missing: %s\n' "$1" >&2
    exit 1
  }
}

assert_contains() {
  local file="$1"
  local expected="$2"
  grep -Fq "$expected" "$file" || {
    printf 'Expected "%s" in %s\n' "$expected" "$file" >&2
    exit 1
  }
}

run_happy_path() {
  local package_manager="$1"
  local create_marker="$2"
  local install_marker="$3"
  local bin_dir="$tmpdir/bin"
  local log_file="$tmpdir/${package_manager}.log"
  local target_dir="$tmpdir/${package_manager}-sample-app"
  mkdir -p "$bin_dir"

  cat >"$bin_dir/$package_manager" <<'EOF'
#!/usr/bin/env bash
set -euo pipefail
log_file="${BOOTSTRAP_VITE_LOG:?missing log file}"
printf '%s\n' "$*" >>"$log_file"
case "$1" in
  create)
    target_dir="$3"
    mkdir -p "$target_dir"
    printf '%s\n' "${BOOTSTRAP_VITE_CREATE_MARKER:?missing create marker}" >"$target_dir/scaffold.txt"
    ;;
  install)
    printf '%s\n' "${BOOTSTRAP_VITE_INSTALL_MARKER:?missing install marker}" >"$(pwd)/install.txt"
    ;;
  *)
    exit 3
    ;;
esac
EOF
  chmod +x "$bin_dir/$package_manager"

  BOOTSTRAP_VITE_LOG="$log_file" \
  BOOTSTRAP_VITE_CREATE_MARKER="$create_marker" \
  BOOTSTRAP_VITE_INSTALL_MARKER="$install_marker" \
  PATH="$bin_dir:$PATH" \
  bash "$script" "$target_dir" --template react-ts --package-manager "$package_manager" --install

  assert_file "$target_dir/scaffold.txt"
  assert_file "$target_dir/install.txt"
  assert_contains "$target_dir/scaffold.txt" "$create_marker"
  assert_contains "$target_dir/install.txt" "$install_marker"
}

run_invalid_manager() {
  local target_dir="$tmpdir/invalid-app"
  if bash "$script" "$target_dir" --package-manager nope >/dev/null 2>&1; then
    printf 'Expected invalid package manager to fail\n' >&2
    exit 1
  fi
}

run_happy_path npm npm-create npm-install
run_happy_path pnpm pnpm-create pnpm-install
run_happy_path yarn yarn-create yarn-install
run_happy_path bun bun-create bun-install
run_invalid_manager

printf 'bootstrap-vite tests passed\n'
