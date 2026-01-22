-- Run this script in your Supabase SQL Editor to update the 'businesses' table
-- and ensure the storage bucket exists.

-- 1. Add missing columns to the 'businesses' table
ALTER TABLE public.businesses 
ADD COLUMN IF NOT EXISTS goal text,
ADD COLUMN IF NOT EXISTS target_clients text,
ADD COLUMN IF NOT EXISTS company_address text,
ADD COLUMN IF NOT EXISTS residential_address text,
ADD COLUMN IF NOT EXISTS nature_of_business text,
ADD COLUMN IF NOT EXISTS phone_number text,
ADD COLUMN IF NOT EXISTS email text,
ADD COLUMN IF NOT EXISTS director_id_url text,
ADD COLUMN IF NOT EXISTS passport_url text;

-- 2. Create 'uploads' bucket if it doesn't exist
INSERT INTO storage.buckets (id, name, public)
VALUES ('uploads', 'uploads', true)
ON CONFLICT (id) DO NOTHING;

-- 3. Enable RLS on storage.objects if not already enabled (usually is by default)
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- 4. Create Storage Policies (Drop existing ones first to avoid conflicts if re-running)
DROP POLICY IF EXISTS "Authenticated users can upload files" ON storage.objects;
CREATE POLICY "Authenticated users can upload files"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'uploads' AND
  auth.role() = 'authenticated'
);

DROP POLICY IF EXISTS "Authenticated users can view files" ON storage.objects;
CREATE POLICY "Authenticated users can view files"
ON storage.objects FOR SELECT
USING (
  bucket_id = 'uploads' AND
  auth.role() = 'authenticated'
);

DROP POLICY IF EXISTS "Users can update own files" ON storage.objects;
CREATE POLICY "Users can update own files"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'uploads' AND
  auth.uid() = owner
);

DROP POLICY IF EXISTS "Users can delete own files" ON storage.objects;
CREATE POLICY "Users can delete own files"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'uploads' AND
  auth.uid() = owner
);
