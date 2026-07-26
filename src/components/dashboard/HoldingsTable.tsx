import { useMemo, useState } from "react";
import type { HoldingRow } from "@/types";
import { ArrowUpDown } from "lucide-react";
import { formatINR, formatClass } from "@/lib/utils";

type SortKey = "name" | "current_value" | "quantity" | "asset_class";

export function HoldingsTable({ holdings }: { holdings: HoldingRow[] }) {
  const [sortKey, setSortKey] = useState<SortKey>("current_value");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");

  const grouped = useMemo(() => {
    const sorted = [...holdings].sort((a, b) => {
      const aVal = a[sortKey] ?? "";
      const bVal = b[sortKey] ?? "";
      if (typeof aVal === "number" && typeof bVal === "number") {
        return sortDir === "asc" ? aVal - bVal : bVal - aVal;
      }
      return sortDir === "asc"
        ? String(aVal).localeCompare(String(bVal))
        : String(bVal).localeCompare(String(aVal));
    });

    return sorted.reduce<Record<string, HoldingRow[]>>((acc, h) => {
      const key = formatClass(h.asset_class);
      if (!acc[key]) acc[key] = [];
      acc[key].push(h);
      return acc;
    }, {});
  }, [holdings, sortKey, sortDir]);

  function toggleSort(key: SortKey) {
    if (sortKey === key) setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    else {
      setSortKey(key);
      setSortDir("desc");
    }
  }

  return (
    <div className="rounded-xl border bg-card overflow-hidden shadow-sm">
      <div className="px-4 py-3 border-b flex items-center justify-between">
        <h3 className="font-medium text-sm">Holdings</h3>
        <span className="text-xs text-muted-foreground">
          {holdings.length} positions · grouped by asset class
        </span>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-muted/50 text-muted-foreground">
            <tr>
              <th className="text-left px-4 py-2.5 font-medium">
                <button onClick={() => toggleSort("name")} className="inline-flex items-center gap-1 hover:text-foreground">
                  Asset <ArrowUpDown className="h-3.5 w-3.5" />
                </button>
              </th>
              <th className="text-right px-4 py-2.5 font-medium">
                <button onClick={() => toggleSort("quantity")} className="inline-flex items-center gap-1 hover:text-foreground">
                  Qty <ArrowUpDown className="h-3.5 w-3.5" />
                </button>
              </th>
              <th className="text-right px-4 py-2.5 font-medium">Avg Price</th>
              <th className="text-right px-4 py-2.5 font-medium">Current</th>
              <th className="text-right px-4 py-2.5 font-medium">
                <button onClick={() => toggleSort("current_value")} className="inline-flex items-center gap-1 hover:text-foreground">
                  Value <ArrowUpDown className="h-3.5 w-3.5" />
                </button>
              </th>
              <th className="text-center px-4 py-2.5 font-medium">Source</th>
            </tr>
          </thead>
          <tbody>
            {Object.entries(grouped).map(([cls, rows]) => (
              <GroupRows key={cls} cls={cls} rows={rows} />
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function GroupRows({ cls, rows }: { cls: string; rows: HoldingRow[] }) {
  return (
    <>
      <tr className="bg-muted/30">
        <td colSpan={6} className="px-4 py-2 font-medium text-xs uppercase tracking-wide text-muted-foreground">
          {cls}
        </td>
      </tr>
      {rows.map((h) => (
        <tr key={h.holding_id} className="border-t hover:bg-muted/20">
          <td className="px-4 py-2.5">
            <div className="font-medium">{h.symbol || h.name}</div>
            <div className="text-xs text-muted-foreground truncate max-w-[180px]">{h.name}</div>
          </td>
          <td className="px-4 py-2.5 text-right tabular-nums">
            {h.quantity.toLocaleString("en-IN", { maximumFractionDigits: 4 })}
          </td>
          <td className="px-4 py-2.5 text-right tabular-nums">
            {h.average_buy_price ? formatINR(h.average_buy_price) : "—"}
          </td>
          <td className="px-4 py-2.5 text-right tabular-nums">{formatINR(h.current_price)}</td>
          <td className="px-4 py-2.5 text-right font-medium tabular-nums">
            {formatINR(h.current_value)}
          </td>
          <td className="px-4 py-2.5 text-center">
            <span
              className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-medium ${
                h.data_source === "live"
                  ? "bg-emerald-100 text-emerald-800"
                  : "bg-slate-100 text-slate-600"
              }`}
            >
              {h.data_source}
            </span>
          </td>
        </tr>
      ))}
    </>
  );
}
