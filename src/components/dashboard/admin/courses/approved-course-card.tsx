"use client";

import Link from "next/link";
import { ArrowUpRight, Star } from "lucide-react";

import { CourseIcon } from "@/components/ui/course-icon";
import { getCourseIconType } from "@/lib/course-icon-type";
import {
  formatLabel,
  getCourseCategoryLabel,
  getCourseLevelLabel,
  isFreeCourse,
} from "@/lib/func";
import { cn } from "@/lib/utils";
import type { Course } from "@/types/course";

const formatDate = (iso?: string | null) => {
  if (!iso) return null;

  try {
    return new Intl.DateTimeFormat("ru-RU", {
      month: "long",
      year: "numeric",
    }).format(new Date(iso));
  } catch {
    return null;
  }
};

function getCourseTagLine(course: Course, category: string) {
  const parts = [category, ...(course.tags ?? []).map(formatLabel)].filter(
    Boolean,
  );

  return Array.from(new Set(parts)).join(", ");
}

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

function getLanguageLabel(language?: string | null) {
  if (!language) return null;

  const value = language.trim();

  if (!value) return null;

  return value.split(/[-_]/)[0]?.toUpperCase() || value.toUpperCase();
}

type Props = {
  course: Course;
  href?: string;
  imagePriority?: boolean;
  variant?: "grid" | "horizontal";
};

export default function ApprovedCourseCard(props: Props) {
  const { course, href, variant = "grid" } = props;

  const targetHref = href ?? `/o/courses/${course.slug}`;
  const category = getCourseCategoryLabel(course);
  const level = getCourseLevelLabel(course.level);
  const priceBadge = getCoursePriceBadge(course);
  const tagLine = getCourseTagLine(course, category)
    .split(", ")
    .slice(0, 3)
    .join(", ");
  const type = getCourseIconType(course);
  const publishedAt = formatDate(course.published_at);
  const language = getLanguageLabel(course.language);
  const rating = Number(course.rating_avg ?? 0);
  const hasRating = rating > 0;
  const metaLine = [language, publishedAt].filter(Boolean).join(" • ");

  if (variant === "horizontal") {
    return (
      <Link
        href={targetHref}
        className="group block rounded-[32px] transition-colors duration-150 hover:bg-[rgba(var(--frontier-home-primary-rgb),0.05)]"
      >
        <article className="flex h-full flex-col gap-4 rounded-[28px] border border-[rgba(var(--frontier-home-border-rgb),0.85)] bg-white p-3 shadow-[0_1px_0_rgba(var(--frontier-home-primary-deep-rgb),0.03)] sm:flex-row sm:p-4">
          <div className="relative overflow-hidden rounded-[24px] sm:w-[220px] sm:shrink-0">
            <div className="absolute left-3 top-3 z-10 rounded-full bg-white/90 px-3 py-1 text-[11px] font-medium text-[var(--frontier-home-primary-deep)] backdrop-blur-sm">
              {category}
            </div>
            <div className="absolute right-3 top-3 z-10 rounded-sm bg-[var(--frontier-home-primary)] px-2.5 py-1 text-[13px] font-medium leading-none text-white shadow-[0_10px_24px_rgba(var(--frontier-home-primary-rgb),0.24)]">
              {priceBadge}
            </div>
            {hasRating ? (
              <div className="absolute bottom-3 left-3 z-10 inline-flex items-center gap-1.5 rounded-full bg-[rgba(var(--frontier-home-primary-deep-rgb),0.72)] px-2.5 py-1 text-[12px] font-medium text-white backdrop-blur-sm">
                <Star className="h-3.5 w-3.5 fill-current text-[#ffd86b]" />
                {rating.toFixed(1)}
              </div>
            ) : null}

            <div className="transition-transform duration-300 ease-out group-hover:scale-[1.05]">
              <CourseIcon
                type={type}
                className="h-[205px] rounded-[24px] sm:h-full sm:min-h-[220px]"
              />
            </div>
          </div>

          <div className="flex min-w-0 flex-1 flex-col px-1 pb-1">
            <p className="text-[13px] leading-[1.2] text-[var(--frontier-home-ink-muted)] sm:text-[15px]">
              {tagLine}
            </p>
            <h3 className="mt-1 line-clamp-2 text-[18px] font-medium leading-[1.08] tracking-[-0.035em] text-[var(--frontier-home-ink)] sm:text-[21px]">
              {course.title}
            </h3>

            {course.short_description ? (
              <p className="mt-3 line-clamp-3 text-[14px] leading-[1.5] text-[var(--frontier-home-ink-muted)]">
                {course.short_description}
              </p>
            ) : null}

            <div className="mt-auto flex flex-col gap-3 border-t border-[rgba(var(--frontier-home-border-rgb),0.8)] pt-4 sm:flex-row sm:items-end sm:justify-between">
              <div className="min-w-0">
                <p className="text-[14px] leading-none text-[var(--frontier-home-primary-deep)] sm:text-[16px]">
                  {level}
                </p>
                {metaLine ? (
                  <p className="mt-2 text-[12px] leading-none text-[var(--frontier-home-ink-muted)] sm:text-[13px]">
                    {metaLine}
                  </p>
                ) : null}
              </div>

              <span className="inline-flex items-center gap-1.5 text-[14px] font-medium text-[var(--frontier-home-primary-deep)] transition-transform duration-150 group-hover:translate-x-0.5">
                Смотреть
                <ArrowUpRight className="h-4 w-4" />
              </span>
            </div>
          </div>
        </article>
      </Link>
    );
  }

  return (
    <Link
      href={targetHref}
      className="group block h-full rounded-[36px] transition-colors duration-150 hover:bg-[rgba(var(--frontier-home-primary-rgb),0.05)]"
    >
      <article className="flex h-full flex-col rounded-[30px] border border-[rgba(var(--frontier-home-border-rgb),0.85)] bg-white p-3 shadow-[0_1px_0_rgba(var(--frontier-home-primary-deep-rgb),0.03)]">
        <div className="relative overflow-hidden rounded-[24px]">
          <div className="absolute left-3 top-3 z-10 rounded-full bg-white/90 px-3 py-1 text-[11px] font-medium text-[var(--frontier-home-primary-deep)] backdrop-blur-sm">
            {category}
          </div>
          <div className="absolute right-3 top-3 z-10 rounded-sm bg-[var(--frontier-home-primary)] px-2.5 py-1 text-[13px] font-medium leading-none text-white shadow-[0_10px_24px_rgba(var(--frontier-home-primary-rgb),0.24)]">
            {priceBadge}
          </div>
          {hasRating ? (
            <div className="absolute bottom-3 left-3 z-10 inline-flex items-center gap-1.5 rounded-full bg-[rgba(var(--frontier-home-primary-deep-rgb),0.72)] px-2.5 py-1 text-[12px] font-medium text-white backdrop-blur-sm">
              <Star className="h-3.5 w-3.5 fill-current text-[#ffd86b]" />
              {rating.toFixed(1)}
            </div>
          ) : null}

          <div className="transition-transform duration-300 ease-out group-hover:scale-[1.08]">
            <CourseIcon
              type={type}
              className="h-[215px] rounded-[24px] sm:h-[228px] lg:h-[246px]"
            />
          </div>
        </div>

        <div className="flex flex-1 flex-col px-2 pb-2 pt-4">
          <p className="text-[13px] leading-[1.2] text-[var(--frontier-home-ink-muted)] lg:text-[15px]">
            {tagLine}
          </p>
          <h3 className="mt-1 line-clamp-2 text-[18px] font-medium leading-[1.08] tracking-[-0.035em] text-[var(--frontier-home-ink)] lg:text-[21px]">
            {course.title}
          </h3>

          {course.short_description ? (
            <p className="mt-3 line-clamp-3 text-[14px] leading-[1.5] text-[var(--frontier-home-ink-muted)]">
              {course.short_description}
            </p>
          ) : null}

          <div className="mt-auto flex flex-col gap-3 border-t border-[rgba(var(--frontier-home-border-rgb),0.8)] pt-4 sm:flex-row sm:items-end sm:justify-between">
            <div className="min-w-0">
              <p className="text-[14px] leading-none text-[var(--frontier-home-primary-deep)] lg:text-[16px]">
                {level}
              </p>
              {metaLine ? (
                <p className="mt-2 text-[12px] leading-none text-[var(--frontier-home-ink-muted)] lg:text-[13px]">
                  {metaLine}
                </p>
              ) : null}
            </div>

            <span className="inline-flex items-center gap-1.5 text-[14px] font-medium text-[var(--frontier-home-primary-deep)] transition-transform duration-150 group-hover:translate-x-0.5">
              Смотреть
              <ArrowUpRight className="h-4 w-4" />
            </span>
          </div>
        </div>
      </article>
    </Link>
  );
}

