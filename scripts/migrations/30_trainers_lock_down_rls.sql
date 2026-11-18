-- 30_trainers_lock_down_rls.sql — close two RLS holes found in the code audit.
-- NOT APPLIED automatically. Review, then run in Supabase → SQL Editor.
--
-- Background: every trainer read/write in the app already goes through the
-- service-role key (app/api/t/*, app/api/admin/trainers, app/trainer/*), which
-- bypasses RLS. The browser anon key never needs write access to these
-- tables, but migration 17 granted it anyway:
--
--   1. trainers_self_insert / trainers_self_update let any signed-in user
--      insert or edit their OWN trainer row straight through the REST API,
--      including is_active and fee_paid_until. A trainer could therefore
--      activate their own page without paying the R1,500 annual fee.
--
--   2. trainer_learners_public_insert (WITH CHECK (true)) let anyone, even
--      signed out, insert a learner row for ANY trainer with is_paid = true.
--      /api/t/verify then returns that trainer's paid-only materials to
--      whoever typed the e-mail address.
--
-- After this migration the anon/authenticated roles can still READ what they
-- could before (public active trainers, a trainer's own rows, a trainer's
-- own learners/materials). Sign-up still works: /api/t/join and
-- /api/t/register use the service role.
--
-- Safe to re-run.

drop policy if exists "trainers_self_insert"            on public.trainers;
drop policy if exists "trainers_self_update"            on public.trainers;
drop policy if exists "trainer_learners_public_insert"  on public.trainer_learners;

-- The "for all" self policies keep a trainer in control of their own learners
-- and materials. Add an explicit WITH CHECK so a trainer cannot move a row to
-- another trainer's id.
drop policy if exists "trainer_learners_self" on public.trainer_learners;
create policy "trainer_learners_self" on public.trainer_learners
  for all
  using (trainer_id in (select id from public.trainers where user_id = auth.uid()))
  with check (trainer_id in (select id from public.trainers where user_id = auth.uid()));

drop policy if exists "trainer_materials_self" on public.trainer_materials;
create policy "trainer_materials_self" on public.trainer_materials
  for all
  using (trainer_id in (select id from public.trainers where user_id = auth.uid()))
  with check (trainer_id in (select id from public.trainers where user_id = auth.uid()));
