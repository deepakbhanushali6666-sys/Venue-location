-- =====================================================================
-- VenueConnect Hub / VENUES LOCATION — Consolidated Supabase Schema
-- =====================================================================
-- Run this once in the Supabase SQL editor (or `supabase db push` after
-- pasting it into a migration file) against a FRESH project. It creates
-- every table, type, function, trigger, RLS policy and storage policy
-- needed by the frontend + backend in this repo.
--
-- Safe to re-run: types/tables/policies/triggers are (re)created
-- idempotently via guards or CREATE OR REPLACE.
-- =====================================================================

create extension if not exists pgcrypto;

-- =====================================================================
-- ENUM TYPES
-- =====================================================================
do $$ begin
  create type public.app_role as enum ('admin', 'owner');
exception when duplicate_object then null; end $$;

do $$ begin
  create type public.venue_status as enum ('pending', 'approved', 'rejected');
exception when duplicate_object then null; end $$;

do $$ begin
  create type public.lead_status as enum ('New', 'Contacted', 'Negotiation', 'Site Visit', 'Booked', 'Closed');
exception when duplicate_object then null; end $$;

do $$ begin
  create type public.subscription_status as enum ('inactive', 'active', 'expired', 'cancelled');
exception when duplicate_object then null; end $$;

do $$ begin
  create type public.payment_status as enum ('pending', 'verified', 'rejected');
exception when duplicate_object then null; end $$;

do $$ begin
  create type public.payment_method as enum ('upi', 'bank', 'cash', 'online');
exception when duplicate_object then null; end $$;

do $$ begin
  create type public.review_status as enum ('pending', 'approved', 'rejected');
exception when duplicate_object then null; end $$;

-- =====================================================================
-- TABLES
-- =====================================================================

-- ROLES ----------------------------------------------------------------
create table if not exists public.user_roles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  role public.app_role not null,
  created_at timestamptz not null default now(),
  unique (user_id, role)
);
alter table public.user_roles enable row level security;

-- PROFILES ---------------------------------------------------------------
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text not null default '',
  mobile text not null default '',
  email text not null default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
alter table public.profiles enable row level security;

