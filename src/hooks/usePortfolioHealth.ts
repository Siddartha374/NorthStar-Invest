import { useMemo, useEffect, useState } from "react";
import { usePortfolio } from "./usePortfolio";
import { calcRisk, calcDiversification } from "@/lib/portfolioHealth";
import { DEMO_PROFILE, DEMO_GOALS } from "@/lib/demoData";
import { supabase, isSupabaseConfigured } from "@/lib/supabase";
import type { Goal } from "@/types";

export interface GoalStatus {
  id: string;
  name: string;
  progressPct: number;
  status: "ahead" | "on_track" | "behind";
  statusLabel: string;
  projectedValueAtTarget: number | null;
  shortfall: number | null;
  monthsRemaining: number | null;
}

function projectGoals(
  goals: Goal[],
  totalValue: number,
  monthlyContribution: number,
  riskTolerance: string
): GoalStatus[] {
  const assumedReturn: Record<string, number> = {
    conservative: 0.07,
    moderate: 0.1,
    aggressive: 0.12,
  };
  const r = assumedReturn[riskTolerance] || 0.1;
  const monthlyR = r / 12;

  return goals.map((g) => {
    const targetDate = g.target_date ? new Date(g.target_date) : null;
    const monthsRemaining = targetDate
      ? Math.max(
          0,
          (targetDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24 * 30.44)
        )
      : null;

    let projected = totalValue;
    if (monthsRemaining && monthsRemaining > 0) {
      projected =
        totalValue * Math.pow(1 + monthlyR, monthsRemaining) +
        monthlyContribution *
          ((Math.pow(1 + monthlyR, monthsRemaining) - 1) / monthlyR);
    }

    const progressPct =
      g.target_amount > 0 ? (g.current_amount / g.target_amount) * 100 : 0;
    const shortfall = g.target_amount - projected;

    let status: "ahead" | "on_track" | "behind" = "on_track";
    if (shortfall < -g.target_amount * 0.05) status = "ahead";
    else if (shortfall > g.target_amount * 0.1) status = "behind";

    return {
      id: g.id,
      name: g.name,
      progressPct: +progressPct.toFixed(1),
      status,
      statusLabel:
        status === "ahead"
          ? "Ahead of plan"
          : status === "behind"
          ? "Behind plan"
          : "Broadly on track",
      projectedValueAtTarget: Math.round(projected),
      shortfall: Math.round(shortfall),
      monthsRemaining: monthsRemaining ? Math.round(monthsRemaining) : null,
    };
  });
}

export function usePortfolioHealth(demoMode = false) {
  const { summary, loading: portLoading } = usePortfolio(demoMode);
  const [goalStatuses, setGoalStatuses] = useState<GoalStatus[]>([]);
  const [profile, setProfile] = useState(DEMO_PROFILE);

  useEffect(() => {
    if (demoMode || !isSupabaseConfigured) {
      setProfile(DEMO_PROFILE);
      return;
    }
    supabase
      .from("profiles")
      .select("*")
      .single()
      .then(({ data }) => {
        if (data) setProfile(data);
      });
  }, [demoMode]);

  useEffect(() => {
    if (!summary) return;

    if (demoMode || !isSupabaseConfigured) {
      setGoalStatuses(
        projectGoals(
          DEMO_GOALS,
          summary.totalValue,
          profile.monthly_investment_capacity || 0,
          profile.risk_tolerance || "moderate"
        )
      );
      return;
    }

    (async () => {
      const { data: goals } = await supabase
        .from("goals")
        .select("*")
        .eq("status", "active");

      // Prefer Edge Function; fall back to client projection
      try {
        const { data } = await supabase.functions.invoke("portfolio-health", {
          body: {
            goals: goals || [],
            totalValue: summary.totalValue,
            monthlyContribution: profile.monthly_investment_capacity,
            riskTolerance: profile.risk_tolerance,
          },
        });
        if (data?.goals) {
          setGoalStatuses(data.goals);
          return;
        }
      } catch {
        // fall through
      }
      setGoalStatuses(
        projectGoals(
          goals || [],
          summary.totalValue,
          profile.monthly_investment_capacity || 0,
          profile.risk_tolerance || "moderate"
        )
      );
    })();
  }, [summary, profile, demoMode]);

  const health = useMemo(() => {
    if (!summary) return null;
    const risk = calcRisk(summary.holdings);
    const diversification = calcDiversification(
      summary.holdings,
      profile.risk_tolerance
    );
    return { risk, diversification, goals: goalStatuses, profile };
  }, [summary, profile, goalStatuses]);

  return { health, loading: portLoading || !health };
}
