import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "@/hooks/use-auth";

export function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isHydrating } = useAuth();
  const location = useLocation();

  if (isHydrating) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <div className="rounded-2xl border bg-white px-6 py-4 text-sm text-muted-foreground shadow-sm">
          Restoring your admin session...
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/console/login" replace state={{ from: location.pathname }} />;
  }

  return <>{children}</>;
}

export function PublicOnlyRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isHydrating } = useAuth();

  if (isHydrating) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <div className="rounded-2xl border bg-white px-6 py-4 text-sm text-muted-foreground shadow-sm">
          Checking your session...
        </div>
      </div>
    );
  }

  if (isAuthenticated) {
    return <Navigate to="/console/dashboard" replace />;
  }

  return <>{children}</>;
}
