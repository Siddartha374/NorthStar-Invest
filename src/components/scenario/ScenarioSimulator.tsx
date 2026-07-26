import { useMemo, useState, useEffect } from "react";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid,
} from "recharts";
import { runSimulation, ScenarioInput, ScenarioType } from "@/lib/scenarioEngine";
import { usePortfolio } from "@/hooks/usePortfolio";
import { useAuth } from "@/hooks/useAuth";
import { DEMO_GOALS, DEMO_PROFILE } from "@/lib/demoData";
import { Sliders, TrendingDown, Wallet, Zap } from "lucide-react";
import { Disclaimer } from "@/components/ui/Disclaimer";
import { formatINR } from "@/lib/utils";

export function ScenarioSimulator() {
  const { demoMode } = useAuth();
  const { summary } = usePortfolio(demoMode);
  const [type, setType] = useState<ScenarioType>("market_shift");
  const [horizonMonths, setHorizonMonths] = useState(36);
  const [marketShiftPct, setMarketShiftPct] = useState(-15);
  const [incomeChangePct, setIncomeChangePct] = useState(-20);
  const [lumpSumAmount, setLumpSumAmount] = useState(500000);
  const [lumpSumMonth, setLumpSumMonth] = useState(0);

  const goals = DEMO_GOALS;
  const monthlyContribution = DEMO_PROFILE.monthly_investment_capacity || 0;

  const result = useMemo(() => {
    if (!summary) return null;
    const input: ScenarioInput = {
      type,
      horizonMonths,
      monthlyContribution,
      marketShiftPct: type === "market_shift" ? marketShiftPct : undefined,
      incomeChangePct: type === "income_change" ? incomeChangePct : undefined,
      lumpSumAmount: type === "lump_sum" ? lumpSumAmount : undefined,
      lumpSumMonth: type === "lump_sum" ? lumpSumMonth : undefined,
    };
    return runSimulation(summary.totalValue, summary.holdings, goals, input);
  }, [
    summary,
    type,
    horizonMonths,
    marketShiftPct,
    incomeChangePct,
    lumpSumAmount,
    lumpSumMonth,
    monthlyContribution,
  ]);

  if (!summary || !result) {
    return (
      <div className="p-6 text-sm text-muted-foreground">Load a portfolio to run scenarios.</div>
    );
  }

  return (
    <div className="p-4 md:p-6 max-w-7xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold tracking-tight">Scenario Simulator</h1>
        <p className="text-sm text-muted-foreground mt-1">
          See how income changes, market moves or life events could affect your trajectory
        </p>
      </div>

      <div className="rounded-xl border bg-card overflow-hidden shadow-sm">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-0">
          {/* Controls */}
          <div className="p-5 border-r space-y-5">
            <div>
              <label className="text-xs font-medium text-muted-foreground">Scenario type</label>
              <div className="mt-1.5 grid grid-cols-1 gap-1.5">
                <TypeButton
                  active={type === "market_shift"}
                  onClick={() => setType("market_shift")}
                  icon={<TrendingDown className="h-3.5 w-3.5" />}
                  label="Market shift"
                />
                <TypeButton
                  active={type === "income_change"}
                  onClick={() => setType("income_change")}
                  icon={<Wallet className="h-3.5 w-3.5" />}
                  label="Income change"
                />
                <TypeButton
                  active={type === "lump_sum"}
                  onClick={() => setType("lump_sum")}
                  icon={<Zap className="h-3.5 w-3.5" />}
                  label="Lump-sum event"
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="font-medium text-muted-foreground">Time horizon</span>
                <span>{horizonMonths} months</span>
              </div>
              <input
                type="range"
                min={12}
                max={120}
                step={12}
                value={horizonMonths}
                onChange={(e) => setHorizonMonths(+e.target.value)}
                className="w-full accent-sky-600"
              />
              <div className="flex justify-between text-[10px] text-muted-foreground mt-0.5">
                <span>1 yr</span>
                <span>5 yr</span>
                <span>10 yr</span>
              </div>
            </div>

            {type === "market_shift" && (
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="font-medium text-muted-foreground">Broad market move</span>
                  <span className={marketShiftPct < 0 ? "text-red-600" : "text-emerald-600"}>
                    {marketShiftPct > 0 ? "+" : ""}
                    {marketShiftPct}%
                  </span>
                </div>
                <input
                  type="range"
                  min={-40}
                  max={30}
                  step={1}
                  value={marketShiftPct}
                  onChange={(e) => setMarketShiftPct(+e.target.value)}
                  className="w-full accent-sky-600"
                />
                <p className="text-[10px] text-muted-foreground mt-1">
                  Applied with different sensitivity per asset class
                </p>
              </div>
            )}

            {type === "income_change" && (
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="font-medium text-muted-foreground">Contribution change</span>
                  <span className={incomeChangePct < 0 ? "text-red-600" : "text-emerald-600"}>
                    {incomeChangePct > 0 ? "+" : ""}
                    {incomeChangePct}%
                  </span>
                </div>
                <input
                  type="range"
                  min={-50}
                  max={50}
                  step={5}
                  value={incomeChangePct}
                  onChange={(e) => setIncomeChangePct(+e.target.value)}
                  className="w-full accent-sky-600"
                />
              </div>
            )}

            {type === "lump_sum" && (
              <div className="space-y-3">
                <div>
                  <label className="text-xs font-medium text-muted-foreground">Amount (₹)</label>
                  <input
                    type="number"
                    value={lumpSumAmount}
                    onChange={(e) => setLumpSumAmount(+e.target.value)}
                    className="mt-1 w-full rounded-lg border px-3 py-1.5 text-sm"
                  />
                </div>
                <div>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="font-medium text-muted-foreground">When it occurs</span>
                    <span>Month {lumpSumMonth}</span>
                  </div>
                  <input
                    type="range"
                    min={0}
                    max={horizonMonths}
                    step={1}
                    value={lumpSumMonth}
                    onChange={(e) => setLumpSumMonth(+e.target.value)}
                    className="w-full accent-sky-600"
                  />
                </div>
              </div>
            )}

            <div className="rounded-lg bg-muted/50 p-3 text-sm">
              <div className="text-xs text-muted-foreground mb-1">Projected difference at horizon</div>
              <div
                className={`text-lg font-semibold ${
                  result.delta >= 0 ? "text-emerald-600" : "text-red-600"
                }`}
              >
                {result.delta >= 0 ? "+" : ""}
                {formatINR(Math.abs(result.delta))}
                <span className="text-xs font-normal ml-1">
                  ({result.deltaPct >= 0 ? "+" : ""}
                  {result.deltaPct}%)
                </span>
              </div>
            </div>
          </div>

          {/* Chart */}
          <div className="lg:col-span-2 p-5 space-y-5">
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={result.points} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="baseline" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#94a3b8" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#94a3b8" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="scenario" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#0ea5e9" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#0ea5e9" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                  <XAxis
                    dataKey="month"
                    tickFormatter={(m) => (m % 12 === 0 ? `${m / 12}y` : "")}
                    tick={{ fontSize: 11 }}
                    tickLine={false}
                    axisLine={false}
                  />
                  <YAxis
                    tickFormatter={(v) => `₹${(v / 100000).toFixed(1)}L`}
                    tick={{ fontSize: 11 }}
                    tickLine={false}
                    axisLine={false}
                    width={48}
                  />
                  <Tooltip
                    formatter={(value: number, name: string) => [
                      formatINR(value),
                      name === "baseline" ? "Baseline" : "Scenario",
                    ]}
                    labelFormatter={(m) => `Month ${m}`}
                  />
                  <Legend />
                  <Area
                    type="monotone"
                    dataKey="baseline"
                    name="Baseline"
                    stroke="#94a3b8"
                    strokeWidth={2}
                    fill="url(#baseline)"
                  />
                  <Area
                    type="monotone"
                    dataKey="scenario"
                    name="Scenario"
                    stroke="#0ea5e9"
                    strokeWidth={2}
                    fill="url(#scenario)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>

            {result.goalImpacts.length > 0 && (
              <div>
                <p className="text-xs font-medium text-muted-foreground mb-2">Impact on goals</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {result.goalImpacts.map((g) => (
                    <div key={g.id} className="rounded-lg border p-3 text-sm">
                      <div className="font-medium">{g.name}</div>
                      <div className="flex justify-between mt-1 text-xs">
                        <span className="text-muted-foreground">
                          Baseline {g.baselineProgress}%
                        </span>
                        <span
                          className={
                            g.statusChange === "improved"
                              ? "text-emerald-600"
                              : g.statusChange === "worsened"
                              ? "text-red-600"
                              : ""
                          }
                        >
                          Scenario {g.scenarioProgress}%
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
        <Disclaimer />
      </div>
    </div>
  );
}

function TypeButton({
  active,
  onClick,
  icon,
  label,
}: {
  active: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  label: string;
}) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-left transition-colors ${
        active ? "bg-sky-600 text-white" : "bg-muted/50 hover:bg-muted text-foreground"
      }`}
    >
      {icon}
      {label}
    </button>
  );
}

export default function ScenariosPage() {
  return <ScenarioSimulator />;
}
