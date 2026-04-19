import { NextResponse } from "next/server";
import { backendFetch } from "@/lib/backend";

export async function POST(req: Request, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params;

  const formData = await req.formData();

  const r = await backendFetch(`/api/mail/${id}/attachments`, {
    method: "POST",
    body: formData,
    // НЕ ставим Content-Type вручную — браузер поставит boundary
  });

  const text = await r.text();
  return new NextResponse(text, { status: r.status, headers: { "Content-Type": "application/json" } });
}
