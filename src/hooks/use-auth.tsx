import { createContext, useContext, useEffect, useState } from "react";
import { api, ApiError } from "@/lib/api";
import {
  clearStoredAdminSession,
  clearStoredCitizenSession,
  getStoredAdminSession,
  getStoredCitizenSession,
  setStoredAdminSession,
  setStoredCitizenSession,
} from "@/lib/auth-storage";
import { AuthSession, UserRole } from "@/types/api";

type RoleAuthState = {
  session: AuthSession | null;
  isAuthenticated: boolean;
  isHydrating: boolean;
  login: (session: AuthSession) => void;
  logout: () => void;
};

interface AuthContextValue {
  admin: RoleAuthState;
  citizen: RoleAuthState;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

type RoleConfig = {
  getStoredSession: () => AuthSession | null;
  setStoredSession: (session: AuthSession) => void;
  clearStoredSession: () => void;
  setSession: React.Dispatch<React.SetStateAction<AuthSession | null>>;
  setIsHydrating: React.Dispatch<React.SetStateAction<boolean>>;
};

function matchesRole(
  session: AuthSession | null,
  role: UserRole,
): session is AuthSession {
  return Boolean(session?.accessToken && session.user.role === role);
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [adminSession, setAdminSession] = useState<AuthSession | null>(
    getStoredAdminSession(),
  );
  const [citizenSession, setCitizenSession] = useState<AuthSession | null>(
    getStoredCitizenSession(),
  );
  const [isAdminHydrating, setIsAdminHydrating] = useState(true);
  const [isCitizenHydrating, setIsCitizenHydrating] = useState(true);

  useEffect(() => {
    let isMounted = true;

    async function restoreSession(role: UserRole, config: RoleConfig) {
      const storedSession = config.getStoredSession();

      if (!storedSession?.accessToken) {
        if (isMounted) {
          config.setSession(null);
          config.setIsHydrating(false);
        }
        return;
      }

      try {
        const user = await api.getProfile(storedSession.accessToken);

        if (user.role !== role) {
          config.clearStoredSession();
          if (isMounted) {
            config.setSession(null);
          }
          return;
        }

        if (isMounted) {
          const nextSession = { ...storedSession, user };
          config.setSession(nextSession);
          config.setStoredSession(nextSession);
        }
      } catch (error) {
        if (error instanceof ApiError && error.status === 401) {
          config.clearStoredSession();
        }
        if (isMounted) {
          config.setSession(null);
        }
      } finally {
        if (isMounted) {
          config.setIsHydrating(false);
        }
      }
    }

    void restoreSession("admin", {
      getStoredSession: getStoredAdminSession,
      setStoredSession: setStoredAdminSession,
      clearStoredSession: clearStoredAdminSession,
      setSession: setAdminSession,
      setIsHydrating: setIsAdminHydrating,
    });

    void restoreSession("citizen", {
      getStoredSession: getStoredCitizenSession,
      setStoredSession: setStoredCitizenSession,
      clearStoredSession: clearStoredCitizenSession,
      setSession: setCitizenSession,
      setIsHydrating: setIsCitizenHydrating,
    });

    return () => {
      isMounted = false;
    };
  }, []);

  function loginAdmin(nextSession: AuthSession) {
    if (nextSession.user.role !== "admin") {
      throw new Error("Admin auth can only store admin sessions.");
    }

    setStoredAdminSession(nextSession);
    setAdminSession(nextSession);
  }

  function logoutAdmin() {
    clearStoredAdminSession();
    setAdminSession(null);
  }

  function loginCitizen(nextSession: AuthSession) {
    if (nextSession.user.role !== "citizen") {
      throw new Error("Citizen auth can only store citizen sessions.");
    }

    setStoredCitizenSession(nextSession);
    setCitizenSession(nextSession);
  }

  function logoutCitizen() {
    clearStoredCitizenSession();
    setCitizenSession(null);
  }

  return (
    <AuthContext.Provider
      value={{
        admin: {
          session: adminSession,
          isAuthenticated: matchesRole(adminSession, "admin"),
          isHydrating: isAdminHydrating,
          login: loginAdmin,
          logout: logoutAdmin,
        },
        citizen: {
          session: citizenSession,
          isAuthenticated: matchesRole(citizenSession, "citizen"),
          isHydrating: isCitizenHydrating,
          login: loginCitizen,
          logout: logoutCitizen,
        },
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export function useRoleAuth(role: UserRole) {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }

  return role === "admin" ? context.admin : context.citizen;
}

// eslint-disable-next-line react-refresh/only-export-components
export function useAuth() {
  return useRoleAuth("admin");
}

// eslint-disable-next-line react-refresh/only-export-components
export function useCitizenAuth() {
  return useRoleAuth("citizen");
}
