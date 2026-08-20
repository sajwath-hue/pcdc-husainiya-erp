# Manbaul Huda Arabic College — Campus ERP

A web-based school management system for Manbaul Huda Arabic College: academic
years, classes, teachers, students, attendance, exams & results, assignments,
fees, financial reports, timetable and reports — all in one staff dashboard.

Built with **Next.js (App Router) + TypeScript + Tailwind CSS** on the frontend
and **Supabase** (Postgres + Auth) as the backend. No separate server to run —
Supabase is the database, auth and API in one.

## 1. Create a Supabase project

1. Go to [supabase.com](https://supabase.com) and create a free project.
2. In **Project Settings → API**, copy the **Project URL** and the **anon /
   public key**.
3. Open **SQL Editor** in the Supabase dashboard, paste the contents of
   [`supabase/schema.sql`](supabase/schema.sql), and run it. This creates every
   table, security policy and index the app needs.
4. Optionally also run [`supabase/seed.sql`](supabase/seed.sql) to load demo
   data (one academic year, six classes, three teachers, two students).

## 2. Configure the app

Copy the example env file and fill in the two values from step 1:

```bash
cp .env.example .env.local
```

```
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
```

## 3. Create your first staff login

Supabase Auth passwords can't be set through plain SQL, so create the first
account from the dashboard:

1. **Authentication → Users → Add user** — enter an email and password
   (leave "Auto Confirm User" checked).
2. That's it — a matching row is created automatically in the `profiles`
   table (role defaults to `admin`; you can change it to `super_admin` or
   `teacher` directly in the `profiles` table if needed).
3. Sign in at `/login` with that email and password.

Create additional staff accounts the same way whenever you need them.

## 4. Run it

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). You'll land on the login
page, then the dashboard once signed in.

## Getting a live web address

The fastest way to get a real `https://...` link staff can use from any
browser — no server to manage — is Vercel's one-click deploy. This runs under
**your own** Vercel and Supabase accounts (nobody else needs access to either):

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/sajwath-hue/pcdc-husainiya-erp&env=NEXT_PUBLIC_SUPABASE_URL,NEXT_PUBLIC_SUPABASE_ANON_KEY&envDescription=From%20your%20Supabase%20project%27s%20Settings%20%E2%86%92%20API%20page&project-name=manbaul-huda-erp&repository-name=manbaul-huda-erp)

1. Click the button, sign in to Vercel (free), and let it fork/import this repo.
2. When it asks for environment variables, paste the same
   `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` from step 1
   above.
3. Click **Deploy**. A few minutes later you get a permanent URL
   (`your-project.vercel.app`, or attach your own domain in Vercel's settings)
   that the whole school office can use.

Any other Next.js-compatible host (Netlify, Render, your own server via
`npm run build && npm run start`) works the same way — just set the same two
environment variables.

## Desktop app (Windows / macOS / Linux)

The same app also runs as an installable desktop program — a self-contained
window like the reference screenshots, no browser needed — via
[Electron](https://www.electronjs.org/). It's the same code either way; the
desktop build just packages the web app with its own local server inside.

**Try it without installing anything:**

```bash
npm run electron:dev
```

This opens the app in its own window while running against the normal dev
server (`.env.local` must already be filled in as in step 2 above).

**Build an installer to hand out to staff computers:**

```bash
npm run electron:build
```

`NEXT_PUBLIC_SUPABASE_URL` / `NEXT_PUBLIC_SUPABASE_ANON_KEY` must already be
set (in `.env.local`, or exported in your shell) *before* running this —
Next.js bakes those two values into the build, so the installer will point at
whichever Supabase project was active when you ran the command. The installer
lands in `release/` — an `.exe` on Windows, `.dmg` on macOS, or `.AppImage` on
Linux, matching whatever platform you build it on (electron-builder does not
cross-compile Windows installers from macOS/Linux without extra setup).

## Project structure

```
src/app/(app)/        Every authenticated page (dashboard, classes, students, ...)
src/app/login/        Sign-in page
src/lib/supabase/      Supabase client helpers (browser, server, middleware)
src/lib/data/          Shared server-side data-fetching helpers
src/components/        Shared UI (sidebar, topbar, forms, charts)
supabase/schema.sql    Full database schema + row-level security policies
supabase/seed.sql      Optional demo data
electron/              Desktop app wrapper (main process, preload, build script)
```

Each module (Academic Years, Classes, Teachers, Students, Attendance,
Exams & Results, Fees, Financial Management, Assignments, Timetable, Reports)
lives in its own folder under `src/app/(app)/` with a `page.tsx` (list/detail),
an `actions.ts` (server actions for create/update/delete), and small form
components.

## Notes on scope

This is a working first version, not a finished, audited product. Before
using it for real student/financial records:

- Review the row-level security policy in `schema.sql` — every signed-in
  staff account currently has full read/write access to all data (there is
  no separate "teacher can only see their own class" restriction yet).
- The "Documents" tab stores a name + external link, not an uploaded file.
  Wiring up real file uploads means adding a Supabase Storage bucket.
- Back up your Supabase project before making schema changes.
- The desktop app uses Electron's default icon. To brand it, add your own
  `.ico` (Windows) / `.icns` (macOS) / `.png` (Linux) file and point
  `build.win.icon` / `build.mac.icon` / `build.linux.icon` at it in
  `package.json`.
