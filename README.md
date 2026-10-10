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

For account-wide subscription upgrades, run these scripts in order for both
new and existing databases:

1. [`supabase/verified_listing_payment.sql`](supabase/verified_listing_payment.sql)
2. [`supabase/account_photo_limits.sql`](supabase/account_photo_limits.sql)

The dashboard lets an owner upgrade or renew their account plan. Basic accounts
allow 10 photos per property, the INR 3,650 annual plan allows 20, and the
INR 36,500 annual plan allows 60. One verified subscription covers all existing
and future properties; pending or rejected payments do not increase the limit.
Verification updates the account without replacing existing listings or photos.
New properties within an active account's allowance do not need another payment.
Expiry keeps existing photos, but further uploads above the free allowance require
renewal. Upgrades charge the full selected annual price (no proration); verification
uses the existing renewal rule of extending a future expiry by one year.
The database enforces the allowance even for direct Supabase writes and restricts
subscription activation to admins/payment verification. Deploy both applications
after applying the SQL scripts.

Admins can open **Subscriptions** from the admin panel (`/subscriptions`) to
view purchased account plans, owner name, phone, email, exact property counts
(including pending/rejected listings), current photo allowance, status, dates
and latest invoice number (plain text, without a download option).
The table is admin-only and paginated. Pending payments stay in the admin panel's
payment verification table until an account subscription is activated.

Payment verification issues an invoice number and activates the subscription.
The dashboard shows the latest invoice number and each verified payment's number
as plain text. Invoice documents and viewing/download options remain disabled
until an approved invoice template is added.
For an existing database, rerun `supabase/verified_listing_payment.sql` to replace
the verification function with this number-only version.

Run [`supabase/visitors.sql`](supabase/visitors.sql) after the schema setup for
both new and existing projects to enable visitor search capture.

For an existing database, run [`supabase/film_categories.sql`](supabase/film_categories.sql)
once in the Supabase SQL editor before deploying the separate Film Locations
category panel. It copies the current venue categories and subcategories as the
initial film options. Fresh installations only need `migration.sql`.

To enable admin-only enquiry deletion on an existing database, run
[`supabase/admin_lead_delete.sql`](supabase/admin_lead_delete.sql) in the SQL editor.
To restrict venue deletion to admins, also run
[`supabase/admin_venue_delete.sql`](supabase/admin_venue_delete.sql).

The one-time [`supabase/reset_lead_codes.sql`](supabase/reset_lead_codes.sql)
deletes all current leads and lead audit history, then starts new lead IDs at
`OMS-001`. New lead audit entries will use those new IDs. Back up the database
before running it; previously issued IDs may still exist outside the app.

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

## Exploring categories

Each category in the home page's Explore Venues section opens a choice between
Venue Bookings and Film Shooting. The choice opens the corresponding listing
page with the selected category in the URL. The Film Locations category filter
includes shared venue categories as well as film-specific categories, using the
listing's film category when set and its venue category otherwise. Categories
without matching listings show an empty result rather than unrelated properties.

Home page Featured Venues cards also offer a purpose choice, opening the selected
property's details rather than a category listing. Only purposes offered by the
property are enabled. The choice is preserved in the details URL and displayed
beside the enquiry form, and included in submitted enquiry messages and the
WhatsApp enquiry text.

## Visitor search capture

Before viewing venue listings, film-location listings or property details,
visitors enter their name and phone number. Details are remembered in session
storage for the browser session, not placed in URLs. Each page visit or filter
change is saved before results are shown, including category, subcategory,
location, capacity, purpose, budget and event/shoot date when supplied.
The selected date is recorded as a requirement, not an availability guarantee.

The admin panel's Visitors section shows these searches and property visits with
pagination and a refresh button.
The Download CSV button exports all pages, including contact details, UTC
timestamps, search type, property and separate columns for every search
requirement. If records change during pagination, export reports an error so
the admin can retry instead of downloading an incomplete file.
Only admins can read visitor records; public
submission uses a validated write-only database function. A failed save keeps
results behind the gate and offers retry. This is a contact-capture UX, not an
authentication system or protection against direct public API access.

Deploy both frontend and backend after running `supabase/visitors.sql`.
The form discloses that contact details and searches are shared with the team.

To run the visitor API regression tests from `backend`, run `npm run build`
followed by `node --test tests/visitors.test.mjs`.

## Admin access

Sign up with an email listed in the `admin_bootstrap_emails` table (seeded
with `info@venueslocation.com` by the migration) to automatically get the
`admin` role. Otherwise every new sign-up gets the `owner` role.

The admin-only Property Codes page shows each property's current owner's name,
phone number and email from their account profile. Search includes these contact
details; missing profile fields are displayed as "Not provided". The All properties,
Venues and Film Shooting Locations filter works together with search. Properties
listed for both purposes appear under either purpose filter. Deploy both the
backend and frontend for these columns; no database migration is required.

## Deployment

City choices are displayed alphabetically (A-Z) in search, listing forms and
admin location lists, including fallback cities. Newly added cities appear in
alphabetical position regardless of their stored sort order. State ordering
is unchanged.

The main admin Venues table and the Property Codes page show 20 properties per
page, with First/Previous/Next/Last controls above and below each table. Switching
pages returns to the table heading. Property Codes search and purpose filters
apply to the full loaded list and reset to page one; CSV exports and analytics
continue to use the full list rather than just the visible page.

### Team and advisor photos

In Admin Panel > Team & Advisors, choosing a photo opens a 4:3 crop preview.
Drag to position the face, adjust zoom, then choose **Crop & Upload** and save
the profile. Edit an existing profile and choose **Crop current photo** to
reframe it. Public cards show the complete saved image without automatically
cutting off faces; older portrait images may have padding until recropped.

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
