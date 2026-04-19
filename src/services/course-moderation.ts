import { apiFetch } from "@/lib/api";
import { invalidateApprovedCoursesCache } from "@/services/course";
import type { ApiErr, ApiOk, Course, CourseLifecycle } from "@/types/course";

export type ModerationAction = "approve" | "reject" | "archive" | "unarchive";
export type ModerationVisibilityFilter = "all" | Course["visibility"];

export const MODERATION_STATUSES: CourseLifecycle[] = [
  "submitted",
  "approved",
  "rejected",
  "archived",
  "draft",
];

const MODERATION_LIMIT = 50;

type CourseResponse<T> = ApiOk<T> | ApiErr | null | Record<string, unknown>;

function isApiErr(value: unknown): value is ApiErr {
  if (!value || typeof value !== "object") return false;

  const maybeError = value as {
    ok?: unknown;
    error?: { message?: unknown };
  };

  return maybeError.ok === false;
}

function isApiOk<T>(value: unknown): value is ApiOk<T> {
  if (!value || typeof value !== "object") return false;

  const maybeOk = value as {
    ok?: unknown;
    data?: unknown;
  };

  return maybeOk.ok === true && "data" in maybeOk;
}

async function readJsonSafe(res: Response) {
  try {
    return await res.json();
  } catch {
    return null;
  }
}

function getErrorMessage(
  json: CourseResponse<unknown>,
  status: number,
  fallback: string,
) {
  if (isApiErr(json) && typeof json.error?.message === "string") {
    return json.error.message;
  }

  if (json && typeof json === "object") {
    const message = (json as { message?: unknown }).message;
    if (typeof message === "string" && message.trim()) {
      return message;
    }
  }

  return `${fallback} (HTTP ${status})`;
}

function normalizeNotes(notes: string) {
  const trimmed = notes.trim();
  return trimmed ? trimmed : null;
}

function buildActionRequest(action: ModerationAction, courseId: string, notes: string) {
  const reviewNotes = normalizeNotes(notes);

  switch (action) {
    case "approve":
      return {
        path: `/api/admin/courses/${courseId}/approve`,
        body: {
          review_notes: reviewNotes,
          publishNow: true,
          visibility: "public" as const,
        },
      };
    case "reject":
      if (!reviewNotes) {
        throw new Error("Для отклонения нужно указать причину.");
      }

      return {
        path: `/api/admin/courses/${courseId}/reject`,
        body: { review_notes: reviewNotes },
      };
    case "archive":
      return {
        path: `/api/admin/courses/${courseId}/archive`,
        body: {},
      };
    case "unarchive":
      return {
        path: `/api/admin/courses/${courseId}/unarchive`,
        body: {},
      };
  }
}

async function submitCourseBeforeApproval(course: Course) {
  const res = await apiFetch(`/api/courses/${course.course_id}/submit`, {
    method: "POST",
  });
  const json = (await readJsonSafe(res)) as CourseResponse<
    Course | { course?: Course }
  >;

  if (!res.ok) {
    throw new Error(
      getErrorMessage(
        json,
        res.status,
        "Не удалось перевести курс в статус submitted перед approve",
      ),
    );
  }

  const submittedCourse = readCourseFromActionResponse(json);

  if (submittedCourse) {
    return submittedCourse;
  }

  return {
    ...course,
    lifecycle_status: "submitted" as const,
    submitted_at: course.submitted_at ?? new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };
}

function readCourseFromActionResponse(
  json: CourseResponse<Course | { course?: Course }>,
) {
  if (!isApiOk<Course | { course?: Course }>(json)) {
    return null;
  }

  const payload = json.data;

  if (payload && typeof payload === "object" && "course_id" in payload) {
    return payload as Course;
  }

  if (
    payload &&
    typeof payload === "object" &&
    "course" in payload &&
    payload.course &&
    typeof payload.course === "object" &&
    "course_id" in payload.course
  ) {
    return payload.course as Course;
  }

  return null;
}

