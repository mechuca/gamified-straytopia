Straytopia Ops Hub (Next.js) deployed separately from the mobile app.

## Getting Started

Set environment variables (see `.env.example`), then run:

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

Key screens:
- `src/app/(app)/cases/page.tsx`
- `src/app/(app)/tasks/page.tsx`

Auth:
- Create an email/password user in Supabase Auth.
- Sign in at `/login`.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

Deploy via Vercel UI or the CLI scripts in repo root:
- `scripts/deploy-hub-preview.sh`
- `scripts/deploy-hub-prod.sh`

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
