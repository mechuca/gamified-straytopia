# LLM Context (1:1 UI Handoff)

This repo contains a prototype UI where most styling/layout is implemented via inline styles inside `straytopia-web/src/app/page.tsx`.

The only reliable way for an LLM to reproduce the UI 1:1 is to use:
1. A specific Git commit SHA (source of truth)
2. A running reference (Vercel URL)
3. A screenshot of the exact state you want

## Source Of Truth
- GitHub repo: https://github.com/mechuca/gamified-straytopia
- Default branch: `main`

## Running Reference
- Production: https://straytopia-prototype.vercel.app

## Ops Hub (New App)

The operations hub lives in `straytopia-hub/` and is intended to be the shared control plane for:
- Case review (accept/reject)
- Auto task creation on accept
- Manual assignment
- Block-level analytics
- MEL / funding KPIs

### Ops Hub Environment Variables

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`

### Supabase Schema

- `supabase/migrations/001_init.sql`
- `supabase/migrations/002_missions_and_proofs.sql`
- `supabase/migrations/003_security_and_rls.sql`
- `supabase/migrations/004_audit_location_metadata.sql`

### Ops Hub Key Files

- Shell + nav: `straytopia-hub/src/components/AppShell.tsx`
- Auth guard: `straytopia-hub/src/components/AuthGate.tsx`
- Supabase client: `straytopia-hub/src/lib/supabase/client.ts`
- Cases queue: `straytopia-hub/src/app/(app)/cases/page.tsx`
- Tasks backlog: `straytopia-hub/src/app/(app)/tasks/page.tsx`
- MEL KPIs: `straytopia-hub/src/app/(app)/mel/page.tsx`

### Ops Hub Deployment Scripts

- Preview: `scripts/deploy-hub-preview.sh`
- Production: `scripts/deploy-hub-prod.sh`

### Ops Hub Running Reference

- Production: https://straytopia-hub.vercel.app

## Screenshots (Checked Into Repo)
- `docs/screenshots/2026-05-16-care-missions-bottom-nav-overlap.png`
- `docs/screenshots/2026-05-18-mission-card-ready-now.png`
- `docs/screenshots/2026-05-13-bottom-nav-reference-overlap.png`

Add ops hub screenshots here too once captured, for 1:1 UI matching.

If the UI changes, add a new screenshot and link it here so an LLM can match the latest visual state without needing external attachments.

## Key Files (Most UI Lives Here)
- Bottom nav + floating quick action: `straytopia-web/src/app/page.tsx` (`TabBar`)
- Onboarding location selection: `straytopia-web/src/app/page.tsx` (`SimpleOnboardingScreen`)
- Mock content (stories, etc): `straytopia-web/src/lib/mock.ts`

## Design / Behavior Rules
- Keep the floating `+` quick action at its current position.
- Bottom nav must show all 4 tabs fully at 375px width (no overlap).
- Prefer subtle borders and minimal shadows (avoid heavy/blocky shadows).
- Avoid overly capsule/pill UI when it feels noisy.

## How To Run Locally
```bash
cd "/Users/home/Desktop/Straytopia"
git pull

cd straytopia-web
npm install
npm run dev
```

## Deployment Discipline (Make Deploy == Commit)
- Do not deploy when `git status` shows modified/untracked files.
- Prefer Git-integrated Vercel deployments.
- If using CLI deployments, use the scripts in `scripts/` (they enforce a clean git tree).

## Copy-Paste Prompt Template (Give Another LLM)

```text
You are working on Straytopia UI.

Repo: https://github.com/mechuca/gamified-straytopia
Commit SHA: <PASTE_SHA_HERE>
Live reference: <PASTE_VERCEL_URL_HERE>
Screenshot: <ATTACH_IMAGE>

Primary file to edit: straytopia-web/src/app/page.tsx
Component: <TabBar | SimpleOnboardingScreen | ...>

Requirements:
- Match the screenshot 1:1 at 375px width and desktop.
- Keep the floating + quick action button position unchanged.
- No layout overlap with Profile tab.

Deliverables:
- Minimal code diff.
- Commands to verify (npm run build).
```
