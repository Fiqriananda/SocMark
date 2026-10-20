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
