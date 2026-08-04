#!/usr/bin/env bash
set -euo pipefail

script_dir="$(cd "$(dirname "$0")" && pwd)"
project_dir="$(cd "$script_dir/.." && pwd)"
marketplace_dir="$project_dir/.agents/plugins"

if ! command -v codex >/dev/null 2>&1; then
  echo "Codex CLI was not found. Install or update Codex first, then run this script again."
  exit 1
fi

codex plugin marketplace add "$marketplace_dir"
codex plugin add daily-ai-wallpaper@personal

echo "Daily AI Wallpaper is installed. Start a new Codex task and ask it to generate today's wallpaper."
