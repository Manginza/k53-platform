-- ================================================================
-- K53 Platform — Fix: Code 10 Test 1 broken image URL
-- Run in: Supabase Dashboard → SQL Editor → New Query
-- Issue: C10.14 was uploaded to storage as "C10.14,img.png"
--        (comma) but the DB references "C10.14.img.png" (period)
-- ================================================================

-- Fix the broken image URL for Q18 (id = 187)
-- "When the main traffic signal light is red and a red arrow flashes to the left..."
UPDATE quiz_questions
SET image_url = 'https://wzqgjzqylkbwyvzyzywu.supabase.co/storage/v1/object/public/resources/code10/test 1/C10.14,img.png'
WHERE id = 187
  AND image_url LIKE '%C10.14.img.png%';

-- Verify
SELECT id, question, image_url
FROM quiz_questions
WHERE id = 187;
