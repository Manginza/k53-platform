-- ================================================================
-- SK Driving — Affiliate admin role
-- Run in: Supabase Dashboard → SQL Editor → New Query → Run
--
-- One affiliate can also run the programme. `is_admin` marks them, and
-- /affiliate renders them a management dashboard instead of the normal
-- earner dashboard: the full scoreboard, plus editing and removing
-- affiliates.
--
-- The flag is deliberately NOT settable through any self-service route
-- (/api/affiliate/register and /api/affiliate/enroll insert explicit column
-- lists that exclude it), so it can only be granted here or by another
-- affiliate admin. It grants sight of every affiliate's bank details, so
-- treat it as a payments-level permission.
--
-- Idempotent.
-- ================================================================

alter table public.affiliates
  add column if not exists is_admin boolean not null default false;

create index if not exists idx_affiliates_is_admin
  on public.affiliates (is_admin) where is_admin;

-- The owner's affiliate record. Runs the programme and carries a referral
-- code of their own, so they appear on the scoreboard if they sell.
insert into public.affiliates (user_id, code, first_name, last_name, email, commission_rate, status, is_admin)
select u.id, 'SKADMN23', 'Lungi', 'Admin', u.email, 0.300, 'active', true
from auth.users u
where lower(u.email) = 'lungi09@gmail.com'
on conflict (user_id) do update
  set is_admin = true,
      status   = 'active',
      email    = excluded.email;
