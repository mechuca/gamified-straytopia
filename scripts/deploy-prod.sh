#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"

if [[ -n "$(git -C "$ROOT_DIR" status --porcelain)" ]]; then
  echo "Refusing to deploy: git working tree is not clean." >&2
  echo "Run: git status" >&2
  exit 1
fi

SHA="$(git -C "$ROOT_DIR" rev-parse --short HEAD)"
echo "Deploying production from commit $SHA"

cd "$ROOT_DIR/straytopia-web"
npm run build
npx vercel deploy --prod --yes
