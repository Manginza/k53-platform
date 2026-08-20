-- ================================================================
-- SK Driving — Access Grants (register-before-pay model)
-- Run in: Supabase Dashboard → SQL Editor → New Query → Run
--
-- Anyone can register an account, but they have NO access until payment.
-- A successful card payment (verified with Yoco on return + webhook) or an
-- admin action grants the account 60 days of full access via this table.
-- ================================================================

create table if not exists public.access_grants (
  user_id     uuid primary key references auth.users(id) on delete cascade,
  expires_at  timestamptz,                 -- null = lifetime
  source      text not null default 'payment',  -- 'payment' | 'admin'
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

alter table public.access_grants enable row level security;

do $$ begin
  drop policy if exists "access_grants_own_read" on public.access_grants;
  create policy "access_grants_own_read"
    on public.access_grants for select to authenticated
    using (auth.uid() = user_id);
end $$;

-- Make affiliate commissions idempotent on the checkout id too (so the
-- synchronous confirm and the webhook can't double-credit).
create unique index if not exists uniq_aff_comm_checkout
  on public.affiliate_commissions(yoco_checkout_id)
  where yoco_checkout_id is not null;
