-- ========================================================================
-- RAIGON ART - SUPABASE STORAGE BUCKETS SETUP & POLICIES
-- ========================================================================

-- Insert storage buckets if they do not exist
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES 
  ('raigon-art-storage', 'raigon-art-storage', true, 52428800, ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/heic', 'application/pdf', 'application/zip'])
ON CONFLICT (id) DO UPDATE SET public = true;

-- Ensure public read access for client apps
CREATE POLICY "Public Access for Raigon Storage" 
ON storage.objects FOR SELECT 
USING (bucket_id = 'raigon-art-storage');

-- Allow authenticated and service role to upload / update / delete
CREATE POLICY "Authenticated Uploads for Raigon Storage" 
ON storage.objects FOR INSERT 
WITH CHECK (bucket_id = 'raigon-art-storage');

CREATE POLICY "Authenticated Updates for Raigon Storage" 
ON storage.objects FOR UPDATE 
USING (bucket_id = 'raigon-art-storage');

CREATE POLICY "Authenticated Deletes for Raigon Storage" 
ON storage.objects FOR DELETE 
USING (bucket_id = 'raigon-art-storage');
