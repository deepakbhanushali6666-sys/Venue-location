-- Run after the existing schema setup.
begin;
alter table public.venue_locations
  add column if not exists state_id uuid references public.venue_locations(id) on delete restrict;
alter table public.venue_locations drop constraint if exists venue_locations_kind_name_key;
create unique index if not exists venue_locations_state_name_unique
  on public.venue_locations(name) where kind = 'state';
create unique index if not exists venue_locations_city_state_name_unique
  on public.venue_locations(state_id, name) where kind = 'city' and state_id is not null;
create unique index if not exists venue_locations_unassigned_city_name_unique
  on public.venue_locations(name) where kind = 'city' and state_id is null;

create or replace function public.check_location_state()
returns trigger language plpgsql set search_path = public as $$
begin
  if tg_op = 'UPDATE' and old.kind = 'state' and new.kind <> 'state'
    and exists (select 1 from public.venue_locations where state_id = old.id) then
    raise exception 'Move or delete this state''s cities before changing its kind';
  end if;
  if new.kind = 'state' and new.state_id is not null then
    raise exception 'States cannot belong to another state';
  end if;
  if new.state_id is not null and (new.state_id = new.id or not exists (
    select 1 from public.venue_locations where id = new.state_id and kind = 'state'
  )) then
    raise exception 'Select a valid parent state for the city';
  end if;
  return new;
end;
$$;
drop trigger if exists venue_locations_check_state on public.venue_locations;
create trigger venue_locations_check_state before insert or update
  on public.venue_locations for each row execute function public.check_location_state();

update public.venue_locations city
set state_id = state.id
from public.venue_locations state
where city.kind = 'city' and city.state_id is null
  and state.kind = 'state' and state.name = 'Maharashtra'
  and city.name in (
    'Mumbai', 'Navi Mumbai', 'Thane', 'Kalyan', 'Dombivli', 'Bhiwandi',
    'Ulhasnagar', 'Panvel', 'Vasai-Virar', 'Palghar', 'Mira-Bhayandar',
    'Pune', 'Pimpri-Chinchwad', 'Lonavala', 'Khandala', 'Karjat', 'Alibaug',
    'Raigad', 'Nashik', 'Igatpuri', 'Trimbak', 'Malegaon', 'Shirdi',
    'Ahmednagar', 'Aurangabad', 'Jalna', 'Beed', 'Latur', 'Nanded',
    'Parbhani', 'Hingoli', 'Osmanabad', 'Nagpur', 'Wardha', 'Chandrapur',
    'Gadchiroli', 'Bhandara', 'Gondia', 'Amravati', 'Akola', 'Yavatmal',
    'Washim', 'Buldhana', 'Kolhapur', 'Sangli', 'Miraj', 'Ichalkaranji',
    'Satara', 'Solapur', 'Pandharpur', 'Ratnagiri', 'Sindhudurg',
    'Mahabaleshwar', 'Panchgani', 'Dhule', 'Nandurbar', 'Jalgaon'
  );
commit;
