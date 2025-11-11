
-- =====================================================
-- Cron Job: Auto-close unreachable tickets
-- =====================================================
-- This cron job runs daily to close tickets that have
-- been in the 'injoignable' status for more than 2 days.
-- =====================================================

-- 1. Create the function to close old unreachable tickets
create or replace function close_old_unreachable_tickets()
returns void as $$
begin
  update tickets
  set status = 'fermé'
  where status = 'injoignable'
  and updated_at < now() - interval '2 days';
end;
$$ language plpgsql;

-- 2. Schedule the cron job to run once a day
select cron.schedule(
  'close-unreachable-tickets-daily',
  '0 0 * * *', -- Every day at midnight
  'select close_old_unreachable_tickets()'
);
