import "server-only";

import { cache } from "react";
import { BACKEND_URL } from "@/lib/backend-url.server";
import {
  COURSE_PAGE_REVALIDATE_SECONDS,
  PUBLIC_COURSES_PAGE_SIZE,
  type PublicCoursesPage,
  type PublicCoursesPageMeta,
} from "@/lib/public-course";
import type { ApiErr, ApiOk, Course } from "@/types/course";

const PUBLIC_COURSE_REQUEST_TIMEOUT_MS = 10_000;

type CourseResponse<T> = ApiOk<T> | ApiErr | null | Record<string, unknown>;

function isApiOk<T>(value: unknown): value is ApiOk<T> {
  if (!value || typeof value !== "object") return false;

  const payload = value as { ok?: unknown; data?: unknown };
  return payload.ok === true && "data" in payload;
}

export const getPublicCoursesPage = cache(async (): Promise<
  PublicCoursesPage | undefined
> => {
  try {
    const searchParams = new URLSearchParams({
      limit: String(PUBLIC_COURSES_PAGE_SIZE),
      offset: "0",
    });
    const res = await fetch(
      `${BACKEND_URL}/api/courses/public?${searchParams.toString()}`,
      {
        headers: { Accept: "application/json" },
        next: { revalidate: COURSE_PAGE_REVALIDATE_SECONDS },
        signal: AbortSignal.timeout(PUBLIC_COURSE_REQUEST_TIMEOUT_MS),
      },
    );

    const json = (await res.json().catch(() => null)) as CourseResponse<
      Course[]
    >;

    if (!res.ok || !isApiOk<Course[]>(json)) {
      return undefined;
    }

    const rawMeta = json.meta as Partial<PublicCoursesPageMeta> | undefined;
    const courses = json.data;

    return {
      courses,
      meta: {
        count: courses.length,
        limit: rawMeta?.limit ?? PUBLIC_COURSES_PAGE_SIZE,
        offset: rawMeta?.offset ?? 0,
        hasMore: rawMeta?.hasMore === true,
        nextOffset:
          typeof rawMeta?.nextOffset === "number" ? rawMeta.nextOffset : null,
      },
    };
  } catch {
    return undefined;
  }
});

export const getPublicCourses = cache(async (): Promise<
  Course[] | undefined
> => (await getPublicCoursesPage())?.courses);

export const getPublicCourse = cache(
  async (slug: string): Promise<Course | null> => {
    try {
      const res = await fetch(
        `${BACKEND_URL}/api/courses/public/${encodeURIComponent(slug)}`,
        {
          headers: { Accept: "application/json" },
          next: { revalidate: COURSE_PAGE_REVALIDATE_SECONDS },
          signal: AbortSignal.timeout(PUBLIC_COURSE_REQUEST_TIMEOUT_MS),
        },
      );

      const json = (await res.json().catch(() => null)) as CourseResponse<Course>;

      if (!res.ok || !isApiOk<Course>(json)) {
        return null;
      }

      return json.data;
    } catch {
      return null;
    }
  },
);
