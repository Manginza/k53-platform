-- Migration 17: Trainer Platform
-- Run in Supabase SQL editor before deploying the trainer feature.

-- ── Core trainer profile ──────────────────────────────────────────────────────
create table if not exists public.trainers (
  id                  uuid primary key default gen_random_uuid(),
  user_id             uuid references auth.users(id) on delete cascade,
  slug                text unique not null,
  name                text not null,
  bio                 text,
  phone               text,
  email               text not null,
  province            text,
  is_active           boolean not null default false,
  fee_paid_until      date,
  yoco_ref            text,
  learner_price_cents integer not null default 0,
  created_at          timestamptz not null default now()
);

-- ── Learners signed up through a trainer ─────────────────────────────────────
create table if not exists public.trainer_learners (
  id           serial primary key,
  trainer_id   uuid not null references public.trainers(id) on delete cascade,
  name         text not null,
  email        text not null,
  phone        text,
  is_paid      boolean not null default false,
  paid_at      timestamptz,
  amount_cents integer,
  created_at   timestamptz not null default now(),
  unique (trainer_id, email)
);

-- ── Materials uploaded/linked by trainer ──────────────────────────────────────
create table if not exists public.trainer_materials (
  id          serial primary key,
  trainer_id  uuid not null references public.trainers(id) on delete cascade,
  title       text not null,
  description text,
  type        text not null check (type in ('pdf', 'video', 'link', 'note')),
  url         text,
  content     text,
  sort_order  integer not null default 0,
  is_active   boolean not null default true,
  created_at  timestamptz not null default now()
);

-- ── Indexes ───────────────────────────────────────────────────────────────────
create index if not exists trainers_user_id_idx      on public.trainers (user_id);
create index if not exists trainers_slug_idx         on public.trainers (slug);
create index if not exists trainer_learners_tid_idx  on public.trainer_learners (trainer_id);
create index if not exists trainer_learners_email_idx on public.trainer_learners (email);
create index if not exists trainer_materials_tid_idx on public.trainer_materials (trainer_id, sort_order);

-- ── RLS ───────────────────────────────────────────────────────────────────────
alter table public.trainers enable row level security;
alter table public.trainer_learners enable row level security;
alter table public.trainer_materials enable row level security;

-- Active trainers are publicly readable (for /t/[slug] pages)
create policy "trainers_public_read"   on public.trainers for select using (is_active = true);
create policy "trainers_self_read"     on public.trainers for select using (auth.uid() = user_id);
create policy "trainers_self_insert"   on public.trainers for insert with check (auth.uid() = user_id);
create policy "trainers_self_update"   on public.trainers for update using (auth.uid() = user_id);

-- Learners: public can insert (sign-up); trainer sees/manages their own
create policy "trainer_learners_public_insert" on public.trainer_learners
  for insert with check (true);

create policy "trainer_learners_self" on public.trainer_learners
  for all using (
    trainer_id in (select id from public.trainers where user_id = auth.uid())
  );

-- Materials: trainer manages their own
create policy "trainer_materials_self" on public.trainer_materials
  for all using (
    trainer_id in (select id from public.trainers where user_id = auth.uid())
  );
