"use client";

import Link from "next/link";
import { type CSSProperties, useMemo, useState } from "react";
import { ArrowRight } from "lucide-react";
import { motion, useReducedMotion } from "framer-motion";
import { useApprovedCourses } from "@/hooks/use-approved-courses";
import { getCourseIconType } from "@/lib/course-icon-type";
import {
  getCourseCategoryLabel,
  getCourseLevelLabel,
  isFreeCourse,
} from "@/lib/func";
import type { Course, CourseIconType } from "@/types/course";
import { CourseIcon } from "@/components/ui/course-icon";

const EASE_OUT = [0.22, 1, 0.36, 1] as const;
const ALL_CATEGORIES = "Все категории";

type AtlasCoursePreviewProps = {
  title: string;
};

type PreviewCourse = {
  category: string;
  href: string;
  level: string;
  priceBadge: string;
  summary: string;
  title: string;
  type: CourseIconType;
};

function getCoursePriceBadge(course: Course) {
  if (isFreeCourse(course)) return "Бесплатно";

  try {
    return new Intl.NumberFormat("ru-RU", {
      style: "currency",
      currency: (course.currency || "USD").toUpperCase(),
      maximumFractionDigits: 0,
    }).format(Number(course.price ?? 0));
  } catch {
    return `${course.price ?? 0} ${(course.currency || "").toUpperCase()}`.trim();
  }
}

function buildPreviewCourse(course: Course): PreviewCourse {
  return {
    category: getCourseCategoryLabel(course),
    href: `/o/courses/${course.slug}`,
    level: getCourseLevelLabel(course.level),
    priceBadge: getCoursePriceBadge(course),
    summary:
      course.short_description?.trim() ||
      course.description?.trim() ||
      "Карточка курса с программой, результатами обучения и основными деталями.",
    title: course.title,
    type: getCourseIconType(course),
  };
}

