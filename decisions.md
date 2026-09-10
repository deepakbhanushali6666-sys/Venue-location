# Architecture Decisions — VenueConnect Hub → "Venue Business" clone

This documents the decisions made while turning the original single
TanStack-Start + Supabase app into a separated `frontend/` + `backend/`
project under `Venue Business/`, and why each choice was made.

---

## 1. Split into `Venue Business/frontend` and `Venue Business/backend`

**Decision:** create two fully independent projects (own `package.json`,
own `node_modules`, own `.env`) instead of a monorepo workspace or a shared
`src/`.

**Why:** the request was explicitly for separate, standalone codebases per
phase ("frontend first, then backend"). Keeping them fully independent also
means either one can be deployed, versioned, or replaced without touching
the other — no shared build tooling or workspace config to coordinate.

## 2. Frontend: convert from TanStack Start (SSR) to a plain Vite SPA

**Decision:** strip out `src/server.ts`, `src/start.ts`, and all
`@tanstack/react-start` SSR wiring; keep TanStack **Router** (file-based
routing) but run it as a client-only SPA via plain Vite + `@vitejs/plugin-react`.

**Why:**
- The original app's SSR layer existed mainly to serve the TanStack Start
  dev/build pipeline, not for SEO-critical server rendering logic — all data
  fetching was already client-side (`useEffect` + Supabase calls).
- A separate "frontend" folder implies a deployable static SPA (e.g. to
  Netlify/Vercel/S3+CDN) that talks to an independent "backend" API — mixing
  in a Node SSR runtime would blur that separation and require a Node host
  for the frontend too.
- Simpler mental model: frontend = static build, backend = API server.

## 3. Backend: Node.js + Express (not Fastify, not Supabase Edge Functions)

**Decision:** confirmed with you directly (three-question check) — Express,
full REST API layer, Supabase as the database.

**Why:** Express is the most common/well-understood choice for a REST API
of this size, has the largest ecosystem, and doesn't require learning a new
runtime (Edge Functions would tie logic back into Supabase-managed infra,
defeating the point of having an independent backend).

## 4. Backend owns all data operations; one REST endpoint per Supabase table/RPC

**Decision:** every direct `supabase.from(...)`/`supabase.rpc(...)` call
that existed in the original frontend was mapped 1:1 to a backend route
(`/api/venues`, `/api/leads`, `/api/subscriptions`, `/api/payments`,
`/api/reviews`, `/api/admin/*`, `/api/profiles/:id`).

**Why:** you asked for a "full API layer" (as opposed to a thin proxy) —
the frontend should no longer need direct knowledge of the Supabase schema
in order to read/write data, only to authenticate.

## 5. Kept Supabase Auth and Supabase Storage as direct frontend→Supabase calls

**Decision:** `supabase.auth.*` (sign up/in/out, session, Google OAuth) and
`supabase.storage.*` (venue photo upload/signed URLs in `PhotoUploader`)
were deliberately **not** routed through the backend.

**Why:**
- Reimplementing session/JWT issuance, password hashing, OAuth redirects,
  and refresh-token rotation from scratch is a large, security-sensitive
  undertaking with no real benefit — Supabase Auth already does this
  correctly, and the backend can simply *verify* the JWT it's handed.
  This "hybrid" pattern (managed auth provider + custom API for business
  data) is a standard, well-understood architecture.
- Storage uploads are already gated by per-user storage RLS policies
  (`(storage.foldername(name))[1] = auth.uid()`), so proxying the file
  bytes through the backend would add latency and complexity without
  adding security — the bucket policies are the real gate either way.

## 6. Backend forwards the caller's own Supabase JWT instead of using the service-role key

**Decision (changed mid-way, on purpose):** the backend does **not** hold a
Supabase service-role/secret key for its data operations. Every authenticated
request builds a per-request Supabase client using the *caller's own*
access token (`createSupabaseUserClient(token)`), so Postgres RLS policies
are the ones actually enforcing who can read/write what. The backend's own
`requireAuth`/`requireAdmin` middleware is an additional, faster-failing
check in front of that, not a replacement for it.

