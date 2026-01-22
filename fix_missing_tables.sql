-- Run this script to create the missing tables that might have failed previously.

-- 1. DESIGN_REQUESTS
CREATE TABLE IF NOT EXISTS public.design_requests (
  id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id uuid REFERENCES public.profiles(id) NOT NULL,
  business_id uuid REFERENCES public.businesses(id),
  request_type text, -- 'logo', 'flyer', 'other'
  description text,
  status text DEFAULT 'pending',
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. ASSETS
CREATE TABLE IF NOT EXISTS public.assets (
  id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id uuid REFERENCES public.profiles(id) NOT NULL,
  business_id uuid REFERENCES public.businesses(id),
  type text, -- 'logo', 'flyer'
  asset_url text, -- URL or base64 data
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. CONSULTATIONS
CREATE TABLE IF NOT EXISTS public.consultations (
  id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id uuid REFERENCES public.profiles(id) NOT NULL,
  expert_name text,
  topic text,
  scheduled_at timestamp with time zone,
  status text DEFAULT 'scheduled', -- 'scheduled', 'completed', 'cancelled'
  meeting_link text,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 4. COMPLIANCE_RECORDS
CREATE TABLE IF NOT EXISTS public.compliance_records (
  id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  business_id uuid REFERENCES public.businesses(id) NOT NULL,
  compliance_type text, -- 'tax', 'annual_returns', 'license'
  due_date date,
  status text DEFAULT 'pending', -- 'pending', 'submitted', 'approved'
  document_url text,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 5. Enable RLS for these tables
ALTER TABLE public.design_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.assets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.consultations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.compliance_records ENABLE ROW LEVEL SECURITY;

-- 6. Create Policies (Drop first to avoid errors if they exist)
DROP POLICY IF EXISTS "Users can view own design requests" ON public.design_requests;
CREATE POLICY "Users can view own design requests" ON public.design_requests FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own design requests" ON public.design_requests;
CREATE POLICY "Users can insert own design requests" ON public.design_requests FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can view own assets" ON public.assets;
CREATE POLICY "Users can view own assets" ON public.assets FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own assets" ON public.assets;
CREATE POLICY "Users can insert own assets" ON public.assets FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can view own consultations" ON public.consultations;
CREATE POLICY "Users can view own consultations" ON public.consultations FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own consultations" ON public.consultations;
CREATE POLICY "Users can insert own consultations" ON public.consultations FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can view own compliance_records" ON public.compliance_records;
CREATE POLICY "Users can view own compliance_records" ON public.compliance_records FOR SELECT USING (auth.uid() = (SELECT user_id FROM public.businesses WHERE id = business_id));
