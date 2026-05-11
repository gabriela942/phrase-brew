-- Enable scheduling and HTTP-from-SQL extensions
CREATE EXTENSION IF NOT EXISTS pg_cron;
CREATE EXTENSION IF NOT EXISTS pg_net;

-- Remove any previous job with this name (idempotent)
DO $$
BEGIN
  PERFORM cron.unschedule('ingest-gmail-recurring')
  FROM cron.job WHERE jobname = 'ingest-gmail-recurring';
EXCEPTION WHEN OTHERS THEN
  NULL;
END $$;

-- Schedule the edge function to run every minute.
--
-- Two headers are required:
--   * Authorization: Bearer <ANON_KEY>  — required by the Supabase Edge
--     Functions gateway (rejects requests with no JWT before reaching the
--     function code). The anon key is public and safe in DDL.
--   * x-cron-secret: <CRON_SECRET>      — read inside the function to
--     bypass the user/admin JWT check (cron has no logged-in user).
--
-- The literal CRON_SECRET below must match the value set via:
--   supabase secrets set CRON_SECRET=...
SELECT cron.schedule(
  'ingest-gmail-recurring',
  '* * * * *',
  $job$
  SELECT net.http_post(
    url := 'https://zxoedlfvsccbmytnybah.supabase.co/functions/v1/ingest-gmail',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'Authorization', 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inp4b2VkbGZ2c2NjYm15dG55YmFoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzU0MjQ0NjYsImV4cCI6MjA5MTAwMDQ2Nn0.yabkmWV1NyZagGWHhRq6AE9DbotD_T-7WDMBqJXZ5go',
      'x-cron-secret', 'crn_y4Gn7LtN8D2eux9owsRInwozOXdi778XMHhO1PTM'
    ),
    body := jsonb_build_object('source', 'cron')
  ) AS request_id;
  $job$
);
