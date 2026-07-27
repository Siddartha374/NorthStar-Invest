import { Navigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";

export function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, loading } = useAuth();
  
  // Check if our direct demo override exists in browser storage
  const isHardDemo = localStorage.getItem("nsi_demo_mode") === "true";

  if (loading && !isHardDemo) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-sm text-muted-foreground">Loading…</div>
      </div>
    );
  }

  // If there's no database login session AND no hard demo override, send to login
  if (!isAuthenticated && !isHardDemo) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
}
