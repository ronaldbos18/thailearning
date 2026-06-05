create extension if not exists pgcrypto;

create table if not exists learner_profile (
  id text primary key default 'solo',
  total_xp integer not null default 0 check (total_xp >= 0),
  player_level integer not null default 1 check (player_level >= 1),
  current_streak_days integer not null default 0 check (current_streak_days >= 0),
  longest_streak_days integer not null default 0 check (longest_streak_days >= 0),
  last_completed_day date,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists character_progress (
  character_id text primary key,
  mastery_level integer not null default 0 check (mastery_level between 0 and 5),
  correct_streak integer not null default 0 check (correct_streak >= 0),
  total_attempts integer not null default 0 check (total_attempts >= 0),
  total_correct integer not null default 0 check (total_correct >= 0),
  total_incorrect integer not null default 0 check (total_incorrect >= 0),
  traditional_correct_count integer not null default 0 check (traditional_correct_count >= 0),
  modern_correct_count integer not null default 0 check (modern_correct_count >= 0),
  both_fonts_correct_count integer not null default 0 check (both_fonts_correct_count >= 0),
  first_seen_at timestamptz,
  last_seen_at timestamptz,
  last_correct_at timestamptz,
  last_incorrect_at timestamptz,
  next_review_at timestamptz,
  confidence_state text not null default 'new' check (confidence_state in ('new', 'fresh', 'due', 'rusty')),
  mastered_at timestamptz,
  updated_at timestamptz not null default now()
);

create table if not exists answer_history (
  id uuid primary key default gen_random_uuid(),
  character_id text not null,
  shown_font_mode text not null check (shown_font_mode in ('traditional', 'modern', 'both')),
  selected_character_id text not null,
  is_correct boolean not null,
  question_source text not null,
  response_sequence bigint generated always as identity,
  answered_at timestamptz not null default now(),
  xp_awarded integer not null default 0 check (xp_awarded >= 0),
  question_token_hash text unique
);

create index if not exists answer_history_character_answered_idx on answer_history (character_id, answered_at desc);
create index if not exists answer_history_sequence_idx on answer_history (response_sequence desc);
create index if not exists character_progress_review_idx on character_progress (confidence_state, next_review_at);

create table if not exists daily_activity (
  activity_date date primary key,
  questions_attempted integer not null default 0 check (questions_attempted >= 0),
  correct_answers integer not null default 0 check (correct_answers >= 0),
  incorrect_answers integer not null default 0 check (incorrect_answers >= 0),
  new_characters_seen integer not null default 0 check (new_characters_seen >= 0),
  characters_mastered integer not null default 0 check (characters_mastered >= 0),
  rusty_characters_recovered integer not null default 0 check (rusty_characters_recovered >= 0),
  xp_earned integer not null default 0 check (xp_earned >= 0),
  daily_goal_completed boolean not null default false
);

create table if not exists practice_sessions (
  id uuid primary key default gen_random_uuid(),
  started_at timestamptz not null default now(),
  ended_at timestamptz,
  questions_attempted integer not null default 0 check (questions_attempted >= 0)
);
