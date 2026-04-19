import { cache } from "react";
import { headers } from "next/headers";
import { BACKEND_URL } from "@/lib/backend-url.server";
import type { ApiErr, ApiOk, Course } from "@/types/course";

export const COURSE_PAGE_REVALIDATE_SECONDS = 300;
export const COURSE_FALLBACK_IMAGE = "/images/course-placeholder.svg";

type CourseResponse<T> = ApiOk<T> | ApiErr | null | Record<string, unknown>;

function isApiOk<T>(value: unknown): value is ApiOk<T> {
  if (!value || typeof value !== "object") return false;

  const payload = value as { ok?: unknown; data?: unknown };
  return payload.ok === true && "data" in payload;
}

export const getPublicCourse = cache(async (slug: string): Promise<Course | null> => {
  const res = await fetch(
    `${BACKEND_URL}/api/courses/public/${encodeURIComponent(slug)}`,
    {
      headers: { Accept: "application/json" },
      next: { revalidate: COURSE_PAGE_REVALIDATE_SECONDS },
    },
  );

  const json = (await res.json().catch(() => null)) as CourseResponse<Course>;

  if (!res.ok || !isApiOk<Course>(json)) {
    return null;
  }

  return json.data;
});

export async function getAppBaseUrl() {
  const envUrl = process.env.NEXT_PUBLIC_APP_URL || process.env.APP_URL;
  if (envUrl) {
    return envUrl.startsWith("http")
      ? envUrl.replace(/\/$/, "")
      : `https://${envUrl.replace(/\/$/, "")}`;
  }

  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL.replace(/\/$/, "")}`;
  }

  const h = await headers();
  const host = h.get("x-forwarded-host") ?? h.get("host");
  const proto = h.get("x-forwarded-proto") ?? "http";

  if (host) {
    return `${proto}://${host}`;
  }

  return "http://localhost:3000";
}

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
