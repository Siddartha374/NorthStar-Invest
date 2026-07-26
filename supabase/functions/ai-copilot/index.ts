// Supabase Edge Function: ai-copilot
// Deploy: supabase functions deploy ai-copilot
// Secret: supabase secrets set GEMINI_API_KEY=...

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const GEMINI_API_KEY = Deno.env.get("GEMINI_API_KEY")!;
const GEMINI_MODEL = "gemini-1.5-flash";
const GEMINI_URL = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${GEMINI_API_KEY}`;

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get("Authorization")!;
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
      { global: { headers: { Authorization: authHeader } } }
    );

    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const body = await req.json();
    const { mode = "proactive", question = null } = body;

    const context = await buildUserContext(supabase, user.id);

    if (mode === "macro") {
      const { data: macro } = await supabase
        .from("macro_indicators")
        .select("*")
        .order("as_of", { ascending: false })
        .limit(1)
        .single();
      const rules = deriveMacroRules(macro);
      const prompt = buildMacroPrompt(macro, context, rules);
      const result = await callGemini(prompt);
      return json(result || getMacroFallback(macro, context));
    }

    const prompt = buildPrompt(context, mode, question);
    let insights;
    try {
      insights = await callGemini(prompt);
    } catch (e) {
      console.error("Gemini failed:", e);
      insights = getFallbackInsights(context);
    }

    return json({
      insights,
      contextUsed: {
        risk_tolerance: context.profile.risk_tolerance,
        horizon: context.profile.investment_horizon,
        totalValue: context.totalValue,
        allocationPct: context.allocationPct,
        goalsCount: context.goals.length,
        recentTxnCount: context.recentTxnCount,
      },
    });
  } catch (err: any) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});

function json(data: unknown) {
  return new Response(JSON.stringify(data), {
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

async function callGemini(prompt: string) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 8000);
  const res = await fetch(GEMINI_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      contents: [{ role: "user", parts: [{ text: prompt }] }],
      generationConfig: {
        temperature: 0.3,
        maxOutputTokens: 1024,
        responseMimeType: "application/json",
      },
    }),
    signal: controller.signal,
  });
  clearTimeout(timeout);
  if (!res.ok) throw new Error(`Gemini ${res.status}`);
  const data = await res.json();
  const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
  return JSON.parse(text);
}

async function buildUserContext(supabase: any, userId: string) {
  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", userId)
    .single();

  const { data: goals } = await supabase
    .from("goals")
    .select("*")
    .eq("user_id", userId)
    .eq("status", "active");

  const { data: holdings } = await supabase
    .from("v_portfolio_holdings")
    .select("*")
    .eq("user_id", userId);

  const totalValue = (holdings || []).reduce((s: number, h: any) => s + (h.current_value || 0), 0);
  const allocation: Record<string, number> = {};
  (holdings || []).forEach((h: any) => {
    const cls = h.asset_class || "other";
    allocation[cls] = (allocation[cls] || 0) + (h.current_value || 0);
  });
  const allocationPct = Object.fromEntries(
    Object.entries(allocation).map(([k, v]) => [
      k,
      totalValue > 0 ? +((v / totalValue) * 100).toFixed(1) : 0,
    ])
  );

  return {
    profile: profile || {},
    goals: goals || [],
    totalValue,
    allocationPct,
    holdingsCount: (holdings || []).length,
    recentTxnCount: 0,
    topHoldings: (holdings || [])
      .sort((a: any, b: any) => (b.current_value || 0) - (a.current_value || 0))
      .slice(0, 5)
      .map((h: any) => ({
        symbol: h.symbol || h.name,
        asset_class: h.asset_class,
        value: h.current_value,
        pct: totalValue > 0 ? +((h.current_value / totalValue) * 100).toFixed(1) : 0,
      })),
  };
}

function buildPrompt(ctx: any, mode: string, question: string | null) {
  const system = `You are North Star Invest's AI Financial Copilot for Indian retail investors.
You give educational, non-advisory insights only.
Always return STRICT JSON.
Never invent numbers — only use the data provided.
Every insight MUST include an "evidence" array quoting exact numbers used.`;

  const dataBlock = `
USER CONTEXT:
- Risk tolerance: ${ctx.profile.risk_tolerance || "not set"}
- Investment horizon: ${ctx.profile.investment_horizon || "not set"}
- Primary goal: ${ctx.profile.primary_goal || "not set"}
- Monthly capacity: ₹${ctx.profile.monthly_investment_capacity || "not set"}
- Total portfolio value: ₹${ctx.totalValue.toLocaleString("en-IN")}
- Allocation %: ${JSON.stringify(ctx.allocationPct)}
- Holdings count: ${ctx.holdingsCount}
- Top holdings: ${JSON.stringify(ctx.topHoldings)}
- Active goals: ${JSON.stringify(ctx.goals)}
`;

  const schema = `
