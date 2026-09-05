-- ================================================================
-- SK Driving — Access codes issued by payment
-- Run in: Supabase Dashboard → SQL Editor → New Query → Run
--
-- Every applied payment mints a single-use code. It is emailed to the buyer
-- and shown to them on the success page, so a customer whose access did not
-- unlock by itself has something they can type in to unlock it, on whatever
-- account they are actually signed in to.
--
-- This extends the access_codes table from migration 09, which the WhatsApp
-- provisioning model used and nothing has used since. The table is created
-- here too, so this migration stands on its own if 09 was never run.
--
-- Idempotent.
-- ================================================================

create table if not exists public.access_codes (
  id            uuid primary key default gen_random_uuid(),
  code          text not null unique,
  label         text,
  status        text not null default 'active',
  duration_days int  not null default 60,
  activated_at  timestamptz,
  expires_at    timestamptz,
  created_by    text,
  created_at    timestamptz not null default now()
);

alter table public.access_codes
  -- The account that paid. The code is NOT restricted to it: a buyer who
  -- registered twice must be able to redeem on the account they are signed
  -- in to, which is one of the cases this whole mechanism exists for.
  add column if not exists user_id          uuid references auth.users(id) on delete set null,
  add column if not exists yoco_checkout_id text,
  add column if not exists source           text not null default 'admin',   -- 'admin' | 'payment'
  add column if not exists redeemed_by      uuid references auth.users(id) on delete set null,
  add column if not exists redeemed_at      timestamptz,
  -- When the code itself stops being redeemable. Separate from expires_at,
  -- which is when the ACCESS granted by an old-style code runs out.
  add column if not exists valid_until      timestamptz,
  add column if not exists emailed_at       timestamptz;

-- One code per payment. Several routes can apply the same checkout, and all
-- of them mint; this is what stops a retry issuing a second usable code.
create unique index if not exists idx_access_codes_checkout
  on public.access_codes(yoco_checkout_id)
  where yoco_checkout_id is not null;

create index if not exists idx_access_codes_user on public.access_codes(user_id);

-- RLS on with no policies: only the service-role key (the mint and redeem
-- routes) may read or write. A code must never be readable by the browser,
-- or anyone could list other people's codes.
alter table public.access_codes enable row level security;
