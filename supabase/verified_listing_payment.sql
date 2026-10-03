create table if not exists public.venue_listing_drafts (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users(id) on delete cascade,
  payload jsonb not null check (jsonb_typeof(payload) = 'object'),
  submitted_venue_id uuid references public.venues(id) on delete set null,
  created_at timestamptz not null default now()
);

alter table public.venue_listing_drafts enable row level security;

drop policy if exists "Owners can view their listing drafts" on public.venue_listing_drafts;
create policy "Owners can view their listing drafts"
  on public.venue_listing_drafts for select to authenticated
  using (auth.uid() = owner_id);

drop policy if exists "Owners can create their listing drafts" on public.venue_listing_drafts;
create policy "Owners can create their listing drafts"
  on public.venue_listing_drafts for insert to authenticated
  with check (auth.uid() = owner_id and submitted_venue_id is null);

grant select, insert on public.venue_listing_drafts to authenticated;

alter table public.payments
  add column if not exists venue_draft_id uuid
  references public.venue_listing_drafts(id) on delete set null;

alter table public.payments
  add column if not exists plan_code text not null default 'verified_listing';

do $$
begin
  if not exists (
    select 1 from pg_constraint
    where conname = 'payments_plan_code_allowed'
      and conrelid = 'public.payments'::regclass
  ) then
    alter table public.payments
      add constraint payments_plan_code_allowed
      check (plan_code in ('verified_listing', 'pro_marketing'));
  end if;
end;
$$;

create unique index if not exists payments_one_active_listing_payment_idx
  on public.payments(venue_draft_id)
  where venue_draft_id is not null and status in ('pending', 'verified');

create or replace function public.verify_payment(p_payment_id uuid)
returns text
language plpgsql
security definer
set search_path to 'public'
as $$
declare
  v_pay public.payments%rowtype;
  v_draft public.venue_listing_drafts%rowtype;
  v_payload jsonb;
  v_venue_id uuid;
  v_invoice text;
  v_plan_name text;
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
  if v_pay.status <> 'pending' then raise exception 'Only pending payments can be verified'; end if;
  if v_pay.plan_code not in ('verified_listing', 'pro_marketing') then
    raise exception 'Unsupported subscription plan';
  end if;

  if v_pay.plan_code = 'pro_marketing' then
    v_plan_name := 'VENUES LOCATION Pro Marketing';
  else
    v_plan_name := 'VENUES LOCATION Verified Listing';
  end if;
  if v_pay.venue_draft_id is not null and (
    (v_pay.plan_code = 'verified_listing' and v_pay.amount <> 3650)
    or (v_pay.plan_code = 'pro_marketing' and v_pay.amount <> 36500)
  ) then
    raise exception 'Payment amount does not match the selected plan';
  end if;

  if v_pay.venue_draft_id is not null then
    select * into v_draft
    from public.venue_listing_drafts
    where id = v_pay.venue_draft_id
    for update;
    if not found then raise exception 'Venue listing draft not found'; end if;
    if v_draft.owner_id <> v_pay.owner_id then raise exception 'Payment owner does not match listing owner'; end if;
    if v_draft.submitted_venue_id is not null then raise exception 'Listing draft was already submitted'; end if;

    v_payload := v_draft.payload;
    if coalesce(trim(v_payload->>'name'), '') = ''
      or coalesce(trim(v_payload->>'slug'), '') = ''
      or coalesce(trim(v_payload->>'category'), '') = ''
      or coalesce(trim(v_payload->>'city'), '') = '' then
      raise exception 'Listing draft is missing required venue details';
    end if;

    insert into public.venues (
      owner_id, name, slug, category, subcategory, city, state, area, pincode, address,
      capacity, starting_price, parking, description, amenities, suitable_for,
      booking_purposes, booking_restrictions, photos, video_url, map_query,
      gst_number, status
    ) values (
      v_draft.owner_id,
      v_payload->>'name',
      v_payload->>'slug',
      v_payload->>'category',
      coalesce(v_payload->>'subcategory', ''),
      v_payload->>'city',
      coalesce(v_payload->>'state', ''),
      coalesce(v_payload->>'area', ''),
      coalesce(v_payload->>'pincode', ''),
      coalesce(v_payload->>'address', ''),
      coalesce(nullif(v_payload->>'capacity', '')::integer, 0),
      coalesce(nullif(v_payload->>'starting_price', '')::integer, 0),
      coalesce(v_payload->>'parking', ''),
      coalesce(v_payload->>'description', ''),
      case when jsonb_typeof(v_payload->'amenities') = 'array'
        then array(select jsonb_array_elements_text(v_payload->'amenities')) else '{}'::text[] end,
      case when jsonb_typeof(v_payload->'suitable_for') = 'array'
        then array(select jsonb_array_elements_text(v_payload->'suitable_for')) else '{}'::text[] end,
      case when jsonb_typeof(v_payload->'booking_purposes') = 'array'
        then array(select jsonb_array_elements_text(v_payload->'booking_purposes')) else '{}'::text[] end,
      case when jsonb_typeof(v_payload->'booking_restrictions') = 'array'
        then array(select jsonb_array_elements_text(v_payload->'booking_restrictions')) else '{}'::text[] end,
      case when jsonb_typeof(v_payload->'photos') = 'array'
        then array(select jsonb_array_elements_text(v_payload->'photos')) else '{}'::text[] end,
      coalesce(v_payload->>'video_url', ''),
      coalesce(v_payload->>'map_query', ''),
      coalesce(v_payload->>'gst_number', ''),
      'pending'
    ) returning id into v_venue_id;

    update public.venue_listing_drafts
      set submitted_venue_id = v_venue_id
      where id = v_draft.id;
  end if;

  v_invoice := 'OMS/INV/' || to_char(now(), 'YYYY') || '/' || nextval('public.invoice_seq');

  select expires_on into v_current from public.subscriptions where owner_id = v_pay.owner_id;
  v_start := current_date;
  if v_current is not null and v_current > current_date then
    v_expiry := v_current + interval '1 year';
  else
    v_expiry := current_date + interval '1 year';
  end if;

  insert into public.subscriptions (owner_id, plan_name, status, amount, started_on, expires_on, invoice_number)
  values (v_pay.owner_id, v_plan_name, 'active', v_pay.amount, v_start, v_expiry, v_invoice)
  on conflict (owner_id) do update
    set plan_name = excluded.plan_name, status = 'active', amount = excluded.amount,
        started_on = coalesce(public.subscriptions.started_on, excluded.started_on),
        expires_on = excluded.expires_on, invoice_number = excluded.invoice_number;

  update public.payments
    set status = 'verified', invoice_number = v_invoice, verified_by = auth.uid(), verified_at = now()
    where id = p_payment_id;

  insert into public.audit_log (actor_id, action, entity_type, entity_id, entity_label, from_value, to_value)
  values (auth.uid(), 'payment_verified', 'payment', p_payment_id, v_invoice, 'pending', 'verified');

  return v_invoice;
end;
$$;