import { isApiOk, readJsonSafe } from "@/lib/api-response";
import { backendFetch } from "@/lib/backend";
import type { ApiErr, ApiOk } from "@/types/api";
import type { CourseApplication } from "@/types/course-application";

export async function getMyCourseApplications() {
  const response = await backendFetch("/api/course-applications/my");
  if (!response.ok) {
    return [];
  }

  const json = await readJsonSafe<ApiOk<CourseApplication[]> | ApiErr | null>(
    response,
  );

  if (!isApiOk<CourseApplication[]>(json)) {
    return [];
  }

  return json.data;
}
