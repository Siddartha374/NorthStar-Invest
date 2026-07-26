import { PieChart, Plus } from "lucide-react";
import { Link } from "react-router-dom";

export function EmptyPortfolioState() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] p-6 text-center">
      <div className="rounded-full bg-sky-50 p-4 mb-4">
        <PieChart className="h-10 w-10 text-sky-600" />
      </div>
      <h2 className="text-xl font-semibold">No holdings yet</h2>
      <p className="text-muted-foreground mt-2 max-w-md text-sm">
        Add your equities, mutual funds, bonds, gold, REITs or fixed deposits to see a
        unified view of your entire portfolio.
      </p>
      <Link
        to="/discover"
        className="mt-6 inline-flex items-center gap-2 rounded-lg bg-sky-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-sky-700"
      >
        <Plus className="h-4 w-4" />
        Explore opportunities
      </Link>
    </div>
  );
}
