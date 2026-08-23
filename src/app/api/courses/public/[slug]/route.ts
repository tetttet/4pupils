import { NextResponse } from "next/server";
import { BACKEND_URL } from "@/lib/backend-url.server";

export async function GET(
  req: Request,
  ctx: { params: Promise<{ slug: string }> },
) {
  const { slug } = await ctx.params;

  const res = await fetch(
    `${BACKEND_URL}/api/courses/public/${encodeURIComponent(slug)}`,
    {
      headers: { Accept: "application/json" },
      next: { revalidate: 60 },
      signal: AbortSignal.any([req.signal, AbortSignal.timeout(10_000)]),
    },
  );

  // пробрасываем ответ как есть
  const text = await res.text();

  return new NextResponse(text, {
    status: res.status,
    headers: {
      "Content-Type": res.headers.get("content-type") ?? "application/json",
      "Cache-Control":
        res.headers.get("cache-control") ??
        "public, max-age=0, s-maxage=60, stale-while-revalidate=300",
      ...(res.headers.get("server-timing")
        ? { "Server-Timing": res.headers.get("server-timing")! }
        : {}),
    },
  });
}
