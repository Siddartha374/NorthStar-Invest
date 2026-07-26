import type { Insight } from "@/types";
import { Shield, Target, Activity, Lightbulb, ChevronDown, ChevronUp } from "lucide-react";
import { useState } from "react";

const typeConfig = {
  diversification: { icon: Shield, label: "Diversification", color: "text-amber-600 bg-amber-50" },
  goal_progress: { icon: Target, label: "Goal Progress", color: "text-sky-600 bg-sky-50" },
  behavioral: { icon: Activity, label: "Behavioural", color: "text-violet-600 bg-violet-50" },
  opportunity: { icon: Lightbulb, label: "Opportunity", color: "text-emerald-600 bg-emerald-50" },
};

export function InsightCard({ insight }: { insight: Insight }) {
  const [open, setOpen] = useState(false);
  const cfg = typeConfig[insight.type] || typeConfig.opportunity;
  const Icon = cfg.icon;

  const severityColor =
    insight.severity === "high"
      ? "border-l-red-500"
      : insight.severity === "medium"
      ? "border-l-amber-500"
      : "border-l-emerald-500";

  return (
    <div className={`rounded-lg border bg-background border-l-4 ${severityColor} shadow-sm`}>
      <button
        onClick={() => setOpen(!open)}
        className="w-full text-left px-3 py-2.5 flex items-start gap-2"
      >
        <div className={`rounded p-1.5 ${cfg.color}`}>
          <Icon className="h-3.5 w-3.5" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
              {cfg.label}
            </span>
            <span className="text-[10px] text-muted-foreground">· {insight.severity}</span>
          </div>
          <p className="font-medium text-sm mt-0.5">{insight.title}</p>
          <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">{insight.summary}</p>
        </div>
        {open ? (
          <ChevronUp className="h-4 w-4 shrink-0" />
        ) : (
          <ChevronDown className="h-4 w-4 shrink-0" />
        )}
      </button>

      {open && (
        <div className="px-3 pb-3 pt-0 space-y-2 border-t">
          <div>
            <p className="text-[10px] font-semibold uppercase text-muted-foreground mb-1">
              Why this matters
            </p>
            <p className="text-xs">{insight.rationale}</p>
          </div>
          <div>
            <p className="text-[10px] font-semibold uppercase text-muted-foreground mb-1">
              Data used
            </p>
            <ul className="text-xs space-y-0.5">
              {insight.evidence.map((e, i) => (
                <li key={i} className="flex gap-1.5">
                  <span className="text-sky-600">▹</span>
                  <span className="font-mono text-[11px] bg-muted px-1 rounded">{e}</span>
                </li>
              ))}
            </ul>
          </div>
          <div className="rounded bg-sky-50 px-2 py-1.5 text-xs text-sky-900">
            <span className="font-medium">Suggestion: </span>
            {insight.actionable_suggestion}
          </div>
        </div>
      )}
    </div>
  );
}