export function getAvailableModerationActions(
  course: Course,
): ModerationAction[] {
  switch (course.lifecycle_status) {
    case "submitted":
      return ["archive", "reject", "approve"];
    case "approved":
      return ["archive"];
    case "rejected":
      return ["archive", "approve"];
    case "archived":
      return ["unarchive"];
    case "draft":
      return ["archive", "approve"];
    default:
      return [];
  }
}

export function applyModerationActionSnapshot(
  course: Course,
  action: ModerationAction,
  notes: string,
) {
  const now = new Date().toISOString();
  const reviewNotes = normalizeNotes(notes);

  switch (action) {
    case "approve":
      return {
        ...course,
        lifecycle_status: "approved" as const,
        visibility: "public" as const,
        reviewed_at: now,
        review_notes: reviewNotes,
        published_at: course.published_at ?? now,
        updated_at: now,
      };
    case "reject":
      return {
        ...course,
        lifecycle_status: "rejected" as const,
        reviewed_at: now,
        review_notes: reviewNotes,
        updated_at: now,
      };
    case "archive":
      return {
        ...course,
        lifecycle_status: "archived" as const,
        updated_at: now,
      };
    case "unarchive":
      return {
        ...course,
        lifecycle_status: "draft" as const,
        updated_at: now,
      };
  }
}

export function getModerationSuccessMessage(action: ModerationAction) {
  switch (action) {
    case "approve":
      return "Курс одобрен и опубликован.";
    case "reject":
      return "Курс отклонён и возвращён преподавателю.";
    case "archive":
      return "Курс отправлен в архив.";
    case "unarchive":
      return "Курс возвращён в черновики.";
  }
}

export async function fetchModerationCourses(
  status: CourseLifecycle,
  options: {
    limit?: number;
    offset?: number;
    signal?: AbortSignal;
  } = {},
): Promise<Course[]> {
  const params = new URLSearchParams({
    status,
    limit: String(options.limit ?? MODERATION_LIMIT),
    offset: String(options.offset ?? 0),
  });

  const res = await apiFetch(`/api/admin/courses/moderation?${params}`, {
    signal: options.signal,
  });
  const json = (await readJsonSafe(res)) as CourseResponse<Course[]>;

  if (!res.ok) {
    throw new Error(
      getErrorMessage(json, res.status, "Не удалось загрузить очередь модерации"),
    );
  }

  if (isApiOk<Course[]>(json) && Array.isArray(json.data)) {
    return json.data;
  }

  const maybeData = (json as { data?: unknown })?.data;
  if (Array.isArray(maybeData)) {
    return maybeData as Course[];
  }

  throw new Error("Сервер вернул некорректный ответ по модерации.");
}

export async function runModerationAction(
  course: Course,
  action: ModerationAction,
  notes: string,
) {
  if (action === "reject" && course.lifecycle_status === "approved") {
    throw new Error(
      "Одобренный курс нельзя отклонить напрямую. Используйте архив или измените статус на стороне бэкенда.",
    );
  }

  let actionCourse = course;

  if (action === "approve" && course.lifecycle_status === "draft") {
    actionCourse = await submitCourseBeforeApproval(course);
  }

  const request = buildActionRequest(action, actionCourse.course_id, notes);

  const res = await apiFetch(request.path, {
    method: "POST",
    body: JSON.stringify(request.body),
  });
  const json = (await readJsonSafe(res)) as CourseResponse<
    Course | { course?: Course }
  >;

  if (!res.ok) {
    throw new Error(
      getErrorMessage(json, res.status, "Не удалось обновить состояние курса"),
    );
  }

  invalidateApprovedCoursesCache();

  const optimisticCourse = applyModerationActionSnapshot(
    actionCourse,
    action,
    notes,
  );
  const serverCourse = readCourseFromActionResponse(json);

  if (!serverCourse) {
    return optimisticCourse;
  }

  return {
    ...optimisticCourse,
    ...serverCourse,
  };
}
