import { http } from "@/lib/http";
import { readApiData } from "@/lib/api-response";
import type {
  Enrollment,
  EnrollmentActionPayload,
  EnrollmentListParams,
  EnrollmentNotePayload,
  ManualEnrollmentPayload,
} from "@/types/enrollment";

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
    fallback || "Не удалось выполнить запрос по enrollments",
  );
}

export const EnrollmentsAPI = {
  createManual(courseId: string, payload: ManualEnrollmentPayload) {
    return request<Enrollment>(
      `/api/courses/${courseId}/enrollments`,
      {
        method: "POST",
        body: JSON.stringify(payload),
      },
      "Не удалось зачислить пользователя на курс",
    );
  },

  listMy(params: EnrollmentListParams = {}) {
    return request<Enrollment[]>(
      `/api/enrollments/my${buildSearchParams(params)}`,
      { method: "GET" },
      "Не удалось загрузить мои enrollments",
    );
  },

  listTeaching(params: EnrollmentListParams = {}) {
    return request<Enrollment[]>(
      `/api/enrollments/teaching${buildSearchParams(params)}`,
      { method: "GET" },
      "Не удалось загрузить enrollments по вашим курсам",
    );
  },

  listForCourse(courseId: string, params: EnrollmentListParams = {}) {
    return request<Enrollment[]>(
      `/api/enrollments/course/${courseId}${buildSearchParams(params)}`,
      { method: "GET" },
      "Не удалось загрузить список студентов курса",
    );
  },

  listAdmin(params: EnrollmentListParams = {}) {
    return request<Enrollment[]>(
      `/api/admin/enrollments${buildSearchParams(params)}`,
      { method: "GET" },
      "Не удалось загрузить все enrollments",
    );
  },

  get(enrollmentId: string) {
    return request<Enrollment>(
      `/api/enrollments/${enrollmentId}`,
      { method: "GET" },
      "Не удалось загрузить enrollment",
    );
  },

  updateProgress(enrollmentId: string, progress_percent: number) {
    return request<Enrollment>(
      `/api/enrollments/${enrollmentId}/progress`,
      {
        method: "PATCH",
        body: JSON.stringify({ progress_percent }),
      },
      "Не удалось обновить прогресс",
    );
  },

  touchActivity(enrollmentId: string) {
    return request<Enrollment>(
      `/api/enrollments/${enrollmentId}/activity`,
      {
        method: "POST",
        body: JSON.stringify({}),
      },
      "Не удалось обновить активность",
    );
  },

  updateNote(enrollmentId: string, payload: EnrollmentNotePayload) {
    return request<Enrollment>(
      `/api/enrollments/${enrollmentId}/note`,
      {
        method: "PATCH",
        body: JSON.stringify(payload),
      },
      "Не удалось обновить заметку",
    );
  },

  drop(enrollmentId: string, payload: EnrollmentActionPayload = {}) {
    return request<Enrollment>(
      `/api/enrollments/${enrollmentId}/drop`,
      {
        method: "POST",
        body: JSON.stringify(payload),
      },
      "Не удалось выйти из курса",
    );
  },

  complete(enrollmentId: string, payload: EnrollmentActionPayload = {}) {
    return request<Enrollment>(
      `/api/enrollments/${enrollmentId}/complete`,
      {
        method: "POST",
        body: JSON.stringify(payload),
      },
      "Не удалось завершить enrollment",
    );
  },

  block(enrollmentId: string, payload: EnrollmentActionPayload = {}) {
    return request<Enrollment>(
      `/api/enrollments/${enrollmentId}/block`,
      {
        method: "POST",
        body: JSON.stringify(payload),
      },
      "Не удалось заблокировать enrollment",
    );
  },

  cancel(enrollmentId: string, payload: EnrollmentActionPayload = {}) {
    return request<Enrollment>(
      `/api/enrollments/${enrollmentId}/cancel`,
      {
        method: "POST",
        body: JSON.stringify(payload),
      },
      "Не удалось отменить enrollment",
    );
  },

  reactivate(enrollmentId: string, payload: EnrollmentActionPayload = {}) {
    return request<Enrollment>(
      `/api/enrollments/${enrollmentId}/reactivate`,
      {
        method: "POST",
        body: JSON.stringify(payload),
      },
      "Не удалось реактивировать enrollment",
    );
  },
};
