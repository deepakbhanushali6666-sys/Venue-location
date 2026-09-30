-- Apply once to an existing database: adds permanent VL- property codes and copies them onto leads.
begin;

create or replace function public.format_code(prefix text, n bigint)
returns text
language sql
immutable
as $$ select prefix || lpad(n::text, greatest(3, length(n::text)), '0') $$;

-- Keeps lead IDs unique past OMS-999.
alter table public.leads alter column lead_code
  set default public.format_code('OMS-', nextval('public.lead_code_seq'));

create sequence if not exists public.property_code_seq start 1;
alter table public.venues add column if not exists property_code text;
alter table public.leads add column if not exists property_code text not null default '';

do $$
declare r record;
begin
  for r in select id from public.venues where property_code is null order by created_at, id loop
    update public.venues
    set property_code = public.format_code('VL-', nextval('public.property_code_seq'))
    where id = r.id;
  end loop;
end;
$$;

alter table public.venues alter column property_code set not null;
create unique index if not exists venues_property_code_key on public.venues(property_code);

create or replace function public.set_venue_property_code()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if tg_op = 'INSERT' then
    new.property_code := public.format_code('VL-', nextval('public.property_code_seq'));
  else
    new.property_code := old.property_code;
  end if;
  return new;
end;
$$;

drop trigger if exists venues_property_code on public.venues;
create trigger venues_property_code
before insert or update of property_code on public.venues
for each row execute function public.set_venue_property_code();

create or replace function public.set_lead_property_code()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  new.property_code := coalesce((select property_code from public.venues where id = new.venue_id), '');
  return new;
end;
$$;

drop trigger if exists leads_property_code on public.leads;
create trigger leads_property_code
before insert on public.leads
for each row execute function public.set_lead_property_code();

update public.leads l
set property_code = v.property_code
from public.venues v
where v.id = l.venue_id and l.property_code = '';

revoke all on function public.set_venue_property_code() from public, anon, authenticated;
revoke all on function public.set_lead_property_code() from public, anon, authenticated;

commit;
