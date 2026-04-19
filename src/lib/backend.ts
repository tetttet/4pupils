import { cookies } from "next/headers";
import { BACKEND_URL } from "@/lib/backend-url.server";

export async function backendFetch(path: string, init: RequestInit = {}) {
  // прокидываем cookie (если у тебя auth через httpOnly cookies)
  const cookieStore = await cookies();
  const cookieHeader = cookieStore
    .getAll()
    .map((c) => `${c.name}=${c.value}`)
    .join("; ");

  const res = await fetch(`${BACKEND_URL}${path}`, {
    ...init,
    headers: {
      ...(init.headers || {}),
      Cookie: cookieHeader,
    },
    cache: "no-store",
  });

  // если бэкенд шлет set-cookie — в app router это обычно делается через forwardSetCookie,
  // но для mail сейчас не нужно. если нужно — скажи, добавим.
  return res;
}
