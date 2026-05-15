export interface Course {
  id: number
  title: string
  description: string | null
  code: string
  created_at: string
}

export interface QuizQuestion {
  id: number
  course_id: number
  test_number: number
  question: string
  option_a: string
  option_b: string
  option_c: string
  correct_answer: 'A' | 'B' | 'C'
  image_url: string | null
  image_ref: string | null
}
