-- Create the completed_missions table
create table if not exists completed_missions (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users not null,
  mission_date date not null,
  category text not null check (category in ('morning', 'day', 'night')),
  xp_earned integer default 0,
  completed_at timestamp with time zone default timezone('utc'::text, now()) not null,
  
  -- Ensure a user can only complete a specific category once per day
  unique(user_id, mission_date, category)
);

-- Enable Row Level Security
alter table completed_missions enable row level security;

-- Policy: Users can insert their own missions
create policy "Users can insert their own missions" 
on completed_missions for insert 
with check (auth.uid() = user_id);

-- Policy: Users can view their own missions
create policy "Users can view their own missions" 
on completed_missions for select 
using (auth.uid() = user_id);
