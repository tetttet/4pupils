import { NextResponse } from "next/server";
import { BACKEND_URL } from "@/lib/backend-url.server";
import { forwardSetCookie } from "@/lib/forward-set-cookie";

export async function POST(req: Request) {
  const cookie = req.headers.get("cookie") || "";

  const r = await fetch(`${BACKEND_URL}/api/auth/logout`, {
    method: "POST",
    headers: { cookie },
  });

  const res = new NextResponse(null, { status: r.status || 204 });
  forwardSetCookie(r, res);
  return res;
}
