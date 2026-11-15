"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { apiFetch, HAS_API } from "../lib/api";
import {
  isActiveRole,
  rolesFromDbRole,
  type ActiveRole,
  type DbRole,
} from "../lib/roles";
import {
  decodeJwt,
  readStorage,
  ROLE_CHANGED_EVENT,
  STORAGE_KEYS,
  writeRoleCookie,
  writeStorage,
  type RoleChangedDetail,
} from "../lib/session";

export interface SessionUser {
  id: string;
  username: string;
  displayName: string;
  avatarUrl: string | null;
  roles: ActiveRole[];
}

export type AuthStatus = "loading" | "guest" | "authenticated";

interface AuthContextValue {
  status: AuthStatus;
  user: SessionUser | null;
  activeRole: ActiveRole;
  isSwitchingRole: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  switchRole: (target: ActiveRole) => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

interface JwtPayload {
  sub?: string;
  username?: string;
  role?: DbRole;
  exp?: number;
}

function userFromToken(token: string): SessionUser | null {
  const payload = decodeJwt<JwtPayload>(token);
  if (!payload?.sub) return null;
  if (payload.exp && payload.exp * 1000 < Date.now()) return null;
  const username = payload.username ?? "user";
  return {
    id: payload.sub,
    username,
    displayName: username,
    avatarUrl: null,
    roles: rolesFromDbRole(payload.role),
  };
}

/** Demo session used only when NEXT_PUBLIC_API_URL is not configured. */
function demoUser(email: string): SessionUser {
  const username = email.split("@")[0] || "demo";
  return {
    id: "demo-user",
    username,
    displayName: username,
    avatarUrl: "/images/avatar.jpg",
    roles: ["buyer", "creator", "merchant"],
  };
}

function readStoredUser(): SessionUser | null {
  const raw = readStorage(STORAGE_KEYS.user);
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw) as SessionUser;
    if (parsed && typeof parsed.id === "string" && Array.isArray(parsed.roles)) {
      return { ...parsed, roles: parsed.roles.filter(isActiveRole) };
    }
  } catch {
    /* corrupted entry: treat as guest */
  }
  return null;
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [status, setStatus] = useState<AuthStatus>("loading");
  const [user, setUser] = useState<SessionUser | null>(null);
  const [activeRole, setActiveRole] = useState<ActiveRole>("buyer");
  const [isSwitchingRole, setIsSwitchingRole] = useState(false);
  const activeRoleRef = useRef<ActiveRole>("buyer");

  const applyRole = useCallback((role: ActiveRole) => {
    activeRoleRef.current = role;
    setActiveRole(role);
    writeStorage(STORAGE_KEYS.activeRole, role);
    writeRoleCookie(role);
  }, []);

  // Restore session on first client render (kept out of render to avoid hydration mismatch).
  useEffect(() => {
    const token = readStorage(STORAGE_KEYS.token);
    const stored = readStoredUser();
    const resolved = stored ?? (token ? userFromToken(token) : null);

    /* eslint-disable react-hooks/set-state-in-effect -- one-time client-only rehydration from localStorage */
    if (!token || !resolved) {
      setUser(null);
      setStatus("guest");
      return;
    }
    const savedRole = readStorage(STORAGE_KEYS.activeRole);
    const role = isActiveRole(savedRole) && resolved.roles.includes(savedRole) ? savedRole : "buyer";
    setUser(resolved);
    applyRole(role);
    setStatus("authenticated");
    /* eslint-enable react-hooks/set-state-in-effect */
  }, [applyRole]);

  // Keep tabs in sync (login/logout/role switch in another tab).
  useEffect(() => {
    const onStorage = (event: StorageEvent) => {
      if (event.key === STORAGE_KEYS.activeRole && isActiveRole(event.newValue)) {
        activeRoleRef.current = event.newValue;
        setActiveRole(event.newValue);
      }
      if (event.key === STORAGE_KEYS.token && !event.newValue) {
        setUser(null);
        setStatus("guest");
      }
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  const login = useCallback(
    async (email: string, password: string) => {
      let token: string;
      let nextUser: SessionUser;

      if (HAS_API) {
        const res = await apiFetch("/auth/login", {
          method: "POST",
          body: JSON.stringify({ email, password }),
        });
        if (!res.ok) {
          const body = (await res.json().catch(() => null)) as { message?: string } | null;
          throw new Error(body?.message ?? "Login gagal. Periksa email dan password.");
        }
        const data = (await res.json()) as { accessToken: string };
        token = data.accessToken;
        const decoded = userFromToken(token);
        if (!decoded) throw new Error("Token sesi tidak valid.");
        nextUser = decoded;
      } else {
        token = "demo-token";
        nextUser = demoUser(email);
      }

      writeStorage(STORAGE_KEYS.token, token);
      writeStorage(STORAGE_KEYS.user, JSON.stringify(nextUser));
      setUser(nextUser);
      applyRole("buyer");
      setStatus("authenticated");
    },
    [applyRole],
  );

  const logout = useCallback(() => {
    writeStorage(STORAGE_KEYS.token, null);
    writeStorage(STORAGE_KEYS.user, null);
    writeStorage(STORAGE_KEYS.activeRole, null);
    writeRoleCookie(null);
    activeRoleRef.current = "buyer";
    setActiveRole("buyer");
    setUser(null);
    setStatus("guest");
  }, []);

  const switchRole = useCallback(
    async (target: ActiveRole) => {
      const previous = activeRoleRef.current;
      if (target === previous || !user || !user.roles.includes(target)) return;

      // Optimistic: header/pill update instantly, no page reload.
      applyRole(target);
      setIsSwitchingRole(true);

      try {
        if (HAS_API) {
          const res = await apiFetch("/api/v1/me/switch-role", {
            method: "POST",
            body: JSON.stringify({ role: target }),
          });
          // 404/501: endpoint not shipped yet -> keep the local switch.
          if (res.status === 401 || res.status === 403) {
            throw new Error("Role tidak diizinkan untuk akun ini.");
          }
          if (res.ok) {
            const data = (await res.json().catch(() => null)) as { accessToken?: string } | null;
            if (data?.accessToken) writeStorage(STORAGE_KEYS.token, data.accessToken);
          }
        }
        const detail: RoleChangedDetail = { previousRole: previous, activeRole: target };
        window.dispatchEvent(new CustomEvent<RoleChangedDetail>(ROLE_CHANGED_EVENT, { detail }));
      } catch (error) {
        applyRole(previous); // roll back on explicit rejection
        throw error;
      } finally {
        setIsSwitchingRole(false);
      }
    },
    [applyRole, user],
  );

  const value = useMemo<AuthContextValue>(
    () => ({ status, user, activeRole, isSwitchingRole, login, logout, switchRole }),
    [status, user, activeRole, isSwitchingRole, login, logout, switchRole],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside <AuthProvider>");
  return ctx;
}
