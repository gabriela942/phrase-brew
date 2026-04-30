-- Idempotency key for Gmail ingestion: prevents inserting the same message twice
ALTER TABLE public.submissions ADD COLUMN IF NOT EXISTS gmail_message_id TEXT;
CREATE UNIQUE INDEX IF NOT EXISTS submissions_gmail_message_id_unique
  ON public.submissions(gmail_message_id)
  WHERE gmail_message_id IS NOT NULL;
