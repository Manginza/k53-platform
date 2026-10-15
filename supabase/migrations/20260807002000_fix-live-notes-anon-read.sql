-- ================================================================
-- Fix: Live Notes and K53 Unpacked content invisible to anonymous
-- visitors (including everyone using the app during the free promo,
-- and paid members whose auth cookie hasn't landed yet).
--
-- The ln_* and ku_* content tables were originally created with
-- `for select TO authenticated` policies, but the app-level gate
-- (`hasFullAccess()`) is the actual access control — the content
-- itself (Dept. of Transport public manual pages, quiz questions)
-- is not secret. Align with the pattern used by `courses` and
-- `quiz_questions`, which are anon-readable.
--
-- Progress and attempts stay authenticated-only (they are per-user).
-- ================================================================

do $$ begin
  -- Live Notes — Road Traffic Signs Manual
  drop policy if exists "ln_chapters_read"  on public.ln_chapters;
  drop policy if exists "ln_pages_read"     on public.ln_pages;
  drop policy if exists "ln_quizzes_read"   on public.ln_quizzes;
  drop policy if exists "ln_questions_read" on public.ln_questions;
  drop policy if exists "ln_options_read"   on public.ln_question_options;

  create policy "ln_chapters_read"  on public.ln_chapters         for select to public using (true);
  create policy "ln_pages_read"     on public.ln_pages            for select to public using (true);
  create policy "ln_quizzes_read"   on public.ln_quizzes          for select to public using (true);
  create policy "ln_questions_read" on public.ln_questions        for select to public using (true);
  create policy "ln_options_read"   on public.ln_question_options for select to public using (true);

  -- K53 Unpacked
  drop policy if exists "ku_chapters_read"  on public.ku_chapters;
  drop policy if exists "ku_pages_read"     on public.ku_pages;
  drop policy if exists "ku_quizzes_read"   on public.ku_quizzes;
  drop policy if exists "ku_questions_read" on public.ku_questions;
  drop policy if exists "ku_options_read"   on public.ku_question_options;

  create policy "ku_chapters_read"  on public.ku_chapters         for select to public using (true);
  create policy "ku_pages_read"     on public.ku_pages            for select to public using (true);
  create policy "ku_quizzes_read"   on public.ku_quizzes          for select to public using (true);
  create policy "ku_questions_read" on public.ku_questions        for select to public using (true);
  create policy "ku_options_read"   on public.ku_question_options for select to public using (true);
end $$;
