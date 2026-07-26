import { useEffect, useState, useCallback } from "react";
import { supabase, isSupabaseConfigured } from "@/lib/supabase";
import type { HoldingRow, PortfolioSummary } from "@/types";
import { buildDemoSummary } from "@/lib/demoData";
import { formatClass } from "@/lib/utils";

export function usePortfolio(demoMode = false) {
  const [summary, setSummary] = useState<PortfolioSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);

    if (demoMode || !isSupabaseConfigured) {
      setSummary(buildDemoSummary());
      setLoading(false);
      return;
    }

    try {
      const { data: portfolios, error: pErr } = await supabase
        .from("portfolios")
        .select("id, name")
        .order("is_default", { ascending: false })
        .limit(1);

      if (pErr) throw pErr;

      if (!portfolios?.length) {
        setSummary(null);
        setLoading(false);
        return;
      }

      const portfolioId = portfolios[0].id;

      const { data: holdings, error: hErr } = await supabase
        .from("v_portfolio_holdings")
        .select("*")
        .eq("portfolio_id", portfolioId);

      if (hErr) throw hErr;

      const rows = (holdings || []) as HoldingRow[];
      const totalValue = rows.reduce((s, r) => s + (r.current_value || 0), 0);
      const totalInvested = rows.reduce(
        (s, r) => s + r.quantity * (r.average_buy_price || 0),
        0
      );
      const absoluteReturn = totalValue - totalInvested;
      const absoluteReturnPct =
        totalInvested > 0 ? (absoluteReturn / totalInvested) * 100 : 0;

      const byClass = rows.reduce<Record<string, number>>((acc, r) => {
        const cls = r.asset_class || "other";
        acc[cls] = (acc[cls] || 0) + (r.current_value || 0);
        return acc;
      }, {});

      const allocation = Object.entries(byClass)
        .map(([name, value]) => ({
          name: formatClass(name),
          value,
          percentage: totalValue > 0 ? (value / totalValue) * 100 : 0,
        }))
        .sort((a, b) => b.value - a.value);

      const skewed = allocation.find((a) => a.percentage > 60);

      setSummary({
        totalValue,
        totalInvested,
        absoluteReturn,
        absoluteReturnPct,
        allocation,
        isSkewed: !!skewed,
        skewedClass: skewed?.name ?? null,
        holdings: rows,
        portfolioId,
      });
    } catch (e: any) {
      setError(e.message || "Failed to load portfolio");
      // Fallback to demo so the UI never goes blank
      setSummary(buildDemoSummary());
    } finally {
      setLoading(false);
    }
  }, [demoMode]);

  useEffect(() => {
    load();
  }, [load]);

  return { summary, loading, error, refresh: load };
}
