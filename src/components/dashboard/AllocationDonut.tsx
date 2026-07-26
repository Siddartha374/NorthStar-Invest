import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip, Legend } from "recharts";
import { formatINR } from "@/lib/utils";

const COLORS = [
  "#0ea5e9", "#8b5cf6", "#10b981", "#f59e0b",
  "#ef4444", "#6366f1", "#ec4899", "#14b8a6", "#84cc16",
];

export function AllocationDonut({
  allocation,
}: {
  allocation: { name: string; value: number; percentage: number }[];
}) {
  return (
    <div className="rounded-xl border bg-card p-4 h-80 shadow-sm">
      <h3 className="font-medium text-sm mb-2">Asset Allocation</h3>
      <ResponsiveContainer width="100%" height="90%">
        <PieChart>
          <Pie
            data={allocation}
            dataKey="value"
            nameKey="name"
            cx="50%"
            cy="45%"
            innerRadius={55}
            outerRadius={80}
            paddingAngle={2}
          >
            {allocation.map((_, i) => (
              <Cell key={i} fill={COLORS[i % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip
            formatter={(value: number, _name: string, props: any) => [
              `${formatINR(value)} (${props.payload.percentage.toFixed(1)}%)`,
              props.payload.name,
            ]}
          />
          <Legend
            layout="horizontal"
            verticalAlign="bottom"
            iconType="circle"
            iconSize={8}
            wrapperStyle={{ fontSize: 11 }}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}
