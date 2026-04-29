import { proxyBackendWithBody } from "@/lib/backend-route-proxy";

type Ctx = { params: Promise<{ courseId: string }> };

async function getCourseId(ctx: Ctx) {
  const params = await ctx.params;
  return params.courseId;
}

export async function POST(req: Request, ctx: Ctx) {
  const courseId = await getCourseId(ctx);

  return proxyBackendWithBody(req, `/api/courses/${courseId}/applications`, "POST");
}
