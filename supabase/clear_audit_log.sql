-- One-time removal of all existing audit entries; future actions are still logged.
-- Back up the database before running this in the Supabase SQL editor.
begin;

lock table public.audit_log in access exclusive mode;
delete from public.audit_log;

commit;