-- Code 10 Test 1 answer corrections (course_id=3, test_number=1)
-- Q1  (id 170): A -> B
-- Q8  (id 177): B -> C
-- Q55 (id 224): C -> A
-- Q60 (id 229): B -> A
UPDATE quiz_questions SET correct_answer = 'B' WHERE id = 170;
UPDATE quiz_questions SET correct_answer = 'C' WHERE id = 177;
UPDATE quiz_questions SET correct_answer = 'A' WHERE id = 224;
UPDATE quiz_questions SET correct_answer = 'A' WHERE id = 229;
