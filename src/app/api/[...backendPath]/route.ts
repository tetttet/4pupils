import {
  proxyBackendRequest,
  proxyBackendWithBody,
} from "@/lib/backend-route-proxy";

type BackendRouteContext = {
  params: Promise<{ backendPath: string[] }>;
};

async function getBackendPath(ctx: BackendRouteContext) {
  const { backendPath } = await ctx.params;
  return `/api/${backendPath.join("/")}`;
}

export async function GET(req: Request, ctx: BackendRouteContext) {
  return proxyBackendRequest(req, await getBackendPath(ctx));
}

export async function POST(req: Request, ctx: BackendRouteContext) {
  return proxyBackendWithBody(req, await getBackendPath(ctx), "POST");
}

export async function PATCH(req: Request, ctx: BackendRouteContext) {
  return proxyBackendWithBody(req, await getBackendPath(ctx), "PATCH");
}

export async function PUT(req: Request, ctx: BackendRouteContext) {
  return proxyBackendWithBody(req, await getBackendPath(ctx), "PUT");
}

export async function DELETE(req: Request, ctx: BackendRouteContext) {
  return proxyBackendWithBody(req, await getBackendPath(ctx), "DELETE");
}
