alter table public.venues
  add column if not exists film_category text not null default '',
  add column if not exists film_subcategory text[] not null default '{}'::text[];

do $$
begin
  if exists (
    select 1 from information_schema.columns
    where table_schema = 'public' and table_name = 'venues' and column_name = 'film_subcategory' and data_type = 'text'
  ) then
    alter table public.venues
      alter column film_subcategory drop default,
      alter column film_subcategory type text[] using case when film_subcategory = '' then '{}'::text[] else array[film_subcategory] end,
      alter column film_subcategory set default '{}'::text[];
  end if;
end $$;

create index if not exists idx_venues_film_category
  on public.venues(film_category)
  where film_category <> '';