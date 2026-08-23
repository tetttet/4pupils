import type { Course } from "@/types/course";

export const COURSE_PAGE_REVALIDATE_SECONDS = 300;
export const COURSE_FALLBACK_IMAGE = "/images/course-placeholder.svg";
export const PUBLIC_COURSES_PAGE_SIZE = 12;

export type PublicCoursesPageMeta = {
  count: number;
  limit: number;
  offset: number;
  hasMore: boolean;
  nextOffset: number | null;
};

export type PublicCoursesPage = {
  courses: Course[];
  meta: PublicCoursesPageMeta;
};

export function isCourseFree(course: Course) {
  return (
    course.is_free ||
    String(course.price) === "0" ||
    String(course.price) === "0.00"
  );
}

export function getCourseCoverImage(course: Course) {
  return course.image_url || COURSE_FALLBACK_IMAGE;
}

export function trimText(value: string, maxLength: number) {
  if (value.length <= maxLength) return value;
  return `${value.slice(0, maxLength).trimEnd()}…`;
}

export function getCourseSummary(course: Course) {
  return (
    course.short_description?.trim() ||
    course.description?.trim() ||
    "Подробная страница курса с программой, результатами обучения и ключевой информацией."
  );
}

export function getCourseSeoDescription(course: Course) {
  return trimText(getCourseSummary(course), 160);
}

export function getCoursePriceLabel(course: Course) {
  if (isCourseFree(course)) {
    return "Бесплатно";
  }

  try {
    return new Intl.NumberFormat("ru-RU", {
      style: "currency",
      currency: course.currency || "USD",
      maximumFractionDigits: 0,
    }).format(course.price);
  } catch {
    return `${course.price} ${course.currency || ""}`.trim();
  }
}

export function formatCourseDate(date?: string | null) {
  if (!date) return null;

  try {
    return new Intl.DateTimeFormat("ru-RU", {
      day: "numeric",
      month: "long",
      year: "numeric",
    }).format(new Date(date));
  } catch {
    return null;
  }
}

export function formatCourseCompactCount(value?: number | null) {
  const normalized = Number(value ?? 0);
  if (!Number.isFinite(normalized) || normalized <= 0) {
    return null;
  }

  return new Intl.NumberFormat("ru-RU", {
    notation: "compact",
    maximumFractionDigits: 1,
  }).format(normalized);
}

export function formatCourseFullCount(value?: number | null) {
  const normalized = Number(value ?? 0);
  if (!Number.isFinite(normalized) || normalized <= 0) {
    return null;
  }

  return new Intl.NumberFormat("ru-RU").format(normalized);
}

const COURSE_LABEL_MAP: Record<string, string> = {
  ru: "Русский",
  en: "English",
  kk: "Қазақша",
  kz: "Қазақша",
  tr: "Türkçe",
  es: "Español",
  beginner: "Новичок",
  basic: "Новичок",
  entry: "Новичок",
  junior: "Новичок",
  intermediate: "Средний",
  middle: "Средний",
  advanced: "Продвинутый",
  expert: "Продвинутый",
  pro: "Продвинутый",
  web: "Веб-разработка",
  mobile: "Мобильная разработка",
  data: "Data / Аналитика",
  design: "Дизайн",
  devops: "DevOps",
  other: "Другое",
};

export function normalizeCourseLabel(value?: string | null) {
  if (!value) return "Не указано";

  const trimmedValue = value.trim();
  const normalizedValue = trimmedValue.toLowerCase();

  if (COURSE_LABEL_MAP[normalizedValue]) {
    return COURSE_LABEL_MAP[normalizedValue];
  }

  return trimmedValue
    .replace(/[_-]+/g, " ")
    .replace(/\s+/g, " ")
    .split(" ")
    .map((chunk) =>
      chunk.length <= 3
        ? chunk.toUpperCase()
        : `${chunk.slice(0, 1).toUpperCase()}${chunk.slice(1)}`,
    )
    .join(" ");
}

export function getCourseDescriptionParagraphs(course: Course) {
  const description = (course.description || course.short_description || "")
    .split(/\n+/)
    .map((chunk) => chunk.trim())
    .filter(Boolean);

  if (description.length) {
    return description;
  }

  return [getCourseSummary(course)];
}

export function getCoursePrimaryActionHref(course: Course) {
  return isCourseFree(course) ? "/auth/sign-up" : "/auth/sign-up";
}

export function getCoursePrimaryActionLabel(course: Course) {
  return isCourseFree(course) ? "Начать бесплатно" : "Получить доступ";
}
