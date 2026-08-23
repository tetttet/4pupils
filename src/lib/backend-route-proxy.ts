import { NextResponse } from "next/server";
import { BACKEND_URL } from "@/lib/backend-url.server";
import { forwardSetCookie } from "@/lib/forward-set-cookie";
import { applyPrivateNoStore } from "@/lib/private-response";

function buildHeaders(req: Request, hasBody: boolean) {
  const headers = new Headers();

  const forwardedHeaders = [
    "accept",
    "accept-language",
    "authorization",
    "content-type",
    "cookie",
    "user-agent",
    "x-forwarded-for",
    "x-real-ip",
  ];

  for (const headerName of forwardedHeaders) {
    const value = req.headers.get(headerName);
    if (value) {
      headers.set(headerName, value);
    }
  }

  if (hasBody && !headers.has("content-type")) {
    headers.set("content-type", "application/json");
  }

  return headers;
}

function buildUrl(req: Request, path: string) {
  const search = new URL(req.url).search;
  return `${BACKEND_URL}${path}${search}`;
}

export async function proxyBackendRequest(
  req: Request,
  path: string,
  init: {
    method?: string;
    body?: BodyInit | null;
  } = {},
) {
  const method = init.method ?? req.method;
  const hasBody = init.body !== undefined && init.body !== null;

  const response = await fetch(buildUrl(req, path), {
    method,
    headers: buildHeaders(req, hasBody),
    body: init.body,
    cache: "no-store",
    signal: AbortSignal.any([req.signal, AbortSignal.timeout(15_000)]),
  });

  const text = await response.text();
  const res = new NextResponse(text, {
    status: response.status,
    headers: {
      "Content-Type": response.headers.get("content-type") ?? "application/json",
    },
  });

  forwardSetCookie(response, res);
  return applyPrivateNoStore(res);
}

async function readRequestBody(req: Request) {
  const body = await req.arrayBuffer();
  return body.byteLength > 0 ? body : null;
}

export async function proxyBackendWithBody(
  req: Request,
  path: string,
  method = req.method,
) {
  const body = await readRequestBody(req);

  return proxyBackendRequest(req, path, {
    method,
    body,
  });
}
