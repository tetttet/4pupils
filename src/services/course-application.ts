import { http } from "@/lib/http";
import { readApiData } from "@/lib/api-response";
import type {
  CourseApplication,
  CourseApplicationDraftPayload,
  CourseApplicationListParams,
  CourseApplicationRejectPayload,
  CourseApplicationReviewPayload,
} from "@/types/course-application";

function buildSearchParams(
  params: Record<string, string | number | boolean | null | undefined>,
) {
  const searchParams = new URLSearchParams();

  for (const [key, value] of Object.entries(params)) {
    if (value == null || value === "") continue;
    searchParams.set(key, String(value));
  }

  const query = searchParams.toString();
  return query ? `?${query}` : "";
}

async function request<T>(path: string, init?: RequestInit, fallback?: string) {
  const res = await http(path, init);

  return readApiData<T>(
    res,
    fallback || "Не удалось выполнить запрос по откликам на курс",
  );
}

export const CourseApplicationsAPI = {
  create(courseId: string, payload: CourseApplicationDraftPayload) {
    return request<CourseApplication>(
      `/api/courses/${courseId}/applications`,
      {
        method: "POST",
        body: JSON.stringify(payload),
      },
      "Не удалось создать отклик на курс",
    );
  },

  listMy(params: CourseApplicationListParams = {}) {
    return request<CourseApplication[]>(
      `/api/course-applications/my${buildSearchParams(params)}`,
      { method: "GET" },
      "Не удалось загрузить мои отклики",
    );
  },

  listTeaching(params: CourseApplicationListParams = {}) {
    return request<CourseApplication[]>(
      `/api/course-applications/teaching${buildSearchParams(params)}`,
      { method: "GET" },
      "Не удалось загрузить отклики по вашим курсам",
    );
  },

  listForCourse(courseId: string, params: CourseApplicationListParams = {}) {
    return request<CourseApplication[]>(
      `/api/course-applications/course/${courseId}${buildSearchParams(params)}`,
      { method: "GET" },
      "Не удалось загрузить отклики курса",
    );
  },

  listAdmin(params: CourseApplicationListParams = {}) {
    return request<CourseApplication[]>(
      `/api/admin/course-applications${buildSearchParams(params)}`,
      { method: "GET" },
      "Не удалось загрузить все отклики",
    );
  },

  get(applicationId: string) {
    return request<CourseApplication>(
      `/api/course-applications/${applicationId}`,
      { method: "GET" },
      "Не удалось загрузить отклик",
    );
  },

  update(applicationId: string, payload: CourseApplicationDraftPayload) {
    return request<CourseApplication>(
      `/api/course-applications/${applicationId}`,
      {
        method: "PATCH",
        body: JSON.stringify(payload),
      },
      "Не удалось обновить отклик",
    );
  },

  withdraw(applicationId: string) {
    return request<CourseApplication>(
      `/api/course-applications/${applicationId}/withdraw`,
      {
        method: "POST",
        body: JSON.stringify({}),
      },
      "Не удалось отозвать отклик",
    );
  },

  markReviewing(applicationId: string, payload: CourseApplicationReviewPayload) {
    return request<CourseApplication>(
      `/api/course-applications/${applicationId}/reviewing`,
      {
        method: "POST",
        body: JSON.stringify(payload),
      },
      "Не удалось перевести отклик в reviewing",
    );
  },

  approve(applicationId: string, payload: CourseApplicationReviewPayload) {
    return request<CourseApplication>(
      `/api/course-applications/${applicationId}/approve`,
      {
        method: "POST",
        body: JSON.stringify(payload),
      },
      "Не удалось одобрить отклик",
    );
  },

  reject(applicationId: string, payload: CourseApplicationRejectPayload) {
    return request<CourseApplication>(
      `/api/course-applications/${applicationId}/reject`,
      {
        method: "POST",
        body: JSON.stringify(payload),
      },
      "Не удалось отклонить отклик",
    );
  },
};
