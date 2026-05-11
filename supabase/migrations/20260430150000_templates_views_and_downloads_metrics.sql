-- Engagement metrics for public templates
ALTER TABLE public.templates
  ADD COLUMN IF NOT EXISTS views_count INTEGER NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS downloads_count INTEGER NOT NULL DEFAULT 0;

-- Increment helpers (modelled on the existing increment_copy_count)
CREATE OR REPLACE FUNCTION public.increment_view_count(template_id UUID)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE public.templates SET views_count = views_count + 1 WHERE id = template_id;
END;
$$;

CREATE OR REPLACE FUNCTION public.increment_download_count(template_id UUID)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE public.templates SET downloads_count = downloads_count + 1 WHERE id = template_id;
END;
$$;
