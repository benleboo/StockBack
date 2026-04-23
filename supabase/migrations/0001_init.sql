-- profiles: one row per authenticated user
create table if not exists public.profiles (
  user_id    uuid primary key references auth.users(id) on delete cascade,
  email      text,
  name       text,
  created_at timestamptz default now()
);

-- flips: cashback-to-stock mapping rows
create table if not exists public.flips (
  id           uuid primary key default gen_random_uuid(),
  user_id      uuid not null references public.profiles(user_id) on delete cascade,
  ticker       text not null,
  merchant     text not null,
  category     text,
  card_id      text,
  confidence   numeric,
  flipped      boolean default false,
  done         boolean default false,
  statement_id text,
  created_at   timestamptz default now()
);

-- portfolio_holdings: fractional share positions
create table if not exists public.portfolio_holdings (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references public.profiles(user_id) on delete cascade,
  ticker      text not null,
  shares      numeric not null default 0,
  avg_price   numeric,
  created_at  timestamptz default now(),
  unique (user_id, ticker)
);

-- user_cards: credit cards the user has linked
create table if not exists public.user_cards (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null references public.profiles(user_id) on delete cascade,
  card_id    text not null,
  nickname   text,
  created_at timestamptz default now()
);

-- Row-level security: each user sees only their own rows
alter table public.profiles           enable row level security;
alter table public.flips              enable row level security;
alter table public.portfolio_holdings enable row level security;
alter table public.user_cards         enable row level security;

create policy "own profile"  on public.profiles           for all using (auth.uid() = user_id);
create policy "own flips"    on public.flips              for all using (auth.uid() = user_id);
create policy "own holdings" on public.portfolio_holdings for all using (auth.uid() = user_id);
create policy "own cards"    on public.user_cards         for all using (auth.uid() = user_id);
