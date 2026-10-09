-- Run after migration.sql for both new and existing projects.
create table if not exists public.visitor_searches (
  id uuid primary key,
  visitor_name text not null check (char_length(visitor_name) between 2 and 80),
  mobile text not null check (mobile ~ '^[0-9+ -]{8,15}$'),
  search_type text not null check (search_type in ('venue', 'film', 'all', 'property')),
  property_slug text,
  requirements jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists visitor_searches_created_at_idx
  on public.visitor_searches (created_at desc, id);

alter table public.visitor_searches enable row level security;
revoke all on public.visitor_searches from public, anon, authenticated;
grant select on public.visitor_searches to authenticated;

drop policy if exists "Admins can view visitors" on public.visitor_searches;
create policy "Admins can view visitors"
  on public.visitor_searches for select to authenticated
  using (public.has_role(auth.uid(), 'admin'));

create or replace function public.record_visitor_search(
  p_id uuid,
  p_visitor_name text,
  p_mobile text,
  p_search_type text,
  p_property_slug text default null,
  p_requirements jsonb default '{}'::jsonb
)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  entry record;
begin
  if p_id is null
     or p_visitor_name is null or char_length(trim(p_visitor_name)) not between 2 and 80
     or p_mobile is null or trim(p_mobile) !~ '^[0-9+ -]{8,15}$'
     or length(regexp_replace(p_mobile, '[^0-9]', '', 'g')) not between 8 and 15
     or p_search_type is null or p_search_type not in ('venue', 'film', 'all', 'property')
     or (p_property_slug is not null and char_length(p_property_slug) > 200)
     or p_requirements is null or jsonb_typeof(p_requirements) <> 'object' then
    raise exception 'Invalid visitor details or search requirements' using errcode = '22023';
  end if;

  for entry in select key, value from jsonb_each(p_requirements) loop
    if entry.key not in ('category', 'subcategory', 'filmType', 'filmSubcategory',
      'city', 'state', 'event', 'date', 'budget', 'capacity', 'purpose')
      or jsonb_typeof(entry.value) <> 'string'
      or char_length(entry.value #>> '{}') > 200 then
      raise exception 'Invalid search requirement' using errcode = '22023';
    end if;
  end loop;

  insert into public.visitor_searches
    (id, visitor_name, mobile, search_type, property_slug, requirements)
  values
    (p_id, trim(p_visitor_name), trim(p_mobile), p_search_type, p_property_slug, p_requirements)
  on conflict (id) do nothing;
end;
$$;

revoke all on function public.record_visitor_search(uuid, text, text, text, text, jsonb) from public;
grant execute on function public.record_visitor_search(uuid, text, text, text, text, jsonb) to anon, authenticated;
