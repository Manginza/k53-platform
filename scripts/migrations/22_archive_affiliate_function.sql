-- ================================================================
-- SK Driving — archive_affiliate(): remove one affiliate, keep the books
-- Run in: Supabase Dashboard → SQL Editor → New Query → Run
--
-- Removing an affiliate cascades their referrals, commissions and clicks
-- away, which would destroy commission records — including any amount still
-- owed. This copies all four tables into the *_archive tables and then
-- deletes, in one transaction, so "remove" never loses a payment record.
--
-- The affiliate's login account is left alone: they may also be a paying
-- learner, and removing them from the programme is not a reason to delete it.
--
-- Column lists are explicit rather than `select *`: the live and archive
-- tables no longer share column order (is_admin was added to affiliates
-- later), so positional inserts would silently write to the wrong columns.
--
-- Idempotent.
-- ================================================================

-- Archive gained its copy of the role column after migration 20 created it.
alter table public.affiliates_archive
  add column if not exists is_admin boolean;

create or replace function public.archive_affiliate(
  p_affiliate_id uuid,
  p_reason       text default 'admin removal'
) returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.affiliate_clicks_archive
    (id, affiliate_id, code, created_at, archived_at, archive_reason)
  select k.id, k.affiliate_id, k.code, k.created_at, now(), p_reason
  from public.affiliate_clicks k where k.affiliate_id = p_affiliate_id;

  insert into public.affiliate_commissions_archive
    (id, affiliate_id, referral_id, referred_user_id, yoco_payment_id,
     amount_cents, commission_cents, status, created_at, yoco_checkout_id,
     archived_at, archive_reason)
  select c.id, c.affiliate_id, c.referral_id, c.referred_user_id, c.yoco_payment_id,
         c.amount_cents, c.commission_cents, c.status, c.created_at, c.yoco_checkout_id,
         now(), p_reason
  from public.affiliate_commissions c where c.affiliate_id = p_affiliate_id;

  insert into public.referrals_archive
    (id, affiliate_id, referred_user_id, code, status, converted_at, created_at,
     archived_at, archive_reason)
  select r.id, r.affiliate_id, r.referred_user_id, r.code, r.status, r.converted_at, r.created_at,
         now(), p_reason
  from public.referrals r where r.affiliate_id = p_affiliate_id;

  insert into public.affiliates_archive
    (id, user_id, code, commission_rate, status, total_earned_cents, total_paid_cents,
     created_at, first_name, last_name, email, bank_account_name, bank_name,
     account_number, account_type, is_admin, archived_at, archive_reason)
  select a.id, a.user_id, a.code, a.commission_rate, a.status, a.total_earned_cents, a.total_paid_cents,
         a.created_at, a.first_name, a.last_name, a.email, a.bank_account_name, a.bank_name,
         a.account_number, a.account_type, a.is_admin, now(), p_reason
  from public.affiliates a where a.id = p_affiliate_id;

  -- Children cascade from this delete; they are archived above.
  delete from public.affiliates where id = p_affiliate_id;
end $$;

-- security definer, so keep it off the client roles: only the service-role
-- key (used by the admin-guarded API route) may call it.
revoke all on function public.archive_affiliate(uuid, text) from public, anon, authenticated;
grant execute on function public.archive_affiliate(uuid, text) to service_role;
