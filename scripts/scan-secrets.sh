#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"

cd "$ROOT_DIR"

fail=0

echo "Scanning git-tracked files for likely secrets…"

# Guardrails: these paths/files should never be tracked.
if git ls-files | grep -E "(^|/)node_modules/|(^|/)\.next/|(^|/)\.vercel/" >/dev/null; then
  echo "ERROR: Build/dependency directories are tracked (node_modules/.next/.vercel)." >&2
  git ls-files | grep -E "(^|/)node_modules/|(^|/)\.next/|(^|/)\.vercel/" >&2 || true
  fail=1
fi

tracked_env_files="$(git ls-files | grep -E "(^|/)\.env($|\.)" | grep -v -E "(^|/)\.env\.example$|(^|/)\.env\..*\.example$")" || true
if [[ -n "$tracked_env_files" ]]; then
  echo "ERROR: .env files are tracked." >&2
  echo "$tracked_env_files" >&2
  fail=1
fi

echo "Checking for known key/token formats…"
PATTERNS_1='AKIA[0-9A-Z]{16}|ASIA[0-9A-Z]{16}|AIza[0-9A-Za-z\-_]{30,}|ghp_[A-Za-z0-9]{30,}|github_pat_[A-Za-z0-9_]{20,}|xox[baprs]-[A-Za-z0-9-]{10,}|sk_live_[A-Za-z0-9]{10,}|-----BEGIN (RSA |EC |OPENSSH |PRIVATE )?PRIVATE KEY-----'
if git grep -nE "$PATTERNS_1" -- . >/dev/null; then
  echo "ERROR: Found matches for known secret patterns:" >&2
  git grep -nE "$PATTERNS_1" -- . >&2 || true
  fail=1
fi

echo "Checking for provider names near key/token/secret…"
PATTERNS_2='(supabase|firebase|openai|anthropic|stripe|twilio|sendgrid|mailgun|sentry|vercel)[^A-Za-z0-9].{0,40}(key|token|secret|dsn)[[:space:]]*[:=]'
if git grep -nEi "$PATTERNS_2" -- . \
  ':(exclude)**/.env.example' \
  ':(exclude)**/.env.*.example' \
  ':(exclude)supabase/config.toml' \
  >/dev/null; then
  echo "ERROR: Found provider+secret-like matches:" >&2
  git grep -nEi "$PATTERNS_2" -- . \
    ':(exclude)**/.env.example' \
    ':(exclude)**/.env.*.example' \
    ':(exclude)supabase/config.toml' \
    >&2 || true
  fail=1
fi

echo "Checking for secret-looking NEXT_PUBLIC_* env vars (client-exposed)…"

# Allowlist: Supabase anon keys are designed to be public.
PATTERNS_PUBLIC_BAD_1='NEXT_PUBLIC_[A-Z0-9_]*(SECRET|TOKEN|PRIVATE|DSN)'
if git grep -nE "$PATTERNS_PUBLIC_BAD_1" -- . >/dev/null; then
  echo "ERROR: Found secret-looking NEXT_PUBLIC_* env vars (these ship to the browser):" >&2
  git grep -nE "$PATTERNS_PUBLIC_BAD_1" -- . >&2 || true
  fail=1
fi

PATTERNS_PUBLIC_BAD_2='NEXT_PUBLIC_[A-Z0-9_]*KEY'
if git grep -nE "$PATTERNS_PUBLIC_BAD_2" -- . | grep -v 'NEXT_PUBLIC_SUPABASE_ANON_KEY' >/dev/null; then
  echo "ERROR: Found secret-looking NEXT_PUBLIC_*KEY env vars (these ship to the browser):" >&2
  git grep -nE "$PATTERNS_PUBLIC_BAD_2" -- . | grep -v 'NEXT_PUBLIC_SUPABASE_ANON_KEY' >&2 || true
  fail=1
fi

if [[ "$fail" -ne 0 ]]; then
  echo ""
  echo "Secret scan failed. Remove secrets, rotate keys, and re-scan." >&2
  exit 1
fi

echo "Secret scan passed."
