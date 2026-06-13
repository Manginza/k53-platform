-- Fixes for incorrect Code 8 Test 3 questions
-- Run this in Supabase Dashboard SQL Editor

UPDATE quiz_questions
SET correct_answer = 'C'
WHERE course_id = (SELECT id FROM courses WHERE code = 'code8' LIMIT 1)
  AND test_number = 3
  AND question LIKE 'How far may you park from the left edge of a roadway outside an urban area%';
