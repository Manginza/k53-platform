-- ================================================================
-- LIVE NOTES — K53 Road Signs Manual Schema
-- Run in: Supabase Dashboard → SQL Editor → New Query → Run
-- ================================================================

-- 1. CHAPTERS
create table if not exists public.ln_chapters (
  id                uuid primary key default gen_random_uuid(),
  manual_slug       text not null default 'k53-road-signs-2012',
  chapter_number    int,
  title             text not null,
  description       text,
  section_reference text,
  page_start        int not null,
  page_end          int not null,
  total_pages       int generated always as (page_end - page_start + 1) stored,
  pass_threshold    int not null default 70,
  display_order     int not null,
  is_front_matter   boolean not null default false,
  created_at        timestamptz not null default now()
);

-- 2. PAGES
create table if not exists public.ln_pages (
  id           uuid primary key default gen_random_uuid(),
  chapter_id   uuid references public.ln_chapters(id) on delete cascade,
  page_number  int not null,
  storage_path text not null,
  alt_text     text,
  created_at   timestamptz not null default now(),
  unique (page_number)
);

-- 3. QUIZZES
create table if not exists public.ln_quizzes (
  id                 uuid primary key default gen_random_uuid(),
  chapter_id         uuid not null references public.ln_chapters(id) on delete cascade,
  title              text not null,
  instructions       text default 'Choose the best answer for each question. You can review your answers at the end.',
  time_limit_seconds int,
  created_at         timestamptz not null default now(),
  unique (chapter_id)
);

-- 4. QUESTIONS
create table if not exists public.ln_questions (
  id              uuid primary key default gen_random_uuid(),
  quiz_id         uuid not null references public.ln_quizzes(id) on delete cascade,
  question_number int not null,
  question_text   text not null,
  question_type   text not null default 'single_choice',
  explanation     text not null,
  source_page     int,
  difficulty      text default 'medium',
  created_at      timestamptz not null default now(),
  unique (quiz_id, question_number)
);

-- 5. OPTIONS
create table if not exists public.ln_question_options (
  id           uuid primary key default gen_random_uuid(),
  question_id  uuid not null references public.ln_questions(id) on delete cascade,
  option_label text not null,
  option_text  text not null,
  is_correct   boolean not null default false,
  created_at   timestamptz not null default now(),
  unique (question_id, option_label)
);

-- 6. USER PROGRESS
create table if not exists public.ln_user_chapter_progress (
  id               uuid primary key default gen_random_uuid(),
  user_id          uuid not null references auth.users(id) on delete cascade,
  chapter_id       uuid not null references public.ln_chapters(id) on delete cascade,
  last_page_viewed int,
  pages_read       int not null default 0,
  marked_complete  boolean not null default false,
  completed_at     timestamptz,
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now(),
  unique (user_id, chapter_id)
);

-- 7. QUIZ ATTEMPTS
create table if not exists public.ln_quiz_attempts (
  id               uuid primary key default gen_random_uuid(),
  user_id          uuid not null references auth.users(id) on delete cascade,
  quiz_id          uuid not null references public.ln_quizzes(id) on delete cascade,
  score_percent    numeric(5,2) not null,
  correct_count    int not null,
  total_questions  int not null,
  passed           boolean not null,
  duration_seconds int,
  started_at       timestamptz not null,
  completed_at     timestamptz not null default now(),
  answers          jsonb not null
);

-- INDEXES
create index if not exists ln_pages_chapter_idx     on public.ln_pages(chapter_id);
create index if not exists ln_questions_quiz_idx    on public.ln_questions(quiz_id);
create index if not exists ln_options_question_idx  on public.ln_question_options(question_id);
create index if not exists ln_progress_user_idx     on public.ln_user_chapter_progress(user_id);
create index if not exists ln_attempts_user_idx     on public.ln_quiz_attempts(user_id);

-- SAFE VIEW — hides is_correct from clients before quiz submission
-- security_invoker = true means RLS on the underlying table still applies
create or replace view public.ln_question_options_public
  with (security_invoker = true) as
  select id, question_id, option_label, option_text
  from public.ln_question_options;

-- RLS
alter table public.ln_chapters              enable row level security;
alter table public.ln_pages                 enable row level security;
alter table public.ln_quizzes               enable row level security;
alter table public.ln_questions             enable row level security;
alter table public.ln_question_options      enable row level security;
alter table public.ln_user_chapter_progress enable row level security;
alter table public.ln_quiz_attempts         enable row level security;

