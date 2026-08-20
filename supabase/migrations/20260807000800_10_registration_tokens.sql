-- ================================================================
-- SK Driving — Registration Tokens (account-based access)
-- Run in: Supabase Dashboard → SQL Editor → New Query → Run
--
-- Access is now tied to a registered account. A registration token grants
-- the right to create an account with full access. Tokens are created by:
--   • a successful Yoco card payment (source 'payment'), or
--   • an admin, who sends the member a /register?token=... link (source 'admin').
-- When the member registers, the token is marked 'used' and bound to their
-- user_id with an expiry. hasFullAccess() then checks the logged-in user's
-- token grant.
-- ================================================================

create table if not exists public.registration_tokens (
  id               uuid primary key default gen_random_uuid(),
  token            text not null unique,
  source           text not null,                 -- 'payment' | 'admin'
  status           text not null default 'pending', -- 'pending' | 'ready' | 'used' | 'revoked'
  duration_days    int,                            -- null = lifetime
  label            text,                           -- member name / phone / 'Online payment'
  used_by_user_id  uuid references auth.users(id) on delete set null,
  used_at          timestamptz,
  expires_at       timestamptz,                    -- access expiry (set on use)
  created_by       text,                           -- admin email or 'yoco'
  yoco_checkout_id text,
  created_at       timestamptz not null default now()
);

create index if not exists idx_reg_tokens_token   on public.registration_tokens(token);
create index if not exists idx_reg_tokens_user     on public.registration_tokens(used_by_user_id);
create index if not exists idx_reg_tokens_status   on public.registration_tokens(status);

-- RLS: a logged-in user may read their OWN granted token (for the access gate).
-- All writes happen via the service-role key (register / admin / webhook routes).
alter table public.registration_tokens enable row level security;

do $$ begin
  drop policy if exists "reg_tokens_own_read" on public.registration_tokens;
  create policy "reg_tokens_own_read"
    on public.registration_tokens for select to authenticated
    using (auth.uid() = used_by_user_id);
end $$;
