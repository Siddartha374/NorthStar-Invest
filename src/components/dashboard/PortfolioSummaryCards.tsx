import { TrendingUp, TrendingDown, Wallet, Target } from "lucide-react";
import type { PortfolioSummary } from "@/types";
import { formatINR } from "@/lib/utils";

export function PortfolioSummaryCards({ summary }: { summary: PortfolioSummary }) {
  const isPositive = summary.absoluteReturn >= 0;

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      <Card label="Total Value" value={formatINR(summary.totalValue)} icon={<Wallet className="h-4 w-4" />} />
      <Card label="Invested" value={formatINR(summary.totalInvested)} icon={<Target className="h-4 w-4" />} />
      <Card
        label="Absolute Return"
        value={`${isPositive ? "+" : ""}${formatINR(summary.absoluteReturn)}`}
        sub={`${isPositive ? "+" : ""}${summary.absoluteReturnPct.toFixed(2)}%`}
        icon={
          isPositive ? (
            <TrendingUp className="h-4 w-4 text-emerald-600" />
          ) : (
            <TrendingDown className="h-4 w-4 text-red-600" />
          )
        }
        valueClass={isPositive ? "text-emerald-600" : "text-red-600"}
      />
      <Card label="Asset Classes" value={String(summary.allocation.length)} sub="across your portfolio" />
    </div>
  );
}

function Card({
  label,
  value,
  sub,
  icon,
  valueClass = "",
}: {
  label: string;
  value: string;
  sub?: string;
  icon?: React.ReactNode;
  valueClass?: string;
}) {
  return (
    <div className="rounded-xl border bg-card p-4 shadow-sm">
      <div className="flex items-center justify-between text-sm text-muted-foreground">
        <span>{label}</span>
        {icon}
      </div>
      <div className={`mt-2 text-xl font-semibold ${valueClass}`}>{value}</div>
      {sub && <div className="text-xs text-muted-foreground mt-0.5">{sub}</div>}
    </div>
  );
}
