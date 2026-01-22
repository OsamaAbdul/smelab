-- Update handle_new_user to include role and handle full_name
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (
    id, 
    email, 
    first_name, 
    last_name, 
    display_name, 
    phone_number, 
    role
  )
  values (
    new.id, 
    new.email, 
    -- Try to split full_name if first_name is missing
    coalesce(new.raw_user_meta_data->>'first_name', split_part(new.raw_user_meta_data->>'full_name', ' ', 1)),
    coalesce(new.raw_user_meta_data->>'last_name', split_part(new.raw_user_meta_data->>'full_name', ' ', 2)),
    coalesce(new.raw_user_meta_data->>'display_name', new.raw_user_meta_data->>'full_name'),
    new.raw_user_meta_data->>'phone_number',
    coalesce(new.raw_user_meta_data->>'role', 'user') -- Default to 'user'
  );
  return new;
end;
$$ language plpgsql security definer;
