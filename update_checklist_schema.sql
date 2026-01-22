ALTER TABLE public.onboarding_checklist ADD COLUMN IF NOT EXISTS business_id uuid REFERENCES public.businesses(id) ON DELETE CASCADE;

-- Optional: Clear old checklist items if you want a fresh start
-- DELETE FROM public.onboarding_checklist;
