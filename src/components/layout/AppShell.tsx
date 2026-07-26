import { NavLink, Outlet, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  HeartPulse,
  Sliders,
  Sparkles,
  Activity,
  Compass,
  LogOut,
  Menu,
  X,
} from "lucide-react";
import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { cn } from "@/lib/utils";

const NAV = [
  { to: "/", label: "Dashboard", icon: LayoutDashboard },
  { to: "/health", label: "Health", icon: HeartPulse },
  { to: "/scenarios", label: "Scenarios", icon: Sliders },
  { to: "/copilot", label: "Copilot", icon: Sparkles },
  { to: "/macro", label: "Macro", icon: Activity },
  { to: "/discover", label: "Discover", icon: Compass },
];

export function AppShell() {
  const { signOut, demoMode, user } = useAuth();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="min-h-screen bg-slate-50 flex">
      {/* Sidebar – desktop */}
      <aside className="hidden md:flex w-56 flex-col border-r bg-white">
        <div className="px-5 py-5 border-b">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-sky-600 flex items-center justify-center text-white font-bold text-sm">
              NS
            </div>
            <div>
              <div className="font-semibold text-sm leading-tight">North Star</div>
              <div className="text-[10px] text-muted-foreground">Invest</div>
            </div>
          </div>
        </div>

        <nav className="flex-1 p-3 space-y-0.5">
          {NAV.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === "/"}
              className={({ isActive }) =>
                cn(
                  "flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm transition-colors",
                  isActive
                    ? "bg-sky-50 text-sky-700 font-medium"
                    : "text-slate-600 hover:bg-slate-50"
                )
              }
            >
              <item.icon className="h-4 w-4" />
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="p-3 border-t">
          {demoMode && (
            <div className="mb-2 rounded-lg bg-amber-50 border border-amber-200 px-2.5 py-1.5 text-[10px] text-amber-800">
              Demo mode · sample portfolio
            </div>
          )}
          <div className="text-xs text-muted-foreground truncate px-1 mb-2">
            {user?.email}
          </div>
          <button
            onClick={() => {
              signOut();
              navigate("/login");
            }}
            className="flex items-center gap-2 w-full rounded-lg px-3 py-2 text-sm text-slate-600 hover:bg-slate-50"
          >
            <LogOut className="h-4 w-4" />
            Sign out
          </button>
        </div>
      </aside>

      {/* Mobile header */}
      <div className="md:hidden fixed top-0 left-0 right-0 z-40 bg-white border-b px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="h-7 w-7 rounded-md bg-sky-600 flex items-center justify-center text-white font-bold text-xs">
            NS
          </div>
          <span className="font-semibold text-sm">North Star</span>
        </div>
        <button onClick={() => setMobileOpen(!mobileOpen)}>
          {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {mobileOpen && (
        <div className="md:hidden fixed inset-0 z-30 bg-white pt-14 px-4">
          <nav className="space-y-1">
            {NAV.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.to === "/"}
                onClick={() => setMobileOpen(false)}
                className={({ isActive }) =>
                  cn(
                    "flex items-center gap-2.5 rounded-lg px-3 py-2.5 text-sm",
                    isActive ? "bg-sky-50 text-sky-700 font-medium" : "text-slate-600"
                  )
                }
              >
                <item.icon className="h-4 w-4" />
                {item.label}
              </NavLink>
            ))}
          </nav>
        </div>
      )}

      {/* Main content */}
      <main className="flex-1 overflow-auto pt-14 md:pt-0">
        <Outlet />
      </main>
    </div>
  );
}
