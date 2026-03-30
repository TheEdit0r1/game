-- Queen June's Royal Game — Supabase Schema
-- Run this in the Supabase SQL editor

-- Profiles (single row for June)
create table if not exists profiles (
  id uuid primary key default gen_random_uuid(),
  total_points int not null default 0,
  master_pin text,
  created_at timestamptz default now()
);

-- Point events log
create table if not exists point_events (
  id uuid primary key default gen_random_uuid(),
  source text not null,
  amount int not null,
  created_at timestamptz default now()
);

-- Prizes
create table if not exists prizes (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  cost int not null,
  tier text not null, -- 'tier1' | 'tier2' | 'tier3' | 'tier4'
  prize_type text not null default 'standard', -- 'standard' | 'iou' | 'timer' | 'wildcard'
  emoji text,
  is_secret bool not null default false,
  is_active bool not null default true
);

-- Prize claims
create table if not exists prize_claims (
  id uuid primary key default gen_random_uuid(),
  prize_id uuid references prizes(id),
  status text not null default 'pending', -- 'pending' | 'approved' | 'declined'
  master_note text,
  claimed_at timestamptz default now()
);

-- Dungeon requests
create table if not exists dungeon_requests (
  id uuid primary key default gen_random_uuid(),
  text text not null,
  category text not null,
  status text not null default 'pending', -- 'pending' | 'approved' | 'declined'
  master_note text,
  created_at timestamptz default now()
);

-- Dice tasks (editable)
create table if not exists dice_tasks (
  id uuid primary key default gen_random_uuid(),
  task_text text not null
);

-- Quiz questions
create table if not exists quiz_questions (
  id uuid primary key default gen_random_uuid(),
  question text not null,
  answers jsonb not null, -- array of 4 strings
  correct_index int not null -- 0-3, or -1 for "all correct"
);

-- Seed dice tasks
insert into dice_tasks (task_text) values
  ('slave must bow for 10 seconds 👑'),
  ('slave must compliment the Queen 3 times'),
  ('slave must ask permission before speaking for the next 5 minutes'),
  ('slave must fetch the Queen a snack or drink of her choice'),
  ('slave must write "I serve the Queen" 10 times'),
  ('slave must perform a dramatic bow and say "As you wish, Your Highness"'),
  ('Queen decides the next activity for the next 30 minutes'),
  ('slave must speak only in compliments for the next 3 minutes'),
  ('The Queen gets to choose any task she likes — no negotiation');

-- Seed a profile row
insert into profiles (total_points) values (0);

-- Disable RLS for simplicity (single-user app with PIN gate)
alter table profiles disable row level security;
alter table point_events disable row level security;
alter table prizes disable row level security;
alter table prize_claims disable row level security;
alter table dungeon_requests disable row level security;
alter table dice_tasks disable row level security;
alter table quiz_questions disable row level security;
