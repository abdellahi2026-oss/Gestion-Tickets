-- =====================================================
-- RIMATEL SA - Scheduled Function to Mark Late Tickets
-- Run this as a PostgreSQL cron job or Edge Function
-- =====================================================

-- Function to update tickets that are open for more than 24 hours
CREATE OR REPLACE FUNCTION mark_late_tickets()
RETURNS void AS $$
BEGIN
  UPDATE tickets
  SET 
    status = 'en_retard',
    updated_at = NOW()
  WHERE 
    status NOT IN ('fermé', 'en_retard')
    AND created_at < NOW() - INTERVAL '24 hours';
    
  -- Log the changes
  INSERT INTO ticket_history (ticket_id, action, from_status, to_status, created_at)
  SELECT 
    id,
    'auto_marked_late',
    status,
    'en_retard',
    NOW()
  FROM tickets
  WHERE 
    status = 'en_retard'
    AND updated_at >= NOW() - INTERVAL '1 minute';
END;
$$ LANGUAGE plpgsql;

-- To schedule this function, use pg_cron extension or Supabase Edge Functions
-- Example with pg_cron (if available):
-- SELECT cron.schedule('mark-late-tickets', '0 * * * *', 'SELECT mark_late_tickets()');

