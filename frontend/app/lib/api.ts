import { authHeaders } from "./session";

export const API_BASE = (process.env.NEXT_PUBLIC_API_URL ?? "").replace(/\/$/, "");

/** True when a backend URL is configured. Otherwise the app runs in demo mode. */
export const HAS_API = API_BASE.length > 0;

/**
 * fetch wrapper that injects `Authorization: Bearer <jwt>` and
 * `X-Active-Role: <ROLE>` on every call, reading the latest session at call time
 * so a role switch applies to the very next request without a reload.
 */
export async function apiFetch(path: string, init: RequestInit = {}): Promise<Response> {
  const headers = new Headers(init.headers);
  const injected = authHeaders();
  for (const [key, value] of Object.entries(injected)) {
    if (!headers.has(key)) headers.set(key, value);
  }
  if (init.body && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }
  return fetch(`${API_BASE}${path}`, { ...init, headers });
}
