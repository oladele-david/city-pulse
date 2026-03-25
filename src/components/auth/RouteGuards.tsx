import { Navigate, useLocation } from "react-router-dom";
import { useRoleAuth } from "@/hooks/use-auth";

type GuardRole = "admin" | "citizen";

type RouteGuardProps = {
  children: React.ReactNode;
  role?: GuardRole;
};

const GUARD_COPY: Record<
  GuardRole,
  {
    loginPath: string;
    appPath: string;
    restoringMessage: string;
    checkingMessage: string;
  }
> = {
  admin: {
    loginPath: "/console/login",
    appPath: "/console/dashboard",
    restoringMessage: "Restoring your admin session...",
    checkingMessage: "Checking your admin session...",
  },
  citizen: {
    loginPath: "/mobile/auth",
    appPath: "/mobile/report",
    restoringMessage: "Restoring your CityPulse account...",
    checkingMessage: "Checking your CityPulse account...",
  },
};

export function ProtectedRoute({
  children,
  role = "admin",
}: RouteGuardProps) {
  const { isAuthenticated, isHydrating } = useRoleAuth(role);
  const location = useLocation();
  const guardCopy = GUARD_COPY[role];

  if (isHydrating) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <div className="rounded-2xl border bg-white px-6 py-4 text-sm text-muted-foreground shadow-sm">
          {guardCopy.restoringMessage}
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <Navigate
        to={guardCopy.loginPath}
        replace
        state={{ from: location.pathname }}
      />
    );
  }

  return <>{children}</>;
}

export function PublicOnlyRoute({
  children,
  role = "admin",
}: RouteGuardProps) {
  const { isAuthenticated, isHydrating } = useRoleAuth(role);
  const location = useLocation();
  const guardCopy = GUARD_COPY[role];
  const fallbackPath =
    typeof location.state?.from === "string"
      ? location.state.from
      : guardCopy.appPath;

  if (isHydrating) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <div className="rounded-2xl border bg-white px-6 py-4 text-sm text-muted-foreground shadow-sm">
          {guardCopy.checkingMessage}
        </div>
      </div>
    );
  }

  if (isAuthenticated) {
    return <Navigate to={fallbackPath} replace />;
  }

  return <>{children}</>;
}
