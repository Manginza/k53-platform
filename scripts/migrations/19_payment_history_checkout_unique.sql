-- ================================================================
-- SK Driving — payment_history as the per-checkout idempotency ledger
-- Run in: Supabase Dashboard → SQL Editor → New Query → Run
--
-- lib/payments.ts inserts a payment_history row BEFORE granting access and
-- treats a unique violation as "this checkout was already applied". That
-- only works if the database enforces one row per Yoco checkout. Partial
-- index so legacy rows without a checkout id (if any) are unaffected.
-- Idempotent.
-- ================================================================

create unique index if not exists idx_payment_history_checkout_unique
  on public.payment_history (yoco_checkout_id)
  where yoco_checkout_id is not null;
