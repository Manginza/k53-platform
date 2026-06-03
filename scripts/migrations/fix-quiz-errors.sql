-- ================================================================
-- K53 Quiz — Expert Audit Fix
-- Run in: Supabase Dashboard → SQL Editor → New Query → Run
--
-- Audit covered all 327 questions (Code 8: 165, Code 10: 162) against the
-- SA Learner Driver Manual. Two confirmed factual errors were found and are
-- patched below. Safe to re-run — uses WHERE id = … (no-op if already fixed).
-- ================================================================

-- ── FIX 1 ───────────────────────────────────────────────────────────────────
-- Code 8 Test 1, Q #56 — "dim light" distance.
-- The correct answer was set to A (100), which is the MAIN beam distance.
-- The MANUAL says: dipped/dim beam = 45 m, main/bright beam = 100 m.
-- Code 10 Test 1 #188 already has this right; aligning Code 8 with the manual.
update public.quiz_questions
   set correct_answer = 'C'
 where id = 56
   and course_id = 2
   and test_number = 1
   and correct_answer = 'A';

-- ── FIX 2 ───────────────────────────────────────────────────────────────────
-- Code 8 Test 2, Q #89 — hooter audible distance.
-- Option A said "Someone must hear it from a distance of at least 50m" which
-- is wrong — the K53 manual specifies the hooter must be clearly audible at
-- 90 m. Updating the option text so the correct answer (A) is factually right.
update public.quiz_questions
   set option_a = 'Someone must hear it from a distance of at least 90m'
 where id = 89
   and course_id = 2
   and test_number = 2
   and option_a like '%50m%';

-- ── VERIFY ──────────────────────────────────────────────────────────────────
-- Optional: run this after to confirm both fixes landed.
-- select id, course_id, test_number, question, option_a, option_c, correct_answer
--   from public.quiz_questions where id in (56, 89);
