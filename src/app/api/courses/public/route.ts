import { NextResponse } from "next/server";
import { BACKEND_URL } from "@/lib/backend-url.server";
import { forwardSetCookie } from "@/lib/forward-set-cookie";

export async function GET(req: Request) {
  const cookie = req.headers.get("cookie") || "";

  const r = await fetch(`${BACKEND_URL}/api/courses/public`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      cookie,
      "user-agent": req.headers.get("user-agent") || "",
      "x-forwarded-for": req.headers.get("x-forwarded-for") || "",
    },
    cache: "no-store",
    signal: req.signal,
  });

  const text = await r.text();
  const res = new NextResponse(text, {
    status: r.status,
    headers: {
      "Content-Type": r.headers.get("content-type") ?? "application/json",
    },
  });

  forwardSetCookie(r, res);
  return res;
}
