# Implementation Plan: Gamified Engineering Blog Feed

## 0. Goal

A personal, single-repo web app: an Instagram-style infinite-scroll feed of engineering
blog / Substack posts, personalized by tags picked at onboarding, with real gamification
(XP, streaks, leaderboards) and real social actions (like, comment, repost, save, share).
Target: working end-to-end prototype in one day, on Ubuntu with 8GB RAM, no Android Studio.

## 1. Constraints (do not violate)

- No Android Studio / native mobile tooling. Web app only (installable as a PWA later).
- Dev machine has 8GB RAM. Do NOT run a local Postgres container, a second backend
  process, or any local search/index service. Use hosted services for anything stateful.
- One language/runtime for the whole app (TypeScript/Node) to avoid running two dev
  servers simultaneously.
- Every feature below must be a real, working implementation — no mocked/stubbed data,
  no fake XP counters, no placeholder leaderboard.
- Monorepo.

## 2. Tech Stack

| Layer          | Choice                                        | Why                                                                                |
| -------------- | --------------------------------------------- | ---------------------------------------------------------------------------------- |
| Framework      | Next.js 14 (App Router, TypeScript)           | Route Handlers + Server Actions cover both frontend and backend, single dev server |
| Styling        | Tailwind CSS                                  | glass/blur utilities built in, no extra runtime cost                               |
| DB             | Neon Postgres (hosted, free tier)             | zero local RAM cost, serverless                                                    |
| ORM            | Prisma                                        | typed schema + migrations                                                          |
| Auth           | NextAuth (Auth.js) + GitHub OAuth provider    | no password handling, dev-audience-appropriate                                     |
| Data fetching  | @tanstack/react-query                         | `useInfiniteQuery` for the feed, optimistic updates for likes/saves                |
| Feed ingestion | `rss-parser`, `@mozilla/readability`, `jsdom` | RSS/Atom parsing + clean article extraction, all Node, no Python process           |
| Deploy         | Vercel (app) + Neon (db)                      | native Next.js support, generous free tier                                         |

## 3. Monorepo Structure

```
blogfeed/
├─ apps/
│  └─ web/                 # Next.js app: UI, API routes, auth
├─ packages/
│  ├─ db/                  # prisma/schema.prisma + generated client, shared
│  └─ ingest/               # scraper/ingestion script, depends on @repo/db
├─ pnpm-workspace.yaml
└─ package.json
```

## 4. Setup Steps

1. `pnpm init` at root, create `pnpm-workspace.yaml` listing `apps/*` and `packages/*`.
2. `pnpm create next-app apps/web --typescript --tailwind --app`
3. `pnpm add -D prisma --filter @repo/db` and `pnpm add @prisma/client --filter @repo/db`; `npx prisma init` inside `packages/db`.
4. Create a free Neon project → copy the pooled connection string into `DATABASE_URL`.
5. `pnpm add next-auth --filter web`; create a GitHub OAuth App (Settings → Developer
   settings → OAuth Apps) with callback `http://localhost:3000/api/auth/callback/github`;
   store `GITHUB_ID` / `GITHUB_SECRET`.
6. `pnpm add @tanstack/react-query --filter web`
7. `pnpm add rss-parser @mozilla/readability jsdom --filter ingest`, add `@repo/db` as a
   workspace dependency of `packages/ingest`.

### `.env.example` (apps/web)

```
DATABASE_URL=
NEXTAUTH_SECRET=
NEXTAUTH_URL=http://localhost:3000
GITHUB_ID=
GITHUB_SECRET=
```

## 5. Data Model (`packages/db/prisma/schema.prisma`)

