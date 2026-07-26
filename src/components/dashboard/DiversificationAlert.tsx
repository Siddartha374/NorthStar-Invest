import { AlertTriangle } from "lucide-react";

export function DiversificationAlert({
  skewedClass,
  percentage,
}: {
  skewedClass: string;
  percentage: number;
}) {
  return (
    <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 flex gap-3">
      <AlertTriangle className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
      <div>
        <p className="font-medium text-amber-900 text-sm">Portfolio concentration detected</p>
        <p className="text-sm text-amber-800 mt-0.5">
          {percentage.toFixed(0)}% of your portfolio is in <strong>{skewedClass}</strong>.
          High concentration increases risk. Consider reviewing diversification across asset classes.
        </p>
      </div>
    </div>
  );
}
