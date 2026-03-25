import { AuthSession } from "@/types/api";

const ADMIN_SESSION_KEY = "citypulse.admin.session";
const CITIZEN_SESSION_KEY = "citypulse.citizen.session";

function readSession(key: string): AuthSession | null {
  if (typeof window === "undefined") {
    return null;
  }

  const rawValue = window.localStorage.getItem(key);
  if (!rawValue) {
    return null;
  }

  try {
    return JSON.parse(rawValue) as AuthSession;
  } catch {
    window.localStorage.removeItem(key);
    return null;
  }
}

function writeSession(key: string, session: AuthSession) {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.setItem(key, JSON.stringify(session));
}

function clearSession(key: string) {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.removeItem(key);
}

export function getStoredAdminSession() {
  return readSession(ADMIN_SESSION_KEY);
}

export function setStoredAdminSession(session: AuthSession) {
  writeSession(ADMIN_SESSION_KEY, session);
}

export function clearStoredAdminSession() {
  clearSession(ADMIN_SESSION_KEY);
}

export function getStoredCitizenSession() {
  return readSession(CITIZEN_SESSION_KEY);
}

export function setStoredCitizenSession(session: AuthSession) {
  writeSession(CITIZEN_SESSION_KEY, session);
}

export function clearStoredCitizenSession() {
  clearSession(CITIZEN_SESSION_KEY);
}
