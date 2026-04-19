import { NextResponse } from "next/server";
import { BACKEND_URL } from "@/lib/backend-url.server";

export async function GET(req: Request) {
  const cookie = req.headers.get("cookie") || "";

  const r = await fetch(`${BACKEND_URL}/api/auth/me`, {
    method: "GET",
    headers: { cookie },
    cache: "no-store",
  });

  const data = await r.json().catch(() => ({}));
  return NextResponse.json(data, { status: r.status });
}
