# Venue Business

VENUES LOCATION — a venue & film-shooting-location listings platform, split
into an independent frontend (SPA) and backend (REST API), both talking to
a shared Supabase project (Postgres + Auth + Storage).

See [`decisions.md`](decisions.md) for why the project is structured this
way, and [`flow.md`](flow.md) for how visitors, owners and admins actually
use the site.

## Structure

```
frontend/   React + TanStack Router SPA (Vite)
backend/    Express + TypeScript REST API
supabase/   migration.sql — full schema for a fresh Supabase project
```

## Setup

### 1. Database

Run [`supabase/migration.sql`](supabase/migration.sql) once in your Supabase
project's SQL editor. It creates every table, function, trigger, RLS policy
and the `venue-photos` storage bucket.

### 2. Backend

```sh
cd backend
npm install
cp .env.example .env   # fill in SUPABASE_URL and SUPABASE_ANON_KEY
npm run dev            # http://localhost:4000
```

No service-role/secret key is required — the backend forwards each user's
own Supabase session token, so Postgres RLS enforces all authorization.

### 3. Frontend

```sh
cd frontend
npm install
cp .env.example .env   # fill in your Supabase + backend API values
npm run dev            # http://localhost:5173
```

## Admin access

Sign up with an email listed in the `admin_bootstrap_emails` table (seeded
with `info@venueslocation.com` by the migration) to automatically get the
`admin` role. Otherwise every new sign-up gets the `owner` role.
