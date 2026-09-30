-- Apply once to an existing Venue Business database before enabling admin lead deletion.
grant delete on public.leads to authenticated;
drop policy if exists "Admins can delete leads" on public.leads;
create policy "Admins can delete leads"
  on public.leads for delete to authenticated
  using (public.has_role(auth.uid(), 'admin'));