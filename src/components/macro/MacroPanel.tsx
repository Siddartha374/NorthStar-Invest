import { useEffect, useState } from "react";
import { Activity, TrendingUp, Droplets, BarChart3 } from "lucide-react";
import { DEMO_MACRO, buildDemoSummary, DEMO_PROFILE } from "@/lib/demoData";
import { Disclaimer } from "@/components/ui/Disclaimer";
import { formatClass } from "@/lib/utils";

interface Implication {
  asset_class: string;
  relevance: "high" | "medium" | "low";
  historical_pattern: string;
  portfolio_link: string;
  evidence: string[];
}

export function MacroPanel() {
  const [macro] = useState(DEMO_MACRO);
  const [implications, setImplications] = useState<Implication[]>([]);
  const [summary, setSummary] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Deterministic macro implications (no network dependency for demo reliability)
    const port = buildDemoSummary();
    const alloc = port.allocation;

    const imps: Implication[] = [
      {
        asset_class: "equity",
        relevance: "high",
        historical_pattern:
          "In mid-cycle environments with stable inflation, equities have typically been supported by earnings growth, though valuations matter.",
        portfolio_link: `Equities are ~${alloc.find((a) => a.name.includes("equity"))?.percentage.toFixed(0) || 50}% of your portfolio — the largest sleeve.`,
        evidence: [
          `Market cycle: ${macro.market_cycle}`,
          `Your equity weight: high`,
          `Repo rate: ${macro.repo_rate}%`,
        ],
      },
      {
        asset_class: "fixed_deposit",
        relevance: "medium",
        historical_pattern:
          "With the policy rate around current levels, fixed deposits have historically offered competitive real returns when inflation is contained.",
        portfolio_link: "Your FD allocation provides ballast against equity volatility.",
        evidence: [
          `Repo rate: ${macro.repo_rate}%`,
          `CPI: ${macro.inflation_cpi}%`,
          `Inflation trend: ${macro.inflation_trend}`,
        ],
      },
      {
        asset_class: "bond",
        relevance: "medium",
        historical_pattern:
          "Long-duration bonds have typically been sensitive to rate expectations; a pause regime often reduces immediate price pressure.",
        portfolio_link: "Bonds are currently a smaller part of your mix relative to a moderate risk stance.",
        evidence: [
          `10Y G-Sec: ${macro.bond_yield_10y}%`,
          `Liquidity: ${macro.liquidity_condition}`,
        ],
      },
      {
        asset_class: "gold",
        relevance: "low",
        historical_pattern:
          "Gold has historically acted as a diversifier when real rates or global risk sentiment shift.",
        portfolio_link: "Your gold allocation (including SGB) adds a non-correlated sleeve.",
        evidence: [`USD-INR: ${macro.usd_inr}`, `Risk stance: ${DEMO_PROFILE.risk_tolerance}`],
      },
    ];

    setImplications(imps);
    setSummary(
      `Repo rate at ${macro.repo_rate}%, CPI at ${macro.inflation_cpi}% (${macro.inflation_trend}), liquidity ${macro.liquidity_condition}. The economy is in a ${macro.market_cycle.replace("_", " ")} phase with ${macro.equity_valuation} equity valuations. ${macro.notes}`
    );
    setLoading(false);
  }, []);

  if (loading) {
    return <div className="p-6 text-sm text-muted-foreground">Loading macro context…</div>;
  }

  return (
    <div className="p-4 md:p-6 max-w-7xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold tracking-tight">Macro Context</h1>
        <p className="text-sm text-muted-foreground mt-1">
          How current conditions have typically interacted with portfolios like yours
        </p>
      </div>

      <div className="rounded-xl border bg-card overflow-hidden shadow-sm">
        <div className="px-4 py-3 border-b flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Activity className="h-4 w-4 text-sky-600" />
            <h3 className="font-medium text-sm">Macro Context</h3>
          </div>
          <span className="text-[10px] text-muted-foreground">
            As of {new Date(macro.as_of).toLocaleDateString("en-IN")}
          </span>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-px bg-border">
          <Indicator label="Repo Rate" value={`${macro.repo_rate}%`} icon={<TrendingUp className="h-3.5 w-3.5" />} />
          <Indicator label="CPI Inflation" value={`${macro.inflation_cpi}%`} sub={macro.inflation_trend} />
          <Indicator label="Liquidity" value={macro.liquidity_condition} icon={<Droplets className="h-3.5 w-3.5" />} />
          <Indicator label="Cycle" value={macro.market_cycle.replace("_", " ")} icon={<BarChart3 className="h-3.5 w-3.5" />} />
        </div>

        {summary && (
          <div className="px-4 py-3 text-sm text-muted-foreground border-b">{summary}</div>
        )}

        <div className="p-4 space-y-3">
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
            What this environment has typically meant for portfolios like yours
          </p>
          {implications.map((imp, i) => (
            <div
              key={i}
              className={`rounded-lg border p-3 ${
                imp.relevance === "high" ? "border-sky-200 bg-sky-50/50" : "bg-muted/20"
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="font-medium text-sm capitalize">
                  {formatClass(imp.asset_class)}
                </span>
                <span className="text-[10px] uppercase text-muted-foreground">
                  {imp.relevance} relevance
                </span>
              </div>
              <p className="text-xs mt-1">{imp.historical_pattern}</p>
              <p className="text-xs mt-1 text-sky-800">{imp.portfolio_link}</p>
              <div className="mt-2 flex flex-wrap gap-1">
                {imp.evidence.map((e, j) => (
                  <span
                    key={j}
                    className="text-[10px] font-mono bg-background border rounded px-1.5 py-0.5"
                  >
                    {e}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
        <Disclaimer />
      </div>
    </div>
  );
}

function Indicator({
  label,
  value,
  sub,
  icon,
}: {
  label: string;
  value: string;
  sub?: string;
  icon?: React.ReactNode;
}) {
  return (
    <div className="bg-card p-3">
      <div className="flex items-center gap-1 text-[10px] text-muted-foreground uppercase">
        {icon}
        {label}
      </div>
      <div className="font-semibold text-sm mt-0.5 capitalize">{value}</div>
      {sub && <div className="text-[10px] text-muted-foreground capitalize">{sub}</div>}
    </div>
  );
}

export default function MacroPage() {
  return <MacroPanel />;
}
