-- SECURITY FIXES
-- Remove overly permissive RLS policies that allow public access to sensitive data

-- 1. Remove "Public can view submissions inbox" — exposes raw emails, phone numbers, personal data
DROP POLICY IF EXISTS "Public can view submissions inbox" ON public.submissions;

-- 2. Remove "Public can update submissions inbox" — allows unauthenticated status changes
DROP POLICY IF EXISTS "Public can update submissions inbox" ON public.submissions;

-- 3. Remove "Public can delete templates" — allows anyone to delete published templates
DROP POLICY IF EXISTS "Public can delete templates" ON public.templates;

-- 4. Remove "Public can update template corrections" — allows unauthenticated template edits
DROP POLICY IF EXISTS "Public can update template corrections" ON public.templates;

-- 5. Remove "Public can insert templates from submission" — too broad, use RPC instead
DROP POLICY IF EXISTS "Public can insert templates from submission" ON public.templates;

-- Restrict template INSERT to admins and moderators only
CREATE POLICY "Admins and moderators can insert templates"
  ON public.templates FOR INSERT
  WITH CHECK (
    public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'moderator')
  );

-- Safe function to increment copies (replaces the need for public UPDATE on templates)
CREATE OR REPLACE FUNCTION public.increment_template_copies(p_template_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE public.templates
  SET copies_count = copies_count + 1
  WHERE id = p_template_id
    AND status = 'published';
END;
$$;

GRANT EXECUTE ON FUNCTION public.increment_template_copies(uuid) TO anon;
GRANT EXECUTE ON FUNCTION public.increment_template_copies(uuid) TO authenticated;
