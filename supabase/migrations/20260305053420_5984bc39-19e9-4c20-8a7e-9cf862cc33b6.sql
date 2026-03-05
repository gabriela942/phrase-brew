
-- The INSERT WITH CHECK (true) on submissions is intentional for public submissions.
-- Let's restrict it to only allow setting specific fields and prevent status manipulation.
DROP POLICY "Anyone can create submissions" ON public.submissions;
CREATE POLICY "Anyone can create submissions" ON public.submissions 
  FOR INSERT WITH CHECK (status = 'new');
