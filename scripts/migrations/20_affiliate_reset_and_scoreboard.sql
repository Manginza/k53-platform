-- ================================================================
-- SK Driving — Affiliate programme reset + earnings scoreboard
-- Run in: Supabase Dashboard → SQL Editor → New Query → Run
--
-- PART 1 — Archive, then clear the programme.
--   Every affiliate, referral, commission and click is copied into an
--   *_archive table before the live rows are deleted, so the books (and any
--   commission still owed) survive the reset. The archive tables keep bank
--   details, so they are RLS-locked with no policies: service role only.
--
-- PART 2 — public.affiliate_scoreboard.
--   Ranked earnings across the programme, powering the leaderboard each
--   affiliate sees on their dashboard. Only affiliates who have actually
--   earned appear. Revoked from anon/authenticated: the app reads it with
--   the service-role key AFTER confirming the viewer is an affiliate.
--
-- Idempotent: re-running archives nothing (live tables already empty) and
-- recreates the view unchanged.
-- ================================================================

-- ── PART 1: archive ──────────────────────────────────────────────

create table if not exists public.affiliates_archive
  (like public.affiliates including defaults);
create table if not exists public.referrals_archive
  (like public.referrals including defaults);
create table if not exists public.affiliate_commissions_archive
  (like public.affiliate_commissions including defaults);
create table if not exists public.affiliate_clicks_archive
  (like public.affiliate_clicks including defaults);

do $$
declare t text;
begin
  foreach t in array array[
    'affiliates_archive', 'referrals_archive',
    'affiliate_commissions_archive', 'affiliate_clicks_archive'
  ] loop
    execute format(
      'alter table public.%I add column if not exists archived_at timestamptz not null default now()', t);
    execute format(
      'alter table public.%I add column if not exists archive_reason text', t);
    execute format('alter table public.%I enable row level security', t);
  end loop;
end $$;

-- Copy the live programme into the archive.
insert into public.affiliates_archive
  select a.*, now(), 'programme reset' from public.affiliates a;
insert into public.referrals_archive
  select r.*, now(), 'programme reset' from public.referrals r;
insert into public.affiliate_commissions_archive
  select c.*, now(), 'programme reset' from public.affiliate_commissions c;
insert into public.affiliate_clicks_archive
  select k.*, now(), 'programme reset' from public.affiliate_clicks k;

-- Clear the live programme. Child rows first: the FKs cascade anyway, but
-- being explicit keeps the intent (and the row counts) readable.
delete from public.affiliate_clicks;
delete from public.affiliate_commissions;
delete from public.referrals;
delete from public.affiliates;

-- ── PART 2: scoreboard view ──────────────────────────────────────

create or replace view public.affiliate_scoreboard as
with totals as (
  select
    a.id as affiliate_id,
    a.code,
    nullif(trim(concat_ws(' ', a.first_name, a.last_name)), '') as name,
    count(c.id)                                as sales,
    coalesce(sum(c.commission_cents), 0)::bigint as earned_cents
  from public.affiliates a
  join public.affiliate_commissions c on c.affiliate_id = a.id
  group by a.id, a.code, a.first_name, a.last_name
)
select
  rank() over (order by earned_cents desc, sales desc) as rank,
  affiliate_id,
  code,
  name,
  sales,
  earned_cents
from totals;

-- The view aggregates across every affiliate, so it deliberately does NOT
-- inherit the per-affiliate RLS of its base tables. Keep it off the client
-- roles — lib/affiliate-scoreboard.ts reads it with the service-role key
-- only after checking the viewer is an enrolled affiliate.
revoke all on public.affiliate_scoreboard from anon, authenticated;
grant select on public.affiliate_scoreboard to service_role;
