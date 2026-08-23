import type { Course } from "@/types/course";
import { categoryOptions } from "@/constant/dash";

function normalizeText(value?: string | null) {
  return String(value || "")
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9\u0400-\u04ff]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function formatLabel(value?: string | null) {
  return String(value || "")
    .replace(/[_-]+/g, " ")
    .split(/\s+/)
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

export function getCourseLevelLabel(level?: string | null) {
  const normalized = normalizeText(level);

  if (!normalized) return "Любой уровень";
  if (/begin|basic|entry|novice|junior|начина|с нуля/.test(normalized)) {
    return "С нуля";
  }
  if (/intermediate|middle|medium|сред/.test(normalized)) {
    return "Средний";
  }
  if (/advanced|expert|pro|продвин/.test(normalized)) {
    return "Продвинутый";
  }

  return formatLabel(level);
}

export function getCourseCategoryLabel(
  course: { category?: string | null; tags?: string[] },
) {
  const value = String(course.category || course.tags?.[0] || "").trim();
  if (!value) return "Без категории";

  const match = categoryOptions.find(
    (option) => option.value === value || option.label === value,
  );
  return match?.label || formatLabel(value) || "Без категории";
}

export type CourseSearchItem = {
  courseId: string;
  title: string;
  href: string;
  meta: string;
  description: string;
};

export function toCourseSearchItem(
  course: Pick<Course, "course_id" | "title" | "slug"> &
    Partial<
      Pick<
        Course,
        | "short_description"
        | "description"
        | "category"
        | "tags"
        | "level"
      >
    >,
): CourseSearchItem {
  const category = getCourseCategoryLabel(course);
  const level = getCourseLevelLabel(course.level);

  return {
    courseId: course.course_id,
    title: course.title,
    href: `/o/courses/${course.slug}`,
    meta: [category, level !== "Любой уровень" ? level : null]
      .filter(Boolean)
      .join(" • "),
    description:
      course.short_description?.trim() || course.description?.trim() || "",
  };
}

export function searchPublicCourses(
  courses: Course[],
  query: string,
  limit: number,
): CourseSearchItem[] {
  const normalizedQuery = normalizeText(query);

  if (normalizedQuery.length < 2) {
    return [];
  }

  return courses
    .map((course) => {
      const description =
        course.short_description?.trim() || course.description?.trim() || "";
      const titleText = normalizeText(course.title);
      const searchText = normalizeText(
        [
          course.title,
          description,
          course.category,
          course.level,
          course.language,
          ...(course.tags ?? []),
          ...(course.outcomes ?? []),
        ].join(" "),
      );

      return {
        item: toCourseSearchItem(course),
        startsWithMatch: titleText.startsWith(normalizedQuery),
        titleMatch: titleText.includes(normalizedQuery),
        generalMatch: searchText.includes(normalizedQuery),
      };
    })
    .filter(({ titleMatch, generalMatch }) => titleMatch || generalMatch)
    .sort((left, right) => {
      if (left.startsWithMatch !== right.startsWithMatch) {
        return Number(right.startsWithMatch) - Number(left.startsWithMatch);
      }

      if (left.titleMatch !== right.titleMatch) {
        return Number(right.titleMatch) - Number(left.titleMatch);
      }

      return left.item.title.localeCompare(right.item.title, "ru");
    })
    .slice(0, limit)
    .map(({ item }) => item);
}
