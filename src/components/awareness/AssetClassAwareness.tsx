import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
  Tooltip,
  Legend,
} from "recharts";

const CLASS_META = [
  { key: "equity", name: "Equities", risk: 8, return: 8, liquidity: 9, oneLiner: "Ownership stakes in companies. Highest long-term growth potential, highest short-term swings." },
  { key: "etf", name: "ETFs", risk: 7, return: 7, liquidity: 9, oneLiner: "Baskets of stocks or bonds that trade like a single share. Easy way to spread risk." },
  { key: "mutual_fund", name: "Mutual Funds", risk: 6, return: 6.5, liquidity: 7, oneLiner: "Professionally managed pools. NAV updates daily; exit loads can apply for early redemption." },
  { key: "bond", name: "Bonds", risk: 4, return: 5, liquidity: 5, oneLiner: "Loans to governments or companies. More stable than equities, but prices fall when rates rise." },
  { key: "fixed_deposit", name: "Fixed Deposits", risk: 1, return: 4, liquidity: 3, oneLiner: "Bank deposits with a fixed rate and tenure. Capital is very stable; early exit usually costs interest." },
  { key: "gold", name: "Gold", risk: 5, return: 5, liquidity: 6, oneLiner: "Physical, Sovereign Gold Bonds or gold ETFs. Often used as a diversifier and inflation hedge." },
  { key: "reit", name: "REITs", risk: 6, return: 6, liquidity: 6, oneLiner: "Real Estate Investment Trusts own income-producing properties and must distribute most of their income." },
  { key: "invit", name: "InvITs", risk: 5.5, return: 6, liquidity: 5, oneLiner: "Infrastructure Investment Trusts own roads, power lines, pipelines etc. and pass through cash flows." },
  { key: "alternative", name: "Alternatives", risk: 9, return: 8, liquidity: 2, oneLiner: "Private credit, invoice discounting, startup secondaries etc. Higher potential return, lower liquidity and transparency." },
];

export function AssetClassAwareness() {
  const radarData = CLASS_META.map((c) => ({
    class: c.name,
    Risk: c.risk,
    Return: c.return,
    Liquidity: c.liquidity,
  }));

  return (
    <div className="rounded-xl border bg-card overflow-hidden shadow-sm">
      <div className="px-5 py-4 border-b">
        <h2 className="font-semibold text-sm">Asset Class Awareness</h2>
        <p className="text-xs text-muted-foreground mt-0.5">
          A neutral map of risk, return potential and liquidity across the major building blocks of a portfolio
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-0">
        <div className="p-5 border-r">
          <p className="text-xs font-medium text-muted-foreground mb-2">
            Relative characteristics (illustrative scale 1–10)
          </p>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart data={radarData} cx="50%" cy="50%" outerRadius="70%">
                <PolarGrid stroke="#e2e8f0" />
                <PolarAngleAxis dataKey="class" tick={{ fontSize: 10 }} />
                <PolarRadiusAxis angle={30} domain={[0, 10]} tick={{ fontSize: 9 }} />
                <Radar name="Risk" dataKey="Risk" stroke="#ef4444" fill="#ef4444" fillOpacity={0.15} />
                <Radar name="Return" dataKey="Return" stroke="#0ea5e9" fill="#0ea5e9" fillOpacity={0.15} />
                <Radar name="Liquidity" dataKey="Liquidity" stroke="#10b981" fill="#10b981" fillOpacity={0.15} />
                <Legend wrapperStyle={{ fontSize: 11 }} />
                <Tooltip />
              </RadarChart>
            </ResponsiveContainer>
          </div>
          <p className="text-[10px] text-muted-foreground mt-2">
            Scales are educational approximations based on typical long-term behaviour, not forecasts.
          </p>
        </div>

        <div className="p-5 max-h-[28rem] overflow-y-auto space-y-3">
          {CLASS_META.map((c) => (
            <div key={c.key} className="rounded-lg border p-3">
              <div className="font-medium text-sm">{c.name}</div>
              <p className="text-xs text-muted-foreground mt-1 leading-relaxed">{c.oneLiner}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="border-t px-5 py-4 bg-muted/20">
        <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-3">
          Closer look at less familiar categories
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <ExplainerCard
            title="REITs – Real Estate Investment Trusts"
            points={[
              "Own and operate income-producing real estate (offices, malls, warehouses, etc.).",
              "By regulation they distribute the bulk of their income to unit holders.",
              "Trade on the stock exchange, so you can buy and sell more easily than physical property.",
              "Prices can still move with interest rates and property cycles.",
            ]}
          />
          <ExplainerCard
            title="InvITs – Infrastructure Investment Trusts"
            points={[
              "Own operating infrastructure assets such as roads, power transmission lines or pipelines.",
              "Cash flows come from long-term contracts or regulated tariffs.",
              "Also exchange-traded and required to distribute most of their cash.",
              "Tend to be less volatile than pure equities but are still subject to interest-rate and regulatory risk.",
            ]}
          />
        </div>
      </div>
    </div>
  );
}

function ExplainerCard({ title, points }: { title: string; points: string[] }) {
  return (
    <div className="rounded-lg border bg-background p-4">
      <div className="font-medium text-sm mb-2">{title}</div>
      <ul className="space-y-1.5">
        {points.map((p, i) => (
          <li key={i} className="text-xs text-muted-foreground flex gap-2">
            <span className="text-sky-600 mt-0.5">•</span>
            <span>{p}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
