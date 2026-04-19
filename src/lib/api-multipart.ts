import { API_URL } from "./api";

type FetchOptions = RequestInit & { retryOn401?: boolean };

export async function apiFetchMultipart(path: string, options: FetchOptions = {}) {
  const res = await fetch(`${API_URL}${path}`, {
    ...options,
    credentials: "include",
    headers: {
      ...(options.headers || {}), // НЕ ставим Content-Type — браузер сам поставит boundary
    },
  });

  if (res.status === 401 && options.retryOn401 !== false) {
    const refreshed = await fetch(`${API_URL}/api/auth/refresh`, {
      method: "POST",
      credentials: "include",
    });

    if (refreshed.ok) {
      return apiFetchMultipart(path, { ...options, retryOn401: false });
    }
  }

  return res;
}
