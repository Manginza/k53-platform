-- ================================================================
-- SK Driving — public.affiliate_admin_stats
-- Run in: Supabase Dashboard → SQL Editor → New Query → Run
--
-- Per-affiliate roster figures for the programme admin's dashboard: sales,
-- commission earned, commission still owed, clicks and sign-ups. Aggregating
-- here keeps the dashboard to one small row per affiliate instead of pulling
-- every click and commission row into the server and counting in JavaScript.
--
-- Pending is derived from the commissions table rather than the
-- total_paid_cents counter, which has drifted in the past.
--
-- Like affiliate_scoreboard, this crosses every affiliate and so cannot use
-- the per-affiliate RLS of its base tables: revoked from the client roles and
-- read only with the service-role key behind an admin check.
--
-- Idempotent.
-- ================================================================

create or replace view public.affiliate_admin_stats as
select
  a.id                                as affiliate_id,
  coalesce(c.sales, 0)::bigint        as sales,
  coalesce(c.earned_cents, 0)::bigint as earned_cents,
  coalesce(c.pending_cents, 0)::bigint as pending_cents,
  coalesce(k.clicks, 0)::bigint       as clicks,
  coalesce(r.signups, 0)::bigint      as signups
from public.affiliates a
left join (
  select affiliate_id,
         count(*)                as sales,
         sum(commission_cents)   as earned_cents,
         sum(case when status <> 'paid' then commission_cents else 0 end) as pending_cents
  from public.affiliate_commissions
  group by affiliate_id
) c on c.affiliate_id = a.id
left join (
  select affiliate_id, count(*) as clicks
  from public.affiliate_clicks group by affiliate_id
) k on k.affiliate_id = a.id
left join (
  select affiliate_id, count(*) as signups
  from public.referrals group by affiliate_id
) r on r.affiliate_id = a.id;

revoke all on public.affiliate_admin_stats from anon, authenticated;
grant select on public.affiliate_admin_stats to service_role;
