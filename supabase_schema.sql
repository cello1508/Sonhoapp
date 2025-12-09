-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- 1. Users table (Extends Supabase Auth)
-- Note: Supabase handles auth.users. We create a public.users profile table.
create table public.users (
  id uuid references auth.users not null primary key,
  name text,
  email text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  timezone text default 'America/Sao_Paulo',
  preferences jsonb default '{}'::jsonb
);

-- Enable RLS
alter table public.users enable row level security;
-- Policies
create policy "Users can view their own profile" on public.users for select using (auth.uid() = id);
create policy "Users can update their own profile" on public.users for update using (auth.uid() = id);
create policy "Users can insert their own profile" on public.users for insert with check (auth.uid() = id);

-- Trigger to create profile on signup
create function public.handle_new_user() 
returns trigger as $$
begin
  insert into public.users (id, email)
  values (new.id, new.email);
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();


-- 2. Nights table
create table public.nights (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.users(id) not null,
  date date not null,
  sleep_start timestamp with time zone,
  sleep_end timestamp with time zone,
  sleep_quality int2 check (sleep_quality between 1 and 5),
  pre_sleep_routine_completed boolean default false,
  post_sleep_routine_completed boolean default false,
  techniques_used text[] default null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.nights enable row level security;
create policy "Users can view their own nights" on public.nights for select using (auth.uid() = user_id);
create policy "Users can insert their own nights" on public.nights for insert with check (auth.uid() = user_id);
create policy "Users can update their own nights" on public.nights for update using (auth.uid() = user_id);
create policy "Users can delete their own nights" on public.nights for delete using (auth.uid() = user_id);


-- 3. Dreams table
create table public.dreams (
  id uuid default uuid_generate_v4() primary key,
  night_id uuid references public.nights(id) on delete cascade not null,
  user_id uuid references public.users(id) not null,
  title text,
  raw_text text,
  lucid boolean default false,
  lucidity_level int2 check (lucidity_level between 0 and 5),
  emotion_main text,
  emotions text[],
  tags text[],
  recall_clarity int2 check (recall_clarity between 0 and 5),
  voice_note_url text,
  cover_image text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.dreams enable row level security;
create policy "Users can view their own dreams" on public.dreams for select using (auth.uid() = user_id);
create policy "Users can insert their own dreams" on public.dreams for insert with check (auth.uid() = user_id);
create policy "Users can update their own dreams" on public.dreams for update using (auth.uid() = user_id);
create policy "Users can delete their own dreams" on public.dreams for delete using (auth.uid() = user_id);


-- 4. Reality Checks
create table public.reality_checks (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.users(id) not null,
  timestamp timestamp with time zone default timezone('utc'::text, now()) not null,
  trigger_type text,
  check_type text,
  completed boolean default false,
  user_answer text,
  perceived_state text,
  context jsonb default '{}'::jsonb,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.reality_checks enable row level security;
create policy "Users can view their own reality checks" on public.reality_checks for select using (auth.uid() = user_id);
create policy "Users can insert their own reality checks" on public.reality_checks for insert with check (auth.uid() = user_id);


-- 5. Daily Metrics
create table public.daily_metrics (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.users(id) not null,
  date date not null,
  dreams_remembered_count int default 0,
  lucid_dreams_count int default 0,
  reality_checks_completed int default 0,
  pre_sleep_routine_completed boolean default false,
  current_streak_days int default 0,
  longest_streak_days int default 0,
  technique_usage jsonb default '{}'::jsonb,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique(user_id, date)
);

alter table public.daily_metrics enable row level security;
create policy "Users can view their own metrics" on public.daily_metrics for select using (auth.uid() = user_id);
create policy "Users can insert their own metrics" on public.daily_metrics for insert with check (auth.uid() = user_id);
create policy "Users can update their own metrics" on public.daily_metrics for update using (auth.uid() = user_id);
