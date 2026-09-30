-- Run once on an existing database before deploying separate film category panels.
alter table public.venue_categories add column if not exists kind text not null default 'venue';
alter table public.venue_categories drop constraint if exists venue_categories_name_key;
alter table public.venue_categories drop constraint if exists venue_categories_slug_key;
create unique index if not exists venue_categories_kind_name_key on public.venue_categories(kind, name);
create unique index if not exists venue_categories_kind_slug_key on public.venue_categories(kind, slug);

insert into public.venue_categories (name, slug, kind, sort_order)
select name, slug, 'film', sort_order from public.venue_categories where kind = 'venue'
on conflict (kind, slug) do nothing;

insert into public.venue_subcategories (category_id, name, slug, sort_order)
select film.id, sub.name, sub.slug, sub.sort_order
from public.venue_categories venue
join public.venue_categories film on film.slug = venue.slug and film.kind = 'film'
join public.venue_subcategories sub on sub.category_id = venue.id
where venue.kind = 'venue'
on conflict (category_id, slug) do nothing;