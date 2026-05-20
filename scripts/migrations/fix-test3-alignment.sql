-- ================================================================
-- K53 Platform — Fix: Code 8 Test 3 alignment with PDF
-- Run in: Supabase Dashboard → SQL Editor → New Query
-- Issues found by comparing DB against "Code 8 Test 3.pdf"
-- ================================================================

-- ── FIX 1: ID 139 — wrong correct_answer ────────────────────────
-- Question: "This sign shows you that there is a …"
-- Image shows a red warning triangle with a sharp LEFT-CURVE arrow.
-- PDF correct answer: A = "sharp curve to the left ahead."
-- DB had:            C = "detour to the left."  ← WRONG
UPDATE quiz_questions
SET correct_answer = 'A'
WHERE id = 139;

-- ── FIX 2: ID 166 — wrong correct_answer ────────────────────────
-- Question: "What is the purpose of these road markings?"
-- Image shows converging lane-reduction arrows (no-overtaking fan).
-- PDF correct answer: C = "To warn you that there is a no-overtaking
--   OR no-crossing line ahead. If you are driving on the lane for
--   oncoming, return to your lane."
-- DB had:            B = "To warn you in good time that the number of
--   lanes are going to reduce…"  ← WRONG
UPDATE quiz_questions
SET correct_answer = 'C'
WHERE id = 166;

-- ── FIX 3: Missing question — stop lamps visibility ─────────────
-- This question appears in the PDF (between Q24 and Q26) but was
-- never inserted into the database.
INSERT INTO quiz_questions
  (course_id, test_number, question, option_a, option_b, option_c,
   correct_answer, image_url, image_ref)
VALUES (
  2, 3,
  'What is the minimum distance stop lamps must be visible to a person with normal eyesight in sunlight..?',
  '20m',
  '10m',
  '30m',
  'C',
  NULL,
  NULL
);

-- ── Verify ──────────────────────────────────────────────────────
SELECT id, question, correct_answer
FROM   quiz_questions
WHERE  id IN (139, 166)
   OR  (course_id = 2 AND test_number = 3 AND question ILIKE '%stop lamps%')
ORDER  BY id;
