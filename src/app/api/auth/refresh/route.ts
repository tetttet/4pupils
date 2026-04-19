import { NextResponse } from "next/server";
import { BACKEND_URL } from "@/lib/backend-url.server";
import { forwardSetCookie } from "@/lib/forward-set-cookie";

export async function POST(req: Request) {
  const cookie = req.headers.get("cookie") || "";

  const r = await fetch(`${BACKEND_URL}/api/auth/refresh`, {
    method: "POST",
    headers: {
      cookie,
      "user-agent": req.headers.get("user-agent") || "",
      "x-forwarded-for": req.headers.get("x-forwarded-for") || "",
    },
  });

  const data = await r.json().catch(() => ({}));
  const res = NextResponse.json(data, { status: r.status });

  forwardSetCookie(r, res);
  return res;
}
