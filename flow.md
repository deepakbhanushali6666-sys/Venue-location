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
