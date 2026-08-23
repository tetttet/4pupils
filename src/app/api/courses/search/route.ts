import { NextResponse } from "next/server";

import { BACKEND_URL } from "@/lib/backend-url.server";
import { toCourseSearchItem } from "@/lib/course-search";
import type { ApiOk, Course } from "@/types/course";

const DEFAULT_LIMIT = 6;
const MAX_LIMIT = 8;

export async function GET(request: Request) {
  const searchParams = new URL(request.url).searchParams;
  const query = searchParams.get("q")?.trim() ?? "";
  const requestedLimit = Number(searchParams.get("limit") ?? DEFAULT_LIMIT);
  const limit = Number.isFinite(requestedLimit)
    ? Math.min(MAX_LIMIT, Math.max(1, Math.floor(requestedLimit)))
    : DEFAULT_LIMIT;

  if (query.length < 2) {
    return NextResponse.json({ data: [] });
  }

  const backendSearchParams = new URLSearchParams({
    q: query,
    limit: String(limit),
    offset: "0",
    view: "search",
  });

  let response: Response;
  try {
    response = await fetch(
      `${BACKEND_URL}/api/courses/public?${backendSearchParams.toString()}`,
      {
        headers: { Accept: "application/json" },
        next: { revalidate: 60 },
        signal: AbortSignal.timeout(10_000),
      },
    );
  } catch {
    return NextResponse.json(
      { message: "Каталог временно недоступен" },
      { status: 503 },
    );
  }

  const payload = (await response.json().catch(() => null)) as
    | ApiOk<
        Array<
          Pick<Course, "course_id" | "title" | "slug"> &
            Partial<
              Pick<
                Course,
                | "short_description"
                | "description"
                | "category"
                | "tags"
                | "level"
              >
            >
        >
      >
    | null;

  if (!response.ok || payload?.ok !== true || !Array.isArray(payload.data)) {
    return NextResponse.json(
      { message: "Каталог временно недоступен" },
      { status: response.status >= 400 ? response.status : 503 },
    );
  }

  return NextResponse.json({
    data: payload.data.map(toCourseSearchItem).slice(0, limit),
  });
}
