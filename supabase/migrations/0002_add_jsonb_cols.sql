-- 0002: widen schema for app data model
-- Run this after 0001_init.sql

-- flips.id must be text because the app generates string IDs like
-- "manual-1234567890" and "upload-stmt-2026-03-abc-0"
alter table public.flips alter column id type text using id::text;
alter table public.flips alter column id drop default;

-- Store the purchases array (array of {date, desc, amount}) and
-- optional resolution metadata on each flip row
alter table public.flips
  add column if not exists purchases       jsonb   not null default '[]',
  add column if not exists resolved_price  numeric,
  add column if not exists resolved_name   text;

-- Portfolio holdings need the full buys history and live price data
alter table public.portfolio_holdings
  add column if not exists buys              jsonb   not null default '[]',
  add column if not exists current_price     numeric not null default 0,
  add column if not exists day_change_pct    numeric not null default 0,
  add column if not exists day_change_dollar numeric not null default 0;

-- user_cards needs the full card object (rewards, brandStyle, etc.)
-- and a unique constraint so we can upsert by (user_id, card_id)
alter table public.user_cards
  add column if not exists card_data jsonb;

create unique index if not exists user_cards_user_card_idx
  on public.user_cards (user_id, card_id);
