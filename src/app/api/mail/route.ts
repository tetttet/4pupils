import { NextResponse } from "next/server";
import { backendFetch } from "@/lib/backend";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const qs = url.searchParams.toString();

  const r = await backendFetch(`/api/mail${qs ? `?${qs}` : ""}`, { method: "GET" });

  const text = await r.text();
  return new NextResponse(text, { status: r.status, headers: { "Content-Type": "application/json" } });
}
