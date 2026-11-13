-- 29_whatsapp_one_open_session.sql
-- One running WhatsApp test per number. Two taps arriving together cannot
-- start two tests. Safe to run more than once. Requires migration 28.

create unique index if not exists wa_quiz_sessions_one_open_idx
  on public.wa_quiz_sessions (wa_id)
  where finished_at is null;
