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

## Project structure

```
src/app/(app)/        Every authenticated page (dashboard, classes, students, ...)
src/app/login/        Sign-in page
src/lib/supabase/      Supabase client helpers (browser, server, middleware)
src/lib/data/          Shared server-side data-fetching helpers
src/components/        Shared UI (sidebar, topbar, forms, charts)
supabase/schema.sql    Full database schema + row-level security policies
supabase/seed.sql      Optional demo data
```

Each module (Academic Years, Classes, Teachers, Students, Attendance,
Exams & Results, Fees, Financial Management, Assignments, Timetable, Reports)
lives in its own folder under `src/app/(app)/` with a `page.tsx` (list/detail),
an `actions.ts` (server actions for create/update/delete), and small form
components.

## Deploying

Any Next.js host works (Vercel is the simplest). Set the same two
`NEXT_PUBLIC_SUPABASE_*` environment variables in your hosting provider's
dashboard, then deploy. No other backend or server process is required —
Supabase hosts the database.

## Notes on scope

This is a working first version, not a finished, audited product. Before
using it for real student/financial records:

- Review the row-level security policy in `schema.sql` — every signed-in
  staff account currently has full read/write access to all data (there is
  no separate "teacher can only see their own class" restriction yet).
- The "Documents" tab stores a name + external link, not an uploaded file.
  Wiring up real file uploads means adding a Supabase Storage bucket.
- Back up your Supabase project before making schema changes.
