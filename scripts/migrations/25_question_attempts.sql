-- ================================================================
-- SK Driving — per-user-per-question attempt tracking (Learn Mode)
-- Run in: Supabase Dashboard → SQL Editor → New Query → Run
--
-- Learn Mode auto-shows the explanation panel the FIRST time a learner
-- answers a given question, and again whenever they answer it wrong. That
-- decision needs a durable, cross-session, cross-device record of how many
-- times this user has answered this question and whether they last got it
-- right. quiz_attempts / user_answers only record completed attempts keyed by
-- attempt_id, so they cannot answer "is this the first time THIS user has
-- seen THIS question?" cheaply at answer time — hence this table.
--
-- One row per (user, question). RLS: a user only ever sees their own rows.
-- Idempotent.
-- ================================================================

create table if not exists public.question_attempts (
  id                 uuid primary key default gen_random_uuid(),
  user_id            uuid   not null references auth.users(id)        on delete cascade,
  question_id        bigint not null references public.quiz_questions(id) on delete cascade,
  attempt_count      integer not null default 0,
  last_correct       boolean,
  first_attempted_at timestamptz not null default now(),
  last_attempted_at  timestamptz not null default now(),
  unique (user_id, question_id)
);

create index if not exists idx_question_attempts_user on public.question_attempts(user_id);

-- Only the row owner may read or write. The record route uses the user's own
-- session (anon key), so these policies are what let the write through.
alter table public.question_attempts enable row level security;

do $$ begin
  drop policy if exists "question_attempts_select_own" on public.question_attempts;
  drop policy if exists "question_attempts_insert_own" on public.question_attempts;
  drop policy if exists "question_attempts_update_own" on public.question_attempts;

  create policy "question_attempts_select_own"
    on public.question_attempts for select to authenticated
    using (auth.uid() = user_id);
  create policy "question_attempts_insert_own"
    on public.question_attempts for insert to authenticated
    with check (auth.uid() = user_id);
  create policy "question_attempts_update_own"
    on public.question_attempts for update to authenticated
    using (auth.uid() = user_id) with check (auth.uid() = user_id);
end $$;
