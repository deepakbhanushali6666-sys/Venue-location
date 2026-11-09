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

alter table public.profiles
  add column if not exists auto_lead_contact boolean not null default false;

create or replace function public.admin_assign_subscription(
  p_owner_id uuid,
  p_plan_code text,
  p_auto_lead_contact boolean
)
returns public.subscriptions
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_plan_name text;
  v_amount integer;
  v_started_on date;
  v_expires_on date;
  v_new_expiry date;
  v_subscription public.subscriptions;
begin
  if auth.uid() is null or not public.has_role(auth.uid(), 'admin') then
    raise exception 'Admin access required' using errcode = '42501';
  end if;

  case p_plan_code
    when 'verified_listing' then
      v_plan_name := 'VENUES LOCATION Verified Listing';
      v_amount := 3650;
    when 'pro_marketing' then
      v_plan_name := 'VENUES LOCATION Pro Marketing';
      v_amount := 36500;
    else
      raise exception 'Unsupported subscription plan';
  end case;

  update public.profiles
    set auto_lead_contact = p_auto_lead_contact, updated_at = now()
    where id = p_owner_id;
  if not found then
    raise exception 'Account not found';
  end if;

  select started_on, expires_on
    into v_started_on, v_expires_on
    from public.subscriptions
    where owner_id = p_owner_id
    for update;

  if v_expires_on is not null and v_expires_on > current_date then
    v_new_expiry := (v_expires_on + interval '1 year')::date;
  else
    v_new_expiry := (current_date + interval '1 year')::date;
  end if;

  insert into public.subscriptions (
    owner_id, plan_name, amount, status, started_on, expires_on, invoice_number
  ) values (
    p_owner_id, v_plan_name, v_amount, 'active', coalesce(v_started_on, current_date), v_new_expiry, ''
  )
  on conflict (owner_id) do update
    set plan_name = excluded.plan_name,
        amount = excluded.amount,
        status = 'active',
        started_on = coalesce(public.subscriptions.started_on, excluded.started_on),
        expires_on = excluded.expires_on,
        invoice_number = '',
        updated_at = now()
  returning * into v_subscription;

  return v_subscription;
end;
$$;

revoke all on function public.admin_assign_subscription(uuid, text, boolean) from public;
grant execute on function public.admin_assign_subscription(uuid, text, boolean) to authenticated;

create or replace function public.admin_set_lead_contact_access(
  p_owner_id uuid,
  p_auto_lead_contact boolean
)
returns public.profiles
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_profile public.profiles;
begin
  if auth.uid() is null or not public.has_role(auth.uid(), 'admin') then
    raise exception 'Admin access required' using errcode = '42501';
  end if;

  update public.profiles
    set auto_lead_contact = p_auto_lead_contact, updated_at = now()
    where id = p_owner_id
    returning * into v_profile;
  if not found then
    raise exception 'Account not found';
  end if;

  return v_profile;
end;
$$;

revoke all on function public.admin_set_lead_contact_access(uuid, boolean) from public;
grant execute on function public.admin_set_lead_contact_access(uuid, boolean) to authenticated;

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
