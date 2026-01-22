-- Add role to profiles
alter table public.profiles 
add column if not exists role text default 'user' check (role in ('user', 'consultant', 'admin'));

-- CONSULTANTS (Extra details for consultants)
create table if not exists public.consultants (
  id uuid references public.profiles(id) not null primary key,
  specialization text, -- 'legal', 'design', 'general'
  availability_status text default 'available', -- 'available', 'busy', 'offline'
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- TASK ASSIGNMENTS
create table if not exists public.task_assignments (
  id uuid default uuid_generate_v4() primary key,
  consultant_id uuid references public.profiles(id),
  task_type text, -- 'cac_verification', 'design_request', 'compliance_review'
  reference_id uuid not null, -- ID of the business, design_request, or compliance_record
  status text default 'pending', -- 'pending', 'in_progress', 'completed'
  due_date timestamp with time zone,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- NOTIFICATIONS
create table if not exists public.notifications (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.profiles(id) not null,
  title text not null,
  message text not null,
  type text, -- 'info', 'success', 'warning', 'error'
  is_read boolean default false,
  action_url text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- MESSAGES
create table if not exists public.messages (
  id uuid default uuid_generate_v4() primary key,
  sender_id uuid references public.profiles(id) not null,
  receiver_id uuid references public.profiles(id) not null,
  content text,
  attachment_url text,
  is_read boolean default false,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Update Compliance Records
alter table public.compliance_records 
add column if not exists cac_status text default 'pending', -- 'approved', 'rejected', 'needs_more_documents'
add column if not exists remarks text;

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

-- RLS POLICIES FOR CONSULTANTS

-- Profiles: Consultants can view all profiles (to see user details)
-- We use the security definer function to avoid infinite recursion
drop policy if exists "Consultants can view all profiles" on public.profiles;
create policy "Consultants can view all profiles" 
on public.profiles for select 
using (
  public.is_consultant()
);

-- Businesses: Consultants can view and update all businesses
drop policy if exists "Consultants can view all businesses" on public.businesses;
create policy "Consultants can view all businesses" 
on public.businesses for select 
using (
  public.is_consultant()
);

drop policy if exists "Consultants can update all businesses" on public.businesses;
create policy "Consultants can update all businesses" 
on public.businesses for update 
using (
  public.is_consultant()
);

-- Design Requests: Consultants can view and update all
drop policy if exists "Consultants can view all design requests" on public.design_requests;
create policy "Consultants can view all design requests" 
on public.design_requests for select 
using (
  public.is_consultant()
);

drop policy if exists "Consultants can update all design requests" on public.design_requests;
create policy "Consultants can update all design requests" 
on public.design_requests for update 
using (
  public.is_consultant()
);

-- Compliance Records: Consultants can view and update all
drop policy if exists "Consultants can view all compliance records" on public.compliance_records;
create policy "Consultants can view all compliance records" 
on public.compliance_records for select 
using (
  public.is_consultant()
);

drop policy if exists "Consultants can update all compliance records" on public.compliance_records;
create policy "Consultants can update all compliance records" 
on public.compliance_records for update 
using (
  public.is_consultant()
);

-- Task Assignments: Consultants can view/update their own tasks
alter table public.task_assignments enable row level security;
drop policy if exists "Consultants can view own tasks" on public.task_assignments;
create policy "Consultants can view own tasks" 
on public.task_assignments for select 
using (auth.uid() = consultant_id);

drop policy if exists "Consultants can update own tasks" on public.task_assignments;
create policy "Consultants can update own tasks" 
on public.task_assignments for update 
using (auth.uid() = consultant_id);

-- Notifications: Users view their own
alter table public.notifications enable row level security;
drop policy if exists "Users can view own notifications" on public.notifications;
create policy "Users can view own notifications" 
on public.notifications for select 
using (auth.uid() = user_id);

-- Messages: Users view messages sent to or by them
alter table public.messages enable row level security;
drop policy if exists "Users can view own messages" on public.messages;
create policy "Users can view own messages" 
on public.messages for select 
using (auth.uid() = sender_id or auth.uid() = receiver_id);

drop policy if exists "Users can insert messages" on public.messages;
create policy "Users can insert messages" 
on public.messages for insert 
with check (auth.uid() = sender_id);
