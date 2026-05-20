#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"

"$ROOT_DIR/scripts/scan-secrets.sh"

if [[ -n "$(git -C "$ROOT_DIR" status --porcelain)" ]]; then
  echo "Refusing to deploy: git working tree is not clean." >&2
  echo "Run: git status" >&2
  exit 1
fi

SHA="$(git -C "$ROOT_DIR" rev-parse --short HEAD)"
echo "Deploying hub production from commit $SHA"

cd "$ROOT_DIR/straytopia-hub"
npm run build
npx vercel deploy --prod --yes
