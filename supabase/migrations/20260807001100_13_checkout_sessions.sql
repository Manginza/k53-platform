-- ================================================================
-- SK Driving — Checkout Sessions (reliable post-payment access)
-- Run in: Supabase Dashboard → SQL Editor → New Query → Run
--
-- Maps each Yoco checkout to the buyer's account at checkout-creation time so
-- access can be granted on return WITHOUT depending on the browser's
-- localStorage. The /subscribe/success page (and a "I've paid" retry) can then
-- look up the logged-in user's recent checkouts, verify them with Yoco, and
-- grant access. The webhook remains an independent backup. Idempotent.
-- ================================================================

create table if not exists public.checkout_sessions (
  checkout_id text primary key,
  user_id     uuid not null references auth.users(id) on delete cascade,
  created_at  timestamptz not null default now()
);

create index if not exists idx_checkout_sessions_user
  on public.checkout_sessions(user_id, created_at desc);

-- RLS on, no policies: only the service-role key (checkout + confirm routes)
-- reads/writes this table.
alter table public.checkout_sessions enable row level security;