```prisma
datasource db { provider = "postgresql"; url = env("DATABASE_URL") }
generator client { provider = "prisma-client-js" }

model User {
  id            String    @id @default(cuid())
  githubId      String    @unique
  name          String?
  email         String?   @unique
  avatarUrl     String?
  xp            Int       @default(0)
  level         Int       @default(1)
  currentStreak Int       @default(0)
  longestStreak Int       @default(0)
  lastReadDate  DateTime?
  createdAt     DateTime  @default(now())

  interests  UserTag[]
  likes      Like[]
  comments   Comment[]
  reposts    Repost[]
  saves      Save[]
  readEvents ReadEvent[]
  xpEvents   XpEvent[]
}

model Tag {
  id      String      @id @default(cuid())
  slug    String      @unique
  label   String
  users   UserTag[]
  sources SourceTag[]
  posts   PostTag[]
}

model UserTag {
  userId String
  tagId  String
  user   User @relation(fields: [userId], references: [id])
  tag    Tag  @relation(fields: [tagId], references: [id])
  @@id([userId, tagId])
}

model Source {
  id          String      @id @default(cuid())
  name        String
  feedUrl     String      @unique
  siteUrl     String
  hasFullFeed Boolean     @default(false) // does the feed itself carry full article content?
  tags        SourceTag[]
  posts       Post[]
}

model SourceTag {
  sourceId String
  tagId    String
  source   Source @relation(fields: [sourceId], references: [id])
  tag      Tag    @relation(fields: [tagId], references: [id])
  @@id([sourceId, tagId])
}

model Post {
  id          String    @id @default(cuid())
  sourceId    String
  title       String
  url         String    @unique
  author      String?
  publishedAt DateTime
  excerpt     String?
  contentHtml String?   // only set when source.hasFullFeed = true (see section 6)
  imageUrl    String?
  wordCount   Int?
  createdAt   DateTime  @default(now())

  source     Source      @relation(fields: [sourceId], references: [id])
  tags       PostTag[]
  likes      Like[]
  comments   Comment[]
  reposts    Repost[]
  saves      Save[]
  readEvents ReadEvent[]
}

model PostTag {
  postId String
  tagId  String
  post   Post @relation(fields: [postId], references: [id])
  tag    Tag  @relation(fields: [tagId], references: [id])
  @@id([postId, tagId])
}

model Like {
  userId    String
  postId    String
  createdAt DateTime @default(now())
  user User @relation(fields: [userId], references: [id])
  post Post @relation(fields: [postId], references: [id])
  @@id([userId, postId])
}

model Comment {
  id        String   @id @default(cuid())
  userId    String
  postId    String
  body      String
  createdAt DateTime @default(now())
  user User @relation(fields: [userId], references: [id])
  post Post @relation(fields: [postId], references: [id])
}

model Repost {
  userId    String
  postId    String
  note      String?
  createdAt DateTime @default(now())
  user User @relation(fields: [userId], references: [id])
  post Post @relation(fields: [postId], references: [id])
  @@id([userId, postId])
}

model Save {
  userId    String
  postId    String
  createdAt DateTime @default(now())
  user User @relation(fields: [userId], references: [id])
  post Post @relation(fields: [postId], references: [id])
  @@id([userId, postId])
}

model ReadEvent {
  userId    String
  postId    String
  method    String   // "in_app" | "external"
  scrollPct Int
  dwellSec  Int
  xpAwarded Int
  createdAt DateTime @default(now())
  user User @relation(fields: [userId], references: [id])
  post Post @relation(fields: [postId], references: [id])
  @@id([userId, postId]) // one XP award per user per post, ever
}

model XpEvent {
  id        String   @id @default(cuid())
  userId    String
  amount    Int
  reason    String   // "full_read" | "streak_bonus" | "comment" | ...
  createdAt DateTime @default(now())
  user User @relation(fields: [userId], references: [id])
}
```

## 6. Content & Click-Through Model (IP-aware design)

At ingestion time, for each `Source`, inspect the feed:

- If the feed's `<content:encoded>` (or full `<description>`) is long relative to a
  normal summary (heuristic: > ~1200 characters, or near the length of the rendered
  page's main content), set `hasFullFeed = true` and store the cleaned HTML in
  `Post.contentHtml` via Readability.
- Otherwise store only `excerpt` (the feed's own summary), `imageUrl` (feed enclosure or
  `og:image`), and leave `contentHtml` null. Do **not** scrape the live page to fill in
  the rest — see section 10 for why.

**Card click behavior:**

- `source.hasFullFeed === true` → open the in-app Reader (renders `Post.contentHtml`,
  distraction-free: no nav, serif font, dimmed background).
- `source.hasFullFeed === false` → open `Post.url` in a new tab (in-app "browser" feel:
  the feed stays open in the background tab). This is effectively "redirects to the
  original blog article" for sources that don't syndicate full text.

**XP tracking for both paths:**

- In-app reader: Intersection Observer scroll% + a running dwell timer; on scroll ≥ 90%
  AND dwell ≥ 60% of estimated reading time (`wordCount / 200wpm`), POST to
  `/api/posts/:id/read-complete` with `method: "in_app"`.
- External tab: start a timer on click; on `visibilitychange` back to the app, compute
  elapsed time; if elapsed ≥ a reading-time estimate (fallback: 30s minimum if no
  `wordCount`), POST the same endpoint with `method: "external"`. Less precise, but a
  reasonable good-faith signal without re-scraping the page.
- Server always upserts on the `(userId, postId)` unique key — XP for a given article is
  awarded exactly once per user regardless of how many times they open it.

## 7. API Routes (`apps/web/app/api/**`)

- `POST /api/onboarding` — body: `{ tagSlugs: string[] }` → writes `UserTag` rows.
- `GET /api/feed?cursor=` — cursor-paginated, filtered/scored by the user's `UserTag`.
- `POST /api/posts/:id/like` / `DELETE` — toggle.
- `POST /api/posts/:id/save` / `DELETE` — toggle.
- `POST /api/posts/:id/repost` — body: `{ note?: string }`.
- `POST /api/posts/:id/comments` / `GET /api/posts/:id/comments`
- `POST /api/posts/:id/read-complete` — body: `{ method, scrollPct, dwellSec }`.
- `GET /api/leaderboard?window=all|week|day`

## 8. Gamification Economy

- Full article read: **+10 XP** (once per post, enforced by `ReadEvent` unique key).
- First read of a new calendar day: **+5 XP** streak bonus, and:
  - `lastReadDate` was yesterday → `currentStreak += 1`
  - `lastReadDate` was today already → no change
  - otherwise (gap > 1 day, or first ever read) → `currentStreak = 1`
  - `longestStreak = max(longestStreak, currentStreak)`
- Comment posted: +2 XP. Like given: +0 XP (likes shouldn't be farmable for points).
- `level = floor(xp / 100) + 1`
- Leaderboard: `SELECT userId, SUM(amount) FROM XpEvent WHERE createdAt >= :windowStart GROUP BY userId ORDER BY 2 DESC` — works for all-time/week/day without denormalized counters going stale.

## 9. Feed Ranking

`score = (tagMatchCount * 10) + recencyDecay(publishedAt) + log(likeCount + 1) * 3`
Fetch candidate posts (tag intersection with user's `UserTag`), compute score in the
route handler, cursor-paginate on `(score DESC, id)`.

## 10. IP / Legal Note (context for the design above — general information, not legal advice)

- Showing title + short excerpt + thumbnail and linking to the original (the
  `hasFullFeed = false` path) mirrors how Feedly/Google News/daily.dev operate and
  carries the lowest IP risk — it uses only what the publisher chose to syndicate and
  sends traffic back to them.
- Rendering full article content in-app is only done when the source's own RSS/Atom
  feed already contains that full content (`hasFullFeed = true`) — i.e. the publisher
  opted to put the whole post in the feed specifically so reader apps could show it.
  This is the same basis Reeder/NetNewsWire/Feedly Pro operate on.
- Deliberately NOT implemented: scraping the live page to backfill full text when the
  feed only offers a summary. That would mean reproducing and redistributing content
  beyond what was offered for syndication, wrapped in your own comments/likes/leaderboard
  layer — a materially higher-risk pattern, especially if this app ever gets more users.
- For a solo/personal prototype this is low-stakes either way; the distinction matters
  more if the app is ever made public or multi-user.

## 11. Day-1 Build Order (~10–12 hours)

1. Scaffold repo, Tailwind, Prisma + Neon, NextAuth + GitHub OAuth (~1.5h)
2. Migrate schema, seed 15–20 sources across target topics + their tags (~1h)
3. Onboarding tag-picker UI → `UserTag` write → redirect to feed (~1h)
4. Ingestion script: parse feeds, run `hasFullFeed` heuristic, extract via Readability
   when applicable, dedupe by `url`, insert `Post` rows (~1.5h)
5. `/api/feed` + infinite scroll + glass `PostCard` (like/comment/repost/save wired,
   optimistic updates) (~2h)
6. In-app Reader + external-tab path + read-complete tracking for both (~1.5h)
7. Comments UI (~1h)
8. Leaderboard page (~1h)
9. Profile header: XP, level, streak (~0.5h)
10. Deploy: push to GitHub, connect Vercel, set env vars, smoke test (~1h)

## 12. Deferred (explicitly out of scope for day 1)

- Scheduled ingestion (run `pnpm --filter ingest start` manually; GitHub Actions cron is
  a later 20-minute add).
- Per-article AI/LLM tagging (source-level tags are enough to start).
- PWA manifest for "install to home screen" (cheap follow-up, no Android Studio needed).
- Reposts appearing in other users' feeds (requires a follow graph — separate feature).
