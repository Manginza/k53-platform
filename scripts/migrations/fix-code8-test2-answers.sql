-- Fixes for incorrect Code 8 Test 2 questions
-- Run this in Supabase Dashboard SQL Editor

UPDATE quiz_questions
SET correct_answer = 'C'
WHERE course_id = (SELECT id FROM courses WHERE code = 'code8' LIMIT 1)
  AND question LIKE 'How far may you park from the left edge of a roadway outside an urban area%';

UPDATE quiz_questions
SET correct_answer = 'B'
WHERE course_id = (SELECT id FROM courses WHERE code = 'code8' LIMIT 1)
  AND question LIKE 'In a light motor vehicle, the load should not project more than%';

UPDATE quiz_questions
SET correct_answer = 'B'
WHERE course_id = (SELECT id FROM courses WHERE code = 'code8' LIMIT 1)
  AND question LIKE 'What is important with regard to the hooter of your vehicle%';

UPDATE quiz_questions
SET correct_answer = 'C'
WHERE course_id = (SELECT id FROM courses WHERE code = 'code8' LIMIT 1)
  AND question LIKE 'What is this road sign called%'
  AND image_ref = '2c8.12.img.png';

UPDATE quiz_questions
SET correct_answer = 'B'
WHERE course_id = (SELECT id FROM courses WHERE code = 'code8' LIMIT 1)
  AND question LIKE 'This road sign shows you that%'
  AND image_ref = '2c8.19.img.png';

UPDATE quiz_questions
SET correct_answer = 'B'
WHERE course_id = (SELECT id FROM courses WHERE code = 'code8' LIMIT 1)
  AND question LIKE 'When approaching this sign, the driver must%'
  AND image_ref = '2c8.20.img.png';

UPDATE quiz_questions
SET correct_answer = 'B'
WHERE course_id = (SELECT id FROM courses WHERE code = 'code8' LIMIT 1)
  AND question LIKE 'What does this control sign indicate%'
  AND image_ref = '2c8.22.img.png';

UPDATE quiz_questions
SET correct_answer = 'A'
WHERE course_id = (SELECT id FROM courses WHERE code = 'code8' LIMIT 1)
  AND question LIKE 'This sign shows you that%'
  AND image_ref = '2c8.24.1.img.png';

UPDATE quiz_questions
SET correct_answer = 'B'
WHERE course_id = (SELECT id FROM courses WHERE code = 'code8' LIMIT 1)
  AND question LIKE 'This road sign prohibits%'
  AND image_ref = '2c8.25.img.png';
