-- Run this script to fix the "Could not find column" error.
-- This only updates the 'businesses' table and should not cause permission errors.

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
