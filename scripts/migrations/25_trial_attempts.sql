-- ================================================================
-- SK Driving — "Each Once" free trial attempts
-- Run in: Supabase Dashboard → SQL Editor → New Query → Run
--
-- A registered learner without paid access may take each Code 8 / Code 10
-- practice test ONCE, full length. One row per (user, course, test) records
-- the claim together with the account email and the IP address it came from,
-- so a second account from the same IP can be refused (see lib/trial.ts).
-- ================================================================

create table if not exists public.trial_attempts (
  id               bigint generated always as identity primary key,
  user_id          uuid not null references auth.users(id) on delete cascade,
  email            text not null,
  ip_address       text not null,
  user_agent       text,
  course_id        bigint not null,
  test_number      integer not null,
  started_at       timestamptz not null default now(),
  completed_at     timestamptz,
  score            integer,
  total_questions  integer,
  percentage       numeric,
  unique (user_id, course_id, test_number)
);

create index if not exists trial_attempts_ip_course
  on public.trial_attempts (ip_address, course_id);

-- No policies: only the service role (server code) reads or writes this table.
alter table public.trial_attempts enable row level security;
