
-- Create storage bucket for submission images
INSERT INTO storage.buckets (id, name, public)
VALUES ('submission-images', 'submission-images', true);

-- Allow anyone to upload images to the bucket
CREATE POLICY "Anyone can upload submission images"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'submission-images');

-- Allow anyone to view submission images
CREATE POLICY "Anyone can view submission images"
ON storage.objects FOR SELECT
USING (bucket_id = 'submission-images');
