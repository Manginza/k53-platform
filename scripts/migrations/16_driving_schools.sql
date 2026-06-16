-- Migration 16: Driving Schools directory
-- Run in Supabase SQL editor BEFORE running seed-driving-schools.mjs

create table if not exists public.driving_schools (
  id           serial primary key,
  name         text not null,
  province     text not null,
  suburb       text not null,
  address      text,
  phone        text,
  email        text,
  licence_codes text[] not null default '{}',
  hours        text,
  lat          double precision not null,
  lng          double precision not null,
  is_verified  boolean not null default false,
  created_at   timestamptz not null default now()
);

create index if not exists driving_schools_province_idx
  on public.driving_schools (province);

create index if not exists driving_schools_lat_lng_idx
  on public.driving_schools (lat, lng);

-- GIN index enables efficient array containment queries (licence code filter)
create index if not exists driving_schools_codes_gin
  on public.driving_schools using gin (licence_codes);

alter table public.driving_schools enable row level security;

create policy "schools_public_read"
  on public.driving_schools for select using (true);
