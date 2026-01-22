-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- PROFILES (Extends auth.users)
create table public.profiles (
  id uuid references auth.users not null primary key,
  email text,
  first_name text,
  last_name text,
  display_name text,
  phone_number text,
  avatar_url text,
  business_type text check (business_type in ('new', 'old')), -- 'new' or 'old'
  role text default 'user' check (role in ('user', 'consultant', 'admin')),
  onboarding_completed boolean default false,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- BUSINESSES (Stores business details)
create table public.businesses (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.profiles(id) not null,
  name text,
  description text,
  industry text,
  stage text, -- 'idea', 'startup', 'growth', 'established'
  registration_status text default 'not_registered', -- 'not_registered', 'pending', 'registered'
  rc_number text, -- For existing businesses
  has_logo boolean default false,
  logo_url text,
  slogan text,
  
  -- Additional fields for onboarding flow
  goal text,
  target_clients text,
  company_address text,
  residential_address text,
  nature_of_business text,
  phone_number text, -- Business phone
  email text, -- Business email
  director_id_url text,
  passport_url text,
  
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- ONBOARDING_CHECKLIST (Tracks user progress)
create table public.onboarding_checklist (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.profiles(id) not null,
  step_key text not null, -- e.g., 'business_details', 'registration', 'branding'
  title text not null,
  description text,
  status text default 'pending', -- 'pending', 'in_progress', 'completed'
  is_locked boolean default false,
  action_url text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- AI_ANALYSES (History of AI validations)
create table public.ai_analyses (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.profiles(id), -- Can be null if guest, but we usually save after auth
  business_idea text,
  generated_name text,
  generated_slogan text,
  success_score integer,
  analysis_json jsonb, -- Full analysis data
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- ASSETS (Logos, Flyers, etc.)
create table public.assets (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.profiles(id) not null,
  business_id uuid references public.businesses(id),
  type text, -- 'logo', 'flyer'
  asset_url text, -- URL or base64 data
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- DESIGN_REQUESTS (For manual design requests)
create table public.design_requests (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.profiles(id) not null,
  business_id uuid references public.businesses(id),
  request_type text, -- 'logo', 'flyer', 'other'
  description text,
  status text default 'pending',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- CONSULTATIONS (Booking records)
create table public.consultations (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.profiles(id) not null,
  expert_name text,
  topic text,
  scheduled_at timestamp with time zone,
  status text default 'scheduled', -- 'scheduled', 'completed', 'cancelled'
  meeting_link text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- COMPLIANCE_RECORDS
create table public.compliance_records (
  id uuid default uuid_generate_v4() primary key,
  business_id uuid references public.businesses(id) not null,
  compliance_type text, -- 'tax', 'annual_returns', 'license'
  due_date date,
  status text default 'pending', -- 'pending', 'submitted', 'approved'
  document_url text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- HELPER FUNCTION TO PREVENT INFINITE RECURSION IN RLS
create or replace function public.is_consultant()
returns boolean as $$
begin
  return exists (
    select 1 from public.profiles
    where id = auth.uid() and role = 'consultant'
  );
end;
$$ language plpgsql security definer;

-- RLS POLICIES (Basic examples)
alter table public.profiles enable row level security;
create policy "Users can view own profile" on public.profiles for select using (auth.uid() = id);
create policy "Users can update own profile" on public.profiles for update using (auth.uid() = id);

alter table public.businesses enable row level security;
create policy "Users can view own business" on public.businesses for select using (auth.uid() = user_id);
create policy "Users can insert own business" on public.businesses for insert with check (auth.uid() = user_id);
create policy "Users can update own business" on public.businesses for update using (auth.uid() = user_id);

alter table public.onboarding_checklist enable row level security;
create policy "Users can view own checklist" on public.onboarding_checklist for select using (auth.uid() = user_id);
create policy "Users can update own checklist" on public.onboarding_checklist for update using (auth.uid() = user_id);
create policy "Users can insert own checklist" on public.onboarding_checklist for insert with check (auth.uid() = user_id);

alter table public.assets enable row level security;
create policy "Users can view own assets" on public.assets for select using (auth.uid() = user_id);
create policy "Users can insert own assets" on public.assets for insert with check (auth.uid() = user_id);

alter table public.design_requests enable row level security;
create policy "Users can view own design requests" on public.design_requests for select using (auth.uid() = user_id);
create policy "Users can insert own design requests" on public.design_requests for insert with check (auth.uid() = user_id);


-- TRIGGER for New User Profile
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email, first_name, last_name, display_name, phone_number)
  values (
    new.id, 
    new.email, 
    new.raw_user_meta_data->>'first_name', 
    new.raw_user_meta_data->>'last_name', 
    new.raw_user_meta_data->>'display_name',
    new.raw_user_meta_data->>'phone_number'
  );
  return new;
end;
$$ language plpgsql security definer;

-- Drop trigger if exists to avoid error on re-run
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- STORAGE BUCKET (Create 'uploads' bucket if not exists)
insert into storage.buckets (id, name, public)
values ('uploads', 'uploads', true)
on conflict (id) do nothing;

-- STORAGE POLICIES
-- Allow authenticated users to upload files to 'uploads' bucket
create policy "Authenticated users can upload files"
on storage.objects for insert
with check (
  bucket_id = 'uploads' and
  auth.role() = 'authenticated'
);

-- Allow authenticated users to view files in 'uploads' bucket
create policy "Authenticated users can view files"
on storage.objects for select
using (
  bucket_id = 'uploads' and
  auth.role() = 'authenticated'
);

-- Allow users to update their own files (optional, but good for re-uploads)
create policy "Users can update own files"
on storage.objects for update
using (
  bucket_id = 'uploads' and
  auth.uid() = owner
);

-- Allow users to delete their own files
create policy "Users can delete own files"
on storage.objects for delete
using (
  bucket_id = 'uploads' and
  auth.uid() = owner
);
