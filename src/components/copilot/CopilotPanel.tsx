import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useCopilot } from "@/hooks/useCopilot";
import { InsightCard } from "./InsightCard";
import { Sparkles, AlertCircle, Send } from "lucide-react";
import { formatINR } from "@/lib/utils";

export function CopilotPanel() {
  const { demoMode } = useAuth();
  const {
    insights,
    contextUsed,
    loading,
    chatLoading,
    error,
    fallbackUsed,
    fetchProactive,
    ask,
  } = useCopilot(demoMode);
  const [question, setQuestion] = useState("");

  useEffect(() => {
    fetchProactive();
  }, [fetchProactive]);

  async function handleAsk(e: React.FormEvent) {
    e.preventDefault();
    if (!question.trim()) return;
    await ask(question.trim());
    setQuestion("");
  }

  return (
    <div className="p-4 md:p-6 max-w-3xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold tracking-tight">AI Financial Copilot</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Insights grounded in your goals, risk profile and portfolio
        </p>
      </div>

      <div className="flex flex-col rounded-xl border bg-card shadow-sm overflow-hidden min-h-[70vh]">
        <div className="px-4 py-3 border-b flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-sky-600" />
          <div>
            <h2 className="font-semibold text-sm">Copilot</h2>
            <p className="text-[11px] text-muted-foreground">
              Powered by your goals, risk profile & live portfolio
            </p>
          </div>
        </div>

        <div className="mx-4 mt-3 rounded-lg bg-amber-50 border border-amber-200 px-3 py-2 text-[11px] text-amber-900 flex gap-2">
          <AlertCircle className="h-3.5 w-3.5 shrink-0 mt-0.5" />
          <span>
            Educational insights only. This is <strong>not</strong> regulated financial advice
            under SEBI. Always consult a registered advisor before making decisions.
          </span>
        </div>

        {contextUsed && (
          <div className="mx-4 mt-2 text-[10px] text-muted-foreground bg-muted/50 rounded px-2 py-1.5">
            Using: risk={contextUsed.risk_tolerance || "—"} · horizon={contextUsed.horizon || "—"} ·
            value={formatINR(contextUsed.totalValue || 0)} · goals={contextUsed.goalsCount} ·
            recent txns={contextUsed.recentTxnCount}
            {fallbackUsed && " · offline insights"}
          </div>
        )}

        <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3">
          {loading && (
            <div className="text-center text-sm text-muted-foreground py-8">
              Analysing your portfolio…
            </div>
          )}
          {error && !fallbackUsed && (
            <div className="text-sm text-red-600 bg-red-50 rounded p-3">{error}</div>
          )}
          {!loading && insights.length === 0 && (
            <div className="text-center text-sm text-muted-foreground py-8">
              No insights yet. Ask a question or refresh.
            </div>
          )}
          {insights.map((ins, i) => (
            <InsightCard key={i} insight={ins} />
          ))}
        </div>

        <form onSubmit={handleAsk} className="p-3 border-t flex gap-2">
          <input
            type="text"
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            placeholder="Ask about diversification, goals, risk…"
            className="flex-1 rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
            disabled={chatLoading}
          />
          <button
            type="submit"
            disabled={chatLoading || !question.trim()}
            className="rounded-lg bg-sky-600 text-white px-3 py-2 hover:bg-sky-700 disabled:opacity-50"
          >
            <Send className="h-4 w-4" />
          </button>
        </form>
      </div>
    </div>
  );
}

export default function CopilotPage() {
  return <CopilotPanel />;
}
