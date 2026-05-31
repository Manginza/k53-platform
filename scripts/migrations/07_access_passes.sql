-- ================================================================
-- SK Driving — Access Passes (one-time, time-boxed + lifetime)
-- Run in: Supabase Dashboard → SQL Editor → New Query → Run
--
-- Replaces the recurring monthly/annual plans with three one-time
-- access passes. `duration_days` controls how long access lasts;
-- NULL means lifetime. The Yoco webhook sets current_period_end to
-- now() + duration_days (or a far-future date for lifetime).
-- ================================================================

-- 1. Add duration_days to plans (nullable; NULL = lifetime)
alter table public.subscription_plans
  add column if not exists duration_days int;

-- 2. Retire the old recurring plans (keep rows for historical FKs)
update public.subscription_plans
  set is_active = false
  where slug in ('premium-monthly', 'premium-annual');

-- 3. Seed the three access passes (idempotent on slug)
insert into public.subscription_plans (name, slug, price_cents, interval, duration_days, features)
values
  ('14-Day Access', 'pass-14day', 4900, 'once', 14, array[
    'Unlimited timed practice tests (Code 8 & Code 10)',
    'Full Live Notes — Road Signs Manual (18 chapters)',
    'All study resources & PDFs',
    'All study videos',
    'Full answer explanations'
  ]),
  ('60-Day Access', 'pass-60day', 15000, 'once', 60, array[
    'Everything in 14-Day Access',
    '60 days of full access',
    'Best for thorough preparation'
  ]),
  ('Lifetime Access', 'pass-lifetime', 39900, 'once', null, array[
    'Everything in 60-Day Access',
    'Lifetime access — pay once, learn forever',
    'All future content updates included'
  ])
on conflict (slug) do update set
  name          = excluded.name,
  price_cents   = excluded.price_cents,
  interval      = excluded.interval,
  duration_days = excluded.duration_days,
  features      = excluded.features,
  is_active     = true;
