import { createContext, useContext, useEffect, useState } from "react";
import { api, ApiError } from "@/lib/api";
import {
  clearStoredAdminSession,
  getStoredAdminSession,
  setStoredAdminSession,
} from "@/lib/auth-storage";
import { AuthSession } from "@/types/api";

interface AuthContextValue {
  session: AuthSession | null;
  isAuthenticated: boolean;
  isHydrating: boolean;
  login: (session: AuthSession) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<AuthSession | null>(getStoredAdminSession());
  const [isHydrating, setIsHydrating] = useState(true);

  useEffect(() => {
    let isMounted = true;

    async function validateSession() {
      const storedSession = getStoredAdminSession();

      if (!storedSession?.accessToken) {
        if (isMounted) {
          setSession(null);
          setIsHydrating(false);
        }
        return;
      }

      try {
        const user = await api.getAdminProfile(storedSession.accessToken);
        if (isMounted) {
          const nextSession = { ...storedSession, user };
          setSession(nextSession);
          setStoredAdminSession(nextSession);
        }
      } catch (error) {
        if (error instanceof ApiError && error.status === 401) {
          clearStoredAdminSession();
        }
        if (isMounted) {
          setSession(null);
        }
      } finally {
        if (isMounted) {
          setIsHydrating(false);
        }
      }
    }

    void validateSession();

    return () => {
      isMounted = false;
    };
  }, []);

  function login(nextSession: AuthSession) {
    setStoredAdminSession(nextSession);
    setSession(nextSession);
  }

  function logout() {
    clearStoredAdminSession();
    setSession(null);
  }

  return (
    <AuthContext.Provider
      value={{
        session,
        isAuthenticated: Boolean(session?.accessToken && session.user.role === "admin"),
        isHydrating,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }

  return context;
}
