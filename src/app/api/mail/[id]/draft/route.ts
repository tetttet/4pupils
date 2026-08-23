import { NextResponse } from "next/server";
import { backendFetch } from "@/lib/backend";
import { applyPrivateNoStore } from "@/lib/private-response";

export async function PATCH(req: Request, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params;
  const bodyText = await req.text();

  const r = await backendFetch(`/api/mail/${id}/draft`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: bodyText,
  });

  const text = await r.text();
  return applyPrivateNoStore(
    new NextResponse(text, {
      status: r.status,
      headers: { "Content-Type": "application/json" },
    }),
  );
}
