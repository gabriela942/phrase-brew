-- Add 'archived' to submission_status enum
ALTER TYPE public.submission_status ADD VALUE IF NOT EXISTS 'archived';

-- Allow admins/moderators to delete submissions (no DELETE policy existed before)
DROP POLICY IF EXISTS "Admins and moderators can delete submissions" ON public.submissions;
CREATE POLICY "Admins and moderators can delete submissions" ON public.submissions
  FOR DELETE USING (
    public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'moderator')
  );

-- When a submission is deleted, keep its published template but null the FK
-- (avoids losing approved templates that originated from a deleted submission)
ALTER TABLE public.templates DROP CONSTRAINT IF EXISTS templates_submission_id_fkey;
ALTER TABLE public.templates
  ADD CONSTRAINT templates_submission_id_fkey
  FOREIGN KEY (submission_id) REFERENCES public.submissions(id) ON DELETE SET NULL;
