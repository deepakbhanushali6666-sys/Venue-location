-- One-time reset: permanently delete all enquiries and lead audit history.
-- Other audit records stay intact. Back up the database before running this script.
begin;

lock table public.leads in access exclusive mode;

delete from public.leads;
delete from public.audit_log where entity_type = 'lead';

alter sequence public.lead_code_seq start with 1 restart with 1;
alter table public.leads alter column lead_code
  set default ('OMS-' || lpad(nextval('public.lead_code_seq')::text, 3, '0'));

commit;