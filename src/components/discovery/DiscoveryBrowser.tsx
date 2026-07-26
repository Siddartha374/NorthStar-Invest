import { useMemo, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { usePortfolio } from "@/hooks/usePortfolio";
import { calcDiversification } from "@/lib/portfolioHealth";
import { DEMO_ASSETS_CATALOGUE, DEMO_PROFILE } from "@/lib/demoData";
import { Search, Info } from "lucide-react";
import { formatClass } from "@/lib/utils";
import { Disclaimer } from "@/components/ui/Disclaimer";

export function DiscoveryBrowser() {
  const { demoMode } = useAuth();
  const { summary } = usePortfolio(demoMode);
  const [search, setSearch] = useState("");
  const [classFilter, setClassFilter] = useState("all");
  const [riskFilter, setRiskFilter] = useState("all");
  const [liquidityFilter, setLiquidityFilter] = useState("all");

  const assets = DEMO_ASSETS_CATALOGUE;

  const underRepresented = useMemo(() => {
    if (!summary) return new Set<string>();
    const div = calcDiversification(summary.holdings, DEMO_PROFILE.risk_tolerance);
    return new Set(div.underRepresented);
  }, [summary]);

  const filtered = useMemo(() => {
    return assets.filter((a) => {
      if (classFilter !== "all" && a.asset_class !== classFilter) return false;
      if (liquidityFilter !== "all" && a.liquidity !== liquidityFilter) return false;
      if (riskFilter !== "all") {
        const vol = a.volatility_annual ?? 12;
        if (riskFilter === "low" && vol > 6) return false;
        if (riskFilter === "medium" && (vol <= 6 || vol > 14)) return false;
        if (riskFilter === "high" && vol <= 14) return false;
      }
      if (search) {
        const q = search.toLowerCase();
        if (
          !a.name.toLowerCase().includes(q) &&
          !a.symbol?.toLowerCase().includes(q)
        )
          return false;
      }
      return true;
    });
  }, [assets, classFilter, riskFilter, liquidityFilter, search]);

  const classes = Array.from(new Set(assets.map((a) => a.asset_class)));

  return (
    <div className="rounded-xl border bg-card overflow-hidden shadow-sm">
      <div className="px-5 py-4 border-b">
        <h2 className="font-semibold text-sm">Discover Opportunities</h2>
        <p className="text-xs text-muted-foreground mt-0.5">
          Browse instruments across asset classes. Tags highlight areas currently under-represented in your portfolio.
        </p>
      </div>

      <div className="px-5 py-3 border-b flex flex-wrap gap-3 items-center bg-muted/20">
        <div className="relative flex-1 min-w-[180px]">
          <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search name, symbol…"
            className="w-full rounded-lg border pl-8 pr-3 py-1.5 text-sm"
          />
        </div>
        <select
          value={classFilter}
          onChange={(e) => setClassFilter(e.target.value)}
          className="rounded-lg border px-2.5 py-1.5 text-sm"
        >
          <option value="all">All classes</option>
          {classes.map((c) => (
            <option key={c} value={c}>
              {formatClass(c)}
            </option>
          ))}
        </select>
        <select
          value={riskFilter}
          onChange={(e) => setRiskFilter(e.target.value)}
          className="rounded-lg border px-2.5 py-1.5 text-sm"
        >
          <option value="all">Any risk</option>
          <option value="low">Lower volatility</option>
          <option value="medium">Moderate volatility</option>
          <option value="high">Higher volatility</option>
        </select>
        <select
          value={liquidityFilter}
          onChange={(e) => setLiquidityFilter(e.target.value)}
          className="rounded-lg border px-2.5 py-1.5 text-sm"
        >
          <option value="all">Any liquidity</option>
          <option value="high">High</option>
          <option value="medium">Medium</option>
          <option value="low">Low</option>
        </select>
      </div>

      <div className="p-5">
        <div className="text-xs text-muted-foreground mb-3">{filtered.length} instruments</div>
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
          {filtered.map((a) => {
            const helpsDiversify = underRepresented.has(a.asset_class);
            return (
              <div
                key={a.id}
                className={`rounded-lg border p-4 hover:border-sky-300 transition-colors ${
                  helpsDiversify ? "ring-1 ring-sky-200 bg-sky-50/30" : ""
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <div className="font-medium text-sm">{a.symbol || a.name}</div>
                    <div className="text-xs text-muted-foreground truncate max-w-[180px]">
                      {a.name}
                    </div>
                  </div>
                  <span className="text-[10px] bg-muted px-1.5 py-0.5 rounded capitalize">
                    {formatClass(a.asset_class)}
                  </span>
                </div>
                <div className="mt-3 grid grid-cols-3 gap-2 text-[11px]">
                  <div>
                    <div className="text-muted-foreground">Est. return</div>
                    <div className="font-medium">
                      {a.expected_return_annual != null ? `${a.expected_return_annual}%` : "—"}
                    </div>
                  </div>
                  <div>
                    <div className="text-muted-foreground">Volatility</div>
                    <div className="font-medium">
                      {a.volatility_annual != null ? `${a.volatility_annual}%` : "—"}
                    </div>
                  </div>
                  <div>
                    <div className="text-muted-foreground">Liquidity</div>
                    <div className="font-medium capitalize">{a.liquidity || "—"}</div>
                  </div>
                </div>
                {helpsDiversify && (
                  <div className="mt-3 flex items-center gap-1.5 text-[11px] text-sky-800 bg-sky-100 rounded px-2 py-1">
                    <Info className="h-3 w-3 shrink-0" />
                    Could help diversify — this class is currently under-represented
                  </div>
                )}
                <div className="mt-2">
                  <span
                    className={`text-[10px] px-1.5 py-0.5 rounded-full ${
                      a.data_source === "live"
                        ? "bg-emerald-100 text-emerald-800"
                        : "bg-slate-100 text-slate-600"
                    }`}
                  >
                    {a.data_source}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
        {filtered.length === 0 && (
          <div className="text-center py-12 text-sm text-muted-foreground">
            No instruments match the current filters.
          </div>
        )}
      </div>
      <Disclaimer />
    </div>
  );
}
