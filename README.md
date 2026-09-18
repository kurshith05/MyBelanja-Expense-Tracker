# MyBelanja — Monthly Expense Tracker

A real, working expense-tracking web app (React 19 + TypeScript + Vite + Tailwind CSS v4 + Recharts),
backed by [Supabase](https://supabase.com) for auth and per-user data storage.

## What it does
- Email/password **sign up & sign in** — each person gets their own private account
- Every user's expenses, budget, income, and profile are stored in Supabase and scoped to them
  (enforced by Postgres Row Level Security, not just app logic)
- Dashboard with spending overview, budget progress, and recent expenses
- Add / edit / delete expenses (amount, category, date, description, payment method)
- Expense history with search/filter
- Monthly budget & income tracking
- Spending breakdown by category (charts)
- Monthly reports
- Settings (profile, currency, sign out, clear data)

The default currency is **Malaysian Ringgit (MYR / RM)** — new accounts start in RM and every
screen formats amounts with it. Users can switch to another currency under Settings -> Preferences;
the list lives in `src/data.ts` (`CURRENCIES`), and `DEFAULT_CURRENCY` there is the single place to
change the app-wide default.

New accounts start completely empty — no demo/seed data. "Clear All Expense Data" in Settings
wipes only the signed-in user's expenses.

## 1. Create a Supabase project
1. Go to https://supabase.com/dashboard and create a new project (free tier is fine).
2. Once it's ready, open **SQL Editor** and run the contents of `supabase/schema.sql` from this
   repo. This creates the `profiles` and `expenses` tables, turns on Row Level Security so users
   can only ever see their own data, and adds a trigger that creates a profile automatically
   whenever someone signs up.
3. Open **Settings → API** in your Supabase project and copy the **Project URL** and the
   **anon public** key.
4. (Optional) Under **Authentication → Providers → Email**, you can turn "Confirm email" off if
   you want new users to be able to sign in immediately without clicking an email link — handy
   while testing.

## 2. Configure the app
Copy `.env.example` to `.env` and fill in the two values from step 1.3:
```bash
cp .env.example .env
```
```
VITE_SUPABASE_URL=https://YOUR-PROJECT-REF.supabase.co
VITE_SUPABASE_ANON_KEY=YOUR-ANON-PUBLIC-KEY
```
`.env` is only read at build/dev time by Vite and should not be committed to git.

## 3. Run it locally
```bash
npm install
npm run dev
```
Then open the URL Vite prints (usually http://localhost:5173). You'll land on the sign in /
sign up screen — create an account to start using the app.

## Build for production
```bash
npm run build
npm run preview   # to test the production build locally
```
The static site is output to `dist/`.

## Deploy it for real
This still builds to a static site, so you can deploy `dist/` to any static host — just make sure
to set the same two `VITE_SUPABASE_URL` / `VITE_SUPABASE_ANON_KEY` environment variables on the
host (Vercel, Netlify, Cloudflare Pages, etc. all support setting env vars in their project
settings; they get baked in at build time).
- **Vercel**: `npx vercel` (auto-detects Vite) — add the env vars in Project Settings → Environment Variables
- **Netlify**: connect the repo or drag the `dist/` folder in — add env vars in Site settings → Environment variables
- **Cloudflare Pages / GitHub Pages**: build command `npm run build`, publish directory `dist`, set env vars in the host's dashboard

Also add your deployed URL under **Authentication → URL Configuration** in Supabase (Site URL /
Redirect URLs) so password-reset links work in production.

## Project structure
```
src/
  App.tsx               — top-level state, auth gating, routing between screens
  lib/supabaseClient.ts — Supabase client (reads env vars)
  lib/auth.tsx           — AuthProvider/useAuth: session, sign up, sign in, sign out, reset password
  lib/db.ts               — Supabase CRUD for expenses/profile/budget/income, scoped per user
  data.ts                — category colors/icons/labels (static constants only)
  types.ts                — shared TypeScript types
  components/Layout.tsx   — sidebar/nav shell (shows signed-in user, sign out)
  screens/Auth.tsx        — sign in / sign up / forgot password screen
  screens/                — Dashboard, AddExpense, ExpenseHistory, MonthlyBudget, Categories, MonthlyReports, Settings
supabase/schema.sql        — run once in the Supabase SQL Editor to set up tables + security
```
