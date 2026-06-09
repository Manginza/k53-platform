-- ================================================================
-- SK Driving — App Settings (admin-editable key/value config)
-- Run in: Supabase Dashboard → SQL Editor → New Query → Run
--
-- Holds small bits of config the admin can change without a code deploy —
-- currently the latest live-session recording link, which is shown at the top
-- of the Videos page and in the session popup. Updating it replaces the old
-- one everywhere. Idempotent.
-- ================================================================

create table if not exists public.app_settings (
  key        text primary key,
  value      text,
  updated_at timestamptz not null default now()
);

-- Seed the current recording link (kept if it already exists).
insert into public.app_settings (key, value)
values ('live_recording_url', 'https://drive.google.com/file/d/1XA_r-AQ9ODalohBq2FSDSj6cEsM3aMie/view?usp=sharing')
on conflict (key) do nothing;

-- RLS on, no policies: only the service-role key (server routes) reads/writes.
alter table public.app_settings enable row level security;
