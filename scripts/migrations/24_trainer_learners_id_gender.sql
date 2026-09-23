-- Migration 24: capture SA ID number + gender on trainer learners
-- Gender is classified from the SA ID (digits 7–10), see lib/sa-id.ts.
-- Run in: Supabase Dashboard → SQL Editor → New Query → Run

alter table public.trainer_learners
  add column if not exists id_number text,
  add column if not exists gender    text;
