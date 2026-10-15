-- ================================================================
-- SK Driving — DLTC Centers (Driving Licence Testing Centres)
-- Run in: Supabase Dashboard → SQL Editor → New Query → Run
-- After running this, run: node scripts/seed-dltc-centers.mjs
-- ================================================================

create table if not exists public.dltc_centers (
  id           serial primary key,
  name         text not null,
  province     text not null,
  address      text not null,
  phone        text,
  lat          double precision not null,
  lng          double precision not null,
  is_smart_hub boolean not null default false,
  created_at   timestamptz not null default now()
);

-- Index for fast province filtering and spatial bounding-box pre-filter
create index if not exists dltc_centers_province_idx on public.dltc_centers (province);
create index if not exists dltc_centers_lat_lng_idx  on public.dltc_centers (lat, lng);

-- Public read access; only service-role key can write
alter table public.dltc_centers enable row level security;
drop policy if exists "dltc_public_read" on public.dltc_centers;
create policy "dltc_public_read" on public.dltc_centers
  for select using (true);
