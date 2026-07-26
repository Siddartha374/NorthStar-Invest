import { useAuth } from "@/hooks/useAuth";
import { usePortfolio } from "@/hooks/usePortfolio";
import { PortfolioSummaryCards } from "@/components/dashboard/PortfolioSummaryCards";
import { PerformanceChart } from "@/components/dashboard/PerformanceChart";
import { AllocationDonut } from "@/components/dashboard/AllocationDonut";
import { HoldingsTable } from "@/components/dashboard/HoldingsTable";
import { DiversificationAlert } from "@/components/dashboard/DiversificationAlert";
import { EmptyPortfolioState } from "@/components/dashboard/EmptyPortfolioState";
import { Skeleton } from "@/components/ui/Skeleton";
import { DEMO_PROFILE } from "@/lib/demoData";

export default function Dashboard() {
  const { demoMode } = useAuth();
  const { summary, loading, error } = usePortfolio(demoMode);

  if (loading) {
    return (
      <div className="p-6 space-y-6 max-w-7xl mx-auto">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-24 w-full" />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Skeleton className="h-80 lg:col-span-2" />
          <Skeleton className="h-80" />
        </div>
        <Skeleton className="h-96 w-full" />
      </div>
    );
  }

  if (error && !summary) {
    return (
      <div className="p-6">
        <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-red-800 text-sm">
          Failed to load portfolio: {error}
        </div>
      </div>
    );
  }

  if (!summary || summary.holdings.length === 0) {
    return <EmptyPortfolioState />;
  }

  const skewedPct =
    summary.allocation.find((a) => a.name === summary.skewedClass)?.percentage ?? 0;

  return (
    <div className="p-4 md:p-6 space-y-6 max-w-7xl mx-auto">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Portfolio Overview</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Unified view across equities, funds, bonds, gold, REITs & alternatives
          {demoMode && (
            <span className="ml-2 text-amber-700">
              · {DEMO_PROFILE.full_name} (demo)
            </span>
          )}
        </p>
      </div>

      {summary.isSkewed && summary.skewedClass && (
        <DiversificationAlert skewedClass={summary.skewedClass} percentage={skewedPct} />
      )}

      <PortfolioSummaryCards summary={summary} />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <PerformanceChart totalValue={summary.totalValue} />
        </div>
        <div>
          <AllocationDonut allocation={summary.allocation} />
        </div>
      </div>

      <HoldingsTable holdings={summary.holdings} />
    </div>
  );
}
