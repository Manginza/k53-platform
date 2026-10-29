-- ================================================================
-- SK Driving — Learn Mode: categoriser instead of alternative questions
-- Run in: Supabase Dashboard → SQL Editor → New Query → Run
--
-- The Learn panel no longer shows interactive "traffic department" practice
-- questions. Instead it shows a short explainer that categorises the item
-- (e.g. "Information sign") and says how the test typically asks about it.
--
-- Two new fields carry that:
--   category   — short label, e.g. "Information sign", "Rule of the road"
--   how_asked  — one or two sentences on how questions on it are usually asked
--
-- The old alt_questions column is left in place (unused) rather than dropped,
-- so no data is lost. Idempotent.
-- ================================================================

alter table public.question_explanations
  add column if not exists category  text,
  add column if not exists how_asked text;
