-- Lead contact gating: owners (and team members) only see an enquiry's mobile
-- and email once an admin approves access for that property.
-- Safe to re-run.

-- 1. Per-property access requests -------------------------------------------
create table if not exists public.lead_contact_requests (
  id uuid primary key default gen_random_uuid(),
  venue_id uuid not null references public.venues(id) on delete cascade,
  requester_id uuid not null references auth.users(id) on delete cascade,
  status text not null default 'pending' check (status in ('pending', 'approved', 'rejected')),
  created_at timestamptz not null default now(),
  decided_at timestamptz,
  decided_by uuid references auth.users(id) on delete set null,
  unique (venue_id, requester_id)
);

alter table public.lead_contact_requests enable row level security;

drop policy if exists "Requesters and admins can view contact requests" on public.lead_contact_requests;
create policy "Requesters and admins can view contact requests"
  on public.lead_contact_requests for select to authenticated
  using (requester_id = auth.uid() or public.has_role(auth.uid(), 'admin'));

drop policy if exists "Users can raise their own contact requests" on public.lead_contact_requests;
create policy "Users can raise their own contact requests"
  on public.lead_contact_requests for insert to authenticated
  with check (requester_id = auth.uid());

drop policy if exists "Admins can decide contact requests" on public.lead_contact_requests;
create policy "Admins can decide contact requests"
  on public.lead_contact_requests for update to authenticated
  using (public.has_role(auth.uid(), 'admin'))
  with check (public.has_role(auth.uid(), 'admin'));

drop policy if exists "Admins can delete contact requests" on public.lead_contact_requests;
create policy "Admins can delete contact requests"
  on public.lead_contact_requests for delete to authenticated
  using (public.has_role(auth.uid(), 'admin'));

-- 2. Per-account auto approval (admin toggle for team members) ---------------
alter table public.profiles add column if not exists auto_lead_contact boolean not null default false;

drop policy if exists "Admins can update profiles" on public.profiles;
create policy "Admins can update profiles"
  on public.profiles for update to authenticated
  using (public.has_role(auth.uid(), 'admin'))
  with check (public.has_role(auth.uid(), 'admin'));

-- 3. Hide the raw contact columns from every non-superuser role --------------
-- RLS cannot mask columns, so the privilege itself is revoked. All reads now go
-- through public.lead_contacts() below.
revoke select (mobile, email) on public.leads from anon, authenticated;

-- 4. Masking helpers ---------------------------------------------------------
create or replace function public.mask_contact_phone(_value text)
returns text language sql immutable as $$
  select case
    when _value is null or length(_value) = 0 then ''
    when length(_value) <= 4 then repeat('*', length(_value))
    else left(_value, 2) || repeat('*', length(_value) - 4) || right(_value, 2)
  end;
$$;

create or replace function public.mask_contact_email(_value text)
returns text language sql immutable as $$
  select case
    when _value is null or position('@' in _value) = 0 then ''
    else left(_value, 1) || '***@' || split_part(_value, '@', 2)
  end;
$$;

-- 5. Contact resolver --------------------------------------------------------
-- Security definer, so the where-clause below is the authorization check:
-- only admins, team members and the venue's owner get a row back at all.
create or replace function public.lead_contacts(_lead_ids uuid[])
returns table (lead_id uuid, mobile text, email text, unlocked boolean)
language sql
stable
security definer
set search_path = public
as $$
  select
    l.id,
    case when a.allowed then l.mobile else public.mask_contact_phone(l.mobile) end,
    case when a.allowed then l.email else public.mask_contact_email(l.email) end,
    a.allowed
  from public.leads l
  cross join lateral (
    select (
      public.has_role(auth.uid(), 'admin')
      or coalesce((select p.auto_lead_contact from public.profiles p where p.id = auth.uid()), false)
      or exists (
        select 1 from public.lead_contact_requests r
        where r.requester_id = auth.uid()
          and r.venue_id = l.venue_id
          and r.status = 'approved'
      )
    ) as allowed
  ) a
  where l.id = any(_lead_ids)
    and (
      public.is_staff(auth.uid())
      or exists (
        select 1 from public.venues v where v.id = l.venue_id and v.owner_id = auth.uid()
      )
    );
$$;

grant execute on function public.lead_contacts(uuid[]) to authenticated;
