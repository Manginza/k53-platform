-- ================================================================
-- SK Driving — "Still can't log in?" requests + private proof storage
-- Run in: Supabase Dashboard → SQL Editor → New Query → Run
--
-- A paid client who cannot get in uploads their proof of payment from
-- /still-cant-login. The file goes into a PRIVATE bucket and the request is
-- recorded here; the client's own email app then sends lungi09@gmail.com a
-- message carrying a time-limited link to the proof.
--
-- Proofs of payment often show bank details, so neither the bucket nor the
-- table has any policy: only the service-role key (the API route) can read
-- or write them. Idempotent.
-- ================================================================

create table if not exists public.access_help_requests (
  id          uuid primary key default gen_random_uuid(),
  first_name  text not null,
  surname     text not null,
  email       text not null,
  phone       text,
  paid_on     text,
  proof_path  text not null,
  ip_hash     text,
  status      text not null default 'new',   -- 'new' | 'resolved'
  created_at  timestamptz not null default now()
);

alter table public.access_help_requests enable row level security;

-- Rate limiting reads "requests from this address in the last hour".
create index if not exists idx_access_help_ip_recent
  on public.access_help_requests (ip_hash, created_at desc);

-- Private bucket, 5 MB per file, images and PDFs only.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'proof-of-payment', 'proof-of-payment', false, 5242880,
  array['image/jpeg','image/png','image/webp','image/heic','image/heif','application/pdf']
)
on conflict (id) do nothing;
