CREATE POLICY "Public can delete templates"
ON public.templates
FOR DELETE
TO public
USING (status = 'published'::template_status);