function CoursePreviewSkeleton() {
  return (
    <div className="space-y-4">
      <div className="-mx-1 flex gap-2 overflow-hidden px-1">
        {Array.from({ length: 4 }).map((_, index) => (
          <div
            className="h-10 w-28 shrink-0 rounded-full bg-[var(--bubble-border)]/75"
            key={index}
          />
        ))}
      </div>

      <div className="-mx-1 flex gap-4 overflow-hidden px-1 pb-1">
        {Array.from({ length: 3 }).map((_, index) => (
          <div
            className="min-w-[17.5rem] overflow-hidden rounded-[28px] border border-[var(--bubble-border)] bg-[var(--assistant-bubble)] p-3 shadow-sm sm:min-w-[19rem]"
            key={index}
          >
            <div className="h-40 rounded-[22px] bg-[var(--bubble-border)]/65" />

            <div className="space-y-3 px-1 pb-2 pt-4">
              <div className="flex gap-2">
                <div className="h-6 w-24 rounded-full bg-[var(--bubble-border)]/75" />
                <div className="h-6 w-18 rounded-full bg-[var(--bubble-border)]/55" />
              </div>

              <div className="space-y-2">
                <div className="h-6 w-5/6 rounded-full bg-[var(--bubble-border)]/75" />
                <div className="h-4 w-full rounded-full bg-[var(--bubble-border)]/55" />
                <div className="h-4 w-4/5 rounded-full bg-[var(--bubble-border)]/45" />
              </div>

              <div className="h-4 w-28 rounded-full bg-[var(--bubble-border)]/55" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function CoursePreviewCard({
  course,
  index,
}: {
  course: PreviewCourse;
  index: number;
}) {
  const prefersReducedMotion = useReducedMotion();
  const cardSurfaceStyle = {
    background: `
      linear-gradient(180deg, rgb(255 255 255 / 0.09) 0%, rgb(255 255 255 / 0.02) 22%, transparent 52%),
      color-mix(in srgb, var(--assistant-bubble) 88%, white 12%)
    `,
  } satisfies CSSProperties;
  const mediaFrameStyle = {
    background:
      "linear-gradient(180deg, rgb(255 255 255 / 0.12) 0%, rgb(255 255 255 / 0.03) 100%)",
    boxShadow:
      "inset 0 1px 0 rgba(255,255,255,0.12), inset 0 -1px 0 rgba(0,0,0,0.08)",
  } satisfies CSSProperties;
  const badgeStyle = {
    background:
      "color-mix(in srgb, var(--main-bg) 74%, rgb(255 255 255 / 26%) 26%)",
    boxShadow:
      "inset 0 1px 0 rgba(255,255,255,0.35), 0 10px 24px rgba(15,23,42,0.14)",
  } satisfies CSSProperties;

  return (
    <motion.div
      animate={prefersReducedMotion ? undefined : { opacity: 1, y: 0 }}
      className="min-w-[17.5rem] snap-start sm:min-w-[19rem]"
      initial={prefersReducedMotion ? undefined : { opacity: 0, y: 14 }}
      transition={
        prefersReducedMotion
          ? undefined
          : {
              delay: 0.03 * index,
              duration: 0.26,
              ease: EASE_OUT,
            }
      }
    >
      <Link className="group block h-full" href={course.href}>
        <article
          className="flex h-full flex-col overflow-hidden rounded-[28px] border border-[var(--bubble-border)]/90 p-3 backdrop-blur-xl transition duration-300 hover:-translate-y-0.5 hover:border-[var(--accent)]/35 active:scale-[0.985]"
          style={cardSurfaceStyle}
        >
          <div
            className="relative overflow-hidden rounded-[22px] border border-white/10"
            style={mediaFrameStyle}
          >
            <div
              aria-hidden="true"
              className="pointer-events-none absolute inset-x-0 top-0 z-[1] h-24 bg-gradient-to-b from-black/15 via-black/6 to-transparent"
            />
            <div
              aria-hidden="true"
              className="pointer-events-none absolute -left-8 -top-10 h-28 w-28 rounded-full bg-[var(--accent)]/14 blur-3xl transition duration-500 group-hover:bg-[var(--accent)]/20"
            />
            <div
              className="absolute right-3 top-3 z-10 rounded-full border border-white/15 px-2.5 py-1 text-[11px] font-semibold text-[var(--assistant-bubble-text)] backdrop-blur-xl"
              style={badgeStyle}
            >
              {course.priceBadge}
            </div>

            <CourseIcon
              animationMode="hover"
              className="h-40 rounded-[22px]"
              type={course.type}
            />
          </div>

          <div className="flex flex-1 flex-col px-1 pb-2 pt-4">
            <div className="flex flex-wrap gap-2">
              <span className="rounded-full border border-[var(--bubble-border)]/85 bg-[var(--assistant-bubble)]/78 px-2.5 py-1 text-[11px] font-semibold text-[var(--accent)] shadow-[inset_0_1px_0_rgba(255,255,255,0.14)] backdrop-blur">
                {course.category}
              </span>
              <span className="rounded-full border border-[var(--bubble-border)]/80 bg-[var(--main-bg)]/52 px-2.5 py-1 text-[11px] font-medium text-[var(--muted)] backdrop-blur">
                {course.level}
              </span>
            </div>

            <h4 className="mt-3 line-clamp-2 text-[17px] font-semibold leading-[1.1] tracking-[-0.03em] text-[var(--assistant-bubble-text)]">
              {course.title}
            </h4>

            <p className="mb-3 mt-2 line-clamp-3 text-[13px] leading-5 text-[var(--muted)]">
              {course.summary}
            </p>

            <div className="mt-auto flex items-center justify-between border-t border-[var(--bubble-border)]/90 pt-4 text-sm font-medium text-[var(--assistant-bubble-text)]">
              <span className="transition-colors duration-200 group-hover:text-[var(--accent)]">
                Открыть курс
              </span>
              <span className="inline-flex items-center gap-1.5 text-[var(--muted)] transition-[transform,color] duration-200 group-hover:translate-x-0.5 group-hover:text-[var(--accent)]">
                Смотреть
                <ArrowRight className="h-4 w-4" />
              </span>
            </div>
          </div>
        </article>
      </Link>
    </motion.div>
  );
}

export function AtlasCoursePreview({ title }: AtlasCoursePreviewProps) {
  const prefersReducedMotion = useReducedMotion();
  const { courses, loading, error } = useApprovedCourses();
  const preparedCourses = useMemo(
    () => courses.map((course) => buildPreviewCourse(course)),
    [courses],
  );
  const categoryOptions = useMemo(() => {
    const labels = Array.from(
      new Set(preparedCourses.map((course) => course.category).filter(Boolean)),
    ).sort((left, right) => left.localeCompare(right, "ru"));

    return [ALL_CATEGORIES, ...labels];
  }, [preparedCourses]);
  const [selectedCategory, setSelectedCategory] = useState(ALL_CATEGORIES);
  const activeCategory = categoryOptions.includes(selectedCategory)
    ? selectedCategory
    : ALL_CATEGORIES;

  const visibleCourses = useMemo(() => {
    const filtered =
      activeCategory === ALL_CATEGORIES
        ? preparedCourses
        : preparedCourses.filter(
            (course) => course.category === activeCategory,
          );

    return filtered.slice(0, 8);
  }, [activeCategory, preparedCourses]);

  if (loading) {
    return <CoursePreviewSkeleton />;
  }

  if (error) {
    return (
      <div className="rounded-2xl border border-rose-200/80 bg-rose-50/85 px-4 py-3 text-sm leading-6 text-rose-700">
        Не удалось показать preview курсов. Основной переход в раздел всё равно
        доступен.
      </div>
    );
  }

  if (!preparedCourses.length) {
    return (
      <div className="rounded-2xl border border-[var(--bubble-border)]/90 bg-[var(--assistant-bubble)]/78 px-4 py-3 text-sm leading-6 text-[var(--muted)] shadow-[inset_0_1px_0_rgba(255,255,255,0.12)] backdrop-blur-xl">
        Пока нет опубликованных курсов для быстрого preview, но раздел{" "}
        {`"${title}"`} можно открыть напрямую.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="-mx-1 flex gap-2 overflow-x-auto px-1 pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {categoryOptions.map((category, index) => {
          const isActive = category === activeCategory;
          const count =
            category === ALL_CATEGORIES
              ? preparedCourses.length
              : preparedCourses.filter((course) => course.category === category)
                  .length;

          return (
            <motion.button
              animate={prefersReducedMotion ? undefined : { opacity: 1, y: 0 }}
              className={`inline-flex shrink-0 items-center gap-2 rounded-full border px-4 py-2.5 text-sm font-medium backdrop-blur-xl transition duration-300 active:scale-[0.98] ${
                isActive
                  ? "border-[var(--accent)]/30 bg-[var(--assistant-bubble)] text-[var(--accent)]"
                  : "border-[var(--bubble-border)]/90 bg-[var(--assistant-bubble)]/78 text-[var(--assistant-bubble-text)]/84 shadow-[inset_0_1px_0_rgba(255,255,255,0.1)] hover:border-[var(--accent)]/20 hover:text-[var(--assistant-bubble-text)]"
              }`}
              initial={prefersReducedMotion ? undefined : { opacity: 0, y: 8 }}
              key={category}
              onClick={() => setSelectedCategory(category)}
              transition={
                prefersReducedMotion
                  ? undefined
                  : {
                      delay: index * 0.03,
                      duration: 0.24,
                      ease: EASE_OUT,
                    }
              }
              type="button"
              whileTap={prefersReducedMotion ? undefined : { scale: 0.98 }}
            >
              <span>{category}</span>
              <span
                className={`rounded-full px-2 py-0.5 text-[11px] font-semibold transition-colors duration-300 ${
                  isActive
                    ? "bg-[var(--accent)]/14 text-[var(--accent)]"
                    : "bg-[var(--main-bg)]/52 text-[var(--muted)]"
                }`}
              >
                {count}
              </span>
            </motion.button>
          );
        })}
      </div>

      <div className="-mx-1 flex snap-x snap-mandatory gap-4 overflow-x-auto px-1 pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {visibleCourses.map((course, index) => (
          <CoursePreviewCard course={course} index={index} key={course.href} />
        ))}
      </div>
    </div>
  );
}
