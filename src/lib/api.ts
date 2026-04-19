// lib/api.ts
import { PUBLIC_BACKEND_URL } from "@/lib/backend-url.client";

export const API_URL = PUBLIC_BACKEND_URL;

type FetchOptions = RequestInit & { retryOn401?: boolean };

export async function apiFetch(path: string, options: FetchOptions = {}) {
  const res = await fetch(`${API_URL}${path}`, {
    ...options,
    credentials: "include", // ВАЖНО: чтобы отправлялись cookies
    headers: {
      "Content-Type": "application/json",
      ...(options.headers || {}),
    },
  });

  // если access истёк — пробуем refresh 1 раз и повторяем запрос
  if (res.status === 401 && options.retryOn401 !== false) {
    const refreshed = await fetch(`${API_URL}/api/auth/refresh`, {
      method: "POST",
      credentials: "include",
    });

    if (refreshed.ok) {
      return apiFetch(path, { ...options, retryOn401: false });
    }
  }

  return res;
}
