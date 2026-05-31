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

// ─── Affiliate / Referral ──────────────────────────────────────────────────────

export interface Affiliate {
  id: string
  user_id: string
  code: string
  commission_rate: number          // 0.20 = 20%
  status: 'active' | 'suspended'
  total_earned_cents: number
  total_paid_cents: number
  created_at: string
}

export interface Referral {
  id: string
  affiliate_id: string
  referred_user_id: string
  code: string
  status: 'signed_up' | 'converted'
  converted_at: string | null
  created_at: string
}

export interface AffiliateCommission {
  id: string
  affiliate_id: string
  referral_id: string | null
  referred_user_id: string | null
  yoco_payment_id: string | null
  amount_cents: number
  commission_cents: number
  status: 'pending' | 'approved' | 'paid'
  created_at: string
}

/** Aggregated figures for the affiliate dashboard. */
export interface AffiliateStats {
  clicks: number
  signups: number
  conversions: number
  earnedCents: number      // lifetime commission earned
  pendingCents: number     // earned but not yet paid out
  paidCents: number        // already paid out
}
