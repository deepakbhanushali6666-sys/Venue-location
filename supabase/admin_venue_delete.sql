-- Apply to an existing database to restrict venue deletion to admins.
drop policy if exists "Owners can delete their own venues" on public.venues;
drop policy if exists "Admins can delete venues" on public.venues;
create policy "Admins can delete venues"
  on public.venues for delete to authenticated
  using (public.has_role(auth.uid(), 'admin'));