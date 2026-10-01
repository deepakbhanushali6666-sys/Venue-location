-- Team member role: read-only access to the admin panel + venue listing rights.
-- Run STEP 1 on its own first (Postgres cannot use a new enum value in the same
-- transaction that adds it), then run STEP 2.

-- =====================================================================
-- STEP 1 - run this statement alone
-- =====================================================================
alter type public.app_role add value if not exists 'team';

-- =====================================================================
-- STEP 2 - run everything below after STEP 1 has committed
-- =====================================================================

create or replace function public.is_staff(_user_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.user_roles
    where user_id = _user_id and role in ('admin'::public.app_role, 'team'::public.app_role)
  );
$$;

-- Admins grant/revoke the team role from the admin panel.
drop policy if exists "Admins can manage roles" on public.user_roles;
create policy "Admins can manage roles"
  on public.user_roles for all to authenticated
  using (public.has_role(auth.uid(), 'admin'))
  with check (public.has_role(auth.uid(), 'admin'));

-- Read-only visibility for staff (admins already covered by their own policies).
drop policy if exists "Staff can view profiles" on public.profiles;
create policy "Staff can view profiles"
  on public.profiles for select to authenticated
  using (public.is_staff(auth.uid()));

drop policy if exists "Staff can view all venues" on public.venues;
create policy "Staff can view all venues"
  on public.venues for select to authenticated
  using (public.is_staff(auth.uid()));

drop policy if exists "Staff can view all leads" on public.leads;
create policy "Staff can view all leads"
  on public.leads for select to authenticated
  using (public.is_staff(auth.uid()));

drop policy if exists "Staff can view subscriptions" on public.subscriptions;
create policy "Staff can view subscriptions"
  on public.subscriptions for select to authenticated
  using (public.is_staff(auth.uid()));

drop policy if exists "Staff can view payments" on public.payments;
create policy "Staff can view payments"
  on public.payments for select to authenticated
  using (public.is_staff(auth.uid()));

drop policy if exists "Staff can view audit log" on public.audit_log;
create policy "Staff can view audit log"
  on public.audit_log for select to authenticated
  using (public.is_staff(auth.uid()));

drop policy if exists "Staff can view reviews" on public.venue_reviews;
create policy "Staff can view reviews"
  on public.venue_reviews for select to authenticated
  using (public.is_staff(auth.uid()));
