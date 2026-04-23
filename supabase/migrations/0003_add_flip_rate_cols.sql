-- 0003: per-flip effective redemption rate tracking
-- effectiveCashRate: card.cashRate at time of flip ($/point as cash)
-- pointsEquivalent:  cashback / 0.01 — actual points earned (at 1¢/pt normalization)
-- cashValueAtFlip:   real dollar value of the cashback at cash-redemption rate

alter table public.flips
  add column if not exists effective_cash_rate  numeric,
  add column if not exists points_equivalent    numeric,
  add column if not exists cash_value_at_flip   numeric;
