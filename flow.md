# VENUES LOCATION — Website Flow

This describes how the site behaves for each type of visitor, based on what's
actually implemented in `Venue Business/frontend` + `Venue Business/backend`.

## Role model (read this first)

There are only **three effective roles**, and they are not symmetric:

| Role | How you become this | What you can do |
|---|---|---|
| **Visitor (anonymous)** | Default — no account | Browse approved venues, view venue details, submit an enquiry, submit a "list your venue" registration, read approved reviews |
| **Owner** | Automatically, the moment you sign up (any email/password) | Everything a visitor can do, **plus**: `/dashboard` — manage your own venues, submit payments, reply to reviews on your venues, view leads for your venues |
| **Admin** | Only if your email is pre-listed in the `admin_bootstrap_emails` table at the moment you sign up (or an existing admin manually adds a `user_roles` row for you) | Everything an owner can do, **plus**: `/admin` — approve/reject/feature venues, verify/reject payments, moderate reviews, view the audit log, view all leads across all owners |

Important nuance: **there is no separate "customer" account type.** Anyone who
creates an account — even someone who just wants to submit an enquiry as a
signed-in user, or leave a review — is given the `owner` role automatically
(see `handle_new_user()` trigger) and can technically open `/dashboard`,
whether or not they ever list a venue. "Owner" here really means "signed-in
user"; whether they *use* the venue-management features is up to them.

---

## 1. Visitor flow (not signed in)

1. Lands on `/` (home) — sees hero, featured venues, categories.
2. Browses `/venues` — filters by category, city, state, event type, budget,
   capacity. This list comes from `GET /api/venues` (public, only
   `status = 'approved'` rows, no login required).
3. Opens a venue at `/venues/$slug` (`GET /api/venues/:slug`) — sees photos,
   amenities, video, map, and **approved reviews** for that venue
   (`GET /api/reviews/venue/:id`, no auth needed for the public list).
4. Submits an enquiry via the `EnquiryForm` (compact version on the venue
   page, full version on `/contact`) — `POST /api/leads`, which calls the
   `submit_lead` Postgres function anonymously. Gets back a **Lead ID**
   (e.g. `OMS-1001`) as a receipt/reference.
5. Can also go to `/list-your-venue` and submit *without* an account — this
   creates a **lead** (not a venue), tagged `purpose: "Venue Listing"`, which
   the admin follows up on manually to help them get set up.
6. To actually manage a venue, they must sign up at `/auth`.

## 2. Owner flow (signed in, not admin)

1. Signs up or logs in at `/auth` (Supabase Auth — email/password or Google).
   On first sign-up, `handle_new_user()` fires and inserts:
   - a `profiles` row,
   - a `user_roles` row with `role = 'owner'`.
2. Redirected to `/dashboard`, which loads (in parallel):
   - `GET /api/venues/mine` — venues they own,
   - `GET /api/subscriptions/mine` — their annual plan status,
   - `GET /api/leads` — enquiries **only for venues they own** (server
     computes their venue IDs first, then filters).
3. **List a venue**: fills the "Add Venue" form → `POST /api/venues`. New
   venues always start `status = 'pending'` — invisible to the public until
   an admin approves them.
4. **Edit a venue**: `PATCH /api/venues/:id` — allowed because they own it.
   Editing does **not** reset the approval status (only an admin can change
   `status`/`featured`).
5. **Upload photos**: handled client-side directly against Supabase Storage
   (`venue-photos` bucket) — not proxied through the backend. Files are
   scoped to `{ownerId}/...` in storage, then a **signed URL** (valid ~10
   years) is stored in the venue's `photos` array so it can render publicly
   without exposing the private bucket.
6. **Subscription**: pays offline (UPI/bank/cash) and submits a reference
   number → `POST /api/payments` (`status: 'pending'`). Nothing is verified
   automatically — an admin must confirm the payment actually arrived.
