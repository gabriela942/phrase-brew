DROP POLICY "Public can update submissions inbox" ON public.submissions;

CREATE POLICY "Public can update submissions inbox"
ON public.submissions
AS PERMISSIVE
FOR UPDATE
USING (status IN ('new'::submission_status, 'in_review'::submission_status, 'approved'::submission_status, 'rejected'::submission_status))
WITH CHECK (status IN ('in_review'::submission_status, 'approved'::submission_status, 'rejected'::submission_status));