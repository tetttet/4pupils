import { NextResponse } from "next/server";
import { BACKEND_URL } from "@/lib/backend-url.server";

export async function GET(req: Request) {
  const search = new URL(req.url).search;

  const r = await fetch(`${BACKEND_URL}/api/courses/public${search}`, {
    method: "GET",
    headers: { Accept: "application/json" },
    next: { revalidate: 60 },
    signal: AbortSignal.any([req.signal, AbortSignal.timeout(10_000)]),
  });

  const text = await r.text();
  const res = new NextResponse(text, {
    status: r.status,
    headers: {
      "Content-Type": r.headers.get("content-type") ?? "application/json",
      "Cache-Control":
        r.headers.get("cache-control") ??
        "public, max-age=0, s-maxage=60, stale-while-revalidate=300",
      ...(r.headers.get("server-timing")
        ? { "Server-Timing": r.headers.get("server-timing")! }
        : {}),
    },
  });

  return res;
}
