-- Add cac_certificate_url to businesses table
ALTER TABLE public.businesses ADD COLUMN IF NOT EXISTS cac_certificate_url text;
