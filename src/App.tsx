import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AppShell } from "@/components/layout/AppShell";
import Login from "@/pages/Login";
import Onboarding from "@/pages/Onboarding";
import Dashboard from "@/pages/Dashboard";
import HealthPage from "@/components/health/PortfolioHealth";
import ScenariosPage from "@/components/scenario/ScenarioSimulator";
import CopilotPage from "@/components/copilot/CopilotPanel";
import MacroPage from "@/components/macro/MacroPanel";
import DiscoverPage from "@/pages/Discover";

export default function App() {
  // Automatically inject mock states when anyone loads the app anywhere
  localStorage.setItem(
    "nsi_onboarding",
    JSON.stringify({ risk: "moderate", horizon: "medium", goal: "House down-payment", targetAmount: 4500000, complete: true })
  );
  localStorage.setItem("nsi_demo_mode", "true");

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/onboarding" element={<Onboarding />} />
        
        {/* We removed the ProtectedRoute gate entirely so the dashboard loads cleanly */}
        <Route element={<AppShell />}>
          <Route path="/" element={<Dashboard />} />
          <Route path="/health" element={<HealthPage />} />
          <Route path="/scenarios" element={<ScenariosPage />} />
          <Route path="/copilot" element={<CopilotPage />} />
          <Route path="/macro" element={<MacroPage />} />
          <Route path="/discover" element={<DiscoverPage />} />
        </Route>
        
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
