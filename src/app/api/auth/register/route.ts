import { NextResponse } from "next/server";
import { BACKEND_URL } from "@/lib/backend-url.server";
import { forwardSetCookie } from "@/lib/forward-set-cookie";
import { applyPrivateNoStore } from "@/lib/private-response";

export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}));
  const cookie = req.headers.get("cookie") || "";

  const r = await fetch(`${BACKEND_URL}/api/auth/register`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      cookie,
      "user-agent": req.headers.get("user-agent") || "",
      "x-forwarded-for": req.headers.get("x-forwarded-for") || "",
    },
    body: JSON.stringify(body),
    cache: "no-store",
    signal: AbortSignal.any([req.signal, AbortSignal.timeout(10_000)]),
  });

  const data = await r.json().catch(() => ({}));
  const res = NextResponse.json(data, { status: r.status });

  forwardSetCookie(r, res);
  return applyPrivateNoStore(res);
}
