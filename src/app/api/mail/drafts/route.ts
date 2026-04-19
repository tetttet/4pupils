import { NextResponse } from "next/server";
import { backendFetch } from "@/lib/backend";

export async function POST(req: Request) {
  const bodyText = await req.text();

  const r = await backendFetch("/api/mail/drafts", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: bodyText,
  });

  const text = await r.text();
  return new NextResponse(text, { status: r.status, headers: { "Content-Type": "application/json" } });
}