7. **Leads**: can change a lead's status through the pipeline (`New` →
   `Contacted` → … → `Booked`/`Closed`) via `PATCH /api/leads/:id`, only for
   leads tied to venues they own.
8. **Reviews**: sees a "Reviews for your venues" panel and can publish a
   public reply to any **approved** review on their own venue
   (`PATCH /api/reviews/:id/reply`).
9. Can leave a review on *other* venues themselves (as a regular signed-in
   user) — one review per venue per person, editable while still `pending`.

## 3. Admin flow (signed in + admin role)

Admin status is checked with `useIsAdmin()` on the frontend (reads
`user_roles`) and re-verified server-side on every protected backend route
via `requireAdmin` — the frontend check is only for UI/UX, the backend +
Postgres RLS are the real gate.

1. Logs in the same way as anyone else, then sees an extra **"Admin Panel"**
   link (only rendered if `isAdmin` is true).
2. `/admin` loads `GET /api/admin/overview` in one call — all venues, all
   leads, all subscriptions, all payments, and the audit log (last 500
   entries).
3. **Approve/reject venues**: `PATCH /api/venues/:id/status`. Approving is
   what makes a venue visible on the public `/venues` page.
4. **Feature a venue**: `PATCH /api/venues/:id/featured` — surfaces it on the
   homepage's featured section.
5. **Verify/reject payments**: `POST /api/payments/:id/verify` or
   `/reject`. Verifying calls the `verify_payment` Postgres function, which
   atomically: generates an invoice number, activates/extends the owner's
   `subscriptions` row by 1 year, marks the payment `verified`, and writes an
   audit log entry — all in one transaction.
6. **Moderate reviews**: approve/reject pending reviews
   (`PATCH /api/reviews/:id/moderate`) — only approved reviews become public.
7. **Audit log**: every status change (venue approval, featured toggle, lead
   status, payment verify/reject, review moderation) is automatically logged
   by Postgres triggers with the acting admin's user ID, timestamp, and
   before/after values. Filterable and exportable to CSV.
8. **Analytics**: lead pipeline funnel, conversion rate, breakdowns by
   category/city/venue, 6-month trend — all computed client-side from the
   same `overview` payload (no extra backend endpoint needed).
9. Can also do everything an owner can (own venues, own subscription) — admin
   is additive, not a separate account type.

---

## Where the "boundary" actually is

- **Anonymous ↔ Owner**: crossed the instant you sign up. There is no
  approval step to become an "owner" — everyone who authenticates gets it.
- **Owner ↔ Admin**: crossed only if (a) your email was in
  `admin_bootstrap_emails` *before* you signed up, or (b) an existing admin
  (or someone with direct database access) manually inserts a `user_roles`
  row with `role = 'admin'` for your user ID. There is no self-service way to
  become an admin from the UI.

---

## Live deployment (as of this writing)

