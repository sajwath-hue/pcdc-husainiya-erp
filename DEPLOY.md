# Deploying (to get a live URL for the Android app)

This app needs a host with a **persistent disk** (it uses a SQLite file
and stores uploaded documents on disk) — not a stateless serverless
platform like Vercel's free tier.

## Render (recommended — has a one-click Blueprint below)

1. Push this repo to GitHub (already done — branch
   `claude/loan-management-enhancement-n2ae67`, or merge it to `main`).
2. Sign up / log in at https://render.com and connect your GitHub account.
3. Click **New +** → **Blueprint**, pick this repository. Render reads
   `render.yaml` in the repo root and proposes one service
   (`pcdc-husainiya-erp`) with a 1GB persistent disk.
4. Confirm the plan (a paid **Starter** plan or above — required for the
   persistent disk; the free tier has none and would lose the database
   and uploaded files on every restart).
5. Click **Apply**. Render builds the `Dockerfile`, runs
   `prisma migrate deploy` automatically on container start, and gives
   you a URL like `https://pcdc-husainiya-erp.onrender.com`.
6. Once it's live, log in and run `npm run db:seed` locally against a
   `DATABASE_URL` pointed at production if you want the demo accounts —
   or just register real PCDC staff accounts (there's no self-serve
   sign-up screen by design; ask an Admin to create accounts, or run the
   seed script once against the production database).

## Railway (alternative)

Same Dockerfile works. Create a new project from this GitHub repo,
add a **Volume** mounted at `/data`, and set the same environment
variables as in `render.yaml` (`DATABASE_URL=file:/data/prod.db`,
`STORAGE_ROOT=/data/storage`, `SESSION_SECRET=<random>`,
`REMINDER_THRESHOLD_DAYS=30`).

## After it's deployed

Give me the live URL and I'll finish wiring the Android WebView app to
point at it and build the APK.
