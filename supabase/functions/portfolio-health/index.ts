// Supabase Edge Function: portfolio-health
// Goal projection with assumed returns by risk stance

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { goals, totalValue, monthlyContribution, riskTolerance } = await req.json();

    const assumedReturn: Record<string, number> = {
      conservative: 0.07,
      moderate: 0.1,
      aggressive: 0.12,
    };
    const r = assumedReturn[riskTolerance || "moderate"] || 0.1;
    const monthlyR = r / 12;

    const results = (goals || []).map((g: any) => {
      const targetDate = g.target_date ? new Date(g.target_date) : null;
      const monthsRemaining = targetDate
        ? Math.max(0, (targetDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24 * 30.44))
        : null;

      let projected = totalValue || 0;
      if (monthsRemaining && monthsRemaining > 0) {
        projected =
          (totalValue || 0) * Math.pow(1 + monthlyR, monthsRemaining) +
          (monthlyContribution || 0) *
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

    return new Response(JSON.stringify({ goals: results }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err: any) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
