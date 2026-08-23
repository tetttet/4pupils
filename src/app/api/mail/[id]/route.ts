import { NextResponse } from "next/server";
import { backendFetch } from "@/lib/backend";
import { applyPrivateNoStore } from "@/lib/private-response";

export async function GET(_req: Request, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params;

  const r = await backendFetch(`/api/mail/${id}`, { method: "GET" });
  const text = await r.text();
  return applyPrivateNoStore(
    new NextResponse(text, {
      status: r.status,
      headers: { "Content-Type": "application/json" },
    }),
  );
}
