-- ================================================================
-- K53 UNPACKED — question images (exam-style sign/signal pictures)
-- Run in: Supabase Dashboard → SQL Editor → New Query → Run
-- ================================================================

alter table public.ku_questions
  add column if not exists image_url text;