Return JSON:
{
  "insights": [
    {
      "type": "diversification" | "goal_progress" | "behavioral" | "opportunity",
      "title": "short title",
      "summary": "1-2 sentence insight",
      "rationale": "2-3 sentences",
      "evidence": ["exact data point 1", "..."],
      "severity": "low" | "medium" | "high",
      "actionable_suggestion": "one educational next step"
    }
  ]
}
Generate 3-4 insights.`;

  if (mode === "chat" && question) {
    return `${system}\n${dataBlock}\nUSER QUESTION: ${question}\nAnswer using only the context. Return the same JSON schema.\n${schema}`;
  }
  return `${system}\n${dataBlock}\nGenerate proactive insights focusing on diversification vs risk, goal progress, behavioural patterns, and under-represented classes.\n${schema}`;
}

function deriveMacroRules(macro: any): string[] {
  const rules: string[] = [];
  if (!macro) return rules;
  if (macro.inflation_trend === "rising" || (macro.inflation_cpi && macro.inflation_cpi > 6)) {
    rules.push("high_inflation: gold historically sought as partial hedge; real returns on cash/FDs compressed unless rates rise");
  }
  if (macro.repo_rate && macro.repo_rate >= 6) {
    rules.push("elevated_rates: long-duration bonds typically under pressure; FDs relatively more attractive; growth equities face higher discount-rate headwinds");
  }
  if (macro.market_cycle === "late_cycle") {
    rules.push("late_cycle: quality equities historically preferred; defensive sectors tend to show relative resilience");
  }
  if (macro.market_cycle === "mid_cycle") {
    rules.push("mid_cycle: equities typically supported by earnings growth; balanced portfolios common");
  }
  return rules;
}

function buildMacroPrompt(macro: any, ctx: any, rules: string[]) {
  return `You are North Star Invest's Macro Intelligence layer.
Explain how CURRENT macro conditions have HISTORICALLY interacted with asset classes.
Do NOT predict markets or give buy/sell advice.
Use "typically" / "historically" / "in environments like this".

MACRO: ${JSON.stringify(macro)}
RULES: ${rules.join("\n")}
PORTFOLIO: value=₹${ctx.totalValue}, allocation=${JSON.stringify(ctx.allocationPct)}, risk=${ctx.profile.risk_tolerance}

Return JSON:
{
  "macro_summary": "2-3 neutral sentences",
  "implications": [
    {
      "asset_class": "equities|bonds|fixed_deposits|gold|reits|...",
      "relevance": "high|medium|low",
      "historical_pattern": "sentence with typically/historically",
      "portfolio_link": "link to user's actual weight",
      "evidence": ["macro figure", "user allocation"]
    }
  ]
}`;
}

function getFallbackInsights(ctx: any) {
  const insights = [];
  const maxClass = Object.entries(ctx.allocationPct || {}).sort(
    (a: any, b: any) => b[1] - a[1]
  )[0] as [string, number] | undefined;

  if (maxClass && maxClass[1] > 55) {
    insights.push({
      type: "diversification",
      title: "High concentration detected",
      summary: `${maxClass[1]}% of your portfolio sits in a single asset class.`,
      severity: maxClass[1] > 70 ? "high" : "medium",
      evidence: [
        `Allocation: ${maxClass[0]} = ${maxClass[1]}%`,
        `Risk tolerance: ${ctx.profile.risk_tolerance || "not set"}`,
      ],
      rationale:
        "Concentrated portfolios can experience larger drawdowns. Your stated risk preference suggests a more balanced mix may be appropriate.",
      actionable_suggestion:
        "Review whether this concentration still matches your risk tolerance and goals.",
    });
  }

  if (ctx.goals?.length) {
    const g = ctx.goals[0];
    const progress = g.target_amount > 0 ? (g.current_amount / g.target_amount) * 100 : 0;
    insights.push({
      type: "goal_progress",
      title: `Goal: ${g.name}`,
      summary: `You are at ${progress.toFixed(0)}% of your target.`,
      severity: progress < 40 ? "medium" : "low",
      evidence: [
        `Current: ₹${Number(g.current_amount).toLocaleString("en-IN")}`,
        `Target: ₹${Number(g.target_amount).toLocaleString("en-IN")}`,
      ],
      rationale:
        "Tracking progress against a dated target helps surface whether the current savings rate is sufficient.",
      actionable_suggestion:
        "Consider whether increasing monthly contributions would keep you on schedule.",
    });
  }

  insights.push({
    type: "opportunity",
    title: "Asset-class coverage",
    summary: "Some diversifying asset classes may be underrepresented relative to your horizon.",
    severity: "low",
    evidence: [
      `Allocation: ${JSON.stringify(ctx.allocationPct)}`,
      `Horizon: ${ctx.profile.investment_horizon || "not set"}`,
    ],
    rationale:
      "A longer horizon can usually support a measured allocation to diversifying assets such as gold, REITs or high-quality debt.",
    actionable_suggestion:
      "Explore whether a small allocation to an underrepresented class would improve resilience.",
  });

  return { insights };
}

function getMacroFallback(macro: any, ctx: any) {
  return {
    macro_summary: macro?.notes || "Macro snapshot loaded.",
    implications: [
      {
        asset_class: "equities",
        relevance: "high",
        historical_pattern:
          "In environments like the current one, equities have typically been driven by earnings and valuations rather than policy alone.",
        portfolio_link: `Your equity weight is a major driver of overall portfolio behaviour.`,
        evidence: [
          `Cycle: ${macro?.market_cycle}`,
          `Repo: ${macro?.repo_rate}%`,
        ],
      },
    ],
  };
}
