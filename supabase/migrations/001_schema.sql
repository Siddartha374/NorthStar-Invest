-- North Star Invest – Core Schema + RLS
-- Run this in the Supabase SQL editor

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text,
  full_name text,
  risk_tolerance text check (risk_tolerance in ('conservative', 'moderate', 'aggressive')),
  investment_horizon text check (investment_horizon in ('short', 'medium', 'long')),
  primary_goal text,
  monthly_investment_capacity numeric(12,2),
  onboarding_complete boolean default false,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists public.goals (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  name text not null,
  target_amount numeric(15,2) not null,
  current_amount numeric(15,2) default 0,
  target_date date,
  priority integer default 1,
  status text default 'active' check (status in ('active', 'achieved', 'paused')),
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists public.assets (
  id uuid primary key default gen_random_uuid(),
  symbol text not null,
  name text not null,
  asset_class text not null check (asset_class in (
    'equity', 'etf', 'mutual_fund', 'bond', 'fixed_deposit',
    'gold', 'reit', 'invit', 'alternative', 'other'
  )),
  asset_subtype text,
  exchange text,
  currency text default 'INR',
  isin text,
  issuer text,
  maturity_date date,
  coupon_rate numeric(6,3),
  interest_rate numeric(6,3),
  tenure_months integer,
  face_value numeric(12,2),
  amc text,
  category text,
  expense_ratio numeric(5,3),
  nav_frequency text,
  liquidity text check (liquidity in ('high','medium','low')),
  expected_return_annual numeric(6,3),
  volatility_annual numeric(6,3),
  data_source text not null default 'mock' check (data_source in ('live','mock')),
  metadata jsonb default '{}',
  created_at timestamptz default now(),
  unique(symbol, exchange)
);

create table if not exists public.portfolios (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  name text not null default 'My Portfolio',
  description text,
  is_default boolean default false,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists public.holdings (
  id uuid primary key default gen_random_uuid(),
  portfolio_id uuid not null references public.portfolios(id) on delete cascade,
  asset_id uuid not null references public.assets(id),
  quantity numeric(18,8) not null default 0,
  average_buy_price numeric(15,4),
  current_value numeric(15,2),
  last_updated timestamptz default now(),
  unique(portfolio_id, asset_id)
);

create table if not exists public.price_history (
  id bigserial primary key,
  asset_id uuid not null references public.assets(id) on delete cascade,
  price numeric(15,4) not null,
  recorded_at timestamptz not null default now(),
  source text default 'manual'
);

create table if not exists public.transactions (
  id uuid primary key default gen_random_uuid(),
  portfolio_id uuid not null references public.portfolios(id) on delete cascade,
  asset_id uuid not null references public.assets(id),
  txn_type text not null check (txn_type in ('buy','sell','dividend','interest','maturity')),
  quantity numeric(18,8),
  price numeric(15,4),
  amount numeric(15,2) not null,
  txn_date date not null default current_date,
  notes text,
  created_at timestamptz default now()
);

create table if not exists public.macro_indicators (
  id uuid primary key default gen_random_uuid(),
  as_of date not null default current_date,
  repo_rate numeric(5,2),
  inflation_cpi numeric(5,2),
  inflation_trend text check (inflation_trend in ('rising','stable','falling')),
  liquidity_condition text check (liquidity_condition in ('tight','neutral','ample')),
  market_cycle text check (market_cycle in ('early_cycle','mid_cycle','late_cycle','recessionary')),
  equity_valuation text check (equity_valuation in ('cheap','fair','expensive')),
  bond_yield_10y numeric(5,2),
  usd_inr numeric(6,2),
  notes text,
  updated_at timestamptz default now()
);

create index if not exists idx_goals_user on public.goals (user_id);
create index if not exists idx_portfolios_user on public.portfolios (user_id);
create index if not exists idx_holdings_portfolio on public.holdings (portfolio_id);
create index if not exists idx_price_history_asset on public.price_history (asset_id, recorded_at desc);

create or replace view public.v_portfolio_holdings as
select
  h.id as holding_id,
  h.portfolio_id,
  p.user_id,
  a.id as asset_id,
  a.symbol,
  a.name,
  a.asset_class,
  a.asset_subtype,
  a.data_source,
  h.quantity,
  h.average_buy_price,
  coalesce(
    (select ph.price from public.price_history ph
     where ph.asset_id = a.id order by ph.recorded_at desc limit 1),
    h.average_buy_price, 0
  ) as current_price,
  coalesce(
    h.quantity * coalesce(
      (select ph.price from public.price_history ph
       where ph.asset_id = a.id order by ph.recorded_at desc limit 1),
      h.average_buy_price, 0
    ),
    h.current_value, 0
  ) as current_value,
  a.liquidity,
  a.expected_return_annual,
  a.volatility_annual,
  a.maturity_date,
  a.coupon_rate,
  a.interest_rate,
  a.tenure_months
from public.holdings h
join public.portfolios p on p.id = h.portfolio_id
join public.assets a on a.id = h.asset_id;

alter table public.profiles enable row level security;
alter table public.goals enable row level security;
alter table public.portfolios enable row level security;
alter table public.holdings enable row level security;
alter table public.transactions enable row level security;
alter table public.macro_indicators enable row level security;
alter table public.assets enable row level security;
alter table public.price_history enable row level security;

create policy "Users manage own profile" on public.profiles for all
  using (auth.uid() = id) with check (auth.uid() = id);

create policy "Users manage own goals" on public.goals for all
  using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "Users manage own portfolios" on public.portfolios for all
  using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "Users manage holdings in own portfolios" on public.holdings for all
  using (exists (select 1 from public.portfolios p where p.id = holdings.portfolio_id and p.user_id = auth.uid()))
  with check (exists (select 1 from public.portfolios p where p.id = holdings.portfolio_id and p.user_id = auth.uid()));

create policy "Users manage own transactions" on public.transactions for all
  using (exists (select 1 from public.portfolios p where p.id = transactions.portfolio_id and p.user_id = auth.uid()))
  with check (exists (select 1 from public.portfolios p where p.id = transactions.portfolio_id and p.user_id = auth.uid()));

create policy "Authenticated users can read macro" on public.macro_indicators for select
  to authenticated using (true);

create policy "Authenticated read assets" on public.assets for select to authenticated using (true);
create policy "Authenticated read prices" on public.price_history for select to authenticated using (true);
