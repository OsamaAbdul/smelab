-- Add columns to businesses table
alter table public.businesses 
add column if not exists proprietor_dob date,
add column if not exists proprietor_id_type text, -- 'nin', 'voters_card', 'drivers_license', 'intl_passport'
add column if not exists proprietor_id_number text,
add column if not exists proprietor_id_url text, -- URL to the uploaded ID document
add column if not exists business_activities text,
add column if not exists business_category text; -- e.g. 'IT', 'Fashion', etc.

-- Create business_partners table
create table if not exists public.business_partners (
  id uuid default uuid_generate_v4() primary key,
  business_id uuid references public.businesses(id) on delete cascade not null,
  full_name text not null,
  email text,
  phone text,
  address text,
  passport_url text,
  id_url text,
  ownership_percentage numeric,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- RLS for business_partners
alter table public.business_partners enable row level security;

-- Users can view partners of their own businesses
create policy "Users can view own business partners" 
on public.business_partners for select 
using (
  exists (
    select 1 from public.businesses 
    where id = public.business_partners.business_id 
    and user_id = auth.uid()
  )
);

-- Users can insert partners to their own businesses
create policy "Users can insert own business partners" 
on public.business_partners for insert 
with check (
  exists (
    select 1 from public.businesses 
    where id = public.business_partners.business_id 
    and user_id = auth.uid()
  )
);

-- Users can update partners of their own businesses
create policy "Users can update own business partners" 
on public.business_partners for update 
using (
  exists (
    select 1 from public.businesses 
    where id = public.business_partners.business_id 
    and user_id = auth.uid()
  )
);

-- Users can delete partners of their own businesses
create policy "Users can delete own business partners" 
on public.business_partners for delete 
using (
  exists (
    select 1 from public.businesses 
    where id = public.business_partners.business_id 
    and user_id = auth.uid()
  )
);

-- Consultants can view all business partners
-- Use the helper function to avoid recursion if needed, or direct check if safe
create policy "Consultants can view all business partners" 
on public.business_partners for select 
using (
  public.is_consultant()
);
