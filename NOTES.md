# Straytopia Notes (Resume Work)

## Links
- GitHub: https://github.com/mechuca/gamified-straytopia
- Vercel (prod): https://straytopia-prototype.vercel.app
- Vercel (latest preview): https://straytopia-prototype-eah55jd9h-mailsarathsasi-5052s-projects.vercel.app

## LLM Handoff
- See `LLM_CONTEXT.md` for a copy-paste prompt template and the exact files to edit.

## Repo Layout
- Main repo: `/Users/home/Desktop/Straytopia`
- Web app: `/Users/home/Desktop/Straytopia/straytopia-web`
- Mirror copy (manual sync, not a git repo): `/Users/home/Desktop/Straytopia Repository`

## Quick Start (Local)
```bash
cd "/Users/home/Desktop/Straytopia"
git pull

cd straytopia-web
npm install
npm run dev
```

## Deploy
- Preferred: use scripts so deploy == commit
```bash
./scripts/deploy-preview.sh
./scripts/deploy-prod.sh
```

- Preview:
```bash
cd "/Users/home/Desktop/Straytopia/straytopia-web"
npx vercel deploy --yes
```
- Production:
```bash
cd "/Users/home/Desktop/Straytopia/straytopia-web"
npx vercel deploy --prod --yes
```

## Where To Edit
- Bottom navigation + quick action button: `straytopia-web/src/app/page.tsx` (`TabBar`)
- Onboarding location selection: `straytopia-web/src/app/page.tsx` (`SimpleOnboardingScreen`)

## Recent Work
- Fixed onboarding location default copy, require selecting an area before continuing.
- Fixed bottom nav so Profile is not covered by the floating `+` quick action.
- Added repo-root `.gitignore` for `.DS_Store`.

## Last Known Good
- Branch: `main`
- Recent commit: `424375b` (ignore `.DS_Store`)
