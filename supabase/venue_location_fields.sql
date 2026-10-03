alter table public.venues
  add column if not exists pincode text not null default '';

do $$
begin
  if not exists (
    select 1 from pg_constraint
    where conname = 'venues_pincode_format'
      and conrelid = 'public.venues'::regclass
  ) then
    alter table public.venues
      add constraint venues_pincode_format
      check (pincode = '' or pincode ~ '^[1-9][0-9]{5}$');
  end if;
end;
$$;

create index if not exists idx_venues_pincode
  on public.venues(pincode)
  where pincode <> '';