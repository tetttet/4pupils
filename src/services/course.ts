import { http } from "@/lib/http";
import type { ApiErr, ApiOk, Course } from "@/types/course";

type CourseResponse<T> = ApiOk<T> | ApiErr | null | Record<string, unknown>;
type FetchApprovedCoursesOptions = {
  forceFresh?: boolean;
};

const APPROVED_COURSES_TTL = 60_000;

let approvedCoursesCache: Course[] | undefined;
let approvedCoursesFetchedAt = 0;
let approvedCoursesRequest: Promise<Course[]> | null = null;
let approvedCoursesVersion = 0;

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

function getErrorMessage(json: CourseResponse<unknown>, status: number) {
  if (isApiErr(json) && typeof json.error?.message === "string") {
    return json.error.message;
  }

  if (json && typeof json === "object") {
    const message = (json as { message?: unknown }).message;
    if (typeof message === "string" && message.trim()) {
      return message;
    }
  }

  return `Не удалось загрузить курсы (HTTP ${status})`;
}

async function readCourseResponse<T>(res: Response): Promise<T> {
  const json = (await res.json().catch(() => null)) as CourseResponse<T>;

  if (!res.ok) {
    throw new Error(getErrorMessage(json, res.status));
  }

  if (!isApiOk<T>(json)) {
    throw new Error("Сервер вернул некорректный ответ по курсам");
  }

  return json.data;
}

function hasFreshApprovedCoursesCache() {
  return (
    approvedCoursesCache !== undefined &&
    Date.now() - approvedCoursesFetchedAt < APPROVED_COURSES_TTL
  );
}

export function getApprovedCoursesSnapshot() {
  if (!hasFreshApprovedCoursesCache()) {
    return undefined;
  }

  return approvedCoursesCache;
}

async function loadApprovedCourses() {
  const requestVersion = approvedCoursesVersion;
  const res = await http("/api/courses/public", { method: "GET" });
  const data = await readCourseResponse<Course[]>(res);

  if (requestVersion === approvedCoursesVersion) {
    approvedCoursesCache = data;
    approvedCoursesFetchedAt = Date.now();
  }

  return data;
}

export async function fetchApprovedCourses(
  options: FetchApprovedCoursesOptions = {},
): Promise<Course[]> {
  const { forceFresh = false } = options;

  if (!forceFresh) {
    const cachedCourses = getApprovedCoursesSnapshot();

    if (cachedCourses !== undefined) {
      return cachedCourses;
    }

    if (approvedCoursesRequest) {
      return approvedCoursesRequest;
    }
  }

  const request = loadApprovedCourses();
  approvedCoursesRequest = request;

  try {
    return await request;
  } finally {
    if (approvedCoursesRequest === request) {
      approvedCoursesRequest = null;
    }
  }
}

export function invalidateApprovedCoursesCache() {
  approvedCoursesVersion += 1;
  approvedCoursesCache = undefined;
  approvedCoursesFetchedAt = 0;
  approvedCoursesRequest = null;
}
