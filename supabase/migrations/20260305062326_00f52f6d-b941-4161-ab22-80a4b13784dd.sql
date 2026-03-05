CREATE POLICY "Public can view submissions inbox"
ON public.submissions
AS PERMISSIVE
FOR SELECT
USING (true);

CREATE POLICY "Public can update submissions inbox"
ON public.submissions
AS PERMISSIVE
FOR UPDATE
USING (true)
WITH CHECK (true);

CREATE POLICY "Public can insert templates from submission"
ON public.templates
AS PERMISSIVE
FOR INSERT
WITH CHECK (
  submission_id IS NOT NULL
  AND EXISTS (
    SELECT 1
    FROM public.submissions s
    WHERE s.id = templates.submission_id
  )
);