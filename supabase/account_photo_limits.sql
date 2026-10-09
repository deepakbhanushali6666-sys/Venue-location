-- Run after verified_listing_payment.sql.
begin;

-- Owners must not be able to activate their own paid allowance.
drop policy if exists "Owners can create their own subscription" on public.subscriptions;
drop policy if exists "Owners and admins can update subscriptions" on public.subscriptions;
drop policy if exists "Admins can create subscriptions" on public.subscriptions;
create policy "Admins can create subscriptions"
  on public.subscriptions for insert to authenticated
  with check (public.has_role(auth.uid(), 'admin'));
drop policy if exists "Admins can update subscriptions" on public.subscriptions;
create policy "Admins can update subscriptions"
  on public.subscriptions for update to authenticated
  using (public.has_role(auth.uid(), 'admin'))
  with check (public.has_role(auth.uid(), 'admin'));

create or replace function public.enforce_account_photo_limit()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_limit integer := 10;
  v_existing integer := 0;
begin
  select case s.amount when 36500 then 60 when 3650 then 20 else 10 end
    into v_limit
    from public.subscriptions s
    where s.owner_id = new.owner_id and s.status = 'active'
      and (s.expires_on is null or s.expires_on >= (now() at time zone 'UTC')::date);
  v_limit := coalesce(v_limit, 10);
  if tg_op = 'UPDATE' then
    -- Preserve existing photos after expiry or an ownership transfer.
    v_existing := cardinality(old.photos);
  end if;
  if cardinality(new.photos) > greatest(v_limit, v_existing) then
    raise exception 'This account allows up to % photos per property', v_limit;
  end if;
  return new;
end;
$$;

drop trigger if exists venues_enforce_account_photo_limit on public.venues;
create trigger venues_enforce_account_photo_limit
  before insert or update of photos, owner_id on public.venues
  for each row execute function public.enforce_account_photo_limit();

commit;
