-- Allow public to update specific fields on templates for community corrections
CREATE POLICY "Public can update template corrections"
ON public.templates
FOR UPDATE
USING (status = 'published')
WITH CHECK (status = 'published');