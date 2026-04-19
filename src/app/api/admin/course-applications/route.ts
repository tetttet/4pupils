import { proxyBackendRequest } from "@/lib/backend-route-proxy";

export async function GET(req: Request) {
  return proxyBackendRequest(req, "/api/admin/course-applications", {
    method: "GET",
  });
}
