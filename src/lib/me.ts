import { cache } from "react";
import { cookies } from "next/headers";
import { BACKEND_URL } from "@/lib/backend-url.server";

const AUTH_REQUEST_TIMEOUT_MS = 10_000;

export const getMe = cache(async function getMe() {
  // ВАЖНО: пробрасываем cookies с Next server -> backend
  const cookieStore = await cookies();
  const cookieHeader = cookieStore
    .getAll()
    .map((cookie) => `${cookie.name}=${cookie.value}`)
    .join("; ");

  try {
    const res = await fetch(`${BACKEND_URL}/api/auth/me`, {
      headers: { cookie: cookieHeader },
      cache: "no-store",
      signal: AbortSignal.timeout(AUTH_REQUEST_TIMEOUT_MS),
    });

    if (!res.ok) return null;
    const data = await res.json();
    return data.user ?? null;
  } catch {
    return null;
  }
});
