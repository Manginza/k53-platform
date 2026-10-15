-- Add test_number column if it does not already exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'quiz_questions' AND column_name = 'test_number'
  ) THEN
    ALTER TABLE quiz_questions ADD COLUMN test_number int8 DEFAULT 1;
    RAISE NOTICE 'Column test_number added.';
  ELSE
    RAISE NOTICE 'Column test_number already exists — skipped.';
  END IF;
END;
$$;

-- Add image_url column if it does not already exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'quiz_questions' AND column_name = 'image_url'
  ) THEN
    ALTER TABLE quiz_questions ADD COLUMN image_url text;
    RAISE NOTICE 'Column image_url added.';
  ELSE
    RAISE NOTICE 'Column image_url already exists — skipped.';
  END IF;
END;
$$;
