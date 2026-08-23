import { NextResponse } from "next/server";
import { BACKEND_URL } from "@/lib/backend-url.server";
import { forwardSetCookie } from "@/lib/forward-set-cookie";
import { applyPrivateNoStore } from "@/lib/private-response";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const qs = url.searchParams.toString();

  const cookie = req.headers.get("cookie") || "";

  const r = await fetch(`${BACKEND_URL}/api/users?${qs}`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      cookie,
      "user-agent": req.headers.get("user-agent") || "",
      "x-forwarded-for": req.headers.get("x-forwarded-for") || "",
    },
    cache: "no-store",
    signal: AbortSignal.any([req.signal, AbortSignal.timeout(10_000)]),
  });

  // users endpoints set cookies обычно не должны, но пусть будет совместимо
  const text = await r.text();
  const res = new NextResponse(text, {
    status: r.status,
    headers: {
      "Content-Type": r.headers.get("content-type") ?? "application/json",
    },
  });

  forwardSetCookie(r, res);
  return applyPrivateNoStore(res);
}
