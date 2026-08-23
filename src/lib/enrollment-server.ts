import { isApiOk, readJsonSafe } from "@/lib/api-response";
import { backendFetch } from "@/lib/backend";
import type { ApiErr, ApiOk } from "@/types/api";
import type { Enrollment } from "@/types/enrollment";

export async function getMyEnrollments() {
  try {
    const response = await backendFetch("/api/enrollments/my");
    if (!response.ok) {
      return [];
    }

    const json = await readJsonSafe<ApiOk<Enrollment[]> | ApiErr | null>(
      response,
    );

    if (!isApiOk<Enrollment[]>(json)) {
      return [];
    }

    return json.data;
  } catch {
    return [];
  }
}
