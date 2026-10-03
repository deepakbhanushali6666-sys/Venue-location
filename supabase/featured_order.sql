alter table public.venues
  add column if not exists featured_order integer not null default 0;

do $$
begin
  if not exists (
    select 1 from pg_constraint
    where conname = 'venues_featured_order_nonnegative'
      and conrelid = 'public.venues'::regclass
  ) then
    alter table public.venues
      add constraint venues_featured_order_nonnegative check (featured_order >= 0);
  end if;
end;
$$;

create index if not exists venues_featured_order_idx
  on public.venues (featured_order, created_at desc)
  where featured = true and status = 'approved';