**Why this changed:** the first version used a service-role client for
everything. That broke two things:
1. **Audit trail correctness** — the `venues_audit_update`,
   `leads_audit_update`, `review_status_changed`, etc. triggers read
   `auth.uid()` to record *who* made a change. Under a service-role
   connection there is no `auth.uid()` (no user JWT in the request), so
   every audit-log entry would have `actor_id = NULL` — useless for
   accountability.
2. **`verify_payment` / `reject_payment` are `SECURITY DEFINER` functions
   that explicitly check `has_role(auth.uid(), 'admin')` internally.**
   Called via service role, `auth.uid()` is null and the functions would
   always raise "Only admins can..." — they'd never work.

Forwarding the user's JWT fixes both issues for free, and as a side benefit
**no secret key is required for the app to function at all** — only the
public anon/publishable key, which was already committed in the repo. This
is strictly more secure (defense-in-depth: even a bug in the Express-level
authorization check can't bypass RLS) and removes an entire class of "leaked
service-role key" risk.

`SUPABASE_SECRET_KEY` is still present as a blank/optional slot in
`backend/.env` in case a future feature genuinely needs to bypass RLS
(e.g. a background job with no user context), but nothing currently reads it.

## 7. `supabasePublic` (anon key, no token) for genuinely anonymous routes

**Decision:** a second, simpler client (no per-request token) is used only
for routes that have no authenticated user at all: public venue
listing/detail, public approved-reviews list, and anonymous lead submission.

**Why:** these routes rely on the `anon`-role RLS policies (`"Approved
venues are public"`, etc.) — there's no per-user JWT to forward because
there's no user, so a plain anon-key client is both correct and simpler
than trying to force a token through.

## 8. Explicit ownership/role checks in route handlers, even though RLS also enforces them

**Decision:** most routes still fetch a row first and manually check
`ownerId === req.user.id || req.user.isAdmin` in JavaScript before mutating,
rather than relying purely on RLS to silently no-op an unauthorized write.

**Why:** this gives clean, specific HTTP responses (`403 Not allowed to
modify this venue` vs. a confusing "0 rows updated" or a generic Postgres
error) while RLS remains the actual security backstop underneath. Two
layers, but for different reasons: correctness of the app-level response,
and non-bypassable security.

## 9. One consolidated `migration.sql` instead of replaying all 15 incremental migration files

**Decision:** wrote `Venue Business/supabase/migration.sql` as a single file
representing the **final end-state** schema (tables, enums, functions,
triggers, RLS policies, storage bucket/policies), rather than concatenating
the original repo's 15 timestamped migration files as-is.

**Why:** several of the original migrations were pure history noise for a
fresh project — test-data cleanup (`delete from leads where customer_name
in (...)`), superseding `REVOKE`/re-`GRANT` passes, a function being
`CREATE OR REPLACE`'d three times across different files, and an email
rename in `admin_bootstrap_emails`. Replaying all of that literally would
work, but a single file reflecting the *current correct state* is easier to
read, audit, and re-run (it's idempotent — safe to run twice) than 15 files
where you have to mentally diff what superseded what.

## 10. Storage bucket policy: private bucket + signed URLs, not a public bucket

**Decision:** the `venue-photos` bucket is created `public: false`; photos
are made viewable via long-lived **signed URLs** generated at upload time
and stored directly in `venues.photos`, not via a public bucket policy.

**Why:** this matches the *final* state of the original project's own
migrations — an early migration made the bucket readable by `anon`, but a
later migration (`20260821111732_...`) deliberately tightened it to
"owners and admins only" for direct access. Signed URLs are how the actual
public site still displays photos despite the bucket being private. The
consolidated migration reproduces this final, tightened state rather than
the earlier, looser one.

## 11. Testing: created pre-confirmed users via the Supabase Admin API rather than real email delivery

**Decision:** used a short one-off Node script (`supabase.auth.admin.createUser`
with `email_confirm: true`) to create both a normal owner test account and
an admin test account, instead of trying to click a real confirmation email.

**Why:** the project's email-confirmation requirement can't be satisfied in
an automated end-to-end test without access to a real inbox. The Admin API
(using the service-role key you provided) is the standard way to create
already-verified test users without disabling email confirmation for real
users. The script was deleted after use — it's not part of the shipped
codebase, purely a testing aid.

## 12. Tailwind arbitrary-value classes replaced with scale equivalents

**Decision:** classes like `min-w-[820px]` → `min-w-205`, `aspect-[16/9]` →
`aspect-video`, etc. were rewritten to use Tailwind's built-in scale/named
utilities.

**Why:** flagged by the editor's Tailwind linter as unnecessary arbitrary
values when an equivalent standard utility exists (Tailwind v4's numeric
spacing scale supports these directly) — purely a lint-cleanliness fix, no
behavior change.

## 13. Replaced Lovable Cloud Auth's Google sign-in with direct Supabase OAuth

**Decision:** removed `@lovable.dev/cloud-auth-js` and the
`src/integrations/lovable/` wrapper entirely. "Continue with Google" now
calls `supabase.auth.signInWithOAuth({ provider: "google" })` directly.

**Why:** the Lovable SDK proxies OAuth through Lovable's own cloud
infrastructure, which only works while a project stays connected to
Lovable. Since this clone runs fully standalone, that flow would silently
fail. Supabase has first-class Google OAuth support once a Google Cloud
OAuth client is configured in the Supabase dashboard — no proxy needed, and
one fewer external dependency. Verified working end-to-end in production
after the user created the Google Cloud OAuth client and enabled the
provider in Supabase.

## 14. Deployment split: Vercel (frontend) + Render (backend), not one platform

**Decision:** the frontend (static Vite SPA) deploys to Vercel; the backend
(Express REST API) deploys to Render, as two independent services glued
together by `VITE_API_URL` (frontend → backend) and `CORS_ORIGIN` (backend
→ frontend).

**Why:** Vercel doesn't run a persistent Node/Express process — only
serverless functions — so it's not a natural fit for the backend as
written. Render runs Express as-is with zero code changes. Splitting by
platform strength (static hosting vs. long-running API) is simpler than
adapting the backend into a serverless handler.

## 15. AWS ECS Express Mode was prepared but not used — Render was faster to unblock on

**Decision:** a production-ready `backend/Dockerfile` (multi-stage Node
build) was created and validated locally (`docker build` + `docker run` +
`/health` check) for a possible AWS deployment via **ECS Express Mode** —
AWS's officially recommended replacement now that **App Runner is closed to
new customers** (confirmed via AWS's own docs during this work). The
Dockerfile is kept in the repo for future use, but the actual production
backend was deployed to Render instead, because AWS's IAM role
creation/propagation was taking too long to be worth blocking on at the
time.

**Why keep the Dockerfile anyway:** it's a small, self-contained artifact
that makes an AWS (or any container-based) migration a quick follow-up
later without redoing the work, and it was already validated to build and
run correctly against the real Supabase project.

## 16. Backend kept warm on Render's free tier via a GitHub Actions cron job

**Decision:** added `.github/workflows/keep-alive.yml` — a scheduled
GitHub Actions workflow that pings `/health` on the deployed backend every
10 minutes.

**Why:** Render's free tier spins a service down after ~15 minutes of
inactivity; the first request afterward pays a 30-50 second cold-start
penalty, which real visitors would experience as a broken/empty site.
GitHub Actions cron triggers are free (public repos: unlimited; private
repos: well within the free monthly minutes for a job this small) and
require no third-party account, unlike an external uptime monitor.

## 17. Separate, dedicated GitHub repository containing only `Venue Business/`

**Decision:** `Venue Business/` was pushed to its own new repository
(`Venue-location`), not to the original Lovable-connected repository at the
workspace root, and only the two sub-projects + migration + docs were
included — not the original monolith's `src/`, `supabase/migrations/`
history, or Lovable-specific files.

**Why:** the original root project stays connected to Lovable (per its
`AGENTS.md`) and pushing/rewriting there risked interfering with that sync.
The new repo's scope was deliberately kept to "everything needed to run
this standalone app," confirmed against the original project for anything
worth carrying over (nothing functionally important was missing — the
consolidated migration already captured the full schema).

**Security note acted on:** before the first commit, `frontend/.gitignore`
was found to be missing a `.env` exclusion (the backend's already had one).
Fixed before `git add .` — verified via `git status --short` that only
`.env.example` files were staged, never the real `.env` files containing
Supabase keys.

