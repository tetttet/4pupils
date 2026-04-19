import { NextResponse } from "next/server";

export function forwardSetCookie(from: Response, to: NextResponse) {
  // В Node fetch у Response есть headers.getSetCookie() (в Next обычно доступно)
  // На всякий случай поддержим и обычный header.

  const setCookies: string[] =
    (typeof from.headers.getSetCookie === "function"
      ? from.headers.getSetCookie()
      : []) || [];

  const fallback = from.headers.get("set-cookie");
  if (fallback) setCookies.push(fallback);

  for (const c of setCookies) {
    if (c) to.headers.append("set-cookie", c);
  }
}
