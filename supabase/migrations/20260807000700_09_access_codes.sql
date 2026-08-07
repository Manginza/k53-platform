-- ================================================================
-- SK Driving — Access Codes (WhatsApp + manual provisioning model)
-- Run in: Supabase Dashboard → SQL Editor → New Query → Run
--
-- Replaces self-serve online payment. A paid member messages the admin on
-- WhatsApp, pays R150, and the admin generates an access code for them in
-- the admin dashboard. The member redeems the code on the site, which starts
-- a 60-day full-access window stored in an httpOnly cookie and validated
-- server-side against this table.
-- ================================================================

create table if not exists public.access_codes (
  id            uuid primary key default gen_random_uuid(),
  code          text not null unique,                 -- e.g. 'SK-7F3A-2K9D'
  label         text,                                 -- member name / phone (admin reference)
  status        text not null default 'active',       -- 'active' | 'revoked'
  duration_days int  not null default 60,
  activated_at  timestamptz,                          -- set on first redemption (clock starts here)
  expires_at    timestamptz,                          -- activated_at + duration_days
  created_by    text,                                 -- admin email that generated it
  created_at    timestamptz not null default now()
);

create index if not exists idx_access_codes_code   on public.access_codes(code);
create index if not exists idx_access_codes_status on public.access_codes(status);

-- RLS on, no policies: only the service-role key (admin + redeem API routes)
-- may read or write these rows.
alter table public.access_codes enable row level security;
