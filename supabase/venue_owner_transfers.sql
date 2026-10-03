create or replace function public.transfer_venue_owner(
  p_venue_id uuid,
  p_property_code text,
  p_new_owner_id uuid
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_venue record;
  v_new_owner_id uuid;
  v_lead_count integer;
  v_revoked_count integer;
begin
  if not public.has_role(auth.uid(), 'admin') then
    raise exception 'Only admins can transfer venue ownership';
  end if;

  select id, owner_id, property_code, name
  into v_venue
  from public.venues
  where id = p_venue_id
  for update;
  if not found then raise exception 'Venue not found'; end if;
  if v_venue.property_code is distinct from trim(p_property_code) then
    raise exception 'Property code does not match this venue';
  end if;

  select id into v_new_owner_id from auth.users where id = p_new_owner_id;
  if not found then raise exception 'New owner account not found'; end if;
  if v_venue.owner_id = v_new_owner_id then raise exception 'This account already owns the venue'; end if;

  select count(*)::integer into v_lead_count
  from public.leads
  where venue_id = v_venue.id
     or (venue_id is null and property_code = v_venue.property_code);

  delete from public.lead_contact_requests where venue_id = v_venue.id;
  get diagnostics v_revoked_count = row_count;

  update public.leads
    set venue_id = v_venue.id
    where venue_id is null and property_code = v_venue.property_code;

  update public.venues
    set owner_id = v_new_owner_id
    where id = v_venue.id;

  insert into public.audit_log (
    actor_id, action, entity_type, entity_id, entity_label, from_value, to_value
  ) values (
    auth.uid(), 'venue_owner_transferred', 'venue', v_venue.id,
    v_venue.property_code || ' · ' || v_venue.name,
    v_venue.owner_id::text, v_new_owner_id::text
  );

  return jsonb_build_object(
    'venue_id', v_venue.id,
    'property_code', v_venue.property_code,
    'venue_name', v_venue.name,
    'previous_owner_id', v_venue.owner_id,
    'new_owner_id', v_new_owner_id,
    'lead_count', v_lead_count,
    'revoked_contact_requests', v_revoked_count
  );
end;
$$;

revoke all on function public.transfer_venue_owner(uuid, text, uuid) from public, anon;
grant execute on function public.transfer_venue_owner(uuid, text, uuid) to authenticated;

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
      or (
        coalesce((select p.auto_lead_contact from public.profiles p where p.id = auth.uid()), false)
        and exists (
          select 1 from public.venues v
          where v.id = l.venue_id and v.owner_id = auth.uid()
        )
      )
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
      public.has_role(auth.uid(), 'admin')
      or exists (
        select 1 from public.venues v where v.id = l.venue_id and v.owner_id = auth.uid()
      )
    );
$$;

grant execute on function public.lead_contacts(uuid[]) to authenticated;