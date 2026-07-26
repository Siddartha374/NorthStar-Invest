import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";

export default function Login() {
  const { signIn, signUp, enterDemoMode, demoMode } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSignUp, setIsSignUp] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    const { error } = isSignUp
      ? await signUp(email, password)
      : await signIn(email, password);
    setLoading(false);
    if (error) {
      setError(error.message);
      return;
    }
    navigate("/");
  }

  function handleDemo() {
    enterDemoMode();
    navigate("/onboarding");
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex h-12 w-12 rounded-xl bg-sky-600 items-center justify-center text-white font-bold text-lg mb-3">
            NS
          </div>
          <h1 className="text-2xl font-semibold">North Star Invest</h1>
          <p className="text-sm text-muted-foreground mt-1">
            AI-powered multi-asset intelligence for Indian retail investors
          </p>
        </div>

        <div className="rounded-xl border bg-white p-6 shadow-sm">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-xs font-medium text-muted-foreground">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="mt-1 w-full rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
                placeholder="you@example.com"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
                className="mt-1 w-full rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
              />
            </div>
            {error && (
              <div className="text-sm text-red-600 bg-red-50 rounded-lg px-3 py-2">{error}</div>
            )}
            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-lg bg-sky-600 text-white py-2.5 text-sm font-medium hover:bg-sky-700 disabled:opacity-50"
            >
              {loading ? "Please wait…" : isSignUp ? "Create account" : "Sign in"}
            </button>
          </form>

          <div className="mt-4 text-center text-sm text-muted-foreground">
            {isSignUp ? "Already have an account?" : "New here?"}{" "}
            <button
              onClick={() => setIsSignUp(!isSignUp)}
              className="text-sky-600 hover:underline"
            >
              {isSignUp ? "Sign in" : "Create account"}
            </button>
          </div>

          <div className="relative my-5">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs">
              <span className="bg-white px-2 text-muted-foreground">or</span>
            </div>
          </div>

          <button
            onClick={handleDemo}
            className="w-full rounded-lg border border-sky-200 bg-sky-50 text-sky-800 py-2.5 text-sm font-medium hover:bg-sky-100"
          >
            Load demo portfolio (recommended for judges)
          </button>
        </div>

        <p className="text-center text-[10px] text-muted-foreground mt-6">
          SEBI Securities Market TechSprint · WealthTech track · Educational platform only
        </p>
      </div>
    </div>
  );
}
