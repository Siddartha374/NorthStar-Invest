import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AppShell } from "@/components/layout/AppShell";
import { ProtectedRoute } from "@/components/layout/ProtectedRoute";
import Login from "@/pages/Login";
import Onboarding from "@/pages/Onboarding";
import Dashboard from "@/pages/Dashboard";
import HealthPage from "@/components/health/PortfolioHealth";
import ScenariosPage from "@/components/scenario/ScenarioSimulator";
import CopilotPage from "@/components/copilot/CopilotPanel";
import MacroPage from "@/components/macro/MacroPanel";
import DiscoverPage from "@/pages/Discover";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/onboarding" element={<Onboarding />} />
        <Route
          element={
            <ProtectedRoute>
              <AppShell />
            </ProtectedRoute>
          }
        >
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
