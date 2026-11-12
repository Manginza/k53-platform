-- 28_whatsapp_bot.sql — WhatsApp version of the practice tests.
--
-- Four new tables, all server-only (RLS on, no policies: only the service
-- role used by the webhook can read or write them). Nothing existing changes.
--
--   wa_users              one row per WhatsApp number that has messaged the bot,
--                         optionally linked to a skdriving account.
--   wa_link_codes         short-lived codes that link a number to an account
--                         through the website (the learner logs in and confirms).
--   wa_quiz_sessions      one row per test attempt taken on WhatsApp.
--   wa_processed_messages message ids already handled, because Meta retries
--                         webhooks and the same tap must never count twice.

create table if not exists public.wa_users (
  wa_id         text primary key,                                   -- digits only, e.g. 27821234567
  user_id       uuid references auth.users(id) on delete set null,  -- linked skdriving account
  profile_name  text,
  created_at    timestamptz not null default now(),
  last_seen_at  timestamptz not null default now()
);
-- One WhatsApp number per account. Linking a new number frees the old one.
create unique index if not exists wa_users_user_id_key on public.wa_users(user_id) where user_id is not null;

create table if not exists public.wa_link_codes (
  code        text primary key,
  wa_id       text not null references public.wa_users(wa_id) on delete cascade,
  expires_at  timestamptz not null,
  used_at     timestamptz,
  used_by     uuid references auth.users(id) on delete set null,
  created_at  timestamptz not null default now()
);
create index if not exists wa_link_codes_wa_id_idx on public.wa_link_codes(wa_id);

create table if not exists public.wa_quiz_sessions (
  id            uuid primary key default gen_random_uuid(),
  wa_id         text not null references public.wa_users(wa_id) on delete cascade,
  course_id     integer not null,
  test_number   integer not null,
  mode          text not null check (mode in ('free', 'full')),
  question_ids  integer[] not null,
  position      integer not null default 0,     -- index of the question now on screen
  correct       integer not null default 0,
  answers       jsonb not null default '[]'::jsonb,
  started_at    timestamptz not null default now(),
  deadline      timestamptz,                    -- end of the free 10 minutes; null = untimed
  finished_at   timestamptz,
  finish_reason text check (finish_reason in ('completed', 'time', 'stopped', 'replaced'))
);
create index if not exists wa_quiz_sessions_lookup_idx
  on public.wa_quiz_sessions(wa_id, course_id, test_number, mode);
create index if not exists wa_quiz_sessions_open_idx
  on public.wa_quiz_sessions(wa_id) where finished_at is null;

create table if not exists public.wa_processed_messages (
  message_id   text primary key,
  received_at  timestamptz not null default now()
);

alter table public.wa_users              enable row level security;
alter table public.wa_link_codes         enable row level security;
alter table public.wa_quiz_sessions      enable row level security;
alter table public.wa_processed_messages enable row level security;
