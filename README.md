# Gamified Engineering Blog Feed

A personal, single-repo web app: an Instagram-style infinite-scroll feed of engineering blog / Substack posts, personalized by tags picked at onboarding, with real gamification (XP, streaks, leaderboards) and real social actions (like, comment, repost, save, share).

## Tech Stack

- **Framework**: Next.js 14 (App Router, TypeScript)
- **Styling**: Tailwind CSS
- **Database**: Neon Postgres
- **ORM**: Prisma
- **Auth**: NextAuth (Auth.js) with GitHub OAuth
- **Deployment**: Vercel

## Structure

- `apps/web`: The Next.js frontend and API routes.
- `packages/db`: Prisma schema and generated client.
- `packages/ingest`: RSS parsing and ingestion script.

## Getting Started

1. Install dependencies: `pnpm install`
2. Setup database: Configure `DATABASE_URL` in `.env` and run `pnpm --filter @repo/db dlx prisma db push`
3. Start development server: `pnpm dev`