-- POLICIES (idempotent drop + create)
do $$ begin
  drop policy if exists "ln_chapters_read"   on public.ln_chapters;
  drop policy if exists "ln_pages_read"      on public.ln_pages;
  drop policy if exists "ln_quizzes_read"    on public.ln_quizzes;
  drop policy if exists "ln_questions_read"  on public.ln_questions;
  drop policy if exists "ln_options_read"    on public.ln_question_options;
  drop policy if exists "ln_progress_read"   on public.ln_user_chapter_progress;
  drop policy if exists "ln_progress_write"  on public.ln_user_chapter_progress;
  drop policy if exists "ln_progress_update" on public.ln_user_chapter_progress;
  drop policy if exists "ln_attempts_read"   on public.ln_quiz_attempts;
  drop policy if exists "ln_attempts_write"  on public.ln_quiz_attempts;

  create policy "ln_chapters_read"   on public.ln_chapters              for select to authenticated using (true);
  create policy "ln_pages_read"      on public.ln_pages                 for select to authenticated using (true);
  create policy "ln_quizzes_read"    on public.ln_quizzes               for select to authenticated using (true);
  create policy "ln_questions_read"  on public.ln_questions             for select to authenticated using (true);
  create policy "ln_options_read"    on public.ln_question_options      for select to authenticated using (true);
  create policy "ln_progress_read"   on public.ln_user_chapter_progress for select to authenticated using (auth.uid() = user_id);
  create policy "ln_progress_write"  on public.ln_user_chapter_progress for insert to authenticated with check (auth.uid() = user_id);
  create policy "ln_progress_update" on public.ln_user_chapter_progress for update to authenticated using (auth.uid() = user_id);
  create policy "ln_attempts_read"   on public.ln_quiz_attempts         for select to authenticated using (auth.uid() = user_id);
  create policy "ln_attempts_write"  on public.ln_quiz_attempts         for insert to authenticated with check (auth.uid() = user_id);
end $$;

-- ================================================================
-- RPC: ln_submit_quiz — scores quiz server-side; never exposes is_correct
-- ================================================================
create or replace function public.ln_submit_quiz(
  p_quiz_id          uuid,
  p_answers          jsonb,        -- [{question_id, option_id}]
  p_started_at       timestamptz,
  p_duration_seconds int
) returns table (
  attempt_id      uuid,
  score_percent   numeric,
  correct_count   int,
  total_questions int,
  passed          boolean,
  detail          jsonb
)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user_id          uuid := auth.uid();
  v_total            int;
  v_correct          int := 0;
  v_pass_threshold   int;
  v_score            numeric;
  v_passed           boolean;
  v_attempt_id       uuid;
  v_detail           jsonb := '[]'::jsonb;
  v_answer           jsonb;
  v_correct_opt_id   uuid;
  v_is_correct       boolean;
begin
  if v_user_id is null then
    raise exception 'Not authenticated';
  end if;

  select count(*) into v_total
    from public.ln_questions where quiz_id = p_quiz_id;

  select c.pass_threshold into v_pass_threshold
    from public.ln_quizzes q
    join public.ln_chapters c on c.id = q.chapter_id
   where q.id = p_quiz_id;

  for v_answer in select * from jsonb_array_elements(p_answers) loop
    select id into v_correct_opt_id
      from public.ln_question_options
     where question_id = (v_answer->>'question_id')::uuid
       and is_correct = true
     limit 1;

    v_is_correct := (v_correct_opt_id = (v_answer->>'option_id')::uuid);
    if v_is_correct then v_correct := v_correct + 1; end if;

    v_detail := v_detail || jsonb_build_object(
      'question_id',       v_answer->>'question_id',
      'selected_option_id', v_answer->>'option_id',
      'correct_option_id', v_correct_opt_id,
      'is_correct',        v_is_correct
    );
  end loop;

  v_score  := round((v_correct::numeric / nullif(v_total, 0)) * 100, 2);
  v_passed := v_score >= v_pass_threshold;

  insert into public.ln_quiz_attempts (
    user_id, quiz_id, score_percent, correct_count, total_questions,
    passed, duration_seconds, started_at, answers
  ) values (
    v_user_id, p_quiz_id, v_score, v_correct, v_total,
    v_passed, p_duration_seconds, p_started_at, v_detail
  ) returning id into v_attempt_id;

  return query select v_attempt_id, v_score, v_correct, v_total, v_passed, v_detail;
end;
$$;

grant execute on function public.ln_submit_quiz to authenticated;