export function PremiumCourseCardSkeleton({
  variant = "grid",
}: {
  variant?: "grid" | "horizontal";
}) {
  const pulse = "animate-pulse rounded-[18px] bg-muted";

  if (variant === "horizontal") {
    return (
      <div className="flex flex-col gap-4 rounded-[28px] border border-[rgba(var(--frontier-home-border-rgb),0.85)] bg-white p-3 sm:flex-row sm:p-4">
        <div
          className={cn(pulse, "h-[205px] w-full rounded-[24px] sm:w-[220px]")}
        />
        <div className="flex flex-1 flex-col gap-3 px-1 pb-1">
          <div className={cn(pulse, "h-4 w-32")} />
          <div className={cn(pulse, "h-5 w-full")} />
          <div className={cn(pulse, "h-5 w-3/4")} />
          <div className={cn(pulse, "h-4 w-full")} />
          <div className={cn(pulse, "h-4 w-5/6")} />
          <div className="mt-auto flex flex-col gap-3 border-t border-[rgba(var(--frontier-home-border-rgb),0.8)] pt-4 sm:flex-row sm:items-end sm:justify-between">
            <div className="space-y-2">
              <div className={cn(pulse, "h-4 w-24")} />
              <div className={cn(pulse, "h-3 w-28")} />
            </div>
            <div className={cn(pulse, "h-4 w-24")} />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col rounded-[30px] border border-[rgba(var(--frontier-home-border-rgb),0.85)] bg-white p-3 shadow-[0_1px_0_rgba(var(--frontier-home-primary-deep-rgb),0.03)]">
      <div className={cn(pulse, "h-[215px] w-full rounded-[24px] sm:h-[228px] lg:h-[246px]")} />
      <div className="flex flex-1 flex-col gap-3 px-2 pb-2 pt-4">
        <div className={cn(pulse, "h-4 w-32")} />
        <div className={cn(pulse, "h-5 w-full")} />
        <div className={cn(pulse, "h-5 w-3/4")} />
        <div className={cn(pulse, "h-4 w-full")} />
        <div className={cn(pulse, "h-4 w-5/6")} />
        <div className="mt-auto flex flex-col gap-3 border-t border-[rgba(var(--frontier-home-border-rgb),0.8)] pt-4 sm:flex-row sm:items-end sm:justify-between">
          <div className="space-y-2">
            <div className={cn(pulse, "h-4 w-24")} />
            <div className={cn(pulse, "h-3 w-28")} />
          </div>
          <div className={cn(pulse, "h-4 w-24")} />
        </div>
      </div>
    </div>
  );
}
