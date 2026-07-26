import { useAuth } from "@/hooks/useAuth";
import { usePortfolioHealth } from "@/hooks/usePortfolioHealth";
import { Shield, PieChart, Target, AlertTriangle, Clock } from "lucide-react";
import { Skeleton } from "@/components/ui/Skeleton";
import { Disclaimer } from "@/components/ui/Disclaimer";
import { formatClass } from "@/lib/utils";

export function PortfolioHealth() {
  const { demoMode } = useAuth();
  const { health, loading } = usePortfolioHealth(demoMode);

  if (loading || !health) {
    return (
      <div className="p-6 space-y-4 max-w-7xl mx-auto">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  const { risk, diversification, goals, profile } = health;

  return (
    <div className="p-4 md:p-6 max-w-7xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold tracking-tight">Portfolio Health</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Risk profile → diversification → progress toward your goals
        </p>
      </div>

      <div className="rounded-xl border bg-card overflow-hidden shadow-sm">
        <div className="p-5 space-y-8">
          {/* RISK */}
          <section>
            <div className="flex items-center gap-2 mb-3">
              <Shield className="h-4 w-4 text-sky-600" />
              <h3 className="font-medium text-sm">Risk Snapshot</h3>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-3">
              <Metric label="Est. volatility" value={`${risk.portfolioVolatility}%`} sub="annualised" />
              <Metric label="Concentration" value={risk.concentrationLabel} sub={`HHI ${risk.herfindahl}`} />
              <Metric label="Largest class" value={`${risk.topClassPct}%`} sub={formatClass(risk.topClassName)} />
              <Metric label="Overall feel" value={risk.riskLabel.split("·")[0].trim()} />
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed">
              {risk.riskLabel}. This is an estimate based on the mix of assets you hold and typical
              long-term volatility ranges for each class — not a guarantee of future swings.
            </p>
          </section>

          {/* DIVERSIFICATION */}
          <section>
            <div className="flex items-center gap-2 mb-3">
              <PieChart className="h-4 w-4 text-violet-600" />
              <h3 className="font-medium text-sm">Diversification Check</h3>
              {diversification.matchesTolerance ? (
                <span className="text-[10px] bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full">
                  Aligned
                </span>
              ) : (
                <span className="text-[10px] bg-amber-100 text-amber-800 px-2 py-0.5 rounded-full">
                  Review suggested
                </span>
              )}
            </div>
            <p className="text-sm mb-3">{diversification.summary}</p>
            {diversification.mismatches.length > 0 && (
              <ul className="space-y-1.5 mb-3">
                {diversification.mismatches.map((m, i) => (
                  <li key={i} className="flex gap-2 text-sm">
                    <AlertTriangle className="h-3.5 w-3.5 text-amber-500 shrink-0 mt-0.5" />
                    <span>{m}</span>
                  </li>
                ))}
              </ul>
            )}
            <div className="flex flex-wrap gap-2 text-xs">
              {diversification.overRepresented.length > 0 && (
                <span className="bg-amber-50 text-amber-800 px-2 py-1 rounded">
                  Higher than typical: {diversification.overRepresented.map(formatClass).join(", ")}
                </span>
              )}
              {diversification.underRepresented.length > 0 && (
                <span className="bg-sky-50 text-sky-800 px-2 py-1 rounded">
                  Lower than typical: {diversification.underRepresented.map(formatClass).join(", ")}
                </span>
              )}
            </div>
            <p className="text-xs text-muted-foreground mt-3">
              These comparisons are educational. They look at broad ranges commonly associated with
              different risk stances — they are not personalised recommendations.
            </p>
          </section>

          {/* GOALS */}
          <section>
            <div className="flex items-center gap-2 mb-3">
              <Target className="h-4 w-4 text-emerald-600" />
              <h3 className="font-medium text-sm">Goal Progress</h3>
            </div>
            {goals.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                No active goals yet. Add a target amount and date to start tracking.
              </p>
            ) : (
              <div className="space-y-4">
                {goals.map((g) => (
                  <div key={g.id} className="rounded-lg border p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="font-medium text-sm">{g.name}</p>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          {g.monthsRemaining != null
                            ? `${g.monthsRemaining} months remaining`
                            : "No target date set"}
                        </p>
                      </div>
                      <StatusBadge status={g.status} label={g.statusLabel} />
                    </div>
                    <div className="mt-3">
                      <div className="flex justify-between text-xs mb-1">
                        <span>{g.progressPct}% of target</span>
                        <span className="text-muted-foreground">
                          Projected: ₹{g.projectedValueAtTarget?.toLocaleString("en-IN")}
                        </span>
                      </div>
                      <div className="h-2 rounded-full bg-muted overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all ${
                            g.status === "ahead"
                              ? "bg-emerald-500"
                              : g.status === "behind"
                              ? "bg-amber-500"
                              : "bg-sky-500"
                          }`}
                          style={{ width: `${Math.min(100, g.progressPct)}%` }}
                        />
                      </div>
                    </div>
                    {g.status === "behind" && g.shortfall != null && g.shortfall > 0 && (
                      <p className="text-xs text-amber-700 mt-2 flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        At the current trajectory, a gap of roughly ₹
                        {g.shortfall.toLocaleString("en-IN")} may remain. Illustration only.
                      </p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </section>
        </div>
        <Disclaimer />
      </div>
    </div>
  );
}

function Metric({ label, value, sub }: { label: string; value: string; sub?: string }) {
  return (
    <div className="rounded-lg bg-muted/40 p-3">
      <div className="text-[10px] text-muted-foreground uppercase">{label}</div>
      <div className="font-semibold text-sm mt-0.5">{value}</div>
      {sub && <div className="text-[10px] text-muted-foreground">{sub}</div>}
    </div>
  );
}

function StatusBadge({ status, label }: { status: string; label: string }) {
  const colors: Record<string, string> = {
    ahead: "bg-emerald-100 text-emerald-800",
    on_track: "bg-sky-100 text-sky-800",
    behind: "bg-amber-100 text-amber-800",
  };
  return (
    <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${colors[status] || ""}`}>
      {label}
    </span>
  );
}

export default function HealthPage() {
  return <PortfolioHealth />;
}
