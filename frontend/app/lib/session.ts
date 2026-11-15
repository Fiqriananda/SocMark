import type { ActiveRole } from "./roles";
import { isActiveRole, ROLE_META } from "./roles";

export const STORAGE_KEYS = {
  token: "socmark:token",
  user: "socmark:user",
  activeRole: "socmark:activeRole",
  cart: "socmark:cart",
  cartItems: "socmark:cartItems",
} as const;

export const ROLE_COOKIE = "socmark_active_role";
export const ROLE_CHANGED_EVENT = "socmark:roleChanged";

export interface RoleChangedDetail {
  previousRole: ActiveRole;
  activeRole: ActiveRole;
}

function hasWindow() {
  return typeof window !== "undefined";
}

export function readStorage(key: string): string | null {
  if (!hasWindow()) return null;
  try {
    return window.localStorage.getItem(key);
  } catch {
    return null;
  }
}

export function writeStorage(key: string, value: string | null) {
  if (!hasWindow()) return;
  try {
    if (value === null) window.localStorage.removeItem(key);
    else window.localStorage.setItem(key, value);
  } catch {
    /* storage unavailable (private mode / quota) - state still lives in memory */
  }
}

export function writeRoleCookie(role: ActiveRole | null) {
  if (!hasWindow()) return;
  document.cookie = role
    ? `${ROLE_COOKIE}=${role}; path=/; max-age=2592000; SameSite=Lax`
    : `${ROLE_COOKIE}=; path=/; max-age=0; SameSite=Lax`;
}

export function readSession(): { token: string | null; activeRole: ActiveRole | null } {
  const raw = readStorage(STORAGE_KEYS.activeRole);
  return {
    token: readStorage(STORAGE_KEYS.token),
    activeRole: isActiveRole(raw) ? raw : null,
  };
}

/** Decode a JWT payload without verifying it (display/derivation only). */
export function decodeJwt<T = Record<string, unknown>>(token: string): T | null {
  try {
    const part = token.split(".")[1];
    if (!part) return null;
    const base64 = part.replace(/-/g, "+").replace(/_/g, "/");
    const padded = base64.padEnd(base64.length + ((4 - (base64.length % 4)) % 4), "=");
    const json = decodeURIComponent(
      atob(padded)
        .split("")
        .map((c) => "%" + c.charCodeAt(0).toString(16).padStart(2, "0"))
        .join(""),
    );
    return JSON.parse(json) as T;
  } catch {
    return null;
  }
}

export function authHeaders(): Record<string, string> {
  const { token, activeRole } = readSession();
  const headers: Record<string, string> = {};
  if (token) headers["Authorization"] = `Bearer ${token}`;
  if (activeRole) headers["X-Active-Role"] = ROLE_META[activeRole].apiRole;
  return headers;
}
