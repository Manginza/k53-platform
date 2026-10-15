-- ================================================================
-- SK Driving — Yoco Payment / Subscription Schema
-- Run in: Supabase Dashboard → SQL Editor → New Query → Run
-- ================================================================

-- 1. SUBSCRIPTION PLANS (seeded with defaults)
create table if not exists public.subscription_plans (
  id           uuid primary key default gen_random_uuid(),
  name         text    not null,
  slug         text    not null unique,   -- 'premium-monthly' | 'premium-annual'
  price_cents  int     not null,          -- ZAR cents: R49.00 = 4900
  currency     text    not null default 'ZAR',
  interval     text    not null,          -- 'monthly' | 'yearly'
  features     text[]  not null default '{}',
  is_active    boolean not null default true,
  created_at   timestamptz not null default now()
);

-- 2. USER SUBSCRIPTIONS (one active subscription per user)
create table if not exists public.user_subscriptions (
  id                   uuid primary key default gen_random_uuid(),
  user_id              uuid not null references auth.users(id) on delete cascade,
  plan_id              uuid references public.subscription_plans(id),
  status               text not null default 'pending',
  -- status values: 'pending' | 'active' | 'cancelled' | 'expired' | 'failed'
  current_period_start timestamptz,
  current_period_end   timestamptz,
  yoco_checkout_id     text,
  yoco_payment_id      text,
  created_at           timestamptz not null default now(),
  updated_at           timestamptz not null default now(),
  unique (user_id)
);

-- 3. PAYMENT HISTORY (immutable audit trail)
create table if not exists public.payment_history (
  id               uuid primary key default gen_random_uuid(),
  user_id          uuid references auth.users(id) on delete set null,
  subscription_id  uuid references public.user_subscriptions(id) on delete set null,
  plan_id          uuid references public.subscription_plans(id) on delete set null,
  amount_cents     int  not null,
  currency         text not null default 'ZAR',
  status           text not null,   -- 'succeeded' | 'failed' | 'pending'
  yoco_payment_id  text,
  yoco_checkout_id text,
  yoco_event_type  text,
  raw_payload      jsonb,
  created_at       timestamptz not null default now()
);

-- INDEXES
create index if not exists idx_user_subs_user_id   on public.user_subscriptions(user_id);
create index if not exists idx_user_subs_status    on public.user_subscriptions(status);
create index if not exists idx_payment_hist_user   on public.payment_history(user_id);

-- RLS
alter table public.subscription_plans   enable row level security;
alter table public.user_subscriptions   enable row level security;
alter table public.payment_history      enable row level security;

do $$ begin
  -- Plans: anyone can read (needed for pricing page)
  drop policy if exists "plans_public_read"        on public.subscription_plans;
  drop policy if exists "subscriptions_own_read"   on public.user_subscriptions;
  drop policy if exists "payment_hist_own_read"    on public.payment_history;

  create policy "plans_public_read"
    on public.subscription_plans for select using (true);

  create policy "subscriptions_own_read"
    on public.user_subscriptions for select to authenticated
    using (auth.uid() = user_id);

  create policy "payment_hist_own_read"
    on public.payment_history for select to authenticated
    using (auth.uid() = user_id);
end $$;

-- SEED default plans (idempotent)
insert into public.subscription_plans (name, slug, price_cents, interval, features)
values
  ('Premium Monthly', 'premium-monthly', 4900, 'monthly', array[
    'All Code 8 practice tests',
    'All Code 10 practice tests',
    'Live Notes — Road Signs Manual (18 chapters)',
    'Unlimited retakes',
    'Full answer explanations',
    'Progress tracking'
  ]),
  ('Premium Annual',  'premium-annual',  39900, 'yearly',  array[
    'All Code 8 practice tests',
    'All Code 10 practice tests',
    'Live Notes — Road Signs Manual (18 chapters)',
    'Unlimited retakes',
    'Full answer explanations',
    'Progress tracking',
    'Save R189 vs monthly'
  ])
on conflict (slug) do update set
  price_cents = excluded.price_cents,
  features    = excluded.features,
  is_active   = excluded.is_active;
