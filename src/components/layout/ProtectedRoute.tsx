import { Navigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";

export function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, demoMode, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-sm text-muted-foreground">Loading…</div>
      </div>
    );
  }

  // If the user is NOT logged in AND they are NOT in demo mode, kick them to login
  if (!isAuthenticated && !demoMode) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
}
