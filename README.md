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

## Deployment

### Frontend → Vercel

When importing this repo in Vercel:
- **Root Directory**: `frontend`
- **Build Command**: `npm run build` (auto-detected)
- **Output Directory**: `dist` (auto-detected)
- **Environment Variables**: copy every key from `frontend/.env.example`,
  filled with your real Supabase values, plus `VITE_API_URL` pointing at
  your deployed backend's URL (e.g. `https://your-backend.onrender.com/api`)

`frontend/vercel.json` already adds the SPA fallback rewrite needed for
client-side routing (TanStack Router) to work on refresh/direct links.

### Backend → Render (or Railway)

`backend/render.yaml` is a ready-to-use Render Blueprint. On Render:
- **Root Directory**: `backend`
- **Build Command**: `npm install && npm run build`
- **Start Command**: `npm start`
- **Environment Variables**: `SUPABASE_URL`, `SUPABASE_ANON_KEY` (from
  `backend/.env.example`), and `CORS_ORIGIN` set to your deployed frontend's
  URL (e.g. `https://your-app.vercel.app`) — no secret/service-role key
  needed.

Railway needs no special config file — just set the same Root Directory
and environment variables; it auto-detects the Node app from `package.json`.

### After both are live

1. Update the backend's `CORS_ORIGIN` to the real Vercel frontend URL.
2. Update the frontend's `VITE_API_URL` to the real backend URL, then
   redeploy the frontend so the new env var is baked into the build.

