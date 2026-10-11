-- Run after visitors.sql. Activity counts represent recorded searches/property views.
begin;
alter table public.visitor_searches add column if not exists mobile_key text
  generated always as (regexp_replace(mobile, '[^0-9]', '', 'g')) stored;
create index if not exists visitor_searches_mobile_key_idx
  on public.visitor_searches (mobile_key, created_at desc);

create or replace function public.visitor_activity_summary(
  p_page integer default 0,
  p_search text default '',
  p_type text default '',
  p_from timestamptz default null,
  p_to timestamptz default null,
  p_mobile text default ''
)
returns jsonb
language plpgsql
security invoker
set search_path = public
as $$
declare result jsonb;
begin
  if not public.has_role(auth.uid(), 'admin') then
    raise exception 'Admin access required' using errcode = '42501';
  end if;
  if p_page is null or p_page < 0 or p_page > 100000
    or p_type not in ('', 'venue', 'film', 'all', 'property')
    or (p_from is not null and p_to is not null and p_from >= p_to) then
    raise exception 'Invalid visitor filters' using errcode = '22023';
  end if;
  with filtered as (
    select * from public.visitor_searches
    where (p_search = '' or visitor_name ilike '%' || p_search || '%'
      or mobile_key ilike '%' || case when p_search ~ '^[0-9+ -]+$'
        then regexp_replace(p_search, '[^0-9]', '', 'g') else p_search end || '%')
      and (p_type = '' or search_type = p_type)
      and (p_from is null or created_at >= p_from)
      and (p_to is null or created_at < p_to)
      and (p_mobile = '' or mobile_key = p_mobile)
  ), grouped as (
    select mobile_key as mobile,
      (array_agg(visitor_name order by created_at desc, id))[1] as visitor_name,
      array_agg(distinct visitor_name order by visitor_name) as names,
      count(*) as activity_count,
      count(*) filter (where search_type <> 'property') as search_count,
      count(*) filter (where search_type = 'property') as property_views,
      count(distinct property_slug) filter (where search_type = 'property') as unique_properties,
      min(created_at) as first_activity, max(created_at) as last_activity
    from filtered group by mobile_key
  ), paged as (
    select * from grouped order by activity_count desc, last_activity desc, mobile
    limit 50 offset p_page * 50
  )
  select jsonb_build_object(
    'visitors', coalesce((select jsonb_agg(to_jsonb(p) order by activity_count desc, last_activity desc, mobile) from paged p), '[]'::jsonb),
    'total', (select count(*) from grouped),
    'activityTotal', (select count(*) from filtered)
  ) into result;
  return result;
end;
$$;
revoke all on function public.visitor_activity_summary(integer, text, text, timestamptz, timestamptz, text) from public, anon;
grant execute on function public.visitor_activity_summary(integer, text, text, timestamptz, timestamptz, text) to authenticated;
commit;
