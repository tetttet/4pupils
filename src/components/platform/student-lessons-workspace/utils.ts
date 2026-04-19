import type { CourseApplication } from "@/types/course-application";
import type { Enrollment } from "@/types/enrollment";

import {
  APPLICATION_META,
  DEFAULT_COURSE_META,
  ENROLLMENT_META,
} from "./constants";
import type { CourseEntry } from "./types";

const DATE_FORMATTER = new Intl.DateTimeFormat("ru-RU", {
  day: "numeric",
  month: "long",
  year: "numeric",
  timeZone: "UTC",
});

function getTimestamp(value?: string | null) {
  if (!value) return 0;

  const timestamp = new Date(value).getTime();
  return Number.isNaN(timestamp) ? 0 : timestamp;
}

function getMaxTimestamp(values: Array<string | null | undefined>) {
  return values.reduce((max, value) => Math.max(max, getTimestamp(value)), 0);
}

function getApplicationTimestamp(application?: CourseApplication | null) {
  if (!application) return 0;

  return getMaxTimestamp([
    application.reviewed_at,
    application.updated_at,
    application.created_at,
  ]);
}

function getEnrollmentTimestamp(enrollment?: Enrollment | null) {
  if (!enrollment) return 0;

  return getMaxTimestamp([
    enrollment.last_activity_at,
    enrollment.updated_at,
    enrollment.enrolled_at,
    enrollment.created_at,
  ]);
}

function pickLatestByCourseId<T extends { course_id: string }>(
  items: T[],
  getItemTimestamp: (item: T) => number,
) {
  const latestByCourseId = new Map<string, T>();

  for (const item of items) {
    const currentTimestamp = getItemTimestamp(item);
    const previous = latestByCourseId.get(item.course_id);
    const previousTimestamp = previous ? getItemTimestamp(previous) : -1;

    if (currentTimestamp >= previousTimestamp) {
      latestByCourseId.set(item.course_id, item);
    }
  }

  return latestByCourseId;
}

export function formatDate(value?: string | number | null) {
  if (value === null || value === undefined) return "—";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";

  return DATE_FORMATTER.format(date);
}

export function getCourseHref(courseSlug?: string | null) {
  return courseSlug ? `/o/courses/${courseSlug}` : "/courses";
}

export function buildCourseEntries(
  applications: CourseApplication[],
  enrollments: Enrollment[],
): CourseEntry[] {
  const latestApplicationsByCourseId = pickLatestByCourseId(
    applications,
    getApplicationTimestamp,
  );
  const latestEnrollmentsByCourseId = pickLatestByCourseId(
    enrollments,
    getEnrollmentTimestamp,
  );

  return Array.from(
    new Set([
      ...latestApplicationsByCourseId.keys(),
      ...latestEnrollmentsByCourseId.keys(),
    ]),
  )
    .map((courseId) => {
      const application = latestApplicationsByCourseId.get(courseId) ?? null;
      const enrollment = latestEnrollmentsByCourseId.get(courseId) ?? null;

      return {
        courseId,
        courseTitle:
          enrollment?.course_title ?? application?.course_title ?? "Курс",
        courseSlug: enrollment?.course_slug ?? application?.course_slug ?? "",
        application,
        enrollment,
        updatedAt: Math.max(
          getApplicationTimestamp(application),
          getEnrollmentTimestamp(enrollment),
        ),
      };
    })
    .sort((left, right) => right.updatedAt - left.updatedAt);
}

export function getPrimaryMeta(entry: CourseEntry) {
  if (entry.enrollment) {
    return ENROLLMENT_META[entry.enrollment.status];
  }

  if (entry.application) {
    return APPLICATION_META[entry.application.status];
  }

  return DEFAULT_COURSE_META;
}

export function getEntryDescription(entry: CourseEntry) {
  if (entry.enrollment) {
    return (
      entry.enrollment.note?.trim() ||
      entry.application?.review_note?.trim() ||
      ENROLLMENT_META[entry.enrollment.status].description
    );
  }

  if (entry.application) {
    return (
      entry.application.review_note?.trim() ||
      entry.application.motivation_text?.trim() ||
      entry.application.message?.trim() ||
      APPLICATION_META[entry.application.status].description
    );
  }

  return DEFAULT_COURSE_META.description;
}

export function getEntryDateLabel(entry: CourseEntry) {
  if (entry.enrollment) {
    return `Доступ с ${formatDate(entry.enrollment.enrolled_at)}`;
  }

  if (entry.application) {
    return `Заявка от ${formatDate(entry.application.created_at)}`;
  }

  return "—";
}

export function getLessonsSummary(entries: CourseEntry[]) {
  return entries.reduce(
    (summary, entry) => {
      summary.total += 1;

      if (entry.enrollment) {
        summary.withAccess += 1;
      }

      if (
        !entry.enrollment &&
        entry.application &&
        (entry.application.status === "pending" ||
          entry.application.status === "reviewing")
      ) {
        summary.awaiting += 1;
      }

      return summary;
    },
    {
      total: 0,
      withAccess: 0,
      awaiting: 0,
    },
  );
}