| Piece | Where | Notes |
|---|---|---|
| Frontend | [venue-location.vercel.app](https://venue-location.vercel.app) | Vercel, auto-deploys on push to `main`, root directory `frontend` |
| Backend | `venue-location.onrender.com` | Render, auto-deploys on push to `main`, root directory `backend` |
| Database | Supabase project `ycgtzabcmvnhwetfyckw` | Free tier — auto-pauses after ~7 days of zero API activity; must be manually restored from the Supabase dashboard if that happens |
| Keep-alive | `.github/workflows/keep-alive.yml` | Pings the backend's `/health` every 10 min so Render's free tier doesn't cold-start on real visitors |
| Repo | [github.com/deepakbhanushali6666-sys/Venue-location](https://github.com/deepakbhanushali6666-sys/Venue-location) | Contains only `Venue Business/` — this is the deployed source of truth |

**Test accounts** (pre-confirmed via Supabase Admin API, real password required to change):
- Owner: `owner.test@venueslocation.com` / `VenueTest#2026`
- Admin: `info@venueslocation.com` / `VenueAdmin#2026`

---

## Known gaps / pending work (read this before continuing the project)

If you're picking this project up, these are the known incomplete or
placeholder pieces — none of them block the core flows above from working,
but all need attention before a real public launch:

1. **Payment details are placeholders.** `frontend/src/data/business.ts` →
   `PAYMENT_DETAILS` has a non-functional UPI ID (`omslocation@upi`) and
   blank bank account/IFSC (`"—"`). Since subscription payments are fully
   manual (owner pays via UPI/bank transfer, admin verifies the reference
   number), **there is currently no real account for owners to actually pay
   into.** Needs the real business UPI ID and bank details.
2. **`BUSINESS.gstin` and `BUSINESS.pan` are blank** — shown on the tax
   invoice generated after a payment is verified.
3. **Only one test venue exists** ("Test Grand Resort") — no real venue
   content has been seeded yet.
4. **No custom domain** — running on `*.vercel.app` / `*.onrender.com`
   subdomains, not a branded domain like `venueslocation.com`.
5. **No rate limiting** on public/anonymous endpoints (`POST /api/leads`,
   review submission, Supabase sign-up) — fine pre-launch, worth adding
   before real public traffic to prevent spam/abuse.
6. **No error monitoring** (e.g. Sentry) on either frontend or backend — if
   something breaks in production, you won't know unless a user reports it.
7. **No automated test suite** — every flow in this document was verified
   via manual browser testing during development, not via unit/integration
   tests. There is no CI test gate on pull requests.
8. **Supabase free-tier auto-pause** — if the project sits idle (no API
   calls) for about a week, it pauses and every API call fails with a DNS
   resolution error until manually restored from the Supabase dashboard.
   The GitHub Actions keep-alive cron pings the *backend*, not Supabase
   itself, so it does **not** prevent this — Supabase pauses based on its
   own API traffic, not the backend's uptime.
9. **AWS deployment path exists but isn't live** — `backend/Dockerfile` and
   `backend/render.yaml` are both in the repo; only Render is actually
   deployed. See `decisions.md` #15 if you want to pick up the AWS ECS
   Express Mode path later.
10. **Backend service-role key is unused by design** (see `decisions.md` #6)
    — if a future feature genuinely needs to bypass RLS (e.g. a background
    job with no user session), it'll need the `SUPABASE_SECRET_KEY` slot
    already reserved in `backend/.env.example`, plus new code to use it.

---

## Live deployment (as of now)

| Layer | Where | Notes |
|---|---|---|
| Frontend | [venue-location.vercel.app](https://venue-location.vercel.app) | Vercel, auto-deploys on push to `main`, Root Directory = `frontend` |
| Backend | [venue-location.onrender.com](https://venue-location.onrender.com) | Render, auto-deploys on push to `main`, Root Directory = `backend` |
| Database | Supabase project `ycgtzabcmvnhwetfyckw` | Postgres + Auth + Storage; schema applied via `supabase/migration.sql` |
| Source | [github.com/deepakbhanushali6666-sys/Venue-location](https://github.com/deepakbhanushali6666-sys/Venue-location) | Single repo, both apps deploy from subdirectories of the same `main` branch |

**Request flow**: browser → Vercel (static SPA) → `fetch` to Render (`VITE_API_URL`) →
Render's Express app forwards the caller's Supabase JWT → Supabase Postgres
(RLS enforces authorization) / Supabase Auth (login) / Supabase Storage
(photo uploads, called directly from the browser, bypassing the backend).

**Keeping the backend warm**: Render's free tier spins the service down after
~15 minutes idle, causing a slow (30-50s) first request afterwards.
`.github/workflows/keep-alive.yml` pings `/health` every 10 minutes via
GitHub Actions (free, no third-party account) to prevent this.

**Google sign-in**: uses a real Google Cloud OAuth client, configured
directly in Supabase's Auth provider settings — confirmed working end-to-end
(redirects to Google, back through Supabase's callback, into the app).
