-- ================================================================
-- SK Driving — Learn Mode explanations (DB-backed, reviewed before shown)
-- Run in: Supabase Dashboard → SQL Editor → New Query → Run
--
-- Each row is the deeper teaching content for one quiz question:
--   why             — plain-language reason the stored answer is correct
--   practical       — what the driver actually does on the road
--   common_mistake  — one line per wrong option saying why it is wrong
--   alt_questions    — jsonb array of exactly 2 traffic-department-style
--                     variants, each { question, options[], correct, reason }
--   related_href    — optional link to the Study Guide section
--
-- Content must match the question's stored correct_answer; the generator
-- flags (needs_review) rather than writing anything that would contradict it.
-- Learners only see rows where reviewed = true (unless the app_settings flag
-- learn_mode_show_unreviewed is true). Idempotent.
-- ================================================================

create table if not exists public.question_explanations (
  question_id    bigint primary key references public.quiz_questions(id) on delete cascade,
  why            text,
  practical      text,
  common_mistake text,
  alt_questions  jsonb not null default '[]'::jsonb,
  related_href   text,
  reviewed       boolean not null default false,
  needs_review   boolean not null default false,
  source         text,                      -- 'seed' | 'generated' | 'manual'
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now()
);

create index if not exists idx_question_explanations_reviewed on public.question_explanations(reviewed);
create index if not exists idx_question_explanations_needs_review on public.question_explanations(needs_review);

-- RLS on. Learners read through the public (anon) client, so allow SELECT of
-- reviewed rows to everyone; all writes go through the service-role key
-- (generator + admin routes), which bypasses RLS. Unreviewed rows are withheld
-- at the query in lib/learn-mode.ts, and this policy is the backstop.
alter table public.question_explanations enable row level security;

do $$ begin
  drop policy if exists "question_explanations_read_reviewed" on public.question_explanations;
  create policy "question_explanations_read_reviewed"
    on public.question_explanations for select
    using (reviewed = true);
end $$;
