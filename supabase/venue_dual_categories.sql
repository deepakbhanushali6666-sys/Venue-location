alter table public.venues
  add column if not exists film_category text not null default '',
  add column if not exists film_subcategory text not null default '';

create index if not exists idx_venues_film_category
  on public.venues(film_category)
  where film_category <> '';