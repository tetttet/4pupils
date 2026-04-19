import { NextResponse } from "next/server";
import { backendFetch } from "@/lib/backend";

export async function POST(req: Request, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params;
  const bodyText = await req.text();

  const r = await backendFetch(`/api/mail/${id}/send`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: bodyText || "{}",
  });

  const text = await r.text();
  return new NextResponse(text, { status: r.status, headers: { "Content-Type": "application/json" } });
}
