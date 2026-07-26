import { useState, useCallback } from "react";
import { supabase, isSupabaseConfigured } from "@/lib/supabase";
import type { Insight } from "@/types";
import { DEMO_PROFILE, buildDemoSummary, DEMO_GOALS } from "@/lib/demoData";
import { calcRisk, calcDiversification } from "@/lib/portfolioHealth";

function getFallbackInsights(): Insight[] {
  const summary = buildDemoSummary();
  const risk = calcRisk(summary.holdings);
  const div = calcDiversification(summary.holdings, DEMO_PROFILE.risk_tolerance);

  const insights: Insight[] = [];

  if (risk.topClassPct > 55) {
    insights.push({
      type: "diversification",
      title: "High concentration detected",
      summary: `${risk.topClassPct}% of your portfolio sits in ${risk.topClassName.replace(/_/g, " ")}.`,
      severity: risk.topClassPct > 70 ? "high" : "medium",
      evidence: [
        `Allocation: ${risk.topClassName} = ${risk.topClassPct}%`,
        `Stated risk tolerance: ${DEMO_PROFILE.risk_tolerance}`,
        `HHI concentration index: ${risk.herfindahl}`,
      ],
      rationale:
        "Concentrated portfolios can experience larger drawdowns. Your stated risk preference suggests a more balanced mix may be appropriate.",
      actionable_suggestion:
        "Review whether this concentration still matches your risk tolerance and goals.",
    });
  }

  const g = DEMO_GOALS[0];
  const progress = (g.current_amount / g.target_amount) * 100;
  insights.push({
    type: "goal_progress",
    title: `Goal: ${g.name}`,
    summary: `You are at ${progress.toFixed(0)}% of your ₹${(g.target_amount / 100000).toFixed(1)}L target.`,
    severity: progress < 40 ? "medium" : "low",
    evidence: [
      `Current: ₹${g.current_amount.toLocaleString("en-IN")}`,
      `Target: ₹${g.target_amount.toLocaleString("en-IN")}`,
      `Target date: ${g.target_date}`,
    ],
    rationale:
      "Tracking progress against a dated target helps surface whether the current savings rate is sufficient.",
    actionable_suggestion:
      "Consider whether increasing monthly contributions would keep you on schedule.",
  });

  if (div.underRepresented.length) {
    insights.push({
      type: "opportunity",
      title: "Asset-class coverage gaps",
      summary: `Some asset classes typical for a ${DEMO_PROFILE.risk_tolerance} profile are under-represented.`,
      severity: "low",
      evidence: [
        `Under-represented: ${div.underRepresented.join(", ")}`,
        `Investment horizon: ${DEMO_PROFILE.investment_horizon}`,
      ],
      rationale:
        "A longer horizon can usually support a measured allocation to diversifying assets such as bonds, gold or REITs.",
      actionable_suggestion:
        "Explore whether a small allocation to an underrepresented class would improve resilience.",
    });
  }

  insights.push({
    type: "behavioral",
    title: "Contribution consistency",
    summary: "Regular monthly investing remains one of the strongest drivers of long-term outcomes.",
    severity: "low",
    evidence: [
      `Stated monthly capacity: ₹${DEMO_PROFILE.monthly_investment_capacity?.toLocaleString("en-IN")}`,
    ],
    rationale:
      "Even modest, uninterrupted contributions compound meaningfully over a multi-year horizon.",
    actionable_suggestion:
      "Keep the contribution amount aligned with your capacity and review it annually.",
  });

  return insights;
}

export function useCopilot(demoMode = false) {
  const [insights, setInsights] = useState<Insight[]>([]);
  const [contextUsed, setContextUsed] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [chatLoading, setChatLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fallbackUsed, setFallbackUsed] = useState(false);

  const fetchProactive = useCallback(async () => {
    setLoading(true);
    setError(null);
    setFallbackUsed(false);

    if (demoMode || !isSupabaseConfigured) {
      // Simulate network delay for realism
      await new Promise((r) => setTimeout(r, 600));
      setInsights(getFallbackInsights());
      setContextUsed({
        risk_tolerance: DEMO_PROFILE.risk_tolerance,
        horizon: DEMO_PROFILE.investment_horizon,
        totalValue: buildDemoSummary().totalValue,
        goalsCount: 1,
        recentTxnCount: 2,
      });
      setFallbackUsed(true);
      setLoading(false);
      return;
    }

    try {
      const { data, error: fnError } = await supabase.functions.invoke("ai-copilot", {
        body: { mode: "proactive" },
      });
      if (fnError) throw fnError;
      const list = data?.insights?.insights || data?.insights || [];
      setInsights(list);
      setContextUsed(data?.contextUsed);
    } catch (e: any) {
      setError(e.message);
      setInsights(getFallbackInsights());
      setFallbackUsed(true);
      setContextUsed({
        risk_tolerance: DEMO_PROFILE.risk_tolerance,
        horizon: DEMO_PROFILE.investment_horizon,
        totalValue: buildDemoSummary().totalValue,
        goalsCount: 1,
        recentTxnCount: 2,
      });
    } finally {
      setLoading(false);
    }
  }, [demoMode]);

  const ask = useCallback(
    async (question: string) => {
      setChatLoading(true);
      setError(null);

      if (demoMode || !isSupabaseConfigured) {
        await new Promise((r) => setTimeout(r, 800));
        const fallback = getFallbackInsights();
        // Simple keyword match for demo chat
        const q = question.toLowerCase();
        let extra: Insight = {
          type: "opportunity",
          title: "Response to your question",
          summary: "Based on your current portfolio and goals, here is an educational perspective.",
          severity: "low",
          evidence: [`Question: "${question}"`, `Risk stance: ${DEMO_PROFILE.risk_tolerance}`],
          rationale:
            "In environments like the current one, investors with similar profiles have often focused on diversification and contribution consistency rather than timing.",
          actionable_suggestion:
            "Review the Portfolio Health section for a structured view of risk and goal progress.",
        };
        if (q.includes("diversif") || q.includes("concentrat")) {
          extra = fallback.find((i) => i.type === "diversification") || extra;
        } else if (q.includes("goal") || q.includes("house") || q.includes("target")) {
          extra = fallback.find((i) => i.type === "goal_progress") || extra;
        }
        setInsights((prev) => [extra, ...prev]);
        setChatLoading(false);
        return [extra];
      }

      try {
        const { data, error: fnError } = await supabase.functions.invoke("ai-copilot", {
          body: { mode: "chat", question },
        });
        if (fnError) throw fnError;
        const newOnes = data?.insights?.insights || data?.insights || [];
        setInsights((prev) => [...newOnes, ...prev]);
        setContextUsed(data?.contextUsed);
        return newOnes;
      } catch (e: any) {
        setError(e.message);
        const fallback = getFallbackInsights().slice(0, 1);
        setInsights((prev) => [...fallback, ...prev]);
        setFallbackUsed(true);
        return fallback;
      } finally {
        setChatLoading(false);
      }
    },
    [demoMode]
  );

  return {
    insights,
    contextUsed,
    loading,
    chatLoading,
    error,
    fallbackUsed,
    fetchProactive,
    ask,
  };
}
