import { cookies } from "next/headers";
import { BACKEND_URL } from "@/lib/backend-url.server";

export async function getMe() {
  // ВАЖНО: пробрасываем cookies с Next server -> backend
  const cookieStore = await cookies();
  const cookieHeader = cookieStore
    .getAll()
    .map((cookie) => `${cookie.name}=${cookie.value}`)
    .join("; ");

  const res = await fetch(`${BACKEND_URL}/api/auth/me`, {
    headers: { cookie: cookieHeader },
    cache: "no-store",
  });

  if (!res.ok) return null;
  const data = await res.json();
  return data.user ?? null;
}