-- VENUES -----------------------------------------------------------------
create table if not exists public.venues (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  slug text not null unique,
  category text not null,
  city text not null,
  state text not null default '',
  area text not null default '',
  address text not null default '',
  capacity integer not null default 0,
  starting_price integer not null default 0,
  parking text not null default '',
  description text not null default '',
  amenities text[] not null default '{}',
  suitable_for text[] not null default '{}',
  photos text[] not null default '{}',
  video_url text not null default '',
  map_query text not null default '',
  gst_number text not null default '',
  status public.venue_status not null default 'pending',
  featured boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
alter table public.venues enable row level security;
create index if not exists idx_venues_status on public.venues(status);
create index if not exists idx_venues_owner on public.venues(owner_id);

-- LEADS --------------------------------------------------------------
create sequence if not exists public.lead_code_seq start 1001;

create table if not exists public.leads (
  id uuid primary key default gen_random_uuid(),
  lead_code text not null unique default ('OMS-' || nextval('public.lead_code_seq')),
  venue_id uuid references public.venues(id) on delete set null,
  venue_name text not null default '',
  customer_name text not null,
  mobile text not null,
  email text not null,
  purpose text not null default 'Other',
  event_date date,
  budget text not null default '',
  guest_count integer,
  message text not null default '',
  status public.lead_status not null default 'New',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
alter table public.leads enable row level security;
create index if not exists idx_leads_venue on public.leads(venue_id);

-- SUBSCRIPTIONS -------------------------------------------------------
create table if not exists public.subscriptions (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users(id) on delete cascade,
  plan_name text not null default 'OMSLOCATION Annual',
  amount integer not null default 3650,
  status public.subscription_status not null default 'inactive',
  started_on date,
  expires_on date,
  invoice_number text not null default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (owner_id)
);
alter table public.subscriptions enable row level security;

-- AUDIT LOG --------------------------------------------------------------
create table if not exists public.audit_log (
  id uuid primary key default gen_random_uuid(),
  actor_id uuid,
  action text not null,
  entity_type text not null,
  entity_id uuid,
  entity_label text not null default '',
  from_value text not null default '',
  to_value text not null default '',
  created_at timestamptz not null default now()
);
alter table public.audit_log enable row level security;
create index if not exists audit_log_created_at_idx on public.audit_log (created_at desc);
create index if not exists audit_log_entity_type_idx on public.audit_log (entity_type);

-- PAYMENTS -----------------------------------------------------------
create sequence if not exists public.invoice_seq start 1001;

create table if not exists public.payments (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users(id) on delete cascade,
  amount integer not null default 3650,
  method public.payment_method not null default 'upi',
  reference text not null default '',
  payer_name text not null default '',
  note text not null default '',
  status public.payment_status not null default 'pending',
  admin_note text not null default '',
  invoice_number text not null default '',
  verified_by uuid,
  verified_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
alter table public.payments enable row level security;

-- ADMIN BOOTSTRAP EMAILS -----------------------------------------------
create table if not exists public.admin_bootstrap_emails (
  email text primary key,
  created_at timestamptz not null default now()
);
alter table public.admin_bootstrap_emails enable row level security;

insert into public.admin_bootstrap_emails (email) values ('info@venueslocation.com')
  on conflict (email) do nothing;

-- VENUE REVIEWS ----------------------------------------------------------
create table if not exists public.venue_reviews (
  id uuid primary key default gen_random_uuid(),
  venue_id uuid not null references public.venues(id) on delete cascade,
  reviewer_id uuid not null references auth.users(id) on delete cascade,
  reviewer_name text not null default '',
  rating integer not null check (rating between 1 and 5),
  title text not null default '',
  comment text not null default '',
  status public.review_status not null default 'pending',
  admin_note text not null default '',
  moderated_by uuid,
  moderated_at timestamptz,
  owner_reply text not null default '',
  owner_reply_by uuid,
  owner_reply_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (venue_id, reviewer_id)
);
alter table public.venue_reviews enable row level security;
create index if not exists venue_reviews_venue_idx on public.venue_reviews (venue_id, status);
create index if not exists venue_reviews_status_idx on public.venue_reviews (status, created_at desc);

-- =====================================================================
-- FUNCTIONS
-- =====================================================================

create or replace function public.has_role(_user_id uuid, _role public.app_role)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (select 1 from public.user_roles where user_id = _user_id and role = _role);
$$;

create or replace function public.set_updated_at()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path to 'public'
as $$
begin
  insert into public.profiles (id, full_name, mobile, email)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'full_name', ''),
    coalesce(new.raw_user_meta_data ->> 'mobile', ''),
    coalesce(new.email, '')
  )
  on conflict (id) do nothing;

  insert into public.user_roles (user_id, role)
  values (new.id, 'owner')
  on conflict (user_id, role) do nothing;

  if exists (
    select 1 from public.admin_bootstrap_emails b
    where lower(b.email) = lower(coalesce(new.email, ''))
  ) then
    insert into public.user_roles (user_id, role)
    values (new.id, 'admin')
    on conflict (user_id, role) do nothing;
  end if;

  return new;
end;
$$;

create or replace function public.log_venue_change()
returns trigger
language plpgsql
security definer
set search_path to 'public'
as $$
begin
  if new.status is distinct from old.status then
    insert into public.audit_log (actor_id, action, entity_type, entity_id, entity_label, from_value, to_value)
    values (auth.uid(), 'venue_status_changed', 'venue', new.id, new.name, old.status::text, new.status::text);
  end if;
  if new.featured is distinct from old.featured then
    insert into public.audit_log (actor_id, action, entity_type, entity_id, entity_label, from_value, to_value)
    values (auth.uid(), 'venue_featured_changed', 'venue', new.id, new.name, old.featured::text, new.featured::text);
  end if;
  return new;
end;
$$;

create or replace function public.log_venue_created()
returns trigger
language plpgsql
security definer
set search_path to 'public'
as $$
begin
  insert into public.audit_log (actor_id, action, entity_type, entity_id, entity_label, from_value, to_value)
  values (auth.uid(), 'venue_created', 'venue', new.id, new.name, '', new.status::text);
  return new;
end;
$$;

create or replace function public.log_lead_created()
returns trigger
language plpgsql
security definer
set search_path to 'public'
as $$
begin
  insert into public.audit_log (actor_id, action, entity_type, entity_id, entity_label, from_value, to_value)
  values (auth.uid(), 'lead_created', 'lead', new.id, new.lead_code, '', new.status::text);
  return new;
end;
$$;

create or replace function public.log_lead_status_change()
returns trigger
language plpgsql
security definer
set search_path to 'public'
as $$
begin
  if new.status is distinct from old.status then
    insert into public.audit_log (actor_id, action, entity_type, entity_id, entity_label, from_value, to_value)
    values (auth.uid(), 'lead_status_changed', 'lead', new.id, new.lead_code, old.status::text, new.status::text);
  end if;
  return new;
end;
$$;

create or replace function public.log_review_moderation()
returns trigger
language plpgsql
security definer
set search_path to 'public'
as $$
begin
  if new.status is distinct from old.status then
    insert into public.audit_log (actor_id, action, entity_type, entity_id, entity_label, from_value, to_value)
    values (auth.uid(), 'review_status_changed', 'review', new.id, left(coalesce(new.title, ''), 120), old.status::text, new.status::text);
  end if;
  return new;
end;
$$;

create or replace function public.submit_lead(
  p_customer_name text,
  p_mobile text,
  p_email text,
  p_purpose text default 'Other',
  p_venue_id uuid default null,
  p_venue_name text default null,
  p_event_date date default null,
  p_budget text default null,
  p_guest_count integer default null,
  p_message text default null
)
returns text
language plpgsql
security definer
set search_path = public
as $$
declare
  v_code text;
begin
  if coalesce(trim(p_customer_name),'') = '' or coalesce(trim(p_mobile),'') = '' then
    raise exception 'Name and mobile are required';
  end if;

  insert into public.leads (customer_name, mobile, email, purpose, venue_id, venue_name, event_date, budget, guest_count, message)
  values (left(trim(p_customer_name),120), left(trim(p_mobile),20), left(coalesce(p_email,''),160), coalesce(p_purpose,'Other'),
          p_venue_id, left(coalesce(p_venue_name,''),160), p_event_date, left(coalesce(p_budget,''),80), p_guest_count, left(coalesce(p_message,''),2000))
  returning lead_code into v_code;

  return v_code;
end;
$$;

create or replace function public.verify_payment(p_payment_id uuid)
returns text
language plpgsql
security definer
set search_path to 'public'
as $$
declare
  v_pay public.payments%rowtype;
  v_invoice text;
  v_start date;
  v_expiry date;
  v_current date;
begin
  if not public.has_role(auth.uid(), 'admin') then
    raise exception 'Only admins can verify payments';
  end if;

  select * into v_pay from public.payments where id = p_payment_id for update;
  if not found then raise exception 'Payment not found'; end if;
  if v_pay.status = 'verified' then return v_pay.invoice_number; end if;

  v_invoice := 'OMS/INV/' || to_char(now(), 'YYYY') || '/' || nextval('public.invoice_seq');

  select expires_on into v_current from public.subscriptions where owner_id = v_pay.owner_id;
  v_start := current_date;
  if v_current is not null and v_current > current_date then
    v_expiry := v_current + interval '1 year';
  else
    v_expiry := current_date + interval '1 year';
  end if;

  insert into public.subscriptions (owner_id, status, amount, started_on, expires_on, invoice_number)
  values (v_pay.owner_id, 'active', v_pay.amount, v_start, v_expiry, v_invoice)
  on conflict (owner_id) do update
    set status = 'active', amount = excluded.amount, started_on = coalesce(public.subscriptions.started_on, excluded.started_on),
        expires_on = excluded.expires_on, invoice_number = excluded.invoice_number;

  update public.payments
    set status = 'verified', invoice_number = v_invoice, verified_by = auth.uid(), verified_at = now()
    where id = p_payment_id;

  insert into public.audit_log (actor_id, action, entity_type, entity_id, entity_label, from_value, to_value)
  values (auth.uid(), 'payment_verified', 'payment', p_payment_id, v_invoice, 'pending', 'verified');

  return v_invoice;
end;
$$;

create or replace function public.reject_payment(p_payment_id uuid, p_reason text default '')
returns void
language plpgsql
security definer
set search_path to 'public'
as $$
begin
  if not public.has_role(auth.uid(), 'admin') then
    raise exception 'Only admins can reject payments';
  end if;

  update public.payments
    set status = 'rejected', admin_note = left(coalesce(p_reason,''), 500), verified_by = auth.uid(), verified_at = now()
    where id = p_payment_id;

  insert into public.audit_log (actor_id, action, entity_type, entity_id, entity_label, from_value, to_value)
  values (auth.uid(), 'payment_rejected', 'payment', p_payment_id, left(coalesce(p_reason,''), 120), 'pending', 'rejected');
end;
$$;

-- =====================================================================
-- TRIGGERS
-- =====================================================================

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row execute function public.handle_new_user();

drop trigger if exists profiles_set_updated_at on public.profiles;
create trigger profiles_set_updated_at
before update on public.profiles
for each row execute function public.set_updated_at();

drop trigger if exists venues_set_updated_at on public.venues;
create trigger venues_set_updated_at
before update on public.venues
for each row execute function public.set_updated_at();

drop trigger if exists venues_audit_update on public.venues;
create trigger venues_audit_update
after update on public.venues
for each row execute function public.log_venue_change();

drop trigger if exists venues_audit_insert on public.venues;
create trigger venues_audit_insert
after insert on public.venues
for each row execute function public.log_venue_created();

drop trigger if exists leads_set_updated_at on public.leads;
create trigger leads_set_updated_at
before update on public.leads
for each row execute function public.set_updated_at();

drop trigger if exists leads_audit_insert on public.leads;
create trigger leads_audit_insert
after insert on public.leads
for each row execute function public.log_lead_created();

drop trigger if exists leads_audit_update on public.leads;
create trigger leads_audit_update
after update on public.leads
for each row execute function public.log_lead_status_change();

drop trigger if exists subscriptions_set_updated_at on public.subscriptions;
create trigger subscriptions_set_updated_at
before update on public.subscriptions
for each row execute function public.set_updated_at();

drop trigger if exists payments_set_updated_at on public.payments;
create trigger payments_set_updated_at
before update on public.payments
for each row execute function public.set_updated_at();

drop trigger if exists venue_reviews_set_updated_at on public.venue_reviews;
create trigger venue_reviews_set_updated_at
before update on public.venue_reviews
for each row execute function public.set_updated_at();

drop trigger if exists venue_reviews_audit_update on public.venue_reviews;
create trigger venue_reviews_audit_update
after update on public.venue_reviews
for each row execute function public.log_review_moderation();

-- =====================================================================
-- ROW LEVEL SECURITY POLICIES
-- =====================================================================

-- user_roles
drop policy if exists "Users can view their own roles" on public.user_roles;
create policy "Users can view their own roles"
  on public.user_roles for select to authenticated
  using (auth.uid() = user_id or public.has_role(auth.uid(), 'admin'));

-- profiles
drop policy if exists "Users can view their own profile" on public.profiles;
create policy "Users can view their own profile"
  on public.profiles for select to authenticated
  using (auth.uid() = id or public.has_role(auth.uid(), 'admin'));
drop policy if exists "Users can insert their own profile" on public.profiles;
create policy "Users can insert their own profile"
  on public.profiles for insert to authenticated
  with check (auth.uid() = id);
drop policy if exists "Users can update their own profile" on public.profiles;
create policy "Users can update their own profile"
  on public.profiles for update to authenticated
  using (auth.uid() = id) with check (auth.uid() = id);

-- venues
drop policy if exists "Approved venues are public" on public.venues;
create policy "Approved venues are public"
  on public.venues for select to anon, authenticated
  using (status = 'approved');
drop policy if exists "Owners can view their own venues" on public.venues;
create policy "Owners can view their own venues"
  on public.venues for select to authenticated
  using (auth.uid() = owner_id or public.has_role(auth.uid(), 'admin'));
drop policy if exists "Owners can create their own venues" on public.venues;
create policy "Owners can create their own venues"
  on public.venues for insert to authenticated
  with check (auth.uid() = owner_id);
drop policy if exists "Owners can update their own venues" on public.venues;
create policy "Owners can update their own venues"
  on public.venues for update to authenticated
  using (auth.uid() = owner_id or public.has_role(auth.uid(), 'admin'))
  with check (auth.uid() = owner_id or public.has_role(auth.uid(), 'admin'));
drop policy if exists "Owners can delete their own venues" on public.venues;
create policy "Owners can delete their own venues"
  on public.venues for delete to authenticated
  using (auth.uid() = owner_id or public.has_role(auth.uid(), 'admin'));

-- leads
drop policy if exists "Anyone can submit an enquiry" on public.leads;
create policy "Anyone can submit an enquiry"
  on public.leads for insert to anon, authenticated
  with check (true);
drop policy if exists "Venue owners and admins can view leads" on public.leads;
create policy "Venue owners and admins can view leads"
  on public.leads for select to authenticated
  using (
    public.has_role(auth.uid(), 'admin')
    or exists (select 1 from public.venues v where v.id = leads.venue_id and v.owner_id = auth.uid())
  );
drop policy if exists "Venue owners and admins can update leads" on public.leads;
create policy "Venue owners and admins can update leads"
  on public.leads for update to authenticated
  using (
    public.has_role(auth.uid(), 'admin')
    or exists (select 1 from public.venues v where v.id = leads.venue_id and v.owner_id = auth.uid())
  )
  with check (
    public.has_role(auth.uid(), 'admin')
    or exists (select 1 from public.venues v where v.id = leads.venue_id and v.owner_id = auth.uid())
  );

-- subscriptions
drop policy if exists "Owners and admins can view subscriptions" on public.subscriptions;
create policy "Owners and admins can view subscriptions"
  on public.subscriptions for select to authenticated
  using (auth.uid() = owner_id or public.has_role(auth.uid(), 'admin'));
drop policy if exists "Owners can create their own subscription" on public.subscriptions;
create policy "Owners can create their own subscription"
  on public.subscriptions for insert to authenticated
  with check (auth.uid() = owner_id);
drop policy if exists "Owners and admins can update subscriptions" on public.subscriptions;
create policy "Owners and admins can update subscriptions"
  on public.subscriptions for update to authenticated
  using (auth.uid() = owner_id or public.has_role(auth.uid(), 'admin'))
  with check (auth.uid() = owner_id or public.has_role(auth.uid(), 'admin'));

-- audit_log
drop policy if exists "Admins can view audit log" on public.audit_log;
create policy "Admins can view audit log"
  on public.audit_log for select to authenticated
  using (public.has_role(auth.uid(), 'admin'::public.app_role));

-- payments
drop policy if exists "Owners and admins can view payments" on public.payments;
create policy "Owners and admins can view payments" on public.payments
  for select to authenticated
  using (auth.uid() = owner_id or public.has_role(auth.uid(), 'admin'));
drop policy if exists "Owners can submit their own payments" on public.payments;
create policy "Owners can submit their own payments" on public.payments
  for insert to authenticated
  with check (auth.uid() = owner_id and status = 'pending');
drop policy if exists "Admins can update payments" on public.payments;
create policy "Admins can update payments" on public.payments
  for update to authenticated
  using (public.has_role(auth.uid(), 'admin'))
  with check (public.has_role(auth.uid(), 'admin'));

-- admin_bootstrap_emails
drop policy if exists "Admins can view bootstrap emails" on public.admin_bootstrap_emails;
create policy "Admins can view bootstrap emails" on public.admin_bootstrap_emails
  for select to authenticated using (public.has_role(auth.uid(), 'admin'));

-- venue_reviews
drop policy if exists "Approved reviews are public" on public.venue_reviews;
create policy "Approved reviews are public"
  on public.venue_reviews for select to anon, authenticated
  using (status = 'approved');
drop policy if exists "Reviewers can view their own reviews" on public.venue_reviews;
create policy "Reviewers can view their own reviews"
  on public.venue_reviews for select to authenticated
  using (auth.uid() = reviewer_id);
drop policy if exists "Owners and admins can view reviews for their venues" on public.venue_reviews;
create policy "Owners and admins can view reviews for their venues"
  on public.venue_reviews for select to authenticated
  using (
    public.has_role(auth.uid(), 'admin')
    or exists (select 1 from public.venues v where v.id = venue_reviews.venue_id and v.owner_id = auth.uid())
  );
drop policy if exists "Signed-in users can submit reviews" on public.venue_reviews;
create policy "Signed-in users can submit reviews"
  on public.venue_reviews for insert to authenticated
  with check (auth.uid() = reviewer_id and status = 'pending');
drop policy if exists "Reviewers can edit their own pending reviews" on public.venue_reviews;
create policy "Reviewers can edit their own pending reviews"
  on public.venue_reviews for update to authenticated
  using (auth.uid() = reviewer_id)
  with check (auth.uid() = reviewer_id and status = 'pending');
drop policy if exists "Admins can moderate reviews" on public.venue_reviews;
create policy "Admins can moderate reviews"
  on public.venue_reviews for update to authenticated
  using (public.has_role(auth.uid(), 'admin'))
  with check (public.has_role(auth.uid(), 'admin'));
drop policy if exists "Venue owners can reply to approved reviews" on public.venue_reviews;
create policy "Venue owners can reply to approved reviews"
  on public.venue_reviews for update to authenticated
  using (
    status = 'approved'::public.review_status
    and exists (select 1 from public.venues v where v.id = venue_reviews.venue_id and v.owner_id = auth.uid())
  )
  with check (
    status = 'approved'::public.review_status
    and exists (select 1 from public.venues v where v.id = venue_reviews.venue_id and v.owner_id = auth.uid())
  );
drop policy if exists "Reviewers and admins can delete reviews" on public.venue_reviews;
create policy "Reviewers and admins can delete reviews"
  on public.venue_reviews for delete to authenticated
  using (auth.uid() = reviewer_id or public.has_role(auth.uid(), 'admin'));

-- =====================================================================
-- TABLE / SEQUENCE / FUNCTION GRANTS (final least-privilege state)
-- =====================================================================

grant select on public.venues to anon;
grant select, insert, update, delete on public.venues to authenticated;
grant all on public.venues to service_role;

grant select on public.venue_reviews to anon;
grant select, insert, update, delete on public.venue_reviews to authenticated;
grant all on public.venue_reviews to service_role;

grant usage on sequence public.lead_code_seq to anon, authenticated, service_role;
grant insert on public.leads to anon;
grant select, insert, update on public.leads to authenticated;
grant all on public.leads to service_role;

grant select, insert, update on public.subscriptions to authenticated;
grant all on public.subscriptions to service_role;

grant select on public.user_roles to authenticated;
grant all on public.user_roles to service_role;

grant select, insert, update on public.profiles to authenticated;
grant all on public.profiles to service_role;

grant select on public.audit_log to authenticated;
grant all on public.audit_log to service_role;

grant select, insert on public.payments to authenticated;
grant update on public.payments to authenticated;
grant all on public.payments to service_role;

grant all on public.admin_bootstrap_emails to service_role;

revoke all on function public.handle_new_user() from public, anon, authenticated;
revoke all on function public.set_updated_at() from public, anon, authenticated;
revoke all on function public.log_venue_change() from public, anon, authenticated;
revoke all on function public.log_venue_created() from public, anon, authenticated;
revoke all on function public.log_lead_created() from public, anon, authenticated;
revoke all on function public.log_lead_status_change() from public, anon, authenticated;
revoke all on function public.log_review_moderation() from public, anon, authenticated;

revoke all on function public.has_role(uuid, public.app_role) from public, anon;
grant execute on function public.has_role(uuid, public.app_role) to authenticated;

revoke all on function public.verify_payment(uuid) from public, anon;
grant execute on function public.verify_payment(uuid) to authenticated;

revoke all on function public.reject_payment(uuid, text) from public, anon;
grant execute on function public.reject_payment(uuid, text) to authenticated;

revoke all on function public.submit_lead(text, text, text, text, uuid, text, date, text, integer, text) from public;
grant execute on function public.submit_lead(text, text, text, text, uuid, text, date, text, integer, text) to anon, authenticated;

-- =====================================================================
-- STORAGE (venue photos)
-- =====================================================================

insert into storage.buckets (id, name, public)
values ('venue-photos', 'venue-photos', false)
on conflict (id) do nothing;

drop policy if exists "Anyone can view venue photos" on storage.objects;
drop policy if exists "Owners and admins can view venue photos" on storage.objects;
create policy "Owners and admins can view venue photos"
on storage.objects for select to authenticated
using (
  bucket_id = 'venue-photos'
  and (
    (storage.foldername(name))[1] = (auth.uid())::text
    or public.has_role(auth.uid(), 'admin')
  )
);

drop policy if exists "Owners can upload their venue photos" on storage.objects;
create policy "Owners can upload their venue photos"
on storage.objects for insert to authenticated
with check (bucket_id = 'venue-photos' and (storage.foldername(name))[1] = auth.uid()::text);

drop policy if exists "Owners can update their venue photos" on storage.objects;
create policy "Owners can update their venue photos"
on storage.objects for update to authenticated
using (bucket_id = 'venue-photos' and (storage.foldername(name))[1] = auth.uid()::text)
with check (bucket_id = 'venue-photos' and (storage.foldername(name))[1] = auth.uid()::text);

drop policy if exists "Owners can delete their venue photos" on storage.objects;
create policy "Owners can delete their venue photos"
on storage.objects for delete to authenticated
using (bucket_id = 'venue-photos' and (storage.foldername(name))[1] = auth.uid()::text);
