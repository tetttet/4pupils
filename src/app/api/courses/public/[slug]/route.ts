import { NextResponse } from "next/server";
import { BACKEND_URL } from "@/lib/backend-url.server";

export async function GET(
  _req: Request,
  ctx: { params: Promise<{ slug: string }> },
) {
  const { slug } = await ctx.params;

  const res = await fetch(
    `${BACKEND_URL}/api/courses/public/${encodeURIComponent(slug)}`,
    {
      headers: { Accept: "application/json" },
      cache: "no-store",
    },
  );

  // пробрасываем ответ как есть
  const text = await res.text();

  return new NextResponse(text, {
    status: res.status,
    headers: {
      "Content-Type": res.headers.get("content-type") ?? "application/json",
    },
  });
}
