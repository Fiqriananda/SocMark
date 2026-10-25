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
/** @format */

export const API_URL =
  process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

export class ApiError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.status = status;
  }
}

export async function apiPost<T>(path: string, body: unknown): Promise<T> {
  let res: Response;
  try {
    res = await fetch(`${API_URL}${path}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
  } catch {
    throw new ApiError('Tidak dapat terhubung ke server. Coba lagi nanti.', 0);
  }

  const data = await res.json().catch(() => null);

  if (!res.ok) {
    const message =
      Array.isArray(data?.message) ? data.message.join(', ') : data?.message;
    throw new ApiError(message || 'Terjadi kesalahan. Coba lagi.', res.status);
  }

  return data as T;
}

export function saveToken(token: string, remember: boolean) {
  const storage = remember ? localStorage : sessionStorage;
  storage.setItem('accessToken', token);
}
