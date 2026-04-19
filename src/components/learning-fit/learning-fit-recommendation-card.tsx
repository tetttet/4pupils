"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";

import { CourseIcon } from "@/components/ui/course-icon";
import { getCourseIconType } from "@/lib/course-icon-type";
import type { LearningFitRecommendation } from "@/lib/learning-fit";
import {
  formatLabel,
  getCourseCategoryLabel,
  getCourseLevelLabel,
  isFreeCourse,
} from "@/lib/func";
import type { Course } from "@/types/course";

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

export function LearningFitRecommendationCard({
  recommendation,
}: {
  recommendation: LearningFitRecommendation;
}) {
  const { course, confidenceLabel, reasons } = recommendation;
  const category = getCourseCategoryLabel(course);
  const level = getCourseLevelLabel(course.level);
  const priceBadge = getCoursePriceBadge(course);
  const type = getCourseIconType(course);
  const tagLine = getCourseTagLine(course, category);

  return (
    <Link
      href={`/o/courses/${course.slug}`}
      className="group block h-full rounded-4xl transition-colors duration-150 hover:bg-[#f5f5f5]"
    >
      <article className="flex h-full flex-col rounded-4xl border border-[#e5e5e5] bg-white p-3">
        <div className="relative overflow-hidden rounded-sm">
          <div className="absolute right-3 top-3 z-10 rounded-sm bg-[#3e82ef] px-2.5 py-1 text-[13px] font-medium leading-none text-white shadow-sm">
            {confidenceLabel}
          </div>

          <div className="transition-transform duration-300 ease-out group-hover:scale-[1.08]">
            <CourseIcon type={type} />
          </div>
        </div>

        <div className="flex flex-1 flex-col px-2 pb-2 pt-4">
          <p className="text-[14px] leading-[1.2] text-[#747474] lg:text-[16px]">
            {tagLine.split(", ").slice(0, 3).join(", ")}
          </p>
          <h3 className="mt-1 line-clamp-2 text-[16px] lg:text-[18px] font-medium leading-[1.08] tracking-[-0.035em] text-[#222222]">
            {course.title}
          </h3>
          <p className="mt-2 text-[14px] leading-none text-[#6b6b6b] lg:text-[16px]">
            {level}
          </p>

          {course.short_description ? (
            <p className="mt-3 line-clamp-3 text-[14px] leading-[1.45] text-[#666666]">
              {course.short_description}
            </p>
          ) : null}

          {reasons.length ? (
            <div className="mt-4 flex flex-wrap gap-2">
              {reasons.slice(0, 3).map((reason) => (
                <span
                  key={reason}
                  className="rounded-sm bg-[#f1f1f1] px-2.5 py-1 text-[12px] leading-none text-[#575757]"
                >
                  {reason}
                </span>
              ))}
            </div>
          ) : null}

          <div className="mt-6 flex items-center justify-between border-t border-[#ebebeb] pt-4 select-none">
            <span className="text-[16px] font-medium text-[#222222] lg:text-[18px]">
              {priceBadge}
            </span>
            <span className="inline-flex items-center gap-1.5 text-[15px] text-[#2f2f2f] transition-transform duration-150 group-hover:translate-x-0.5">
              Смотреть курс
              <ArrowRight className="h-4 w-4" />
            </span>
          </div>
        </div>
      </article>
    </Link>
  );
}

export function LearningFitRecommendationCardSkeleton() {
  return (
    <div className="rounded-4xl border border-[#e5e5e5] bg-white p-3">
      <div className="h-42 w-full animate-pulse rounded-[28px] bg-[#f3f3f3] lg:h-62.5" />
      <div className="space-y-3 px-2 pb-2 pt-4">
        <div className="h-4 w-28 animate-pulse rounded bg-[#f0f0f0]" />
        <div className="h-7 w-4/5 animate-pulse rounded bg-[#f0f0f0]" />
        <div className="h-4 w-24 animate-pulse rounded bg-[#f0f0f0]" />
        <div className="h-4 w-full animate-pulse rounded bg-[#f3f3f3]" />
        <div className="h-4 w-5/6 animate-pulse rounded bg-[#f3f3f3]" />
        <div className="flex gap-2 pt-2">
          <div className="h-7 w-24 animate-pulse rounded-sm bg-[#f0f0f0]" />
          <div className="h-7 w-28 animate-pulse rounded-sm bg-[#f0f0f0]" />
        </div>
      </div>
    </div>
  );
}
