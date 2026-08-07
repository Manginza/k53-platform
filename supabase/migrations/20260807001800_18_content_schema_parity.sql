-- Keep a fresh SK Online project compatible with the current learning content.
alter table public.courses add column if not exists thumbnail_url text;
alter table public.quiz_questions add column if not exists option_d text;
alter table public.quiz_questions alter column question drop not null;
alter table public.quiz_questions alter column option_a drop not null;
alter table public.quiz_questions alter column option_b drop not null;
alter table public.quiz_questions alter column option_c drop not null;
alter table public.quiz_questions alter column correct_answer drop not null;
alter table public.quiz_questions drop constraint if exists quiz_questions_correct_answer_check;
alter table public.quiz_questions add constraint quiz_questions_correct_answer_check
  check (correct_answer in ('A', 'B', 'C', 'D'));

-- An earlier local migration used an integer school id. The production content
-- uses UUID ids and additional directory fields. A fresh target has no rows, so
-- replace only that empty incompatible table; never discard populated data.
do $$
declare
  id_type text;
  row_count bigint;
begin
  select data_type into id_type
  from information_schema.columns
  where table_schema = 'public' and table_name = 'driving_schools' and column_name = 'id';

  if id_type = 'integer' then
    select count(*) into row_count from public.driving_schools;
    if row_count > 0 then
      raise exception 'Cannot upgrade populated driving_schools integer ids automatically';
    end if;
    drop table public.driving_schools;
  end if;
end $$;

create table if not exists public.driving_schools (
  id                  uuid primary key default gen_random_uuid(),
  name                text not null,
  province            text not null,
  city                text,
  suburb              text,
  address             text,
  postal_code         text,
  phone               text,
  email               text,
  website             text,
  description         text,
  registration_number text,
  licence_codes       text[] not null default '{}',
  hours               text,
  lat                 double precision not null,
  lng                 double precision not null,
  is_verified         boolean not null default false,
  is_active           boolean not null default true,
  updated_at          timestamptz not null default now(),
  created_at          timestamptz not null default now()
);

create index if not exists driving_schools_province_idx on public.driving_schools (province);
create index if not exists driving_schools_lat_lng_idx on public.driving_schools (lat, lng);
create index if not exists driving_schools_codes_gin on public.driving_schools using gin (licence_codes);

alter table public.driving_schools enable row level security;
drop policy if exists "schools_public_read" on public.driving_schools;
create policy "schools_public_read" on public.driving_schools for select using (true);
