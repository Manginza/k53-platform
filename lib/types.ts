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
  explanation?: string | null
}

// ─── Affiliate / Referral ──────────────────────────────────────────────────────

export interface Affiliate {
  id: string
  user_id: string
  code: string
  first_name: string | null
  last_name: string | null
  email: string | null
  bank_account_name: string | null
  bank_name: string | null
  account_number: string | null
  account_type: 'cheque' | 'savings' | null
  commission_rate: number          // 0.30 = 30%
  status: 'active' | 'suspended'
  total_earned_cents: number
  total_paid_cents: number
  created_at: string
}

export interface AffiliateCommission {
  id: string
  affiliate_id: string
  referral_id: string | null
  referred_user_id: string | null
  yoco_payment_id: string | null
  yoco_checkout_id: string | null
  amount_cents: number
  commission_cents: number
  status: 'pending' | 'paid'
  created_at: string
}

/** Aggregated figures for the affiliate dashboard. */
export interface AffiliateStats {
  clicks: number
  signups: number          // learners durably attributed to the affiliate
  conversions: number      // number of paid commissions
  earnedCents: number      // lifetime commission earned
  pendingCents: number     // earned but not yet paid out
  paidCents: number        // already paid out
}

// ─── Access Codes (admin-issued member access) ──────────────────────────────────

export interface AccessCode {
  id: string
  code: string
  label: string | null
  status: 'active' | 'revoked'
  duration_days: number
  activated_at: string | null
  expires_at: string | null
  created_by: string | null
  created_at: string
}

export interface RegistrationToken {
  id: string
  token: string
  source: 'payment' | 'admin'
  status: 'pending' | 'ready' | 'used' | 'revoked'
  duration_days: number | null
  label: string | null
  used_by_user_id: string | null
  used_at: string | null
  expires_at: string | null
  created_by: string | null
  yoco_checkout_id: string | null
  created_at: string
}
