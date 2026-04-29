import {
  proxyBackendRequest,
  proxyBackendWithBody,
} from "@/lib/backend-route-proxy";

type Ctx = { params: Promise<{ path: string[] }> };

async function getPath(ctx: Ctx) {
  const params = await ctx.params;
  return params.path.join("/");
}

export async function GET(req: Request, ctx: Ctx) {
  const path = await getPath(ctx);
  return proxyBackendRequest(req, `/api/enrollments/${path}`, {
    method: "GET",
  });
}

export async function PATCH(req: Request, ctx: Ctx) {
  const path = await getPath(ctx);
  return proxyBackendWithBody(req, `/api/enrollments/${path}`, "PATCH");
}

export async function POST(req: Request, ctx: Ctx) {
  const path = await getPath(ctx);
  return proxyBackendWithBody(req, `/api/enrollments/${path}`, "POST");
}
