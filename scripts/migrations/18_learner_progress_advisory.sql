-- Learner advisory and cross-device progress support.
-- Extends the existing practice-attempt model without changing scoring/content.

alter table public.quiz_attempts
  add column if not exists submission_key uuid,
  add column if not exists test_name text,
  add column if not exists licence_code text,
  add column if not exists percentage numeric(5,2),
  add column if not exists result_passed boolean,
  add column if not exists is_final boolean not null default false,
  add column if not exists category_scores jsonb not null default '{}'::jsonb;

create unique index if not exists quiz_attempts_user_submission_uidx
  on public.quiz_attempts(user_id, submission_key)
  where submission_key is not null;

create unique index if not exists user_answers_attempt_question_uidx
  on public.user_answers(attempt_id, question_id);

create index if not exists quiz_attempts_user_course_test_idx
  on public.quiz_attempts(user_id, course_id, test_number, completed_at desc);

create table if not exists public.learner_section_progress (
  id              uuid primary key default gen_random_uuid(),
  user_id         uuid not null references auth.users(id) on delete cascade,
  section         text not null check (section in ('live_notes', 'road_rules')),
  visit_count     integer not null default 0,
  completed_items text[] not null default '{}',
  first_visited_at timestamptz,
  last_visited_at  timestamptz,
  completed_at     timestamptz,
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now(),
  unique (user_id, section)
);

alter table public.learner_section_progress enable row level security;

do $$ begin
  drop policy if exists "learner_section_progress_read" on public.learner_section_progress;
  drop policy if exists "learner_section_progress_insert" on public.learner_section_progress;
  drop policy if exists "learner_section_progress_update" on public.learner_section_progress;

  create policy "learner_section_progress_read"
    on public.learner_section_progress for select to authenticated
    using (auth.uid() = user_id);
  create policy "learner_section_progress_insert"
    on public.learner_section_progress for insert to authenticated
    with check (auth.uid() = user_id);
  create policy "learner_section_progress_update"
    on public.learner_section_progress for update to authenticated
    using (auth.uid() = user_id) with check (auth.uid() = user_id);
end $$;

