import { http } from "@/lib/http";
import { toUserFacingErrorMessage } from "@/lib/error-messages";
import type { ApiErr, ApiOk, Course } from "@/types/course";
import {
  PUBLIC_COURSES_PAGE_SIZE,
  type PublicCoursesPage,
  type PublicCoursesPageMeta,
} from "@/lib/public-course";

type CourseResponse<T> = ApiOk<T> | ApiErr | null | Record<string, unknown>;
type FetchApprovedCoursesOptions = {
  forceFresh?: boolean;
};

const APPROVED_COURSES_TTL = 60_000;

let approvedCoursesCache: Course[] | undefined;
let approvedCoursesMeta: PublicCoursesPageMeta | undefined;
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
    return toUserFacingErrorMessage(json.error.message, "Не удалось загрузить курсы", {
      code: typeof json.error.code === "string" ? json.error.code : undefined,
      status,
    });
  }

  if (json && typeof json === "object") {
    const message = (json as { message?: unknown }).message;
    if (typeof message === "string" && message.trim()) {
      return toUserFacingErrorMessage(message, "Не удалось загрузить курсы", {
        status,
      });
    }
  }

  return toUserFacingErrorMessage(null, "Не удалось загрузить курсы", { status });
}

async function readCoursesPageResponse(res: Response): Promise<PublicCoursesPage> {
  const json = (await res.json().catch(() => null)) as CourseResponse<Course[]>;

  if (!res.ok) {
    throw new Error(getErrorMessage(json, res.status));
  }

  if (!isApiOk<Course[]>(json)) {
    throw new Error("Сервер вернул некорректный ответ по курсам");
  }

  const rawMeta = json.meta as Partial<PublicCoursesPageMeta> | undefined;
  return {
    courses: json.data,
    meta: {
      count: json.data.length,
      limit: rawMeta?.limit ?? PUBLIC_COURSES_PAGE_SIZE,
      offset: rawMeta?.offset ?? 0,
      hasMore: rawMeta?.hasMore === true,
      nextOffset:
        typeof rawMeta?.nextOffset === "number" ? rawMeta.nextOffset : null,
    },
  };
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

export function getApprovedCoursesMetaSnapshot() {
  return hasFreshApprovedCoursesCache() ? approvedCoursesMeta : undefined;
}

export function primeApprovedCoursesCache(
  courses: Course[],
  meta?: PublicCoursesPageMeta,
) {
  approvedCoursesCache = courses;
  approvedCoursesMeta = meta;
  approvedCoursesFetchedAt = Date.now();
}

async function loadApprovedCourses(forceFresh: boolean) {
  const requestVersion = approvedCoursesVersion;
  const searchParams = new URLSearchParams({
    limit: String(PUBLIC_COURSES_PAGE_SIZE),
    offset: "0",
  });
  const res = await http(`/api/courses/public?${searchParams.toString()}`, {
    method: "GET",
    cache: forceFresh ? "no-store" : undefined,
  });
  const page = await readCoursesPageResponse(res);

  if (requestVersion === approvedCoursesVersion) {
    approvedCoursesCache = page.courses;
    approvedCoursesMeta = page.meta;
    approvedCoursesFetchedAt = Date.now();
  }

  return page.courses;
}

export async function fetchApprovedCoursesPage({
  offset,
  limit = PUBLIC_COURSES_PAGE_SIZE,
}: {
  offset: number;
  limit?: number;
}) {
  const searchParams = new URLSearchParams({
    limit: String(limit),
    offset: String(offset),
  });
  const res = await http(`/api/courses/public?${searchParams.toString()}`, {
    method: "GET",
  });
  return readCoursesPageResponse(res);
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

  const request = loadApprovedCourses(forceFresh);
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
  approvedCoursesMeta = undefined;
  approvedCoursesFetchedAt = 0;
  approvedCoursesRequest = null;
}
