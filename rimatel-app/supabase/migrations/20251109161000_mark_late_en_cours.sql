-- =====================================================
-- Mark 'en_cours' tickets as 'en_retard' after 24h
-- Scheduled via pg_cron (hourly)
-- =====================================================

create or replace function mark_late_en_cours_tickets()
returns void as $$
begin
  -- Identify tickets to update based on last activity (updated_at or created_at)
  with to_update as (
    select id, ticket_number
    from tickets
    where status = 'en_cours'
      and coalesce(updated_at, created_at) < now() - interval '24 hours'
  ),
  updated as (
    update tickets t
    set status = 'en_retard',
        updated_at = now()
    from to_update u
    where t.id = u.id
    returning t.id, t.ticket_number
  )
  insert into ticket_history (ticket_id, action, from_status, to_status, created_at, changed_by, changed_by_name)
  select u.id, 'status_change', 'en_cours', 'en_retard', now(), null, 'System'
  from updated u;
end;
$$ language plpgsql;

-- Schedule hourly run (at minute 0)
select cron.schedule(
  'mark-late-en-cours-hourly',
  '0 * * * *',
  'select mark_late_en_cours_tickets()'
);

