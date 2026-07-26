export type AssetClass =
  | "equity"
  | "etf"
  | "mutual_fund"
  | "bond"
  | "fixed_deposit"
  | "gold"
  | "reit"
  | "invit"
  | "alternative"
  | "other";

export type RiskTolerance = "conservative" | "moderate" | "aggressive";
export type InvestmentHorizon = "short" | "medium" | "long";
export type Liquidity = "high" | "medium" | "low";

export interface Profile {
  id: string;
  email?: string;
  full_name?: string;
  risk_tolerance?: RiskTolerance;
  investment_horizon?: InvestmentHorizon;
  primary_goal?: string;
  monthly_investment_capacity?: number;
  onboarding_complete?: boolean;
}

export interface HoldingRow {
  holding_id: string;
  portfolio_id: string;
  user_id?: string;
  asset_id: string;
  symbol: string;
  name: string;
  asset_class: AssetClass;
  asset_subtype: string | null;
  data_source: "live" | "mock";
  quantity: number;
  average_buy_price: number | null;
  current_price: number;
  current_value: number;
  liquidity: Liquidity | null;
  expected_return_annual: number | null;
  volatility_annual: number | null;
  maturity_date: string | null;
  coupon_rate: number | null;
  interest_rate: number | null;
  tenure_months: number | null;
}

export interface PortfolioSummary {
  totalValue: number;
  totalInvested: number;
  absoluteReturn: number;
  absoluteReturnPct: number;
  allocation: { name: string; value: number; percentage: number }[];
  isSkewed: boolean;
  skewedClass: string | null;
  holdings: HoldingRow[];
  portfolioId?: string;
}

export interface Goal {
  id: string;
  name: string;
  target_amount: number;
  current_amount: number;
  target_date: string | null;
  priority?: number;
  status: string;
}

export interface Insight {
  type: "diversification" | "goal_progress" | "behavioral" | "opportunity";
  title: string;
  summary: string;
  rationale: string;
  evidence: string[];
  severity: "low" | "medium" | "high";
  actionable_suggestion: string;
}
