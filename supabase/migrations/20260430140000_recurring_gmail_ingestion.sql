-- Schedules the ingest-gmail edge function via pg_cron.
--
-- Secret handling
-- ───────────────
-- The CRON_SECRET sent in the x-cron-secret header is read from Supabase
-- Vault at runtime (`vault.decrypted_secrets`), so this file never contains
-- the actual value. Before applying this migration to a fresh database,
-- create the vault entry:
--
--   SELECT vault.create_secret(
--     'your-cron-secret-here',
--     'cron_secret',
--     'CRON_SECRET for ingest-gmail edge function'
--   );
--
-- The same value must be set as the CRON_SECRET secret in Edge Functions
-- (Supabase Dashboard → Project → Edge Functions → Manage Secrets), and
-- read inside the function as `Deno.env.get("CRON_SECRET")`.
--
-- The anon-key Bearer token below is the *public* anon key — required by
-- the Edge Functions gateway as a JWT, intentionally public, protected by
-- RLS. Safe to keep in DDL per Supabase docs.

CREATE EXTENSION IF NOT EXISTS pg_cron;
CREATE EXTENSION IF NOT EXISTS pg_net;

-- Idempotent: drop any previous job with this name before (re)scheduling
DO $$
BEGIN
  PERFORM cron.unschedule('ingest-gmail-recurring')
  FROM cron.job WHERE jobname = 'ingest-gmail-recurring';
EXCEPTION WHEN OTHERS THEN
  NULL;
END $$;

SELECT cron.schedule(
  'ingest-gmail-recurring',
  '* * * * *',
  $job$
  SELECT net.http_post(
    url := 'https://zxoedlfvsccbmytnybah.supabase.co/functions/v1/ingest-gmail',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'Authorization', 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inp4b2VkbGZ2c2NjYm15dG55YmFoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzU0MjQ0NjYsImV4cCI6MjA5MTAwMDQ2Nn0.yabkmWV1NyZagGWHhRq6AE9DbotD_T-7WDMBqJXZ5go',
      'x-cron-secret', (SELECT decrypted_secret FROM vault.decrypted_secrets WHERE name = 'cron_secret' LIMIT 1)
    ),
    body := jsonb_build_object('source', 'cron')
  ) AS request_id;
  $job$
);
