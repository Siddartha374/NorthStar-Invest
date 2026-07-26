import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { Check } from "lucide-react";

type Step = 1 | 2 | 3 | 4;

export default function Onboarding() {
  const navigate = useNavigate();
  const { enterDemoMode } = useAuth();
  const [step, setStep] = useState<Step>(1);
  const [risk, setRisk] = useState<"conservative" | "moderate" | "aggressive">("moderate");
  const [horizon, setHorizon] = useState<"short" | "medium" | "long">("long");
  const [goal, setGoal] = useState("House down-payment");
  const [targetAmount, setTargetAmount] = useState(4500000);

  function finish(useDemo: boolean) {
    if (useDemo) enterDemoMode();
    // In full Supabase mode you'd upsert profiles + goals here
    localStorage.setItem(
      "nsi_onboarding",
      JSON.stringify({ risk, horizon, goal, targetAmount, complete: true })
    );
    navigate("/");
  }

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="w-full max-w-lg">
        <div className="text-center mb-6">
          <div className="inline-flex h-10 w-10 rounded-xl bg-sky-600 items-center justify-center text-white font-bold mb-2">
            NS
          </div>
          <h1 className="text-xl font-semibold">Set up your North Star</h1>
          <p className="text-sm text-muted-foreground mt-1">Under 2 minutes · powers every module</p>
        </div>

        {/* Progress */}
        <div className="flex gap-2 mb-6">
          {[1, 2, 3, 4].map((s) => (
            <div
              key={s}
              className={`h-1.5 flex-1 rounded-full ${s <= step ? "bg-sky-600" : "bg-slate-200"}`}
            />
          ))}
        </div>

        <div className="rounded-xl border bg-white p-6 shadow-sm">
          {step === 1 && (
            <div className="space-y-4">
              <h2 className="font-medium">How do you think about risk?</h2>
              <p className="text-xs text-muted-foreground">
                This shapes diversification checks and projections across the app.
              </p>
              {(
                [
                  ["conservative", "Conservative", "Prefer stability; smaller swings"],
                  ["moderate", "Moderate", "Balance of growth and stability"],
                  ["aggressive", "Aggressive", "Comfortable with larger swings for higher growth"],
                ] as const
              ).map(([val, label, desc]) => (
                <button
                  key={val}
                  onClick={() => setRisk(val)}
                  className={`w-full text-left rounded-lg border p-3 transition-colors ${
                    risk === val ? "border-sky-500 bg-sky-50" : "hover:bg-slate-50"
                  }`}
                >
                  <div className="font-medium text-sm flex items-center gap-2">
                    {risk === val && <Check className="h-4 w-4 text-sky-600" />}
                    {label}
                  </div>
                  <div className="text-xs text-muted-foreground mt-0.5">{desc}</div>
                </button>
              ))}
              <button
                onClick={() => setStep(2)}
                className="w-full rounded-lg bg-sky-600 text-white py-2.5 text-sm font-medium hover:bg-sky-700"
              >
                Continue
              </button>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-4">
              <h2 className="font-medium">Investment horizon</h2>
              <p className="text-xs text-muted-foreground">When do you expect to need most of this money?</p>
              {(
                [
                  ["short", "Short", "Under 3 years"],
                  ["medium", "Medium", "3–7 years"],
                  ["long", "Long", "More than 7 years"],
                ] as const
              ).map(([val, label, desc]) => (
                <button
                  key={val}
                  onClick={() => setHorizon(val)}
                  className={`w-full text-left rounded-lg border p-3 ${
                    horizon === val ? "border-sky-500 bg-sky-50" : "hover:bg-slate-50"
                  }`}
                >
                  <div className="font-medium text-sm">{label}</div>
                  <div className="text-xs text-muted-foreground">{desc}</div>
                </button>
              ))}
              <div className="flex gap-2">
                <button onClick={() => setStep(1)} className="flex-1 rounded-lg border py-2.5 text-sm">
                  Back
                </button>
                <button
                  onClick={() => setStep(3)}
                  className="flex-1 rounded-lg bg-sky-600 text-white py-2.5 text-sm font-medium"
                >
                  Continue
                </button>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-4">
              <h2 className="font-medium">Primary goal</h2>
              <div className="grid grid-cols-2 gap-2">
                {["House down-payment", "Retirement", "Education", "Wealth creation"].map((g) => (
                  <button
                    key={g}
                    onClick={() => setGoal(g)}
                    className={`rounded-lg border p-3 text-sm text-left ${
                      goal === g ? "border-sky-500 bg-sky-50" : "hover:bg-slate-50"
                    }`}
                  >
                    {g}
                  </button>
                ))}
              </div>
              <div>
                <label className="text-xs text-muted-foreground">Target amount (₹)</label>
                <input
                  type="number"
                  value={targetAmount}
                  onChange={(e) => setTargetAmount(+e.target.value)}
                  className="mt-1 w-full rounded-lg border px-3 py-2 text-sm"
                />
              </div>
              <div className="flex gap-2">
                <button onClick={() => setStep(2)} className="flex-1 rounded-lg border py-2.5 text-sm">
                  Back
                </button>
                <button
                  onClick={() => setStep(4)}
                  className="flex-1 rounded-lg bg-sky-600 text-white py-2.5 text-sm font-medium"
                >
                  Continue
                </button>
              </div>
            </div>
          )}

          {step === 4 && (
            <div className="space-y-4">
              <h2 className="font-medium">Almost done</h2>
              <p className="text-sm text-muted-foreground">
                For the live demo, load a realistic sample portfolio (concentration risk, a goal
                slightly behind schedule, macro-relevant mix). Or continue with an empty portfolio.
              </p>
              <button
                onClick={() => finish(true)}
                className="w-full rounded-lg bg-sky-600 text-white py-3 text-sm font-medium hover:bg-sky-700"
              >
                Load demo portfolio (recommended for judges)
              </button>
              <button
                onClick={() => finish(false)}
                className="w-full rounded-lg border py-2.5 text-sm hover:bg-slate-50"
              >
                Start with empty portfolio
              </button>
              <button onClick={() => setStep(3)} className="w-full text-xs text-muted-foreground">
                Back
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
