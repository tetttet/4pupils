// lib/http.ts
type FetchOptions = RequestInit & { retryOn401?: boolean };

export async function http(path: string, options: FetchOptions = {}) {
  const res = await fetch(path, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(options.headers || {}),
    },
    credentials: "include",
  });

  if (res.status === 401 && options.retryOn401 !== false) {
    const refreshed = await fetch("/api/auth/refresh", {
      method: "POST",
      credentials: "include",
    });

    if (refreshed.ok) {
      return http(path, { ...options, retryOn401: false });
    }
  }

  return res;
}
