#!/usr/bin/env bash
set -euo pipefail

script_dir="$(cd "$(dirname "$0")" && pwd)"
project_dir="$(cd "$script_dir/.." && pwd)"

codex_bin="$(command -v codex 2>/dev/null || true)"
bundled_codex="/Applications/ChatGPT.app/Contents/Resources/codex"

if [[ -z "$codex_bin" ]] || ! "$codex_bin" plugin --help >/dev/null 2>&1; then
  if [[ -x "$bundled_codex" ]] && "$bundled_codex" plugin --help >/dev/null 2>&1; then
    codex_bin="$bundled_codex"
  else
    codex_bin=""
  fi
fi

if [[ -z "$codex_bin" ]]; then
  echo "Codex CLI was not found. Install or update Codex first, then run this script again."
  exit 1
fi

"$codex_bin" plugin marketplace add "$project_dir"
"$codex_bin" plugin add daily-ai-wallpaper@personal

echo "Daily AI Wallpaper is installed. Start a new Codex task and ask it to generate today's wallpaper."
