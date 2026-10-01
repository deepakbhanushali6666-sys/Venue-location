-- Venue / lead deletion requests raised by owners and team members.
-- Replaces the old browser-localStorage queue so the admin actually receives them.
-- Safe to re-run.

create table if not exists public.deletion_requests (
  id uuid primary key default gen_random_uuid(),
  target_type text not null check (target_type in ('venue', 'lead')),
  venue_id uuid references public.venues(id) on delete cascade,
  lead_id uuid references public.leads(id) on delete cascade,
  property_code text not null default '',
  target_label text not null default '',
  target_details text not null default '',
  requester_id uuid not null references auth.users(id) on delete cascade,
  requester_name text not null default '',
  requester_mobile text not null default '',
  requester_email text not null default '',
  created_at timestamptz not null default now(),
  constraint deletion_requests_target_check check (
    (target_type = 'venue' and venue_id is not null)
    or (target_type = 'lead' and lead_id is not null)
  )
);

alter table public.deletion_requests enable row level security;

create unique index if not exists deletion_requests_unique_venue
  on public.deletion_requests(venue_id) where venue_id is not null;
create unique index if not exists deletion_requests_unique_lead
  on public.deletion_requests(lead_id) where lead_id is not null;

drop policy if exists "Requesters and admins can view deletion requests" on public.deletion_requests;
create policy "Requesters and admins can view deletion requests"
  on public.deletion_requests for select to authenticated
  using (requester_id = auth.uid() or public.has_role(auth.uid(), 'admin'));

drop policy if exists "Signed-in users can raise deletion requests" on public.deletion_requests;
create policy "Signed-in users can raise deletion requests"
  on public.deletion_requests for insert to authenticated
  with check (requester_id = auth.uid());

drop policy if exists "Admins can clear deletion requests" on public.deletion_requests;
create policy "Admins can clear deletion requests"
  on public.deletion_requests for delete to authenticated
  using (public.has_role(auth.uid(), 'admin'));
