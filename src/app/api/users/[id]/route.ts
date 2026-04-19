import { NextResponse } from "next/server";
import { BACKEND_URL } from "@/lib/backend-url.server";
import { forwardSetCookie } from "@/lib/forward-set-cookie";

type Ctx = { params: Promise<{ id: string }> | { id: string } };

async function getId(ctx: Ctx) {
  const p = await ctx.params;
  return p.id;
}

function commonHeaders(req: Request) {
  return {
    "Content-Type": "application/json",
    cookie: req.headers.get("cookie") || "",
    "user-agent": req.headers.get("user-agent") || "",
    "x-forwarded-for": req.headers.get("x-forwarded-for") || "",
  };
}

export async function GET(req: Request, ctx: Ctx) {
  const id = await getId(ctx);

  const r = await fetch(`${BACKEND_URL}/api/users/${id}`, {
    method: "GET",
    headers: commonHeaders(req),
    cache: "no-store",
  });

  const text = await r.text();
  const res = new NextResponse(text, {
    status: r.status,
    headers: {
      "Content-Type": r.headers.get("content-type") ?? "application/json",
    },
  });

  forwardSetCookie(r, res);
  return res;
}

export async function PATCH(req: Request, ctx: Ctx) {
  const id = await getId(ctx);
  const bodyText = await req.text();

  const r = await fetch(`${BACKEND_URL}/api/users/${id}`, {
    method: "PATCH",
    headers: commonHeaders(req),
    body: bodyText,
    cache: "no-store",
  });

  const text = await r.text();
  const res = new NextResponse(text, {
    status: r.status,
    headers: {
      "Content-Type": r.headers.get("content-type") ?? "application/json",
    },
  });

  forwardSetCookie(r, res);
  return res;
}

export async function DELETE(req: Request, ctx: Ctx) {
  const id = await getId(ctx);

  const r = await fetch(`${BACKEND_URL}/api/users/${id}`, {
    method: "DELETE",
    headers: commonHeaders(req),
    cache: "no-store",
  });

  const text = await r.text();
  const res = new NextResponse(text, {
    status: r.status,
    headers: {
      "Content-Type": r.headers.get("content-type") ?? "application/json",
    },
  });

  forwardSetCookie(r, res);
  return res;
}
