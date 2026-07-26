import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";
import { formatINR } from "@/lib/utils";

export function PerformanceChart({ totalValue }: { totalValue: number }) {
  const data = generateTrend(totalValue);

  return (
    <div className="rounded-xl border bg-card p-4 h-80 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-medium text-sm">Portfolio Value Trend</h3>
        <span className="text-xs text-muted-foreground">Last 90 days (illustrative)</span>
      </div>
      <ResponsiveContainer width="100%" height="85%">
        <AreaChart data={data} margin={{ top: 5, right: 5, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#0ea5e9" stopOpacity={0.3} />
              <stop offset="95%" stopColor="#0ea5e9" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
          <XAxis dataKey="date" tick={{ fontSize: 11 }} tickLine={false} axisLine={false} />
          <YAxis
            tickFormatter={(v) => `₹${(v / 100000).toFixed(1)}L`}
            tick={{ fontSize: 11 }}
            tickLine={false}
            axisLine={false}
            width={45}
          />
          <Tooltip
            formatter={(value: number) => [formatINR(value), "Value"]}
            labelStyle={{ fontWeight: 600 }}
          />
          <Area
            type="monotone"
            dataKey="value"
            stroke="#0ea5e9"
            strokeWidth={2}
            fill="url(#colorValue)"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}

function generateTrend(endValue: number) {
  const points = 12;
  const data = [];
  let value = endValue * 0.88;
  const now = new Date();
  for (let i = points - 1; i >= 0; i--) {
    const d = new Date(now);
    d.setDate(d.getDate() - i * 7);
    value = value * (1 + (Math.random() * 0.025 - 0.008));
    data.push({
      date: d.toLocaleDateString("en-IN", { day: "numeric", month: "short" }),
      value: Math.round(value),
    });
  }
  data[data.length - 1].value = Math.round(endValue);
  return data;
}
